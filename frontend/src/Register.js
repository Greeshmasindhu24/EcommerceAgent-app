import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ Backend URL
const API = "https://ecommerceagent-app.onrender.com";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleRegister = async () => {

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.post(`${API}/register`, { email, password });

            setSuccess("Registration successful!");
            setError("");

            setTimeout(() => navigate("/"), 1500);

        } catch (err) {
            setError(err.response?.data?.msg || "Registration failed");
            setSuccess("");
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
            <h2 style={{ color: "#2874f0" }}>📝 Register</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

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

            <input
                type="password"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button onClick={handleRegister}>
                Register
            </button>

            <p>
                Already have account? <a href="/">Login</a>
            </p>
        </div>
    );
}