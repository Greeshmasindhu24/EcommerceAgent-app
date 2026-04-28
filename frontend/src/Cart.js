import React from "react";
import { useNavigate } from "react-router-dom";

export default function Cart({ cart, setCart }) {

    const nav = useNavigate();

    const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

    return (
        <div style={{ padding: "20px" }}>
            <h1>🛒 Cart</h1>

            {cart.map(i => (
                <div key={i.id}>
                    {i.name} - ₹{i.price} x {i.qty}
                    <button onClick={() => setCart(cart.filter(p => p.id !== i.id))}>
                        ❌
                    </button>
                </div>
            ))}

            <h2>Total: ₹{total}</h2>

            <button onClick={() => nav("/checkout")}>
                Checkout
            </button>
        </div>
    );
}