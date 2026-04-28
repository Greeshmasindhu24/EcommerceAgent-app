import React from "react";

export default function Dashboard({ user, orders }) {

    return (
        <div style={{ padding: "20px" }}>
            <h1>👤 Dashboard</h1>

            <h3>Email: {user.email}</h3>

            <h2>📦 Orders</h2>

            {orders.length === 0 ? (
                <p>No orders yet</p>
            ) : (
                orders.map((o, idx) => (
                    <div key={idx} style={{ border: "1px solid #ccc", margin: "10px" }}>
                        {o.items.map(i => (
                            <div key={i.id}>
                                {i.name} - ₹{i.price} x {i.qty}
                            </div>
                        ))}
                        <b>Total: ₹{o.total}</b>
                    </div>
                ))
            )}
        </div>
    );
}