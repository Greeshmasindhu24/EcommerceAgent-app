import React from "react";

export default function About() {
  return (
    <div className="content-page">
      <h1>Our Story</h1>
      <p style={{ fontSize: "1.125rem", color: "var(--aura-muted)", marginBottom: "40px", lineHeight: 1.8 }}>
        Welcome to <strong>Style</strong>, where fashion meets technology. Founded in 2026, we began with a simple
        mission: to curate quality products for everyday online shopping.
      </p>
      <div className="content-block">
        <h2>Precision Curated</h2>
        <p>
          Every item in our store is hand-selected by our team of experts. We don&apos;t just sell products;
          we offer a lifestyle of elegance and performance.
        </p>
      </div>
      <div className="content-block">
        <h2>Sustainability</h2>
        <p>
          We are committed to ethical sourcing and sustainable practices. Our packaging is 100% recyclable,
          and we partner with manufacturers who value human rights.
        </p>
      </div>
      <div className="content-block">
        <h2>Innovation</h2>
        <p>
          From our AI-powered shopping assistant to our seamless checkout process, we leverage the latest
          technology to ensure your shopping experience is second to none.
        </p>
      </div>
    </div>
  );
}
