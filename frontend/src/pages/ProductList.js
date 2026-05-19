import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

export default function ProductList({ addToCart }) {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API}/products/${category}`);
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching products", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [category]);

    if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Loading {category}...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ textAlign: "center", marginBottom: "30px", textTransform: "capitalize" }}>{category}</h1>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px"
            }}>
                {products.length === 0 ? (
                    <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>No products found in this category.</p>
                ) : (
                    products.map(p => (
                        <div key={p.id} style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            borderRadius: "10px",
                            textAlign: "center",
                            background: "white",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                        }}>
                            <img src={p.image} alt={p.name} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "5px" }} />
                            <h3>{p.name}</h3>
                            <p style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#2874f0" }}>₹{p.price}</p>
                            <button
                                onClick={() => addToCart(p)}
                                style={{
                                    padding: "8px 15px",
                                    background: "#fb641b",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer"
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
