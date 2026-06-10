import React, { useState, useEffect } from "react";
import api from "./api";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import CartCheckout from "./pages/CartCheckout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ChatAgent from "./components/ChatAgent";

import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token) {
      setUser({ email: email || "user@example.com" });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    setLoadingProducts(true);
    api
      .get(`/products/${category}`)
      .then((res) => setProducts(res.data || []))
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoadingProducts(false));
  }, [category]);

  const addToCart = (product) => {
    const productId = product.id || product._id;
    const existing = cart.find((item) => (item.id || item._id) === productId);
    if (existing) {
      setCart(
        cart.map((item) =>
          (item.id || item._id) === productId
            ? { ...item, qty: (item.qty || 1) + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, id: productId, qty: 1 }]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("cart");
    setCart([]);
    setUser(null);
  };

  const cartCount = cart.reduce((a, c) => a + (c.qty || 1), 0);

  const storefront = (
    <Home
      products={products}
      addToCart={addToCart}
      category={category}
      setCategory={setCategory}
      loading={loadingProducts}
    />
  );

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} setUser={setUser} cartCount={cartCount} onLogout={handleLogout} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={storefront} />
            <Route path="/products/:category" element={storefront} />
            <Route path="/shop" element={<Navigate to="/" replace />} />
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
            <Route
              path="/cart"
              element={
                user ? (
                  <CartCheckout cart={cart} setCart={setCart} setOrders={setOrders} user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard user={user} orders={orders} onLogout={handleLogout} /> : <Navigate to="/login" />}
            />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <div className="container">
            <div className="footer-brand">
              <span className="nav-logo-icon">S</span>
              Style
            </div>
            <p>Online shopping powered by single-agent AI.</p>
            <div className="footer-copy">
              &copy; {new Date().getFullYear()} Style. All rights reserved.
            </div>
          </div>
        </footer>

        {user && <ChatAgent />}
      </div>
    </Router>
  );
}
