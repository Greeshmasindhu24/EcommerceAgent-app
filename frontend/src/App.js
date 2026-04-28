import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Dashboard from "./Dashboard";
import ChatAgent from "./components/ChatAgent";

// ✅ Backend URL
const API = "https://ecommerceagent-app.onrender.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); // ✅ NEW

  // ✅ Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ email: "user@example.com" });
    }
  }, []);

  // ✅ Fetch products
  useEffect(() => {
    axios.get(`${API}/products/${category}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, [category]);

  // ✅ Add to cart
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

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <div style={{ fontFamily: "sans-serif" }}>

        {/* 🔥 HEADER */}
        {user && (
          <div style={{
            background: "#2874f0",
            padding: "10px",
            color: "white",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <h2>🛒 Welcome to MyStore</h2>

            <div style={{ display: "flex", gap: "15px" }}>
              <Link to="/" style={{ color: "white" }}>Home</Link>
              <Link to="/cart" style={{ color: "white" }}>Cart ({cart.length})</Link>
              <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>

              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}

        <Routes>

          {/* 🔐 REGISTER */}
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" />}
          />

          {/* 🏠 HOME */}
          <Route
            path="/"
            element={
              !user ? (
                <Login setUser={setUser} />
              ) : (
                <div style={{ padding: "20px" }}>

                  {/* CATEGORY FILTER */}
                  <div style={{ marginBottom: "20px" }}>
                    {["all", "grocery", "electronics", "fashion"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        style={{
                          margin: "5px",
                          padding: "8px 15px",
                          background: category === cat ? "#2874f0" : "white",
                          color: category === cat ? "white" : "#2874f0",
                          border: "1px solid #2874f0",
                          borderRadius: "20px"
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* PRODUCTS */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "20px"
                  }}>
                    {products.map(p => (
                      <div key={p.id} style={{
                        padding: "15px",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
                      }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: "100%", height: "200px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/200";
                          }}
                        />

                        <h3>{p.name}</h3>
                        <p>₹{p.price}</p>

                        <button onClick={() => addToCart(p)}>
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              )
            }
          />

          {/* 🛒 CART */}
          <Route
            path="/cart"
            element={user ? <Cart cart={cart} /> : <Navigate to="/" />}
          />

          {/* 💳 CHECKOUT */}
          <Route
            path="/checkout"
            element={
              user
                ? <Checkout cart={cart} setOrders={setOrders} setCart={setCart} />
                : <Navigate to="/" />
            }
          />

          {/* 📊 DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              user
                ? <Dashboard user={user} orders={orders} />
                : <Navigate to="/" />
            }
          />

        </Routes>

        {/* 🤖 CHAT */}
        {user && <ChatAgent />}

      </div>
    </Router>
  );
}