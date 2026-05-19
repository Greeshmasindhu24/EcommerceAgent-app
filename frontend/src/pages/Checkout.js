import React, { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function Checkout({ cart, setOrders, setCart }) {
    const [paymentMethod, setPaymentMethod] = useState("Credit/Debit Card");
    const [customerName, setCustomerName] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");

    const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

    const placeOrder = async () => {

        if (cart.length === 0) {
            alert("Cart is empty ❌");
            return;
        }

        if (!customerName.trim() || !shippingAddress.trim()) {
            alert("Please provide your name and shipping address 🏠");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to place an order 🔑");
            return;
        }

        try {
            await axios.post(`${API}/orders`, {
                total_amount: total,
                items: cart,
                payment_method: paymentMethod,
                customer_name: customerName,
                shipping_address: shippingAddress
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(prev => [...prev, { items: cart, total, customer_name: customerName, shipping_address: shippingAddress }]);
            setCart([]);

            alert(`✅ Order Placed Successfully via ${paymentMethod}!`);
        } catch (err) {
            console.error("Order failed", err);
            alert("❌ Failed to place order: " + (err.response?.data?.msg || err.message));
        }
    };


    const paymentOptions = [
        { id: "card", name: "Credit/Debit Card", icon: "💳" },
        { id: "gpay", name: "Google Pay", icon: "📱" },
        { id: "phonepe", name: "PhonePe", icon: "💜" },
        { id: "cod", name: "Cash on Delivery", icon: "💵" }
    ];

    return (
        <div style={{ padding: "30px", background: "white", borderRadius: "10px", border: "1px solid #eee" }}>
            <h2 style={{ marginBottom: "25px" }}>Secure Checkout</h2>

            <div style={{ marginBottom: "30px" }}>
                <p style={{ fontWeight: "600", marginBottom: "15px", fontSize: "0.9rem", color: "#666", textTransform: "uppercase" }}>Shipping Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.95rem" }}
                    />
                    <textarea
                        placeholder="Shipping Address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.95rem", minHeight: "80px", fontFamily: "inherit" }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
                <p style={{ fontWeight: "600", marginBottom: "15px", fontSize: "0.9rem", color: "#666", textTransform: "uppercase" }}>Order Summary</p>
                {cart.map(i => (
                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.95rem" }}>
                        <span>{i.name} <small>x{i.qty || 1}</small></span>
                        <span>₹{((i.price) * (i.qty || 1)).toLocaleString()}</span>
                    </div>
                ))}
            </div>

            <div style={{ borderTop: "2px solid #000", paddingTop: "15px", marginBottom: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>Total Amount</span>
                    <b style={{ fontSize: "1.5rem" }}>₹{total.toLocaleString()}</b>
                </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
                <p style={{ fontWeight: "600", marginBottom: "15px", fontSize: "0.9rem", color: "#666", textTransform: "uppercase" }}>Select Payment Method</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {paymentOptions.map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => setPaymentMethod(opt.name)}
                            style={{
                                padding: "12px 15px",
                                border: paymentMethod === opt.name ? "2px solid #000" : "1px solid #eee",
                                borderRadius: "5px",
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                background: paymentMethod === opt.name ? "#f9f9f9" : "white"
                            }}
                        >
                            <span style={{ fontSize: "1.2rem" }}>{opt.icon}</span>
                            <b style={{ flex: 1 }}>{opt.name}</b>
                            {paymentMethod === opt.name && <span>✓</span>}
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={placeOrder}
                style={{
                    padding: "15px 20px",
                    background: "black",
                    color: "white",
                    border: "none",
                    borderRadius: "0",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    width: "100%",
                    letterSpacing: "1px"
                }}
            >
                PLACE ORDER NOW
            </button>
            <p style={{ textAlign: "center", marginTop: "15px", fontSize: "0.8rem", color: "#888" }}>
                🔒 Secure SSL Encryption
            </p>
        </div>
    );
}


