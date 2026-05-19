import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

updates = [
    ("Rice Bag", "/images/rice_bag.png"),
    ("Milk Pack", "/images/milk_pack.png"),
    ("Vegetables", "/images/vegetables.png"),
    ("Smartphone", "/images/smartphone.png"),
    ("Laptop", "/images/laptop.png"),
    ("T-Shirt", "/images/tshirt.png"),
    ("Shoes", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600")
]

for name, image in updates:
    cur.execute("UPDATE products SET image = %s WHERE name = %s", (image, name))

conn.commit()
cur.close()
conn.close()

print("Database updated successfully!")
