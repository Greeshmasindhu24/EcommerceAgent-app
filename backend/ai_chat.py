import re

from db import parse_items

GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
]

CATEGORY_KEYWORDS = {
    "mobiles": ["mobile", "phone", "iphone", "samsung", "smartphone"],
    "laptops": ["laptop", "macbook", "notebook", "computer"],
    "electronics": ["headphone", "earphone", "speaker", "electronic"],
    "fashion": ["shoe", "sneaker", "nike", "handbag", "bag", "fashion", "wear"],
    "beauty": ["makeup", "beauty", "serum", "skincare", "cosmetic"],
    "gaming": ["gaming", "playstation", "ps5", "console", "game"],
}

STORE_POLICIES = """
- 30-day return policy for unused items in original packaging
- Refunds processed within 5-7 business days
- Free shipping on orders above ₹5,000; standard delivery in 3-5 business days
- Payment: credit/debit cards, UPI, Google Pay, PhonePe, and Cash on Delivery
- Support email: support@mystore.com
"""


def build_chat_prompt(message, product_rows, order_text, user_email):
    product_list = "\n".join(
        f"- {name} | ₹{price:,.0f} | {category} | {description}"
        for name, price, category, description in product_rows
    )

    prompt = f"""You are MyStore's ecommerce AI assistant. Answer ONLY using the catalog and order data below.
Use ₹ (INR) for prices. Be concise, friendly, and specific. Recommend products from the catalog when relevant.

PRODUCT CATALOG:
{product_list}

STORE POLICIES:
{STORE_POLICIES}
"""

    if user_email:
        prompt += f"\nLOGGED-IN CUSTOMER: {user_email}\n"

    if order_text:
        prompt += f"""
CUSTOMER ORDER HISTORY:
{order_text}
"""

    prompt += f"""
CUSTOMER QUESTION: {message}

Instructions:
- For product questions: recommend matching items with name and price from the catalog
- For order questions: use the order history above; if none, say they have no orders yet
- For policy questions: use the store policies above
- Do not invent products or prices not listed in the catalog
"""
    return prompt


def generate_with_gemini(client, prompt):
    if not client:
        return None

    for model_name in GEMINI_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response and response.text:
                return response.text.strip()
        except Exception as exc:
            print(f"Model {model_name} failed: {exc}")

    return None


def _format_products(product_rows, limit=5):
    lines = []
    for name, price, category, description in product_rows[:limit]:
        lines.append(f"• {name} — ₹{price:,.0f} ({category}): {description}")
    return "\n".join(lines)


def local_chat_reply(message, product_rows, order_rows, user_email):
    msg = message.lower()

    if any(k in msg for k in ["return", "refund", "policy", "policies", "shipping", "delivery time"]):
        return f"Here are our store policies:\n{STORE_POLICIES.strip()}"

    if any(k in msg for k in ["payment", "pay", "upi", "cod", "cash on delivery", "google pay", "phonepe", "card"]):
        return (
            "We accept Credit/Debit Cards, UPI, Google Pay, PhonePe, and Cash on Delivery. "
            "Choose your preferred method at checkout."
        )

    if any(k in msg for k in ["order", "track", "tracking", "status", "where is my", "my purchase"]):
        if not user_email:
            return "Please log in first so I can look up your orders securely."
        if not order_rows:
            return "You don't have any orders yet. Add items to your cart and checkout to place your first order!"
        lines = ["Here are your recent orders:\n"]
        for row in order_rows:
            order_id, total, items_raw, created_at = row
            items = parse_items(items_raw)
            names = ", ".join(item.get("name", "item") for item in items)
            lines.append(f"📦 Order #{order_id} — ₹{total:,.0f} — {names} — {created_at}")
        lines.append("\nNeed help with a specific order? Tell me the order number.")
        return "\n".join(lines)

    matched = list(product_rows)
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in msg for keyword in keywords):
            matched = [p for p in product_rows if p[2] == category]
            break

    price_match = re.search(
        r"(?:under|below|less than|max|upto|up to)\s*₹?\s*([\d,]+)|₹?\s*([\d,]+)\s*(?:budget|range)",
        msg,
    )
    if price_match:
        raw = price_match.group(1) or price_match.group(2)
        limit = int(re.sub(r"[^\d]", "", raw))
        matched = [p for p in matched if p[1] <= limit]

    product_intent = any(
        k in msg
        for k in [
            "product", "recommend", "suggest", "show", "best", "buy",
            "cheap", "price", "cost", "available", "catalog", "list",
            "what do you have", "what do you sell",
        ]
    ) or any(kw in msg for cats in CATEGORY_KEYWORDS.values() for kw in cats)

    if product_intent or price_match:
        if matched:
            heading = "Here's what I recommend:\n\n" if product_intent else "Matching products:\n\n"
            return heading + _format_products(matched)
        if price_match:
            return "No products found in that price range. Try a higher budget or browse all categories."
        return (
            "We sell mobiles, laptops, electronics, fashion, beauty, and gaming products. "
            "Tell me a category or budget, e.g. 'laptops under 150000'."
        )

    if any(k in msg for k in ["hello", "hi", "hey", "help"]):
        return (
            "Hi! I'm your MyStore assistant. I can help with:\n"
            "• Product recommendations (e.g. 'gaming laptops under ₹150000')\n"
            "• Order tracking (log in first)\n"
            "• Returns, shipping, and payment info\n\n"
            "What would you like to know?"
        )

    sample = _format_products(product_rows, limit=3)
    return (
        "I can help with product recommendations, order tracking, and store policies.\n\n"
        f"Popular picks:\n{sample}\n\n"
        "Ask me something specific, like 'show me beauty products' or 'where is my order?'."
    )

