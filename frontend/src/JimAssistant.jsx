import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import '@material/web/button/filled-button.js';
import '@material/web/dialog/dialog.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/filled-text-field.js';
// Removed the import for circular-progress.js here

const JimAssistant = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const initialGreeting = "Hi there! I'm Jim, your personal health assistant. How can I help you today? Here are some things I can do:";
    const initialOptions = ["Analyze my latest health log.", "Give me tips for better sleep.", "Suggest a simple workout plan."];

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        if (messages.length === 0) {
            setMessages([{ sender: 'jim', text: initialGreeting, options: initialOptions }]);
        }
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSendMessage = async (messageText) => {
        if (!messageText.trim()) return;

        const userMessage = { sender: 'user', text: messageText };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const logsRes = await axios.get(`http://localhost:5000/api/logs/${user.user_id}`);
            const latestLog = logsRes.data.length > 0 ? logsRes.data.slice(-1)[0] : {};

            const conversationHistory = messages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [msg.text] }));
            
            const jimRes = await axios.post('http://localhost:5000/api/jim_chat', {
                user_id: user.user_id,
                message: messageText,
                context: latestLog,
                history: conversationHistory
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setMessages(prevMessages => [...prevMessages, { sender: 'jim', text: jimRes.data.response }]);
        } catch (error) {
            console.error("Jim API Error:", error);
            setMessages(prevMessages => [...prevMessages, { sender: 'jim', text: "Sorry, I'm having trouble connecting to my services right now." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage(userInput);
        }
    };

    const handleOptionClick = (optionText) => {
        handleSendMessage(optionText);
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50">
                <md-filled-button onClick={handleOpenModal}>
                    <md-icon slot="icon">smart_toy</md-icon>
                    Ask Jim
                </md-filled-button>
            </div>

            {isModalOpen && (
                <md-dialog open onclose={handleCloseModal}>
                    <div slot="headline" className="flex justify-between items-center">
                        <span>Jim, your Health Assistant</span>
                        <md-icon-button onClick={handleCloseModal}>
                            <md-icon>close</md-icon>
                        </md-icon-button>
                    </div>
                    <div slot="content" className="p-4 flex flex-col space-y-4 h-[60vh] md:h-[70vh] w-[80vw] md:w-[500px]">
                        <div className="flex-1 overflow-y-auto space-y-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-xl max-w-xs ${msg.sender === 'user' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="p-3 rounded-xl max-w-xs bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
                                        <p>Please be patient, Jim is generating a response...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {messages.length > 0 && messages[messages.length-1].options && (
                            <div className="flex flex-col gap-2">
                                {messages[messages.length-1].options.map((option, index) => (
                                    <md-outlined-button key={index} onClick={() => handleOptionClick(option)} className="w-full" disabled={isLoading}>
                                        {option}
                                    </md-outlined-button>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <md-filled-text-field
                                className="flex-1"
                                placeholder="Type a message..."
                                value={userInput}
                                onInput={(e) => setUserInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            ></md-filled-text-field>
                            <md-icon-button onClick={() => handleSendMessage(userInput)} disabled={isLoading}>
                                <md-icon>send</md-icon>
                            </md-icon-button>
                        </div>
                    </div>
                </md-dialog>
            )}
        </>
    );
};

export default JimAssistant;