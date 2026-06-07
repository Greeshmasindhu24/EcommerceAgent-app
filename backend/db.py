import os
import json
from urllib.parse import parse_qs, urlencode, urlparse

import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

db_pool = None


def get_database_url():
    raw_url = (
        os.getenv("POSTGRES_URL", "").strip()
        or os.getenv("DATABASE_URL", "").strip()
    )
    if not raw_url:
        raise RuntimeError(
            "POSTGRES_URL or DATABASE_URL is required. "
            "Add your Supabase connection string to backend/.env"
        )

    parsed = urlparse(raw_url)
    if not parsed.scheme:
        return raw_url

    allowed_params = {
        "sslmode",
        "connect_timeout",
        "application_name",
        "fallback_application_name",
        "options",
        "sslrootcert",
        "sslcert",
        "sslkey",
        "sslpassword",
    }
    query = parse_qs(parsed.query)
    filtered = {key: value for key, value in query.items() if key in allowed_params}
    cleaned_query = urlencode(filtered, doseq=True)
    return parsed._replace(query=cleaned_query).geturl()


def get_pool():
    global db_pool
    if db_pool is None:
        db_pool = pool.ThreadedConnectionPool(1, 10, get_database_url())
    return db_pool


def get_conn():
    return get_pool().getconn()


def release_conn(conn):
    get_pool().putconn(conn)


def execute(cur, sql, params=None):
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
