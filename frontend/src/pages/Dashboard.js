import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";

export default function Dashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const email = user?.email || localStorage.getItem("email");
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API}/orders/${encodeURIComponent(email)}`);
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleSignOut = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <div className="container" style={{ padding: "48px 24px" }}>
      <div className="account-header">
        <h1 className="checkout-page-title" style={{ margin: 0 }}>Your Account</h1>
        <button type="button" className="btn btn-outline" onClick={handleSignOut}>Sign Out</button>
      </div>

      <div className="glass-panel profile-card">
        <h3>Profile</h3>
        <p>Email: <strong>{user?.email || localStorage.getItem("email") || "Not available"}</strong></p>
      </div>

      <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "24px" }}>Order History</h2>

      {loading ? (
        <div className="loading-state">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state glass-panel">You haven&apos;t placed any orders yet.</div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="glass-panel order-card">
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--aura-border)", paddingBottom: "12px", marginBottom: "16px" }}>
              <span>Order <strong>#{order.id}</strong></span>
              <span style={{ color: "var(--aura-muted)", fontSize: "0.875rem" }}>
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
            {(order.customer_name || order.shipping_address) && (
              <div style={{ marginBottom: "16px", color: "var(--aura-text)", fontSize: "0.95rem" }}>
                {order.customer_name && <div><strong>Customer:</strong> {order.customer_name}</div>}
                {order.shipping_address && <div><strong>Delivery Address:</strong> {order.shipping_address}</div>}
              </div>
            )}
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="summary-row">
                <span>{item.name} × {item.qty || 1}</span>
                <span>₹{((item.price) * (item.qty || 1)).toLocaleString()}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Total</span>
              <span>₹{order.total.toLocaleString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
