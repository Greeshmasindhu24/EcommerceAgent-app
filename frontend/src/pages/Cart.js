import React from "react";
import { Link } from "react-router-dom";

export default function Cart({ cart, setCart }) {
  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

  return (
    <div className="glass-panel" style={{ padding: "32px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "24px" }}>Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 0" }}>
          <p>Your cart is empty.</p>
          <Link to="/products/all" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cart.map((item) => (
              <div key={item.id} className="cart-item glass-panel" style={{ marginBottom: 0 }}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>{item.name}</h3>
                  <p style={{ color: "var(--aura-muted)", fontSize: "0.9rem" }}>
                    ₹{item.price.toLocaleString()} × {item.qty || 1}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <b>₹{((item.price) * (item.qty || 1)).toLocaleString()}</b>
                  <button
                    type="button"
                    onClick={() => setCart(cart.filter((p) => p.id !== item.id))}
                    style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", opacity: 0.5 }}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-row" style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--aura-border)" }}>
            <span>Subtotal</span>
            <b style={{ fontSize: "1.25rem" }}>₹{total.toLocaleString()}</b>
          </div>
          <p style={{ color: "var(--aura-muted)", fontSize: "0.875rem", marginTop: "8px" }}>
            Shipping and taxes calculated at checkout.
          </p>
        </>
      )}
    </div>
  );
}
