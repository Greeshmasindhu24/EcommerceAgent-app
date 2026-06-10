import React, { useState, useRef, useEffect } from "react";
import api from "../api";

export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
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
      });

      const reply = res?.data?.reply || "Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
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
