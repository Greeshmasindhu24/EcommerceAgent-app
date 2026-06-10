import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["all", "mobiles", "laptops", "electronics", "fashion", "beauty", "gaming"];

const CATEGORY_LABELS = {
  all: "All",
  mobiles: "Mobiles",
  laptops: "Laptops",
  electronics: "Electronics",
  fashion: "Fashion",
  beauty: "Beauty",
  gaming: "Gaming",
};

const CATEGORY_IMAGES = {
  all: "https://images.unsplash.com/photo-1441984904996-e0b6a6876864?w=800&q=80",
  mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  electronics: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80",
  fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
  gaming: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
};

const TESTIMONIALS = [
  {
    quote: "The build quality of the headphones is exceptional. Minimalist design paired with incredible sound.",
    initials: "JD",
    name: "John Doe",
    role: "Verified Buyer",
    color: "indigo",
    stars: 5,
  },
  {
    quote: "The smart watch completely changed my workflow. It's sleek, responsive, and looks amazing.",
    initials: "AS",
    name: "Alice Smith",
    role: "Tech Reviewer",
    color: "purple",
    stars: 5,
  },
  {
    quote: "Customer service was fantastic. They helped me choose the right VR headset. Highly recommend!",
    initials: "MB",
    name: "Marcus Brown",
    role: "Designer",
    color: "emerald",
    stars: 4,
  },
];

export default function Home({ products, addToCart, category, setCategory, loading }) {
  const { category: routeCategory } = useParams();
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    if (routeCategory) {
      setCategory(routeCategory);
    }
  }, [routeCategory, setCategory]);

  const sortedProducts = [...(products || [])].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  const premiumProducts = sortedProducts.slice(0, 4);

  return (
    <div className="storefront">
      <section className="store-promo">
        <div className="container store-promo-inner">
          <div>
            <p className="store-promo-tag">Premium Collection 2026</p>
            <h1>Style — Online Shopping</h1>
            <p>Discover our premium collection of mobiles, laptops, fashion, and more — shop and checkout in one place.</p>
          </div>
          <div className="store-promo-badge">Free delivery on orders above ₹5,000</div>
        </div>
      </section>

      <section className="section container">
        <div className="section-header">
          <h2>Shop by Category</h2>
        </div>
        <div className="categories-grid">
          {CATEGORIES.filter((cat) => cat !== "all").map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-card ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              <img src={CATEGORY_IMAGES[cat]} alt={CATEGORY_LABELS[cat]} />
              <div className="category-overlay">
                <div>
                  <h3>{CATEGORY_LABELS[cat]}</h3>
                  <span>Explore Collection →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {!loading && premiumProducts.length > 0 && category === "all" && (
        <section id="premium-collection" className="section container" style={{ borderTop: "1px solid var(--aura-border)" }}>
          <div className="section-row">
            <div>
              <h2>Premium Collection</h2>
              <p>Our top picks for this season.</p>
            </div>
          </div>
          <div className="products-grid" style={{ paddingTop: 0 }}>
            {premiumProducts.map((product) => (
              <ProductCard key={`premium-${product.id}`} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </section>
      )}

      <section className="container store-section">
        <div className="store-toolbar">
          <div>
            <h2 className="store-section-title" style={{ marginBottom: 4 }}>
              {category === "all" ? "All Products" : CATEGORY_LABELS[category]}
            </h2>
            <p className="store-count">{(products || []).length} items</p>
          </div>
          <select className="store-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default Sorting</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className="filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn ${category === cat ? "btn-primary" : "btn-outline"}`}
              onClick={() => setCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : sortedProducts.length === 0 ? (
          <div className="empty-state">No products found in this category.</div>
        ) : (
          <div className="products-grid">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </section>

      <section className="testimonials-section section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((item) => (
              <div key={item.name} className="testimonial-card">
                <div className="testimonial-stars">{"★".repeat(item.stars)}{item.stars < 5 ? "☆" : ""}</div>
                <p className="testimonial-text">&ldquo;{item.quote}&rdquo;</p>
                <div className="testimonial-author">
                  <div className={`author-avatar ${item.color}`}>{item.initials}</div>
                  <div>
                    <h4>{item.name}</h4>
                    <span>{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "48px" }}>
        <div className="ai-banner ai-banner-compact">
          <h2>Style AI Assistant</h2>
          <p>Ask about products, orders, or support using the chat button below.</p>
        </div>
      </section>
    </div>
  );
}
