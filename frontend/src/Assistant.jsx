import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import Sidebar from "./Sidebar";
import { useOverflow } from "./useOverflow";
import { motion } from "framer-motion";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/textfield/outlined-text-field.js";

const Assistant = () => {
    const navigate = useNavigate();
    const [chatSessions, setChatSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));
    const chatEndRef = useRef(null);
    const scrollRef = useRef(null);
    const isOverflowing = useOverflow(scrollRef);

    useEffect(() => {
        if (!user || !user.user_id) {
            navigate("/");
            return;
        }
        fetchChatSessions();
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const fetchChatSessions = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/chats/${user.user_id}`);
            setChatSessions(res.data);
            if (res.data.length > 0 && !currentSessionId) {
                const latestSession = res.data[0];
                setCurrentSessionId(latestSession.id);
                fetchMessages(latestSession.id);
            }
        } catch (error) {
            console.error("Failed to fetch chat sessions:", error);
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/chats/${sessionId}/messages`);
            setMessages(res.data.map(msg => ({ role: msg.role, content: msg.content })));
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
    };
    
    const handleDeleteChat = async (sessionId) => {
        if (window.confirm("Are you sure you want to delete this chat?")) {
            try {
                await axios.delete(`http://localhost:5000/api/chats/${sessionId}`);
                if (currentSessionId === sessionId) {
                    handleNewChat();
                }
                fetchChatSessions();
            } catch (error) {
                console.error("Failed to delete chat session:", error);
            }
        }
    };

    const parseDatesFromInput = (text) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (/yesterday/i.test(text)) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return { startDate: yesterday, endDate: yesterday };
        }
        if (/last week/i.test(text)) {
            const endDate = new Date(today);
            endDate.setDate(today.getDate() - today.getDay());
            const startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6);
            return { startDate, endDate };
        }
        const monthMatch = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
        if (monthMatch) {
            const month = new Date(Date.parse(monthMatch[0] +" 1, 2024")).getMonth();
            const year = today.getFullYear();
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);
            return { startDate, endDate };
        }

        return null;
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            let sessionId = currentSessionId;
            if (!sessionId) {
                const titleRes = await axios.post('http://localhost:5000/api/assistant/title', { message: input });
                const title = titleRes.data.title;
                const res = await axios.post(`http://localhost:5000/api/chats/${user.user_id}`, { title });
                sessionId = res.data.id;
                setCurrentSessionId(sessionId);
                fetchChatSessions();
            }

            await axios.post(`http://localhost:5000/api/chats/${sessionId}/messages`, userMessage);

            const profileRes = await axios.get(`http://localhost:5000/api/profile/${user.user_id}`);
            const dateRange = parseDatesFromInput(input);
            let logs = [];
            if (dateRange) {
                const { startDate, endDate } = dateRange;
                const logsRes = await axios.get(`http://localhost:5000/api/logs/${user.user_id}`, {
                    params: {
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0]
                    }
                });
                logs = logsRes.data;
            }

            const context = `
                Current Date: ${new Date().toLocaleDateString()}
                User Profile: ${JSON.stringify(profileRes.data)}
                ${logs.length > 0 ? `Health Logs: ${JSON.stringify(logs)}` : ''}
            `;

            const conversationHistory = [...messages, userMessage].map(msg => `${msg.role}: ${msg.content}`).join('\n');
            const fullPrompt = `${context}\n\n${conversationHistory}\nassistant:`;
            
            const geminiRes = await axios.post('http://localhost:5000/api/assistant/generate', { prompt: fullPrompt });
            const reply = geminiRes.data.reply;
            
            const modelMessage = { role: "assistant", content: reply };
            setMessages(prev => [...prev, modelMessage]);
            await axios.post(`http://localhost:5000/api/chats/${sessionId}/messages`, modelMessage);

        } catch (error) {
            console.error("Failed to send message or get reply:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-transparent">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
                    <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0">
                        <h2 className="text-3xl font-bold mb-6 text-center text-[var(--theme-text)]">Assistant</h2>
                        <div className="flex-1 flex gap-6 min-h-0">
                            <div className="w-1/4 flex flex-col">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-4">
                                    <md-filled-button class="w-full" onClick={handleNewChat}>New Chat</md-filled-button>
                                </motion.div>
                                <div ref={scrollRef} className={`flex-1 overflow-y-auto space-y-2 ${isOverflowing ? 'pr-2' : ''}`}>
                                    {chatSessions.map(session => (
                                        <div key={session.id} className={`flex items-center justify-between p-2 rounded-lg border border-[var(--theme-outline)] cursor-pointer ${currentSessionId === session.id ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} onClick={() => { setCurrentSessionId(session.id); fetchMessages(session.id); }}>
                                            <span className="text-[var(--theme-text)] truncate">{session.title}</span>
                                            <md-icon-button onClick={(e) => { e.stopPropagation(); handleDeleteChat(session.id); }}>
                                                <md-icon>delete</md-icon>
                                            </md-icon-button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-3/4 flex flex-col min-h-0">
                                <div className={`flex-1 overflow-y-auto mb-4 p-4 rounded-lg border border-[var(--theme-outline)] space-y-4`}>
                                    {messages.length > 0 ? (
                                        messages.map((msg, index) => (
                                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)]' : 'bg-gray-200 dark:bg-gray-700 text-[var(--theme-text)]'}`}>
                                                    <p>{msg.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                        </div>
                                    )}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="max-w-xl p-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-[var(--theme-text)]">
                                                <p>Assistant is typing...</p>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <div className="flex items-center gap-4">
                                    <md-outlined-text-field class="flex-1" label="Ask me anything..." value={input} onInput={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}></md-outlined-text-field>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <md-icon-button onClick={handleSendMessage} disabled={isLoading}>
                                            <md-icon>send</md-icon>
                                        </md-icon-button>
                                    </motion.div>
                                </div>
                                <p className="text-xs text-left text-[var(--theme-text)] opacity-70 mt-2">
                                    Assistant can make mistakes. Make sure to independently verify all information.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Assistant;
