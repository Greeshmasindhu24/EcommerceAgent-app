import re
import json

from db import parse_items

GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
]

SEARCH_INTENT_KEYWORDS = [
    "show", "list", "display", "find", "search", "suggest", "recommend",
    "browse", "see", "get", "give", "what do you have", "what do you sell",
]

SEARCH_STOPWORDS = [
    "show", "list", "display", "find", "search", "suggest", "recommend",
    "browse", "see", "get", "give", "me", "the", "a", "an", "for", "buy",
    "about", "details", "specs", "price", "cost", "wishlist", "cart",
    "products", "product", "items", "item", "all", "any", "some", "please",
    "mobile", "mobiles", "phone", "phones", "smartphone", "smartphones",
]

BRAND_KEYWORDS = {
    "samsung": ["samsung", "galaxy"],
    "apple": ["apple", "iphone", "macbook"],
    "nykaa": ["nykaa"],
    "nike": ["nike"],
    "sony": ["sony"],
    "asus": ["asus", "rog"],
    "lakme": ["lakme"],
    "playstation": ["playstation", "ps5"],
}

PRODUCT_ALIASES = {
    "iphone": "iPhone 15 Pro",
    "samsung": "Samsung Galaxy S24 Ultra",
    "galaxy": "Samsung Galaxy S24 Ultra",
    "macbook": "MacBook Air M3",
    "rog": "ASUS ROG Gaming Laptop",
    "asus": "ASUS ROG Gaming Laptop",
    "sony": "Sony WH1000XM5",
    "headphone": "Sony WH1000XM5",
    "nike": "Nike Air Max",
    "handbag": "Luxury Handbag",
    "lakme": "Lakme Makeup Kit",
    "makeup": "Lakme Makeup Kit",
    "nykaa": "Nykaa Face Serum",
    "serum": "Nykaa Face Serum",
    "playstation": "PlayStation 5",
    "ps5": "PlayStation 5",
}

CATEGORY_KEYWORDS = {
    "mobiles": ["mobile", "phone", "smartphone"],
    "laptops": ["laptop", "notebook", "computer"],
    "electronics": ["headphone", "earphone", "speaker", "electronic"],
    "fashion": ["shoe", "sneaker", "handbag", "bag", "fashion", "wear"],
    "beauty": ["makeup", "beauty", "serum", "skincare", "cosmetic"],
    "gaming": ["gaming", "console", "game"],
}

STORE_POLICIES = """
- 30-day return policy for unused items in original packaging
- Refunds processed within 5-7 business days
- Free shipping on orders above ₹5,000; standard delivery in 3-5 business days
- Payment: credit/debit cards, UPI, Google Pay, PhonePe, and Cash on Delivery
- Support email: support@mystore.com
"""


def infer_product_brand(product):
    explicit_brand = product.get("brand")
    if explicit_brand:
        return explicit_brand

    text = f"{product.get('name', '')} {product.get('description', '')}".lower()
    for brand_name, keywords in BRAND_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return brand_name
    return ""


def extract_brand_from_text(text):
    msg = text.lower().strip()
    for brand_name, keywords in BRAND_KEYWORDS.items():
        if any(keyword in msg for keyword in keywords):
            return brand_name
    return None


def extract_category_from_text(text):
    msg = text.lower().strip()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in msg for keyword in keywords):
            return category
    return None


def clean_search_query(text):
    msg = text.lower().strip()
    stopword_pattern = r"\b(" + "|".join(re.escape(word) for word in SEARCH_STOPWORDS) + r")\b"
    clean_q = re.sub(stopword_pattern, " ", msg)
    clean_q = re.sub(r"\s+", " ", clean_q).strip()
    return clean_q


def extract_search_filters(message):
    msg = message.lower().strip()
    brand = extract_brand_from_text(msg)
    category = extract_category_from_text(msg)
    clean_q = clean_search_query(msg)

    if brand and clean_q == brand:
        clean_q = ""
    if category and clean_q == category:
        clean_q = ""

    return brand, category, clean_q


