import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:5000";

export default function Home({ addToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API}/products/all`);
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching products", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <header className="hero" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1576905341935-40dc1bd953e1?w=1600")' }}>
                <div className="hero-content">
                    <p className="hero-subtitle">NEW COLLECTION 2026</p>
                    <h1 className="hero-title">Style Redefined</h1>
                    <p className="hero-description">
                        Discover our highly curated collection of premium essentials tailored for your unique aesthetic.
                    </p>
                    <div className="hero-btns">
                        <Link to="/products/all" className="btn-white">Shop Now</Link>
                        <button className="btn-outline-white">Learn More</button>
                    </div>
                </div>
            </header>

            {/* Product Section */}
            <div className="container" style={{ paddingBottom: "100px" }}>
                <h2 style={{ fontSize: "2rem", marginBottom: "40px", textAlign: "center" }}>Featured Collection</h2>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>Loading products...</div>
                ) : (
                    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
                        {products.map(p => (
                            <div key={p.id} className="card" style={{ padding: "0" }}>
                                <div style={{ height: "350px", overflow: "hidden", position: "relative" }}>
                                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                                    <div style={{
                                        position: "absolute",
                                        bottom: "20px",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        width: "80%",
                                        opacity: 0,
                                        transition: "all 0.3s ease",
                                        className: "card-action-btn"
                                    }}>
                                    </div>
                                </div>
                                <div style={{ padding: "20px", textAlign: "center" }}>
                                    <p style={{ fontSize: "0.8rem", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>{p.category}</p>
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "10px" }}>{p.name}</h3>
                                    <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>₹{p.price.toLocaleString()}</p>
                                    <button
                                        onClick={() => addToCart(p)}
                                        style={{
                                            marginTop: "15px",
                                            padding: "10px 20px",
                                            background: "black",
                                            color: "white",
                                            borderRadius: "0",
                                            width: "100%",
                                            fontWeight: "bold",
                                            letterSpacing: "1px"
                                        }}
                                    >
                                        ADD TO CART
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

