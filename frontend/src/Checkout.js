import React from "react";

export default function Checkout({ cart, setOrders, setCart }) {

    const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

    const placeOrder = () => {

        if (cart.length === 0) {
            alert("Cart is empty ❌");
            return;
        }

        // ✅ Save order
        setOrders(prev => [...prev, { items: cart, total }]);

        // ✅ Clear cart after order
        setCart([]);

        alert("✅ Order Placed Successfully!");
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