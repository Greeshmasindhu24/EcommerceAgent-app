import os
import json
from urllib.parse import parse_qs, urlencode, urlparse

import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

db_pool = None
resolved_database_url = None


def _clean_database_url(raw_url):
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


def _connection_candidates():
    candidates = []

    pool_url = os.getenv("POSTGRES_URL", "").strip()
    if pool_url:
        candidates.append(_clean_database_url(pool_url))

    direct_url = os.getenv("POSTGRES_URL_NON_POOLING", "").strip()
    if direct_url:
        candidates.append(_clean_database_url(direct_url))

    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        candidates.append(_clean_database_url(database_url))

    host = os.getenv("POSTGRES_HOST", "").strip()
    password = os.getenv("POSTGRES_PASSWORD", "").strip()
    if host and password:
        user = os.getenv("POSTGRES_USER", "postgres").strip()
        database = os.getenv("POSTGRES_DATABASE", "postgres").strip()
        candidates.append(
            f"postgresql://{user}:{password}@{host}:5432/{database}?sslmode=require"
        )

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for url in candidates:
        if url not in seen:
            seen.add(url)
            unique.append(url)
    return unique


def resolve_database_url():
    global resolved_database_url
    if resolved_database_url:
        return resolved_database_url

    candidates = _connection_candidates()
    if not candidates:
        raise RuntimeError(
            "Supabase is required. Set POSTGRES_URL in backend/.env "
            "(from Supabase Dashboard > Project Settings > Database)."
        )

    errors = []
    for url in candidates:
        try:
            conn = psycopg2.connect(url)
            conn.close()
            resolved_database_url = url
            print("Supabase PostgreSQL connected successfully")
            return resolved_database_url
        except Exception as exc:
            errors.append(str(exc))

    raise RuntimeError(
        "Could not connect to Supabase PostgreSQL. "
        "Check that your project is active (not paused) and credentials are correct. "
        f"Errors: {' | '.join(errors[:2])}"
    )


def get_database_url():
    return resolve_database_url()


def get_pool():
    global db_pool
    if db_pool is None:
        db_pool = pool.ThreadedConnectionPool(1, 10, resolve_database_url())
    return db_pool


def reset_pool():
    global db_pool
    if db_pool is not None:
        try:
            db_pool.closeall()
        except Exception:
            pass
        db_pool = None


def _ping_conn(conn):
    if conn.closed:
        return False
    try:
        conn.rollback()
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
        return True
    except (psycopg2.OperationalError, psycopg2.InterfaceError):
        return False


def get_conn():
    last_error = None
    for attempt in range(3):
        try:
            conn = get_pool().getconn()
            if _ping_conn(conn):
                return conn
            release_conn(conn, discard=True)
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as exc:
            last_error = exc
            if attempt == 1:
                reset_pool()
    if last_error:
        raise last_error
    raise RuntimeError("Could not acquire a database connection")


def release_conn(conn, discard=False):
    if conn is None:
        return
    try:
        if discard or conn.closed:
            get_pool().putconn(conn, close=True)
        else:
            get_pool().putconn(conn)
    except Exception:
        try:
            conn.close()
        except Exception:
            pass


def with_db(callback, retries=2):
    last_error = None
    for attempt in range(retries):
        conn = None
        discard = False
        try:
            conn = get_conn()
            cur = conn.cursor()
            result = callback(cur, conn)
            conn.commit()
            return result
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as exc:
            last_error = exc
            discard = True
            if conn:
                try:
                    conn.rollback()
                except Exception:
                    pass
            if attempt < retries - 1:
                reset_pool()
                continue
            raise
        except Exception:
            if conn:
                try:
                    conn.rollback()
                except Exception:
                    pass
            raise
        finally:
            if conn:
                release_conn(conn, discard=discard)
    if last_error:
        raise last_error


def get_backend():
    return "postgres"


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
            payment_method TEXT,
            customer_name TEXT,
            shipping_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        cur.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;")
        cur.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;")
        cur.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;")

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
