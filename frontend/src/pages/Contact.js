import React from "react";

export default function Contact() {
    return (
        <div style={{ padding: "80px 20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "40px", textAlign: "center" }}>Contact Us</h1>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "60px", marginTop: "40px" }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Get in Touch</h2>
                    <p style={{ color: "#666", marginBottom: "20px" }}>
                        Have a question about an order or a product? Our team is here to help.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <p><b>Email:</b> support@styletech.com</p>
                        <p><b>Phone:</b> +91 98765 43210</p>
                        <p><b>Address:</b> 123 Fashion Street, Tech Park, Bangalore, India</p>
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Send a Message</h2>
                    <form onSubmit={(e) => { e.preventDefault(); alert("Message Sent!"); }} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <input type="text" placeholder="Your Name" style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "5px" }} required />
                        <input type="email" placeholder="Your Email" style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "5px" }} required />
                        <textarea placeholder="Your Message" style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "5px", minHeight: "120px" }} required />
                        <button type="submit" style={{ 
                            padding: "15px", 
                            background: "black", 
                            color: "white", 
                            fontWeight: "bold", 
                            borderRadius: "0",
                            cursor: "pointer",
                            letterSpacing: "1px"
                        }}>
                            SEND MESSAGE
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
