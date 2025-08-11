import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HealthChart from "./HealthChart";
import { ThemeContext } from "./ThemeContext";
import Sidebar from "./Sidebar";
import { useOverflow } from "./useOverflow";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";

const Dashboard = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));
    const scrollRef = useRef(null);
    const isOverflowing = useOverflow(scrollRef);

    useEffect(() => {
        if (!user || !user.user_id) {
            navigate("/");
            return;
        }
        fetchData();
    }, []);
    
    const fetchData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/logs/${user.user_id}`);
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        }
    };

    const getSummary = () => {
        if (logs.length === 0) return { avg_steps: 'N/A', avg_sleep: 'N/A', avg_calories: 'N/A', avg_active_minutes: 'N/A' };
        const recentLogs = logs.slice(-7);
        const calcAverage = (field) => {
            const filteredLogs = recentLogs.filter(log => log[field] != null);
            if (filteredLogs.length === 0) return 'N/A';
            const total = filteredLogs.reduce((sum, log) => sum + log[field], 0);
            return (total / filteredLogs.length).toFixed(field === 'sleep_hours' ? 1 : 0);
        }
        return {
            avg_steps: calcAverage('steps'),
            avg_sleep: calcAverage('sleep_hours'),
            avg_calories: calcAverage('calorie_intake'),
            avg_active_minutes: calcAverage('active_minutes'),
        };
    };
    
    const summary = getSummary();

    return (
        <div className="flex h-screen bg-transparent">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
                    <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0">
                        <div ref={scrollRef} className={`flex-1 overflow-y-auto ${isOverflowing ? 'pr-4' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-[var(--theme-outline)]">
                                    <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Steps (7d)</h3>
                                    <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_steps}</p>
                                </div>
                                 <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-[var(--theme-outline)]">
                                    <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Sleep (7d)</h3>
                                    <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_sleep}</p>
                                </div>
                                <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-[var(--theme-outline)]">
                                    <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Calories (7d)</h3>
                                    <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_calories}</p>
                                </div>
                                 <div className="p-4 flex flex-col items-center justify-center rounded-xl border border-[var(--theme-outline)]">
                                    <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Active Mins (7d)</h3>
                                    <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_active_minutes}</p>
                                </div>
                            </div>

                            <div className="bg-[var(--theme-card-bg)] p-4 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
                                <HealthChart data={logs} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
