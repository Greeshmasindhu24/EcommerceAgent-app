import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import CartCheckout from "./pages/CartCheckout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ChatAgent from "./components/ChatAgent";

import "./index.css";

const API = "http://127.0.0.1:5000"; // Assuming local flask for development

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) {
      setUser({ email });
    }
  }, []);

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

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} setUser={setUser} cartCount={cart.reduce((a, c) => a + (c.qty || 1), 0)} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/products/:category" element={<ProductList addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />


            <Route path="/cart" element={<CartCheckout cart={cart} setCart={setCart} setOrders={setOrders} user={user} />} />

            <Route path="/dashboard" element={user ? <Dashboard user={user} orders={orders} /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <footer style={{ textAlign: "center", padding: "40px 20px", background: "var(--card-bg)", marginTop: "40px", borderTop: "1px solid var(--border-color)" }}>
          <p>© 2026 StyleTech Store. All rights reserved.</p>
        </footer>

        <ChatAgent />
      </div>
    </Router>
  );
}