import React from "react";
import Cart from "./Cart";
import Checkout from "./Checkout";

export default function CartCheckout({ cart, setCart, setOrders, user }) {
  return (
    <div className="container cart-layout">
      <div className="cart-items-column">
        <Cart cart={cart} setCart={setCart} />
      </div>
      {cart.length > 0 && (
        <Checkout cart={cart} setOrders={setOrders} setCart={setCart} user={user} />
      )}
    </div>
  );
}
