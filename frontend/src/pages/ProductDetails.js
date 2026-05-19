import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function ProductDetails({ addToCart }) {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Since there's no specific /product/:id endpoint in app.py, 
                // we fetch all and filter or we could assume the backend handles it.
                // Looking at app.py, there is no /product/<id> route.
                // I will fetch all products and find the one with the id.
                const res = await axios.get(`${API}/products/all`);
                const found = res.data.find(p => p.id === parseInt(id));
                setProduct(found);
            } catch (err) {
                console.error("Error fetching product", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Loading product details...</div>;
    if (!product) return <div style={{ padding: "50px", textAlign: "center" }}>Product not found!</div>;

    return (
        <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", display: "flex", gap: "40px" }}>
            <div style={{ flex: 1 }}>
                <img src={product.image} alt={product.name} style={{ width: "100%", borderRadius: "10px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }} />
            </div>
            <div style={{ flex: 1 }}>
                <h1>{product.name}</h1>
                <p style={{ fontSize: "0.9rem", color: "#888", textTransform: "uppercase" }}>{product.category}</p>
                <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
                    <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#2874f0" }}>₹{product.price}</span>
                </div>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#444" }}>{product.description}</p>

                <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
                    <button
                        onClick={() => {
                            if (addToCart) addToCart(product);
                            else alert("Add to cart functionality not linked!");
                        }}
                        style={{
                            padding: "15px 30px",
                            background: "#ff9f00",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            flex: 1
                        }}
                    >
                        ADD TO CART
                    </button>
                    <button
                        onClick={() => navigate("/cart")}
                        style={{
                            padding: "15px 30px",
                            background: "#fb641b",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            flex: 1
                        }}
                    >
                        GO TO CART
                    </button>
                </div>

                {product.specs && Object.keys(product.specs).length > 0 && (
                    <div style={{ marginTop: "40px" }}>
                        <h3>Specifications</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody>
                                {Object.entries(product.specs).map(([key, val]) => (
                                    <tr key={key} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: "10px", color: "#888", width: "40%" }}>{key}</td>
                                        <td style={{ padding: "10px", fontWeight: "500" }}>{val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
