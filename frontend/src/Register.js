import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
            await axios.post("http://localhost:5000/register", { email, password });
            setSuccess("Registration successful! Redirecting to login...");
            setError("");
            setTimeout(() => navigate("/"), 2000);
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
            background: "white",
            fontFamily: "'Inter', sans-serif"
        }}>
            <h2 style={{ color: "#2874f0", marginBottom: "30px" }}>📝 Register</h2>

            {error && <p style={{ color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "5px" }}>{error}</p>}
            {success && <p style={{ color: "#2e7d32", backgroundColor: "#e8f5e9", padding: "10px", borderRadius: "5px" }}>{success}</p>}

            <div style={{ textAlign: "left", marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Email</label>
                <input
                    type="email"
                    placeholder="Enter email"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            <div style={{ textAlign: "left", marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Password</label>
                <input
                    type="password"
                    placeholder="Enter password"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div style={{ textAlign: "left", marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm password"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            <button 
                onClick={handleRegister}
                style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #2874f0 0%, #0056b3 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer"
                }}
            >
                Register
            </button>

            <p style={{ marginTop: "20px", fontSize: "14px" }}>
                Already have an account? <a href="/" style={{ color: "#2874f0", textDecoration: "none", fontWeight: "600" }}>Login</a>
            </p>
        </div>
    );
}
