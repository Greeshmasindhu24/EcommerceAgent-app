import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import google.generativeai as genai

# ---------------- LOAD ENV ----------------
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# ---------------- APP CONFIG ----------------
app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key") # Change this in production!
jwt = JWTManager(app)

# ---------------- AI CONFIG ----------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# ---------------- DB CONNECTION ----------------
def get_conn():
    return psycopg2.connect(DATABASE_URL)

# ---------------- INIT DB + SAMPLE DATA ----------------
def init_db():
    conn = get_conn()
    cur = conn.cursor()

    # Create Users Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
    """)

    # Create Products Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT,
        price FLOAT,
        image TEXT,
        category TEXT
    );
    """)

    # Seed products only if table is empty
    cur.execute("SELECT COUNT(*) FROM products")
    if cur.fetchone()[0] == 0:
        cur.execute("""
        INSERT INTO products (name, price, image, category) VALUES
        ('Rice Bag', 1200, '/images/rice_bag.png', 'grocery'),
        ('Milk Pack', 50, '/images/milk_pack.png', 'grocery'),
        ('Vegetables', 200, '/images/vegetables.png', 'grocery'),
        ('Smartphone', 15000, '/images/smartphone.png', 'electronics'),
        ('Laptop', 55000, '/images/laptop.png', 'electronics'),
        ('T-Shirt', 499, '/images/tshirt.png', 'fashion'),
        ('Shoes', 1499, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'fashion');
        """)

    conn.commit()
    cur.close()
    conn.close()
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
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, hashed_password))
        conn.commit()
        return jsonify({"msg": "User created successfully"}), 201
    except psycopg2.IntegrityError:
        return jsonify({"msg": "User already exists"}), 400
    finally:
        cur.close()
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT password FROM users WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and check_password_hash(user[0], password):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Bad email or password"}), 401

# ---------------- AI AGENT ROUTE ----------------

@app.route("/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message")
    if not user_msg:
        return jsonify({"msg": "No message provided"}), 400

    api_key = os.getenv("GEMINI_API_KEY")
    
    try:
        # Fetch available products to provide context
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT name, price, category FROM products")
        products = cur.fetchall()
        cur.close()
        conn.close()

        product_list = "\\n".join([f"- {p[0]} (₹{p[1]}, {p[2]})" for p in products])
        
        # If API key is missing, provide a smart mock response based on the products
        if not api_key:
            lowercase_msg = user_msg.lower()
            if "smartphone" in lowercase_msg or "phone" in lowercase_msg:
                return jsonify({"reply": "We have a Smartphone for ₹15000. It is in the electronics category!"})
            elif "budget" in lowercase_msg or "cheap" in lowercase_msg:
                return jsonify({"reply": "Our most budget-friendly item is the Milk Pack at ₹50! We also have a T-Shirt for ₹499."})
            else:
                return jsonify({"reply": f"I see you are asking about '{user_msg}'. I can tell you we have {len(products)} products in store right now!"})

        prompt = f"""
You are a helpful e-commerce support assistant for 'MyStore'.
Here is the current list of products available in our store:
{product_list}

Answer the following user query concisely and politely using the product information if relevant:
User: {user_msg}
"""
        response = model.generate_content(prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        print("Chat Error:", e)
        return jsonify({"reply": f"AI Error: {str(e)}"}), 500

# ---------------- PRODUCT ROUTES ----------------

@app.route("/")
def home():
    return "Ecommerce Backend Running 🚀"

@app.route("/products/<category>")
def get_products(category):

    conn = get_conn()
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
            "category": r[4]
        })

    cur.close()
    conn.close()

    return jsonify(products)

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True)