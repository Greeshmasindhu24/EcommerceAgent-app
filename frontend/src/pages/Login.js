import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // ✅ FIXED

// ✅ Backend URL
const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

export default function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API}/login`, { email, password });

            localStorage.setItem("token", res.data.access_token);
            localStorage.setItem("email", email);
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
            background: "white"
        }}>
            <h2 style={{ color: "#2874f0" }}>🔐 Login</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                type="email"
                placeholder="Email"
                style={{ width: "100%", padding: "10px", margin: "10px 0" }}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                style={{ width: "100%", padding: "10px", margin: "10px 0" }}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                onClick={handleLogin}
                style={{
                    width: "100%",
                    padding: "10px",
                    background: "#2874f0",
                    color: "white",
                    border: "none",
                    borderRadius: "5px"
                }}
            >
                Login
            </button>

            <p style={{ marginTop: "15px" }}>
                Don't have account? <Link to="/register">Register</Link> {/* ✅ FIXED */}
            </p>
        </div>
    );
}