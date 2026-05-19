import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function Dashboard({ user }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await axios.get(`${API}/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
            <h1 style={{ marginBottom: "10px" }}>👤 My Account</h1>
            <div style={{
                background: "var(--card-bg)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                marginBottom: "40px"
            }}>
                <h3 style={{ margin: 0 }}>Email: <span style={{ color: "var(--primary-color)" }}>{user?.email}</span></h3>
            </div>

            <h2 style={{ marginBottom: "20px" }}>📦 Order History</h2>

            {loading ? (
                <p>Loading orders...</p>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", background: "var(--card-bg)", borderRadius: "12px" }}>
                    <p>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {orders.map((o) => (
                        <div key={o.id} style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--border-color)",
                            padding: "20px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
                                <span>Order <b>#{o.id}</b></span>
                                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{new Date(o.date).toLocaleDateString()}</span>
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                {o.items.map((i, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                        <span>{i.name} <small style={{ color: "var(--text-secondary)" }}>x{i.qty || 1}</small></span>
                                        <span>₹{((i.price) * (i.qty || 1)).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "10px", borderTop: "1px dashed var(--border-color)" }}>
                                <div>
                                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Status: </span>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                        fontSize: "0.8rem",
                                        background: "#e0f2fe",
                                        color: "#0369a1",
                                        fontWeight: "bold"
                                    }}>{o.status}</span>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "5px" }}>
                                        <b>Customer:</b> {o.customer_name || user?.email}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                        <b>Address:</b> {o.shipping_address || "N/A"}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                        <b>Method:</b> {o.payment_method}
                                    </div>
                                </div>
                                <b style={{ fontSize: "1.2rem", color: "var(--primary-color)" }}>Total: ₹{o.total.toLocaleString()}</b>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}