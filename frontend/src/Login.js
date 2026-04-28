import React, { useState } from "react";
import axios from "axios";

export default function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:5000/login", { email, password });
            localStorage.setItem("token", res.data.access_token);
            setUser({ email });
        } catch (err) {
            setError(err.response?.data?.msg || "Login failed");
        }
    };

    return (
        <div style={{ 
            maxWidth: "400px", 
            margin: "100px auto", 
            padding: "30px", 
            textAlign: "center", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            borderRadius: "15px",
            background: "white",
            fontFamily: "'Inter', sans-serif"
        }}>
            <h2 style={{ color: "#2874f0", marginBottom: "30px" }}>🔐 Login</h2>

            {error && <p style={{ color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "5px" }}>{error}</p>}

            <div style={{ textAlign: "left", marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Email</label>
                <input
                    type="email"
                    placeholder="Enter email"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            <div style={{ textAlign: "left", marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Password</label>
                <input
                    type="password"
                    placeholder="Enter password"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button 
                onClick={handleLogin}
                style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #2874f0 0%, #0056b3 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "transform 0.2s"
                }}
            >
                Login
            </button>

            <p style={{ marginTop: "20px", fontSize: "14px" }}>
                Don't have an account? <a href="/register" style={{ color: "#2874f0", textDecoration: "none", fontWeight: "600" }}>Register</a>
            </p>
        </div>
    );
}