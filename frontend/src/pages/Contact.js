import React from "react";

export default function Contact() {
  return (
    <div className="content-page">
      <h1>Contact Us</h1>
      <div className="contact-grid">
        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Get in Touch</h2>
          <p style={{ color: "var(--aura-muted)", marginBottom: "20px" }}>
            Have a question about an order or a product? Our team is here to help.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p><strong>Email:</strong> support@style.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Address:</strong> 123 Fashion Street, Tech Park, Bangalore, India</p>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Send a Message</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <input type="text" placeholder="Your Name" style={{ padding: "12px 16px", border: "1px solid var(--aura-border)", borderRadius: "8px" }} required />
            <input type="email" placeholder="Your Email" style={{ padding: "12px 16px", border: "1px solid var(--aura-border)", borderRadius: "8px" }} required />
            <textarea placeholder="Your Message" style={{ padding: "12px 16px", border: "1px solid var(--aura-border)", borderRadius: "8px", minHeight: "120px", fontFamily: "inherit" }} required />
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
