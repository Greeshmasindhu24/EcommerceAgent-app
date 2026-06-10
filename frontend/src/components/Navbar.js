import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ user, setUser, cartCount, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route) => {
    if (route === "/") return path === "/" || path.startsWith("/products");
    return path === route || path.startsWith(`${route}/`);
  };

  const logout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      setUser(null);
    }
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <span className="nav-logo-icon">S</span>
          Style
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>
          <Link to="/about" className={isActive("/about") ? "active" : ""}>About</Link>
          <Link to="/contact" className={isActive("/contact") ? "active" : ""}>Contact</Link>
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="nav-icon-btn" aria-label="Cart">
            🛍
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="nav-icon-btn" aria-label="Account">👤</Link>
              <button type="button" onClick={logout} className="btn btn-outline" style={{ padding: "6px 16px", fontSize: "0.85rem" }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: "6px 16px", fontSize: "0.85rem" }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
