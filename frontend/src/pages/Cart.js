import React from "react";
import { useNavigate } from "react-router-dom";

export default function Cart({ cart, setCart }) {

    const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

    return (
        <div style={{ padding: "30px", background: "#f9f9f9", borderRadius: "10px" }}>
            <h2 style={{ marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span>🛒</span> Your Shopping Bag
            </h2>

            {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <p style={{ color: "#888", fontSize: "1.1rem" }}>Your bag is currently empty.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {cart.map(i => (
                        <div key={i.id} style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            background: "white",
                            padding: "15px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}>
                            <div>
                                <p style={{ fontWeight: "600", marginBottom: "5px" }}>{i.name}</p>
                                <p style={{ fontSize: "0.9rem", color: "#666" }}>₹{i.price.toLocaleString()} x {i.qty || 1}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <b style={{ fontSize: "1.1rem" }}>₹{((i.price) * (i.qty || 1)).toLocaleString()}</b>
                                <button 
                                    onClick={() => setCart(cart.filter(p => p.id !== i.id))}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "1.2rem",
                                        cursor: "pointer",
                                        opacity: 0.6
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <div style={{ 
                        marginTop: "20px", 
                        paddingTop: "20px", 
                        borderTop: "2px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ fontSize: "1.2rem", color: "#666" }}>Subtotal</span>
                        <b style={{ fontSize: "1.5rem" }}>₹{total.toLocaleString()}</b>
                    </div>
                </div>
            )}
        </div>
    );
}