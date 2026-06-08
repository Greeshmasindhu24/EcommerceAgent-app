import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";
export default function Checkout({ cart, setOrders, setCart }) {

    const [loading, setLoading] = useState(false);

    const total = cart.reduce(
        (s, i) => s + i.price * (i.qty || 1),
        0
    );

    const placeOrder = async () => {

        if (cart.length === 0) {
            alert("Cart is empty ❌");
            return;
        }

        setLoading(true);

        try {

            const email =
                localStorage.getItem("email") || "guest@gmail.com";

            const response = await axios.post(
                `${API}/place-order`,
                {
                    items: cart,
                    total,
                    email
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    timeout: 30000
                }
            );

            console.log(response.data);

            // SAVE FRONTEND ORDERS
            setOrders(prev => [
                ...prev,
                {
                    items: cart,
                    total
                }
            ]);

            // CLEAR CART
            setCart([]);

            alert("✅ Order placed successfully!");

        } catch (err) {

            console.log("ORDER ERROR:", err);

            if (err.code === "ECONNABORTED") {
                alert("Server timeout. Try again.");
            }
            else if (err.response) {
                alert(
                    err.response.data.msg ||
                    "Backend error"
                );
            }
            else {
                alert(
                    "Network issue or backend crashed"
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>

            <h1>💳 Checkout</h1>

            {cart.map(i => (
                <div
                    key={i.id}
                    style={{
                        marginBottom: "10px",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "8px"
                    }}
                >
                    <b>{i.name}</b>

                    <p>
                        ₹{i.price} × {i.qty}
                    </p>
                </div>
            ))}

            <h2>Total: ₹{total}</h2>

            <button
                onClick={placeOrder}
                disabled={loading}
                style={{
                    padding: "12px 20px",
                    background: "#2874f0",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                }}
            >
                {loading
                    ? "Placing Order..."
                    : "Place Order"}
            </button>

        </div>
    );
}