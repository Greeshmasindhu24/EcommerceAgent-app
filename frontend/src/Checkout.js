import React from "react";

export default function Checkout({ cart, setOrders }) {

    const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

    const placeOrder = () => {
        setOrders(prev => [...prev, { items: cart, total }]);
        alert("Order Placed ✅");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>💳 Checkout</h1>

            {cart.map(i => (
                <div key={i.id}>
                    {i.name} - ₹{i.price} x {i.qty}
                </div>
            ))}

            <h2>Total: ₹{total}</h2>

            <button onClick={placeOrder}>
                Place Order
            </button>
        </div>
    );
}