import React from "react";

export default function About() {
    return (
        <div style={{ padding: "80px 20px", maxWidth: "800px", margin: "0 auto", lineHeight: "1.8" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "40px", textAlign: "center" }}>Our Story</h1>
            <p style={{ fontSize: "1.2rem", color: "#444", marginBottom: "30px" }}>
                Welcome to <b>STYLE.</b>, where fashion meets technology. Founded in 2026, we began with a simple mission: to curate the most premium essentials for the modern lifestyle.
            </p>
            <div style={{ display: "grid", gap: "40px", marginTop: "60px" }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Precision Curated</h2>
                    <p style={{ color: "#666" }}>
                        Every item in our store is hand-selected by our team of experts. We don't just sell products; we offer a lifestyle of elegance and performance.
                    </p>
                </div>
                <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Sustainability</h2>
                    <p style={{ color: "#666" }}>
                        We are committed to ethical sourcing and sustainable practices. Our packaging is 100% recyclable, and we partner with manufacturers who value human rights.
                    </p>
                </div>
                <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Innovation</h2>
                    <p style={{ color: "#666" }}>
                        From our AI-powered shopping assistant to our seamless checkout process, we leverage the latest technology to ensure your shopping experience is second to none.
                    </p>
                </div>
            </div>
        </div>
    );
}
