import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Dashboard from "./Dashboard";
import ChatAgent from "./components/ChatAgent";

export default function App() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("token");
    if (token) {
      // In a real app, you'd verify the token with the backend
      setUser({ email: "user@example.com" });
    }
  }, []);

  useEffect(() => {
    axios.get(`https://ecommerceagent-app.onrender.com/`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, [category]);

  const addToCart = (p) => {
    const exist = cart.find(i => i.id === p.id);
    if (exist) {
      setCart(cart.map(i =>
        i.id === p.id ? { ...i, qty: (i.qty || 1) + 1 } : i
      ));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        {user && (
          <div style={{ background: "#2874f0", padding: "10px 20px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: 0 }}>🛒 MyStore</h2>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "600" }}>Home</Link>
              <Link to="/cart" style={{ color: "white", textDecoration: "none", fontWeight: "600" }}>Cart ({cart.length})</Link>
              <Link to="/dashboard" style={{ color: "white", textDecoration: "none", fontWeight: "600" }}>Dashboard</Link>
              <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid white", color: "white", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={
            !user ? <Login setUser={setUser} /> : (
              <div style={{ padding: "20px" }}>
                {/* CATEGORY SELECTOR */}
                <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                  {["all", "grocery", "electronics", "fashion"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: "8px 15px",
                        borderRadius: "20px",
                        border: "1px solid #2874f0",
                        background: category === cat ? "#2874f0" : "white",
                        color: category === cat ? "white" : "#2874f0",
                        cursor: "pointer",
                        textTransform: "capitalize"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* PRODUCT GRID */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "25px"
                }}>
                  {products.map(p => (
                    <div key={p.id} style={{
                      border: "none",
                      borderRadius: "15px",
                      padding: "15px",
                      textAlign: "center",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                      background: "white",
                      transition: "transform 0.2s"
                    }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=No+Image"; }}
                      />
                      <h3 style={{ margin: "15px 0 5px" }}>{p.name}</h3>
                      <p style={{ color: "#2e7d32", fontWeight: "bold", fontSize: "18px" }}>₹{p.price}</p>
                      <button
                        onClick={() => addToCart(p)}
                        style={{
                          background: "#2874f0",
                          color: "white",
                          padding: "10px 20px",
                          border: "none",
                          borderRadius: "8px",
                          width: "100%",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginTop: "10px"
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          } />
          <Route path="/cart" element={user ? <Cart cart={cart} /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/checkout" element={user ? <Checkout cart={cart} /> : <Navigate to="/" />} />
        </Routes>

        {user && <ChatAgent />}
      </div>
    </Router>
  );
}