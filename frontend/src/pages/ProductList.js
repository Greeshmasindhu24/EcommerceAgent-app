import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";

export default function ProductList({ addToCart }) {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products/${category}`);
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  if (loading) {
    return <div className="loading-state">Loading {category}...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/products/all" className="link-accent" style={{ display: "inline-block", marginBottom: "12px" }}>
          ← Back to Shop
        </Link>
        <h1 style={{ textTransform: "capitalize" }}>All Products ({products.length})</h1>
        <div style={{ marginTop: "20px" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "1px solid var(--aura-border)",
              borderRadius: "8px",
              fontFamily: "inherit",
              background: "white",
            }}
          >
            <option value="default">Default Sorting</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="empty-state">No products found in this category.</div>
      ) : (
        <div className="products-grid">
          {sortedProducts.map((p) => (
            <div key={p.id} className="product-card card">
              <img src={p.image} alt={p.name} className="product-image" />
              <div className="product-info">
                <span className="product-category">{p.category}</span>
                <h3 className="product-title">{p.name}</h3>
                <div className="product-footer">
                  <span className="product-price">₹{p.price.toLocaleString()}</span>
                  <button type="button" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.875rem" }} onClick={() => addToCart(p)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
