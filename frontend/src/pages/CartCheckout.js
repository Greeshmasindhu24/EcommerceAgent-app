import React from "react";
import Cart from "./Cart";
import Checkout from "./Checkout";

export default function CartCheckout({ cart, setCart, setOrders, user }) {
    if (cart.length === 0) {
        return <Cart cart={cart} setCart={setCart} />;
    }

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px" }}>
            <div style={{ flex: 1, minWidth: "300px" }}>
                <Cart cart={cart} setCart={setCart} />
            </div>
            <div style={{ flex: 1, minWidth: "300px", borderLeft: "1px solid #eee", paddingLeft: "20px" }}>
                <Checkout cart={cart} setOrders={setOrders} setCart={setCart} />
            </div>
        </div>
    );
}