def product_matches_brand(product, brand):
    if not brand:
        return True

    product_brand = infer_product_brand(product).lower()
    if product_brand and brand.lower() in product_brand:
        return True

    searchable = f"{product.get('name', '')} {product.get('description', '')}".lower()
    keywords = BRAND_KEYWORDS.get(brand.lower(), [brand.lower()])
    return any(keyword in searchable for keyword in keywords)


def is_product_search_message(message):
    msg = message.lower().strip()
    if any(keyword in msg for keyword in SEARCH_INTENT_KEYWORDS):
        return True
    if extract_brand_from_text(msg) or extract_category_from_text(msg):
        return True
    return any(keyword in msg for cats in CATEGORY_KEYWORDS.values() for keyword in cats)


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
    brand, category, clean_q = extract_search_filters(message)

    if brand:
        matched = [
            p for p in matched
            if product_matches_brand({"name": p[0], "description": p[3]}, brand)
        ]
    elif category:
        matched = [p for p in product_rows if p[2] == category]
    elif clean_q:
        matched = [
            p for p in product_rows
            if clean_q in p[0].lower() or any(word in p[0].lower() for word in clean_q.split() if len(word) > 2)
        ]

    price_match = re.search(
        r"(?:under|below|less than|max|upto|up to)\s*₹?\s*([\d,]+)|₹?\s*([\d,]+)\s*(?:budget|range)",
        msg,
    )
    if price_match:
        raw = price_match.group(1) or price_match.group(2)
        limit = int(re.sub(r"[^\d]", "", raw))
        matched = [p for p in matched if p[1] <= limit]

    product_intent = is_product_search_message(message) or any(
        k in msg
        for k in [
            "product", "best", "buy", "cheap", "price", "cost",
            "available", "catalog",
        ]
    )

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


def detect_sales_intent_local(message):
    msg = message.lower().strip()
    
    # Check "Add All to Cart" first
    if any(k in msg for k in ["add all", "add all of them", "add all these", "add everything"]):
        return {
            "intent": "Add All to Cart",
            "product_query": None,
            "category": None
        }
    
    # Check "Add to Cart"
    if "cart" in msg and any(k in msg for k in ["add", "put", "insert"]):
        product_query = None
        for k in ["add", "put"]:
            if k in msg:
                parts = msg.split(k)
                if len(parts) > 1:
                    sub = parts[1].split("to cart")[0].strip()
                    sub = re.sub(r"\b(the|this|my|a|an|products|product|items|item)\b", "", sub).strip()
                    if len(sub) > 1:
                        product_query = sub
        return {
            "intent": "Add to Cart",
            "product_query": product_query,
            "category": None
        }
        
    # Check "Add to Wishlist"
    if "wishlist" in msg:
        product_query = None
        for k in ["add", "put"]:
            if k in msg:
                parts = msg.split(k)
                if len(parts) > 1:
                    sub = parts[1].split("to wishlist")[0].strip()
                    sub = re.sub(r"\b(the|this|my|a|an|products|product|items|item)\b", "", sub).strip()
                    if len(sub) > 1:
                        product_query = sub
        return {
            "intent": "Add to Wishlist",
            "product_query": product_query,
            "category": None
        }
        
    # Check "Buy Now"
    if any(k in msg for k in ["buy now", "purchase now", "checkout now", "buy this", "buy the", "buy it"]):
        product_query = None
        match = re.search(r"\bbuy\s+(?:now\s+)?(?:the|this|it|a|an)?\s*(.*)", msg)
        if match:
            sub = match.group(1).replace("now", "").strip()
            sub = re.sub(r"\b(the|this|my|a|an|products|product|items|item)\b", "", sub).strip()
            if len(sub) > 1:
                product_query = sub
        return {
            "intent": "Buy Now",
            "product_query": product_query,
            "category": None
        }
        
    # Check Product Details
    if any(k in msg for k in ["detail", "spec", "description", "how much", "rating", "review"]) or (
        any(k in msg for k in ["price", "cost"]) and not is_product_search_message(message)
    ):
        product_query = msg
        for k in ["price of", "cost of", "details of", "specs of", "about"]:
            if k in msg:
                product_query = msg.split(k)[1].strip()
                break
        product_query = re.sub(r"\b(price|cost|how much|details|specs|description|rating|reviews|review)\b", "", product_query).strip()
        brand, category, _ = extract_search_filters(product_query or message)
        return {
            "intent": "Product Details",
            "product_query": product_query,
            "category": category,
            "brand": brand,
        }

    brand, category, _ = extract_search_filters(message)
    return {
        "intent": "Product Search",
        "product_query": message,
        "category": category,
        "brand": brand,
    }


