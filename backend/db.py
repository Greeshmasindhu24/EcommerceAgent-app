import os
import json
import sqlite3
import threading

import psycopg2
from psycopg2 import pool

DATABASE_URL = os.getenv("POSTGRES_URL")
SQLITE_PATH = os.path.join(os.path.dirname(__file__), "local.db")

db_backend = None
db_pool = None
_sqlite_lock = threading.Lock()


def get_backend():
    global db_backend
    if db_backend is not None:
        return db_backend

    if os.getenv("USE_SQLITE", "").lower() in ("1", "true", "yes"):
        db_backend = "sqlite"
        return db_backend

    if DATABASE_URL:
        try:
            psycopg2.connect(DATABASE_URL).close()
            db_backend = "postgres"
            return db_backend
        except Exception as exc:
            print(f"Postgres unavailable ({exc}), using SQLite")

    db_backend = "sqlite"
    return db_backend


def _sqlite_conn():
    with _sqlite_lock:
        conn = sqlite3.connect(SQLITE_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn


def get_pool():
    global db_pool
    if db_pool is None and get_backend() == "postgres":
        db_pool = pool.ThreadedConnectionPool(1, 10, DATABASE_URL)
    return db_pool


def get_conn():
    if get_backend() == "sqlite":
        return _sqlite_conn()
    return get_pool().getconn()


def release_conn(conn):
    if get_backend() == "sqlite":
        conn.close()
    else:
        get_pool().putconn(conn)


def execute(cur, sql, params=None):
    if get_backend() == "sqlite":
        sql = sql.replace("%s", "?")
    if params:
        cur.execute(sql, params)
    else:
        cur.execute(sql)


def parse_items(value):
    if value is None:
        return []
    if isinstance(value, (list, dict)):
        return value
    return json.loads(value)


def init_db():
    conn = get_conn()
    try:
        cur = conn.cursor()
        backend = get_backend()

        if backend == "sqlite":
            cur.execute("""
            CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
            """)
            cur.execute("""
            CREATE TABLE IF NOT EXISTS products(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                price REAL,
                image TEXT,
                category TEXT,
                description TEXT
            )
            """)
            cur.execute("""
            CREATE TABLE IF NOT EXISTS orders(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT,
                total_amount REAL,
                items TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
        else:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
            """)
            cur.execute("""
            CREATE TABLE IF NOT EXISTS products(
                id SERIAL PRIMARY KEY,
                name TEXT,
                price FLOAT,
                image TEXT,
                category TEXT,
                description TEXT
            )
            """)
            cur.execute("""
            CREATE TABLE IF NOT EXISTS orders(
                id SERIAL PRIMARY KEY,
                user_email TEXT,
                total_amount FLOAT,
                items JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

        execute(cur, "SELECT COUNT(*) FROM products")
        count = cur.fetchone()[0]

        if count == 0:
            seed_products = [
                ("iPhone 15 Pro", 129999, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800", "mobiles", "Latest Apple flagship smartphone"),
                ("Samsung Galaxy S24 Ultra", 119999, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800", "mobiles", "Samsung premium AI smartphone"),
                ("MacBook Air M3", 134999, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "laptops", "Apple M3 ultra fast laptop"),
                ("ASUS ROG Gaming Laptop", 149999, "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800", "laptops", "RTX gaming laptop"),
                ("Sony WH1000XM5", 24999, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", "electronics", "Noise cancellation headphones"),
                ("Nike Air Max", 8999, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "fashion", "Premium sneakers"),
                ("Luxury Handbag", 4999, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800", "fashion", "Elegant designer handbag"),
                ("Lakme Makeup Kit", 2499, "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800", "beauty", "Professional beauty makeup kit"),
                ("Nykaa Face Serum", 999, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", "beauty", "Vitamin C glowing serum"),
                ("PlayStation 5", 54999, "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800", "gaming", "Next generation console"),
            ]
            for product in seed_products:
                execute(
                    cur,
                    "INSERT INTO products (name, price, image, category, description) VALUES (%s, %s, %s, %s, %s)",
                    product,
                )

        conn.commit()
        cur.close()
    finally:
        release_conn(conn)
