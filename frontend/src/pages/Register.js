import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/register", { email, password });
      const loginRes = await api.post("/login", { email, password });
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
    <div className="container">
      <div className="form-container glass-panel">
        <h2>Create Account</h2>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px" }}>
            Register
          </button>
        </form>
        <div className="form-footer">
          Already have an account? <Link to="/login" style={{ color: "var(--aura-accent)", fontWeight: 600 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
}