def find_matching_products(query_str, category_str, products, brand_str=None):
    """
    products: list of dicts with keys: id, name, price, image, category, description
    """
    source_text = " ".join(
        part for part in [query_str or "", category_str or "", brand_str or ""] if part
    ).strip()
    if not source_text:
        return []

    brand, category, clean_q = extract_search_filters(source_text)
    if brand_str:
        brand = brand_str.lower().strip()
    if category_str:
        category = category_str.lower().strip()

    candidates = list(products)

    if brand:
        candidates = [p for p in candidates if product_matches_brand(p, brand)]
        if not candidates:
            return []

    if category:
        candidates = [p for p in candidates if p["category"].lower() == category]
        if not candidates:
            return []

    if not clean_q:
        return candidates if (brand or category) else []

    for alias, product_name in PRODUCT_ALIASES.items():
        if alias in clean_q:
            matched = [p for p in candidates if p["name"].lower() == product_name.lower()]
            if matched:
                return matched

    matched = [p for p in candidates if clean_q in p["name"].lower()]
    if matched:
        return matched

    q_words = [w for w in clean_q.split() if len(w) > 2]
    if q_words:
        matched = [p for p in candidates if any(w in p["name"].lower() for w in q_words)]
        if matched:
            return matched

        matched = [
            p for p in candidates
            if any(w in f"{p['name']} {p.get('description', '')}".lower() for w in q_words)
        ]
        if matched:
            return matched

    return candidates if (brand or category) else []


