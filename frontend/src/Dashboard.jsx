import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HealthChart from "./HealthChart";
import { ThemeContext } from "./ThemeContext";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";

const Dashboard = () => {
    const navigate = useNavigate();
    const { isSidebarOpen, toggleSidebar } = useContext(ThemeContext);
    const [logs, setLogs] = useState([]);
    const [metric, setMetric] = useState("steps");
    
    const user = JSON.parse(localStorage.getItem("user"));

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

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
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
            <div className={`bg-[var(--theme-card-bg)] backdrop-blur-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                <div className="p-4">
                    <div
                        className={`flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${isSidebarOpen ? 'gap-2' : 'justify-center'}`}
                        onClick={toggleSidebar}
                    >
                        <md-icon>menu</md-icon>
                        <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>SmartHealth</span>
                    </div>
                </div>
                <nav className="flex flex-col gap-4 p-4 flex-grow">
                    <div className={`flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${isSidebarOpen ? 'gap-2' : 'justify-center'}`} onClick={() => navigate('/dashboard')}>
                        <md-icon>dashboard</md-icon>
                        <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Dashboard</span>
                    </div>
                    <div className={`flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${isSidebarOpen ? 'gap-2' : 'justify-center'}`} onClick={() => navigate('/calendar')}>
                        <md-icon>calendar_month</md-icon>
                        <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Calendar</span>
                    </div>
                    <div className={`flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${isSidebarOpen ? 'gap-2' : 'justify-center'}`} onClick={() => navigate('/profile')}>
                        <md-icon>person</md-icon>
                        <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Profile</span>
                    </div>
                    <div className={`flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${isSidebarOpen ? 'gap-2' : 'justify-center'}`} onClick={() => navigate('/settings')}>
                        <md-icon>settings</md-icon>
                        <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Settings</span>
                    </div>
                </nav>
                <nav className="flex flex-col gap-4 p-4">
                    <div className={`flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${isSidebarOpen ? 'gap-2' : 'justify-center'}`} onClick={handleLogout}>
                        <md-icon>logout</md-icon>
                        <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Log Out</span>
                    </div>
                </nav>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                <main className="container mx-auto px-6 pt-4 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
                            <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Steps (7d)</h3>
                            <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_steps}</p>
                        </div>
                         <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
                            <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Sleep (7d)</h3>
                            <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_sleep}</p>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
                            <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Calories (7d)</h3>
                            <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_calories}</p>
                        </div>
                         <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
                            <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Active Mins (7d)</h3>
                            <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_active_minutes}</p>
                        </div>
                    </div>

                    {logs.length > 0 && (
                        <div className="bg-[var(--theme-card-bg)] p-4 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
                            <md-tabs aria-label="Select metric to display" onchange={(e) => setMetric(e.target.activeTab.id)}>
                                <md-primary-tab id="steps" active>Steps</md-primary-tab>
                                <md-primary-tab id="sleep_hours">Sleep</md-primary-tab>
                                <md-primary-tab id="water_glasses">Water</md-primary-tab>
                                <md-primary-tab id="calorie_intake">Calories</md-primary-tab>
                                <md-primary-tab id="weight">Weight</md-primary-tab>
                                <md-primary-tab id="active_minutes">Activity</md-primary-tab>
                                <md-primary-tab id="heart_rate">Heart Rate</md-primary-tab>
                                <md-primary-tab id="mood">Mood</md-primary-tab>
                                <md-primary-tab id="stress_level">Stress</md-primary-tab>
                            </md-tabs>
                            <HealthChart data={logs} metric={metric} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
