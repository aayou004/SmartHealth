import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '@material/web/button/filled-button.js';
import '@material/web/dialog/dialog.js';
import '@material/web/icon/icon.js';

const JimAssistant = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jimResponse, setJimResponse] = useState("Hi there! I'm Jim, your personal health assistant. Click on 'Analyze My Day' to get started.");
    const [isLoading, setIsLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleAnalyzeDay = async () => {
        if (!user || !user.user_id) {
            setJimResponse("Please log in to use Jim.");
            return;
        }

        setIsLoading(true);
        setJimResponse("Analyzing your latest health log...");

        try {
            const logsRes = await axios.get(`http://localhost:5000/api/logs/${user.user_id}`);
            const latestLog = logsRes.data.length > 0 ? logsRes.data.slice(-1)[0] : null;

            if (!latestLog) {
                setJimResponse("It looks like you haven't logged any data yet. Please log a day's worth of data first!");
                setIsLoading(false);
                return;
            }

            const requestBody = {
                user_id: user.user_id,
                message: "Analyze my latest health log.",
                context: latestLog
            };

            console.log("Sending request to Jim API with body:", requestBody);

            const jimRes = await axios.post(
                'http://localhost:5000/api/jim_chat', 
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setJimResponse(jimRes.data.response);
        } catch (error) {
            console.error("Jim API Error:", error);
            setJimResponse("Sorry, I'm having trouble analyzing your data right now. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50">
                <md-filled-button onClick={() => { handleOpenModal(); handleAnalyzeDay(); }}>
                    <md-icon slot="icon">smart_toy</md-icon>
                    Ask Jim
                </md-filled-button>
            </div>

            {isModalOpen && (
                <md-dialog open onclose={handleCloseModal}>
                    <div slot="headline">Jim, your Health Assistant</div>
                    <div slot="content" className="p-4 space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl max-h-96 overflow-y-auto">
                            <p className="text-sm">{isLoading ? "Thinking..." : jimResponse}</p>
                        </div>
                        <md-filled-button onClick={handleAnalyzeDay} disabled={isLoading}>
                            <md-icon slot="icon">refresh</md-icon>
                            Analyze Again
                        </md-filled-button>
                    </div>
                    <div slot="actions">
                        <md-filled-button onClick={handleCloseModal}>Close</md-filled-button>
                    </div>
                </md-dialog>
            )}
        </>
    );
};

export default JimAssistant;