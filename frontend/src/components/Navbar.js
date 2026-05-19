import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser, cartCount }) {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        setUser(null);
        navigate("/login");
    };

    return (
        <nav style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 80px",
            background: "white",
            color: "black",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            borderBottom: "1px solid #eee"
        }}>
            <div style={{ fontSize: "1.8rem", fontWeight: "900", letterSpacing: "-1px" }}>
                <Link to="/" style={{ color: "black", textDecoration: "none" }}>STYLE.</Link>
            </div>
            
            <div style={{ display: "flex", gap: "40px", alignItems: "center", fontWeight: "500", fontSize: "0.95rem" }}>
                <Link to="/" style={{ color: "black", textDecoration: "none" }}>Home</Link>
                <Link to="/products/all" style={{ color: "black", textDecoration: "none" }}>Shop</Link>
                <Link to="/about" style={{ color: "black", textDecoration: "none" }}>About</Link>
                <Link to="/contact" style={{ color: "black", textDecoration: "none" }}>Contact</Link>
            </div>

            <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
                <Link to="/cart" style={{ color: "black", textDecoration: "none", position: "relative", fontSize: "1.4rem" }}>
                    🛒
                    {cartCount > 0 && (
                        <span style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-10px",
                            background: "black",
                            color: "white",
                            borderRadius: "50%",
                            padding: "2px 6px",
                            fontSize: "0.65rem",
                            fontWeight: "bold"
                        }}>{cartCount}</span>
                    )}
                </Link>

                {user ? (
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        <Link to="/dashboard" style={{ color: "black", fontSize: "1.4rem" }}>👤</Link>
                        <button 
                            onClick={logout}
                            style={{
                                background: "none",
                                border: "1px solid black",
                                color: "black",
                                padding: "5px 12px",
                                fontSize: "0.8rem",
                                cursor: "pointer"
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" style={{ color: "black", fontSize: "1.4rem" }}>👤</Link>
                )}
            </div>
        </nav>
    );
}

