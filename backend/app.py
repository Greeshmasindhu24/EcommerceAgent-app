import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from google import genai

# ---------------- LOAD ENV ----------------
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# ---------------- APP CONFIG ----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 60 * 60 * 24 * 7  # 7 days in seconds
jwt = JWTManager(app)

# ---------------- AI CONFIG ----------------
_ai_client = None

def get_ai_client():
    global _ai_client
    if _ai_client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            _ai_client = genai.Client(api_key=api_key)
    return _ai_client

# Try models in order until one works (handles 503 overload / 429 quota errors)
def generate_with_fallback(prompt):
    client = get_ai_client()
    if not client:
        raise Exception("MISSING_API_KEY")

    models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"]
    quota_exhausted = False
    last_err = None
    
    for model_name in models:
        try:
            response = client.models.generate_content(model=model_name, contents=prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            err_str = str(e)
            print(f"Model {model_name} failed: {e}")
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                quota_exhausted = True
            last_err = e
            
    if quota_exhausted:
        raise Exception("QUOTA_EXCEEDED")
    raise last_err


# ---------------- DB CONNECTION POOL ----------------
# Pool reuses connections instead of opening a new one per request (much faster with Supabase)
_pool = None

def get_pool():
    global _pool
    if _pool is None:
        _pool = pool.ThreadedConnectionPool(1, 10, DATABASE_URL)
    return _pool

def get_conn():
    return get_pool().getconn()

def release_conn(conn):
    get_pool().putconn(conn)

# ---------------- INIT DB + SAMPLE DATA ----------------
def init_db():
    conn = get_conn()
    try:
        cur = conn.cursor()
        # Create all tables only if they don't exist (fast on restarts)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_email TEXT NOT NULL,
            total_amount FLOAT NOT NULL,
            items JSONB NOT NULL,
            status TEXT DEFAULT 'Paid & Processing',
            payment_method TEXT DEFAULT 'Dummy Card',
            customer_name TEXT,
            shipping_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Ensure columns exist if table was created previously
        try:
            cur.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;")
            cur.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;")
            conn.commit()
        except Exception as e:
            print("Alter table error (likely already exists):", e)
            conn.rollback()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT,
            price FLOAT,
            image TEXT,
            category TEXT,
            description TEXT,
            rating FLOAT DEFAULT 4.5,
            reviews_count INTEGER DEFAULT 100,
            specs JSONB
        );
        """)

        # Only seed products if the table is empty (skip on every subsequent restart)
        cur.execute("SELECT COUNT(*) FROM products;")
        count = cur.fetchone()[0]

        if count == 0:
            print("Seeding products...")
            cur.execute("""
            INSERT INTO products (name, price, image, category, description, rating, reviews_count, specs) VALUES
            ('MacBook Pro M3', 149000, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 'laptops', 'The latest Apple MacBook Pro with M3 chip, delivering extraordinary performance and battery life.', 4.9, 340, '{"processor": "Apple M3", "ram": "16GB", "storage": "512GB SSD", "display": "14-inch Liquid Retina XDR"}'),
            ('Dell XPS 15', 125000, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600', 'laptops', 'Powerful Windows laptop featuring a stunning 4K OLED display and Intel Core i7 processor.', 4.7, 210, '{"processor": "Intel Core i7 13th Gen", "ram": "16GB", "storage": "1TB SSD", "display": "15.6-inch 4K OLED"}'),
            ('ASUS ROG Zephyrus G14', 135000, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', 'laptops', 'High-performance gaming laptop with AMD Ryzen 9 and RTX 4060 in a compact 14-inch chassis.', 4.8, 150, '{"processor": "AMD Ryzen 9", "ram": "32GB", "storage": "1TB SSD", "display": "14-inch QHD 165Hz", "gpu": "NVIDIA RTX 4060"}'),
            ('Elegant Summer Dress', 2499, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600', 'fashion', 'A beautiful floral summer dress perfect for warm days and casual outings.', 4.6, 85, '{}'),
            ('Classic Leather Jacket', 5999, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 'fashion', 'Premium faux leather jacket with a timeless design. Durable and stylish.', 4.8, 120, '{}'),
            ('Running Sneakers', 3499, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'fashion', 'Lightweight and comfortable running shoes with excellent grip and support.', 4.5, 430, '{}'),
            ('Wireless Noise-Cancelling Headphones', 12000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'electronics', 'Over-ear headphones with active noise cancellation and 30-hour battery life.', 4.7, 500, '{}'),
            ('Split Air Conditioner 1.5 Ton', 35000, 'https://images.unsplash.com/photo-1762341123870-d706f257a12e?w=1080', 'electronics', 'Energy efficient 5-star AC with fast cooling and low noise.', 4.6, 110, '{}'),
            ('Double Door Refrigerator', 28000, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600', 'electronics', 'Frost-free double door fridge with convertible freezer.', 4.8, 190, '{}'),
            ('Designer Handbag', 4500, 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600', 'fashion', 'Luxury PU leather handbag with spacious compartments and elegant design.', 4.7, 215, '{}'),
            ('Men''s Formal Suit', 8500, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600', 'fashion', 'A sleek and modern two-piece formal suit.', 4.8, 140, '{}'),
            ('Casual Denim Jeans', 1899, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', 'fashion', 'Classic straight fit denim jeans for everyday wear.', 4.4, 300, '{}'),
            ('Stylish Aviator Sunglasses', 1299, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', 'fashion', 'UV protected aviator sunglasses with a golden frame.', 4.5, 410, '{}'),
            ('Smart TV 55 Inch 4K', 42000, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', 'electronics', 'Ultra HD Smart LED TV with built-in streaming apps.', 4.7, 512, '{}'),
            ('Washing Machine Front Load', 32000, 'https://images.unsplash.com/photo-1626806787426-5910811b6325?w=600', 'electronics', 'Fully automatic front load washing machine with inverter technology.', 4.6, 185, '{}'),
            ('Digital Mirrorless Camera', 85000, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600', 'electronics', '24.2MP mirrorless camera with 4K video recording.', 4.9, 120, '{}');
            """)
            print("Products seeded successfully.")
        else:
            print(f"DB ready — {count} products loaded, skipping seed.")

        conn.commit()
        cur.close()
    finally:
        release_conn(conn)
# run once
init_db()

# ---------------- AUTH ROUTES ----------------

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    hashed_password = generate_password_hash(password)

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, hashed_password))
        conn.commit()
        cur.close()
        return jsonify({"msg": "User created successfully"}), 201
    except psycopg2.IntegrityError:
        return jsonify({"msg": "User already exists"}), 400
    finally:
        release_conn(conn)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT password FROM users WHERE email=%s", (email,))
        user = cur.fetchone()
        cur.close()
        if user and check_password_hash(user[0], password):
            access_token = create_access_token(identity=email)
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"msg": "Bad email or password"}), 401
    finally:
        release_conn(conn)

# ---------------- ORDER ROUTES ----------------

@app.route("/orders", methods=["POST"])
@jwt_required()
def place_order():
    user_email = get_jwt_identity()
    data = request.json
    total_amount = data.get("total_amount")
    items = data.get("items")
    payment_method = data.get("payment_method", "Dummy Card")
    customer_name = data.get("customer_name")
    shipping_address = data.get("shipping_address")

    if not items or not total_amount:
        return jsonify({"msg": "Missing order details"}), 400

    import json
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO orders (user_email, total_amount, items, payment_method, customer_name, shipping_address) VALUES (%s, %s, %s, %s, %s, %s)",
            (user_email, total_amount, json.dumps(items), payment_method, customer_name, shipping_address)
        )
        conn.commit()
        cur.close()
        return jsonify({"msg": "Order placed successfully"}), 201
    finally:
        release_conn(conn)

@app.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
    user_email = get_jwt_identity()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, total_amount, items, status, payment_method, customer_name, shipping_address, created_at FROM orders WHERE user_email=%s ORDER BY created_at DESC", (user_email,))
        rows = cur.fetchall()
        cur.close()
        
        orders = []
        for r in rows:
            orders.append({
                "id": r[0],
                "total": r[1],
                "items": r[2],
                "status": r[3],
                "payment_method": r[4],
                "customer_name": r[5],
                "shipping_address": r[6],
                "date": r[7].isoformat()
            })

        return jsonify(orders)
    finally:
        release_conn(conn)


# ---------------- AI AGENT ROUTE ----------------

@app.route("/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message")
    if not user_msg:
        return jsonify({"msg": "No message provided"}), 400

    print(f"Chat request received: {user_msg}")
    api_key = os.getenv("GEMINI_API_KEY")
    
    def get_mock_reply(msg, products):
        lowercase_msg = msg.lower()
        if "laptop" in lowercase_msg or "macbook" in lowercase_msg:
            return "We have the MacBook Pro M3 (₹1,49,000) and Dell XPS 15 (₹1,25,000) in our premium collection."
        elif "fashion" in lowercase_msg or "dress" in lowercase_msg:
            return "Our fashion collection features elegant summer dresses (₹2,499) and classic leather jackets (₹5,999)."
        elif "electronics" in lowercase_msg:
            return "We offer top-tier electronics including noise-cancelling headphones (₹12,000) and 4K Smart TVs."
        else:
            return f"Welcome to STYLE. I'm here to help you find the best in fashion and tech. We have {len(products)} premium items currently available!"

    try:
        # Fetch available products to provide context
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute("SELECT name, price, category FROM products")
            products = cur.fetchall()
            cur.close()
        finally:
            release_conn(conn)

        print(f"Found {len(products)} products for context")
        product_list = "\\n".join([f"- {p[0]} (₹{p[1]}, {p[2]})" for p in products])
        
        # If API key is missing, provide a smart mock response
        if not api_key:
            return jsonify({"reply": get_mock_reply(user_msg, products)})

        prompt = f"""
You are STYLE. Assistant, a premium AI shopping guide for an high-end ecommerce store.
Available Products context:
{product_list}

Rules:
- Be helpful, concise, and elegant.
- Refer to prices in ₹ (INR).
- If a product is not in the list, politely say we don't carry it yet.
- Focus on quality and lifestyle.

User: {user_msg}
"""
        reply = generate_with_fallback(prompt)
        print(f"AI Reply: {reply[:100]}...")
        return jsonify({"reply": reply})
    except Exception as e:
        err_str = str(e)
        print("Chat Error:", err_str)
        if "QUOTA_EXCEEDED" in err_str or "MISSING_API_KEY" in err_str:
             return jsonify({"reply": get_mock_reply(user_msg, products)})
        
        return jsonify({"reply": "I'm experiencing a brief connection issue. Please feel free to browse our collections while I refresh!"}), 200

# ---------------- PRODUCT ROUTES ----------------

@app.route("/")
def home():
    return "Ecommerce Backend Running 🚀"

@app.route("/products/<category>")
def get_products(category):
    conn = get_conn()
    try:
        cur = conn.cursor()

        if category == "all":
            cur.execute("SELECT * FROM products")
        else:
            cur.execute("SELECT * FROM products WHERE category=%s", (category,))

        rows = cur.fetchall()

        products = []
        for r in rows:
            products.append({
                "id": r[0],
                "name": r[1],
                "price": r[2],
                "image": r[3],
                "category": r[4],
                "description": r[5],
                "rating": r[6],
                "reviews_count": r[7],
                "specs": r[8]
            })

        cur.close()
        return jsonify(products)
    finally:
        release_conn(conn)

@app.route("/recommend", methods=["POST"])
def recommend_products():
    data = request.json
    user_needs = data.get("needs")
    category = data.get("category", "laptops") # 'laptops' or 'fashion'
    
    if not user_needs:
        return jsonify({"msg": "No needs provided"}), 400

    api_key = os.getenv("GEMINI_API_KEY")
    
    # Fetch products
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, price, description, specs FROM products WHERE category=%s", (category,))
        products = cur.fetchall()
        cur.close()
    finally:
        release_conn(conn)
    
    product_list = "\\n".join([f"ID: {p[0]} - {p[1]} (₹{p[2]}) - {p[3]} - Specs: {p[4]}" for p in products])
    
    if not api_key:
        # Mock recommendation
        if len(products) > 0:
            return jsonify({"recommendation": f"Based on your needs '{user_needs}', we recommend {products[0][1]}.", "product_ids": [products[0][0]]})
        return jsonify({"recommendation": "Sorry, no products available."})

    prompt = f"""
    You are an AI shopping assistant for 'StyleTech Store'.
    The user is looking for {category}. Their specific needs/preferences are: "{user_needs}"
    
    Here is the list of available products in this category:
    {product_list}
    
    Based on the user's needs, recommend the best 1 or 2 products from the list. Explain why they fit the user's needs.
    Format your response nicely. Also, provide the recommended product IDs as a comma-separated list at the very end of your response like this: [IDs: 1, 2]
    """
    try:
        recommendation = generate_with_fallback(prompt)
        return jsonify({"recommendation": recommendation})
    except Exception as e:
        err_str = str(e)
        if "QUOTA_EXCEEDED" in err_str:
            return jsonify({"recommendation": "⚠️ The AI assistant has reached its daily free quota. It resets at midnight. Please try again later!"}), 200
        return jsonify({"recommendation": f"AI Error: {err_str}"}), 500

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True)