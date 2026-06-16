import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ChatAgent({ addToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastProducts, setLastProducts] = useState([]);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your Style AI assistant. Ask me about products, orders, or anything else.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const currentInput = input;
    setMessages((prev) => [...prev, { text: currentInput, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        message: currentInput,
        email: localStorage.getItem("email") || null,
        last_seen_products: lastProducts,
      });

      const reply = res?.data?.reply || "Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);

      if (res?.data?.products && res.data.products.length > 0) {
        setLastProducts(res.data.products);
      }

      if (res?.data?.action) {
        const actionType = res.data.action.type;
        const actionProducts = res.data.action.products || [];

        if (actionType === 'ADD_TO_CART' || actionType === 'BUY_NOW') {
          actionProducts.forEach((p) => {
            if (addToCart) addToCart(p);
          });
          if (actionType === 'BUY_NOW') {
            navigate('/cart');
          }
        } else if (actionType === 'ADD_ALL_TO_CART') {
          actionProducts.forEach((p) => {
            if (addToCart) addToCart(p);
          });
        } else if (actionType === 'ADD_TO_WISHLIST') {
          alert(`Added to wishlist: ${actionProducts.map((p) => p.name).join(', ')}`);
        }
      }
    } catch (err) {
      console.error("Chat Error:", err);
      let errorMsg = "AI assistant temporarily unavailable.";
      if (err.code === "ECONNABORTED") {
        errorMsg = "Request timed out. Please try again.";
      } else if (err.response?.data?.reply) {
        errorMsg = err.response.data.reply;
      } else if (err.message?.includes("Network Error")) {
        errorMsg = "Unable to connect to server.";
      }
      setMessages((prev) => [...prev, { text: errorMsg, sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-widget">
      <button type="button" className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "💬"}
      </button>

      <div className={`chat-window ${!isOpen ? "hidden" : ""}`}>
        <div className="chat-header">
          <div className="chat-header-dot" />
          <div>
            <div style={{ fontWeight: 600 }}>Style Assistant</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>Single-Agent AI</div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.sender === "user" ? "user" : "bot"}`}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="message bot" style={{ fontStyle: "italic", color: "var(--aura-muted)" }}>
              Thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products..."
          />
          <button type="submit" disabled={loading}>➔</button>
        </form>
      </div>
    </div>
  );
}
