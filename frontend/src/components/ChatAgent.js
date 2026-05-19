import React, { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function ChatAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ text: "Hi! How can I help you today?", isUser: false }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, isUser: true };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post(`${API}/chat`, { message: currentInput }, { timeout: 10000 });
            setMessages(prev => [...prev, { text: res.data.reply, isUser: false }]);
        } catch (err) {
            console.error("Chat error", err);
            let errorMsg = "Sorry, I'm having trouble connecting to the server.";
            if (err.code === 'ECONNABORTED') errorMsg = "The request timed out. Please try again.";
            if (err.response?.data?.reply) errorMsg = err.response.data.reply;

            setMessages(prev => [...prev, { text: errorMsg, isUser: false }]);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 10000 }}>
            {isOpen ? (
                <div style={{
                    width: "350px",
                    height: "500px",
                    background: "white",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    borderRadius: "20px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    border: "1px solid #eee",
                    animation: "slideUp 0.3s ease"
                }}>
                    <div style={{ background: "black", color: "white", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "10px", height: "10px", background: "#4ade80", borderRadius: "50%" }}></div>
                            <b style={{ letterSpacing: "1px" }}>STYLE. ASSISTANT</b>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                    </div>

                    <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px", background: "#fcfcfc" }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.isUser ? "flex-end" : "flex-start",
                                background: m.isUser ? "black" : "white",
                                color: m.isUser ? "white" : "black",
                                padding: "12px 16px",
                                borderRadius: m.isUser ? "15px 15px 0 15px" : "15px 15px 15px 0",
                                maxWidth: "85%",
                                fontSize: "0.95rem",
                                boxShadow: m.isUser ? "none" : "0 2px 5px rgba(0,0,0,0.05)",
                                border: m.isUser ? "none" : "1px solid #eee"
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: "flex-start", background: "white", padding: "12px 16px", borderRadius: "15px 15px 15px 0", border: "1px solid #eee" }}>
                                <span className="typing-dots">Thinking...</span>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: "20px", borderTop: "1px solid #eee", background: "white", display: "flex", gap: "10px" }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your message..."
                            style={{
                                flex: 1,
                                padding: "12px",
                                borderRadius: "10px",
                                border: "1px solid #ddd",
                                outline: "none",
                                fontSize: "0.95rem"
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            style={{
                                background: "black",
                                color: "white",
                                border: "none",
                                padding: "10px 15px",
                                borderRadius: "10px",
                                cursor: "pointer"
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: "65px",
                        height: "65px",
                        borderRadius: "50%",
                        background: "black",
                        color: "white",
                        border: "none",
                        fontSize: "1.8rem",
                        cursor: "pointer",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.3s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                    💬
                </button>
            )}
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .typing-dots {
                    display: inline-block;
                    overflow: hidden;
                    white-space: nowrap;
                    animation: typing 1.5s steps(3, end) infinite;
                }
                @keyframes typing {
                    from { width: 60px; }
                    to { width: 80px; }
                }
            `}</style>
        </div>
    );
}

