import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your MyStore Assistant. How can I help you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, sender: "user" };
        setMessages([...messages, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/chat", { message: input });
            setMessages(prev => [...prev, { text: res.data.reply, sender: "bot" }]);
        } catch (err) {
            const errorReply = err.response?.data?.reply || "Sorry, I'm having trouble connecting right now.";
            setMessages(prev => [...prev, { text: errorReply, sender: "bot" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000, fontFamily: "'Inter', sans-serif" }}>
            {/* Chat Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#2874f0",
                    color: "white",
                    border: "none",
                    fontSize: "30px",
                    cursor: "pointer",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                {isOpen ? "×" : "💬"}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: "absolute",
                    bottom: "80px",
                    right: "0",
                    width: "350px",
                    height: "500px",
                    background: "white",
                    borderRadius: "15px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}>
                    {/* Header */}
                    <div style={{ background: "#2874f0", color: "white", padding: "15px", fontWeight: "bold" }}>
                        MyStore AI Assistant
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                                background: m.sender === "user" ? "#2874f0" : "#f1f3f6",
                                color: m.sender === "user" ? "white" : "black",
                                padding: "10px 15px",
                                borderRadius: "15px",
                                maxWidth: "80%",
                                fontSize: "14px",
                                lineHeight: "1.4"
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {loading && <div style={{ alignSelf: "flex-start", color: "#888", fontSize: "12px" }}>AI is thinking...</div>}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px" }}>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask me anything..."
                            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
                        />
                        <button 
                            onClick={handleSend}
                            style={{ background: "#2874f0", color: "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer" }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
