import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import (
    JWTManager,
    create_access_token
)
from werkzeug.security import generate_password_hash, check_password_hash
from psycopg2.extras import Json
from google import genai

from db import execute, get_conn, init_db, parse_items, release_conn, with_db
from ai_chat import build_chat_prompt, generate_with_gemini, local_chat_reply

# ================= LOAD ENV =================
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ================= APP =================
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "secret-key"
)

jwt = JWTManager(app)

# ================= AI =================
ai_client = None

def get_ai():
    global ai_client

    if ai_client is None and GEMINI_API_KEY:
        ai_client = genai.Client(api_key=GEMINI_API_KEY)

    return ai_client


init_db()

# ================= HOME =================
@app.route("/")
def home():
    return "Backend Running Successfully (Supabase PostgreSQL only)"


@app.route("/db-status")
def db_status():
    try:
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute("SELECT 1")
            cur.fetchone()
            cur.close()
        finally:
            release_conn(conn)

        return jsonify({
            "status": "connected",
            "engine": "postgresql",
            "database": "supabase",
        })
    except Exception as exc:
        return jsonify({
            "status": "error",
            "engine": "postgresql",
            "database": "supabase",
            "message": str(exc),
            "hint": "Update POSTGRES_URL in backend/.env with a valid Supabase connection string.",
        }), 503


# ================= PRODUCTS =================
@app.route("/products/<category>")
def products(category):

    conn = get_conn()

    try:
        cur = conn.cursor()

        if category == "all":
            execute(cur, "SELECT * FROM products")
        else:
            execute(
                cur,
                "SELECT * FROM products WHERE category=%s",
                (category,)
            )

        rows = cur.fetchall()

        result = []

        for r in rows:
            result.append({
                "id": r[0],
                "name": r[1],
                "price": r[2],
                "image": r[3],
                "category": r[4],
                "description": r[5]
            })

        cur.close()

        return jsonify(result)

    finally:
        release_conn(conn)


# ================= REGISTER =================
@app.route("/register", methods=["POST"])
def register():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "msg": "Missing fields"
        }), 400

    hashed = generate_password_hash(password)

    conn = get_conn()

    try:
        cur = conn.cursor()

        execute(
            cur,
            "INSERT INTO users(email,password) VALUES(%s,%s)",
            (email, hashed)
        )

        conn.commit()
        cur.close()

        return jsonify({
            "msg": "Registered successfully"
        })

    except Exception as e:

        print(e)

        return jsonify({
            "msg": "User already exists"
        }), 400

    finally:
        release_conn(conn)


# ================= LOGIN =================
@app.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    conn = get_conn()

    try:
        cur = conn.cursor()

        execute(
            cur,
            "SELECT password FROM users WHERE email=%s",
            (email,)
        )

        user = cur.fetchone()

        cur.close()

        if user and check_password_hash(user[0], password):

            token = create_access_token(identity=email)

            return jsonify({
                "access_token": token
            })

        return jsonify({
            "msg": "Invalid credentials"
        }), 401

    finally:
        release_conn(conn)


# ================= PLACE ORDER =================
@app.route("/place-order", methods=["POST"])
def place_order():
    try:
        data = request.get_json(silent=True) or {}

        items = data.get("items", [])
        total = data.get("total", 0)
        email = data.get("email") or "guest"
        payment_method = data.get("payment_method") or "Credit/Debit Card"
        customer_name = data.get("customer_name")
        shipping_address = data.get("shipping_address")

        if not isinstance(items, list) or len(items) == 0:
            return jsonify({"msg": "Cart empty"}), 400

        if not email or email == "guest":
            return jsonify({"msg": "Please login before placing an order"}), 401

        def db_work(cur, conn):
            execute(cur, """
            INSERT INTO orders
            (user_email, total_amount, items, payment_method, customer_name, shipping_address)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """, (
                email,
                float(total),
                Json(items),
                payment_method,
                customer_name,
                shipping_address,
            ))
            return cur.fetchone()[0]

        order_id = with_db(db_work)

        return jsonify({
            "msg": "Order placed successfully",
            "order_id": order_id,
        }), 201

    except Exception as e:
        print("ORDER ERROR:", e)
        return jsonify({
            "msg": "Failed to place order",
            "error": str(e),
        }), 500


# ================= GET ORDERS =================
@app.route("/orders/<email>")
def get_orders(email):

    conn = get_conn()

    try:
        cur = conn.cursor()

        execute(cur, """
        SELECT id,total_amount,items,created_at
        FROM orders
        WHERE user_email=%s
        ORDER BY id DESC
        """, (email,))

        rows = cur.fetchall()

        result = []

        for r in rows:
            result.append({
                "id": r[0],
                "total": r[1],
                "items": parse_items(r[2]),
                "created_at": str(r[3])
            })

        cur.close()

        return jsonify(result)

    finally:
        release_conn(conn)


# ================= CHAT =================
@app.route("/chat", methods=["POST"])
def chat():

    try:

        message = request.json.get("message", "").strip()
        user_email = request.json.get("email")

        if not message:
            return jsonify({
                "reply": "Please enter a message."
            })

        conn = get_conn()

        try:
            cur = conn.cursor()

            execute(cur, """
            SELECT name, price, category, description
            FROM products
            """)

            product_rows = cur.fetchall()

            order_rows = []
            order_text = ""
            if user_email:
                execute(cur, """
                SELECT id, total_amount, items, created_at
                FROM orders
                WHERE user_email=%s
                ORDER BY id DESC
                LIMIT 5
                """, (user_email,))
                order_rows = cur.fetchall()
                if order_rows:
                    order_lines = []
                    for row in order_rows:
                        items = parse_items(row[2])
                        names = ", ".join(
                            item.get("name", "item") for item in items
                        )
                        order_lines.append(
                            f"Order #{row[0]} - ₹{row[1]} - {names} - {row[3]}"
                        )
                    order_text = "\n".join(order_lines)

            cur.close()

        finally:
            release_conn(conn)

        prompt = build_chat_prompt(message, product_rows, order_text, user_email)
        reply = generate_with_gemini(get_ai(), prompt)

        if not reply:
            print("Using local chat fallback (Gemini unavailable)")
            reply = local_chat_reply(message, product_rows, order_rows, user_email)

        return jsonify({"reply": reply})

    except Exception as e:

        print("CHAT ERROR:", e)

        return jsonify({
            "reply": "AI assistant unavailable currently. Please try again."
        })


# ================= RUN =================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5001")),
        debug=True
    )