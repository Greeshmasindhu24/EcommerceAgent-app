import React, { useState, useEffect } from "react";
import { placeOrder as submitOrder, wakeBackend, getApiUrl } from "../api";

export default function Checkout({ cart, setOrders, setCart, user }) {
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendReady, setBackendReady] = useState(true);

  useEffect(() => {
    let cancelled = false;
    wakeBackend().then((ready) => {
      if (!cancelled) setBackendReady(ready);
    });
    return () => { cancelled = true; };
  }, []);

  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const customerName = `${firstName} ${lastName}`.trim();
  const shippingAddress = [address, city, zipCode].filter(Boolean).join(", ");

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !address.trim() || !city.trim() || !zipCode.trim()) {
      alert("Please fill in all shipping details: first name, last name, address, city, and ZIP code.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to place an order");
      return;
    }

    const email = user?.email || localStorage.getItem("email") || "guest";
    setLoading(true);

    try {
      await wakeBackend();
      await submitOrder({
        items: cart,
        total,
        email,
        payment_method: paymentMethod,
        customer_name: customerName,
        shipping_address: shippingAddress,
      });

      setOrders((prev) => [
        ...prev,
        {
          items: cart,
          total,
          customer_name: customerName,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
        },
      ]);
      setCart([]);
      alert(`Order placed successfully via ${paymentMethod}!`);
    } catch (err) {
      console.error("Order failed", err);
      let message = err.response?.data?.msg || err.message;
      if (err.response?.status === 401) {
        message = "Please log in again before placing an order.";
      } else if (!err.response && (err.code === "ECONNABORTED" || err.message?.includes("timeout"))) {
        message = "Render server is waking up (can take 60s). Wait, then try again.";
      } else if (!err.response) {
        message = `Cannot reach backend at ${getApiUrl()}. Check Render backend is running.`;
      }
      alert("Failed to place order: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel cart-summary">
      <h2 className="checkout-page-title">Checkout</h2>
      {!backendReady && (
        <div className="form-error" style={{ textAlign: "left" }}>
          Waking up server — first request on Render can take up to 60 seconds.
        </div>
      )}

      <h3 className="checkout-step-title">1. Shipping Details</h3>
      <div className="form-row-2">
        <div className="form-group">
          <label htmlFor="first-name">First Name</label>
          <input
            id="first-name"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="last-name">Last Name</label>
          <input
            id="last-name"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input
          id="address"
          type="text"
          placeholder="Street address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="street-address"
        />
      </div>
      <div className="form-row-2">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
          />
        </div>
        <div className="form-group">
          <label htmlFor="zip">ZIP / Postal Code</label>
          <input
            id="zip"
            type="text"
            placeholder="ZIP / Postal Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            autoComplete="postal-code"
          />
        </div>
      </div>

      <h3 className="checkout-step-title" style={{ marginTop: "24px" }}>2. Payment Method</h3>
      <div className="payment-options">
        {["Credit Card", "PayPal", "Cash on Delivery"].map((method) => (
          <button
            key={method}
            type="button"
            className={`payment-option ${paymentMethod === method ? "active" : ""}`}
            onClick={() => setPaymentMethod(method)}
          >
            {method}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "32px" }}>
        <h3 className="checkout-step-title">Order Summary</h3>
        {cart.map((item) => (
          <div key={item.id} className="summary-row">
            <span>{item.name} × {item.qty || 1}</span>
            <span>₹{((item.price) * (item.qty || 1)).toLocaleString()}</span>
          </div>
        ))}
        <div className="summary-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>

      <button type="button" className="btn btn-primary checkout-btn" onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
}
