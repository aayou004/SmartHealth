import React, { useContext, useRef } from "react";
import { ThemeContext } from "./ThemeContext";
import Sidebar from "./Sidebar";
import { useOverflow } from "./useOverflow";
import { motion } from "framer-motion";
import StatusMessage from "./StatusMessage";
import "@material/web/button/outlined-button.js";

const TestPage = () => {
    const { statusMessage, setStatusMessage } = useContext(ThemeContext);
    const scrollRef = useRef(null);
    const isOverflowing = useOverflow(scrollRef);

    const triggerStatusMessage = () => {
        setStatusMessage("This is a test message!");
    };

    return (
        <div className="flex h-screen bg-transparent">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
                    <div id="page-card-container" className="relative bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0">
                        <StatusMessage message={statusMessage} onDismiss={() => setStatusMessage("")} />
                        <div ref={scrollRef} className={`flex-1 overflow-y-auto ${isOverflowing ? 'pr-4' : ''}`}>
                            <h2 className="text-3xl font-bold mb-6 text-center text-[var(--theme-text)]">Test Page</h2>
                            
                            <div className="p-4 rounded-lg border border-[var(--theme-outline)]">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[var(--theme-text)]">Test Button</span>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <md-outlined-button onClick={triggerStatusMessage}>
                                            Status Message
                                        </md-outlined-button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TestPage;
