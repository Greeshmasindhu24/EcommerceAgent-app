import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";

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

// ✅ Backend URL
const API = "http://127.0.0.1:5000";
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

  // ✅ Check Login
  useEffect(() => {

    const token = localStorage.getItem("token");

    const email = localStorage.getItem("email");

    if (token) {

      setUser({
        email: email || "user@example.com"
      });
    }

  }, []);

  // ✅ Save Cart
  useEffect(() => {

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

  }, [cart]);

  // ✅ Fetch Products
  useEffect(() => {

    setLoadingProducts(true);

    axios
      .get(`${API}/products/${category}`)

      .then((res) => {

        setProducts(res.data || []);
      })

      .catch((err) => {

        console.error(
          "Error fetching products:",
          err
        );
      })

      .finally(() => {

        setLoadingProducts(false);
      });

  }, [category]);

  // ✅ Add To Cart
  const addToCart = (product) => {

    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing) {

      setCart(
        cart.map((item) =>

          item.id === product.id
            ? {
              ...item,
              qty: (item.qty || 1) + 1
            }
            : item
        )
      );

    } else {

      setCart([
        ...cart,
        {
          ...product,
          qty: 1
        }
      ]);
    }
  };

  // ✅ Logout
  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("email");

    localStorage.removeItem("cart");

    setCart([]);

    setUser(null);
  };

  return (

    <Router>

      <div className="app-container">

        {/* ✅ HEADER */}
        {user && (

          <div
            style={{
              background: "#2874f0",
              padding: "12px 20px",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >

            <h2 style={{ margin: 0 }}>
              🛒 MyStore
            </h2>

            <div
              style={{
                display: "flex",
                gap: "18px",
                alignItems: "center"
              }}
            >

              <Link
                to="/"
                style={{
                  color: "white",
                  textDecoration: "none"
                }}
              >
                Home
              </Link>

              <Link
                to="/cart"
                style={{
                  color: "white",
                  textDecoration: "none"
                }}
              >
                Cart (
                {cart.reduce(
                  (a, c) => a + (c.qty || 1),
                  0
                )}
                )
              </Link>

              <Link
                to="/dashboard"
                style={{
                  color: "white",
                  textDecoration: "none"
                }}
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  background: "white",
                  color: "#2874f0",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Logout
              </button>

            </div>
          </div>
        )}

        {/* ✅ Navbar */}
        <Navbar
          user={user}
          setUser={setUser}
          cartCount={
            cart.reduce(
              (a, c) => a + (c.qty || 1),
              0
            )
          }
        />

        {/* ✅ MAIN */}
        <main className="main-content">

          <Routes>

            {/* ✅ HOME */}
            <Route
              path="/"
              element={
                !user ? (

                  <Login setUser={setUser} />

                ) : (

                  loadingProducts ? (

                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center"
                      }}
                    >
                      Loading products...
                    </div>

                  ) : (

                    <Home
                      products={products}
                      addToCart={addToCart}
                      category={category}
                      setCategory={setCategory}
                    />
                  )
                )
              }
            />

            {/* ✅ PRODUCT LIST */}
            <Route
              path="/products/:category"
              element={
                <ProductList
                  addToCart={addToCart}
                />
              }
            />

            {/* ✅ PRODUCT DETAILS */}
            <Route
              path="/product/:id"
              element={
                <ProductDetails
                  addToCart={addToCart}
                />
              }
            />
            <Route
              path="/cart"
              element={
                user ? (
                  <CartCheckout
                    cart={cart}
                    setCart={setCart}
                    setOrders={setOrders}
                    user={user}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            {/* ✅ DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                user ? (

                  <Dashboard
                    user={user}
                    orders={orders}
                  />

                ) : (

                  <Navigate to="/" />
                )
              }
            />

            {/* ✅ LOGIN */}
            <Route
              path="/login"
              element={
                !user ? (

                  <Login setUser={setUser} />

                ) : (

                  <Navigate to="/" />
                )
              }
            />

            {/* ✅ REGISTER */}
            <Route
              path="/register"
              element={
                !user ? (

                  <Register
                    setUser={setUser}
                  />

                ) : (

                  <Navigate to="/" />
                )
              }
            />

            {/* ✅ ABOUT */}
            <Route
              path="/about"
              element={<About />}
            />

            {/* ✅ CONTACT */}
            <Route
              path="/contact"
              element={<Contact />}
            />

          </Routes>

        </main>

        {/* ✅ FOOTER */}
        <footer
          style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "var(--card-bg)",
            marginTop: "40px",
            borderTop:
              "1px solid var(--border-color)"
          }}
        >

          <p>
            © 2026 StyleTech Store.
            All rights reserved.
          </p>

        </footer>

        {/* ✅ AI CHATBOT */}
        {user && <ChatAgent />}

      </div>
    </Router>
  );
}