import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // ✅ FIXED

// ✅ Backend URL
const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

export default function Register({ setUser }) {
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
            
            // Auto login after register
            const loginRes = await axios.post(`${API}/login`, { email, password });
            localStorage.setItem("token", loginRes.data.access_token);
            localStorage.setItem("email", email);
            
            setSuccess("Registration successful! Logging you in...");
            setError("");

            setTimeout(() => {
                setUser({ email });
                navigate("/");
            }, 1500);

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
                style={{ width: "100%", padding: "10px", margin: "10px 0" }}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                style={{ width: "100%", padding: "10px", margin: "10px 0" }}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                placeholder="Confirm Password"
                style={{ width: "100%", padding: "10px", margin: "10px 0" }}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
                onClick={handleRegister}
                style={{
                    width: "100%",
                    padding: "10px",
                    background: "#2874f0",
                    color: "white",
                    border: "none",
                    borderRadius: "5px"
                }}
            >
                Register
            </button>

            <p style={{ marginTop: "15px" }}>
                Already have account? <Link to="/">Login</Link> {/* ✅ FIXED */}
            </p>
        </div>
    );
}