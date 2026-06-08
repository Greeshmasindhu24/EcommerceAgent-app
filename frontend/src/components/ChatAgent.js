import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// ✅ Your backend URL
const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";
export default function ChatAgent() {

    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState([
        {
            text: "Hello 👋 I'm your MyStore AI Assistant. How can I help you today?",
            sender: "bot"
        }
    ]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);

    // ✅ Auto scroll
    const scrollToBottom = () => {

        chatEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ✅ Send Message
    const handleSend = async () => {

        if (!input.trim() || loading) return;

        const currentInput = input;

        // User message
        const userMsg = {
            text: currentInput,
            sender: "user"
        };

        setMessages(prev => [...prev, userMsg]);

        setInput("");

        setLoading(true);

        try {

            const res = await axios.post(

                `${API}/chat`,

                {
                    message: currentInput,
                    email: localStorage.getItem("email") || null
                },

                {
                    timeout: 30000,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const reply =
                res?.data?.reply ||
                "Sorry, I couldn't understand that.";

            setMessages(prev => [
                ...prev,
                {
                    text: reply,
                    sender: "bot"
                }
            ]);

        } catch (err) {

            console.error("Chat Error:", err);

            let errorMsg =
                "⚠️ AI assistant temporarily unavailable.";

            if (err.code === "ECONNABORTED") {

                errorMsg =
                    "⏳ Request timed out. Please try again.";

            } else if (
                err.response?.data?.reply
            ) {

                errorMsg = err.response.data.reply;

            } else if (
                err.message?.includes("Network Error")
            ) {

                errorMsg =
                    "🌐 Unable to connect to server.";
            }

            setMessages(prev => [
                ...prev,
                {
                    text: errorMsg,
                    sender: "bot"
                }
            ]);

        } finally {

            setLoading(false);
        }
    };

    return (

        <div
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 9999,
                fontFamily: "'Inter', sans-serif"
            }}
        >

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "65px",
                    height: "65px",
                    borderRadius: "50%",
                    background: "#2874f0",
                    color: "white",
                    border: "none",
                    fontSize: "28px",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
                }}
            >
                {isOpen ? "×" : "💬"}
            </button>

            {/* Chat Window */}
            {isOpen && (

                <div
                    style={{
                        position: "absolute",
                        bottom: "80px",
                        right: "0",
                        width: "360px",
                        height: "520px",
                        background: "white",
                        borderRadius: "18px",
                        boxShadow:
                            "0 10px 35px rgba(0,0,0,0.18)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden"
                    }}
                >

                    {/* Header */}
                    <div
                        style={{
                            background: "#2874f0",
                            color: "white",
                            padding: "16px",
                            fontWeight: "bold",
                            fontSize: "16px"
                        }}
                    >
                        🤖 MyStore AI Assistant
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            padding: "15px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            background: "#f8fafc"
                        }}
                    >

                        {messages.map((m, i) => (

                            <div
                                key={i}
                                style={{

                                    alignSelf:
                                        m.sender === "user"
                                            ? "flex-end"
                                            : "flex-start",

                                    background:
                                        m.sender === "user"
                                            ? "#2874f0"
                                            : "#e5e7eb",

                                    color:
                                        m.sender === "user"
                                            ? "white"
                                            : "#111827",

                                    padding: "12px 16px",

                                    borderRadius: "16px",

                                    maxWidth: "80%",

                                    fontSize: "14px",

                                    lineHeight: "1.5",

                                    wordBreak: "break-word"
                                }}
                            >
                                {m.text}
                            </div>
                        ))}

                        {/* Loading */}
                        {loading && (

                            <div
                                style={{
                                    color: "#666",
                                    fontSize: "13px"
                                }}
                            >
                                🤖 AI is thinking...
                            </div>
                        )}

                        <div ref={chatEndRef} />

                    </div>

                    {/* Input Area */}
                    <div
                        style={{
                            padding: "15px",
                            borderTop: "1px solid #eee",
                            display: "flex",
                            gap: "10px",
                            background: "white"
                        }}
                    >

                        <input
                            type="text"

                            value={input}

                            onChange={(e) =>
                                setInput(e.target.value)
                            }

                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter" &&
                                    !loading
                                ) {

                                    handleSend();
                                }
                            }}

                            placeholder="Ask about products..."

                            style={{
                                flex: 1,
                                padding: "12px",
                                borderRadius: "10px",
                                border: "1px solid #ddd",
                                outline: "none",
                                fontSize: "14px"
                            }}
                        />

                        <button
                            onClick={handleSend}

                            disabled={loading}

                            style={{
                                background: loading
                                    ? "#93c5fd"
                                    : "#2874f0",

                                color: "white",

                                border: "none",

                                padding: "10px 16px",

                                borderRadius: "10px",

                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer",

                                fontWeight: "600"
                            }}
                        >
                            {loading ? "..." : "Send"}
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}