def process_chat_query(client, message, products, last_seen_products=None):
    """
    products: list of dicts with keys: id, name, price, image, category, description
    last_seen_products: list of dicts or None
    """
    intent_data = None
    if client:
        try:
            prompt = f"""
Analyze the customer's query and extract their intent, target product name, brand, and target category.
The allowed intents are:
- "Product Search" (searching/filtering/listing products by brand, category, or keywords — includes show, list, display, find, search, suggest)
- "Product Details" (asking for details, price, rating, specs, or description of a specific product)
- "Add to Cart" (adding a specific product or the current/last product to cart)
- "Add All to Cart" (adding all previously listed/shown/mentioned products to cart)
- "Add to Wishlist" (adding a specific product or the current/last product to wishlist)
- "Buy Now" (purchasing/buying a specific product or the current/last product immediately)

Return your response in raw JSON format with these exact keys:
{{
  "intent": "intent_string",
  "product_query": "name of product or keywords if specified, otherwise null",
  "brand": "samsung" or "apple" or "nykaa" or "nike" or "sony" or "asus" or "lakme" or "playstation" or null,
  "category": "mobiles" or "laptops" or "electronics" or "fashion" or "beauty" or "gaming" or null
}}

Do not return any other text, only valid JSON.

Query: "{message}"
"""
            response_text = generate_with_gemini(client, prompt)
            if response_text:
                json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
                if json_match:
                    intent_data = json.loads(json_match.group(0))
        except Exception as e:
            print("Gemini intent detection failed, falling back to local:", e)
            
    if not intent_data:
        intent_data = detect_sales_intent_local(message)
        
    intent = intent_data.get("intent", "Product Search")
    product_query = intent_data.get("product_query")
    category = intent_data.get("category")
    brand = intent_data.get("brand")

    if not brand and product_query:
        brand = extract_brand_from_text(product_query)
    if not brand:
        brand = extract_brand_from_text(message)
    if not category:
        category = extract_category_from_text(message)
    
    print(f"Single Agent Chat detected intent: {intent} | Query: {product_query} | Brand: {brand} | Category: {category}")
    
    # 1. Product Search
    if intent == "Product Search":
        matched = find_matching_products(product_query, category, products, brand)
        if not matched:
            return {
                "reply": "No products found for your request.",
                "action": None,
                "products": []
            }
        
        lines = []
        for p in matched:
            lines.append(f"- **{p['name']}** — ₹{p['price']:,.0f} ({p['category']})\n  {p['description']}")
        
        reply = "I found matching product(s) in our store:\n\n" + "\n".join(lines)
        return {
            "reply": reply,
            "action": None,
            "products": matched
        }
        
    # 2. Product Details
    elif intent == "Product Details":
        matched = find_matching_products(product_query, category, products, brand)
        if not matched:
            return {
                "reply": "No products found for your request.",
                "action": None,
                "products": []
            }
            
        lines = []
        for p in matched:
            lines.append(
                f"**{p['name']}**\n"
                f"Price: ₹{p['price']:,.0f}\n"
                f"Category: {p['category']}\n"
                f"Details: {p['description']}\n"
            )
        reply = "\n\n".join(lines)
        return {
            "reply": reply,
            "action": None,
            "products": matched
        }
        
    # 3. Add to Cart
    elif intent == "Add to Cart":
        matched = []
        if product_query:
            matched = find_matching_products(product_query, category, products, brand)
        if not matched and last_seen_products:
            matched = [last_seen_products[0]]
            
        if not matched:
            return {
                "reply": "No products found for your request.",
                "action": None,
                "products": []
            }
            
        product_to_add = matched[0]
        reply = f"Added **{product_to_add['name']}** to your cart!"
        return {
            "reply": reply,
            "action": {
                "type": "ADD_TO_CART",
                "products": [product_to_add]
            },
            "products": matched
        }
        
    # 4. Add All to Cart
    elif intent == "Add All to Cart":
        if not last_seen_products:
            return {
                "reply": "No products found from the previous search/listing to add to the cart.",
                "action": None,
                "products": []
            }
            
        count = len(last_seen_products)
        names = ", ".join(f"**{p['name']}**" for p in last_seen_products)
        reply = f"Added {count} product(s) to your cart: {names}!"
        return {
            "reply": reply,
            "action": {
                "type": "ADD_ALL_TO_CART",
                "products": last_seen_products
            },
            "products": last_seen_products
        }
        
    # 5. Add to Wishlist
    elif intent == "Add to Wishlist":
        matched = []
        if product_query:
            matched = find_matching_products(product_query, category, products, brand)
        if not matched and last_seen_products:
            matched = [last_seen_products[0]]
            
        if not matched:
            return {
                "reply": "No products found for your request.",
                "action": None,
                "products": []
            }
            
        product_to_add = matched[0]
        reply = f"Added **{product_to_add['name']}** to your wishlist!"
        return {
            "reply": reply,
            "action": {
                "type": "ADD_TO_WISHLIST",
                "products": [product_to_add]
            },
            "products": matched
        }
        
    # 6. Buy Now
    elif intent == "Buy Now":
        matched = []
        if product_query:
            matched = find_matching_products(product_query, category, products, brand)
        if not matched and last_seen_products:
            matched = [last_seen_products[0]]
            
        if not matched:
            return {
                "reply": "No products found for your request.",
                "action": None,
                "products": []
            }
            
        product_to_buy = matched[0]
        reply = f"Starting checkout for **{product_to_buy['name']}**!"
        return {
            "reply": reply,
            "action": {
                "type": "BUY_NOW",
                "products": [product_to_buy]
            },
            "products": matched
        }
        
    return {
        "reply": "I couldn't process your request. Please try again.",
        "action": None,
        "products": []
    }

