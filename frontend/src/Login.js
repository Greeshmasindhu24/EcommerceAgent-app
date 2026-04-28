import React, { useState } from "react";
import axios from "axios";

// ✅ Backend URL
const API = "https://ecommerceagent-app.onrender.com";

export default function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API}/login`, { email, password });

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
            background: "white"
        }}>
            <h2 style={{ color: "#2874f0" }}>🔐 Login</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>
                Login
            </button>

            <p>
                Don't have account? <a href="/register">Register</a>
            </p>
        </div>
    );
}