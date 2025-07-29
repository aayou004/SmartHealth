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
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [metric, setMetric] = useState("steps");

    const [steps, setSteps] = useState("");
    const [sleep, setSleep] = useState("");
    const [water, setWater] = useState("");
    const [mood, setMood] = useState(3);
    const [message, setMessage] = useState("");

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

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/log", {
                user_id: user.user_id,
                steps: Number(steps) || null,
                sleep_hours: Number(sleep) || null,
                water_glasses: Number(water) || null,
                mood: Number(mood)
            });
            setMessage("Log for today submitted successfully!");
            setSteps("");
            setSleep("");
            setWater("");
            setMood(3);
            fetchData();
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage("Failed to submit log. Please try again.");
            console.error("Log submission error:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const getSummary = () => {
        if (logs.length === 0) return { avg_steps: 'N/A', avg_sleep: 'N/A' };

        const recentLogs = logs.slice(-7);
        const totalSteps = recentLogs.reduce((sum, log) => sum + (log.steps || 0), 0);
        const totalSleep = recentLogs.reduce((sum, log) => sum + (log.sleep_hours || 0), 0);
        const stepLogs = recentLogs.filter(log => log.steps != null);
        const sleepLogs = recentLogs.filter(log => log.sleep_hours != null);

        return {
            avg_steps: stepLogs.length > 0 ? (totalSteps / stepLogs.length).toFixed(0) : 'N/A',
            avg_sleep: sleepLogs.length > 0 ? (totalSleep / sleepLogs.length).toFixed(1) : 'N/A'
        };
    };
    
    const summary = getSummary();


    return (
        <div className="relative bg-[var(--theme-bg)] min-h-screen transition-colors duration-300">
            <div className="absolute top-0 left-0 p-4 z-40">
                <md-icon-button onClick={toggleSidebar}>
                    <md-icon>{isSidebarOpen ? "close" : "menu"}</md-icon>
                </md-icon-button>
            </div>
            <div className="absolute top-0 right-0 p-4 z-40">
                <md-icon-button onClick={toggleTheme}>
                    <md-icon>{theme === "light" ? "dark_mode" : "light_mode"}</md-icon>
                </md-icon-button>
            </div>
            {isSidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-20" onClick={toggleSidebar}></div>}
            <div className={`fixed top-0 left-0 h-full bg-[var(--theme-card-bg)] w-64 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="mt-16 mb-8">
                        <h1 className="text-2xl font-bold text-[var(--theme-primary)]">SmartHealth</h1>
                    </div>
                    <nav className="flex flex-col gap-4 mt-auto">
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" onClick={handleLogout}>
                            <md-icon>logout</md-icon>
                            <span className="text-[var(--theme-text)]">Log Out</span>
                        </div>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto p-6 pt-20">
                <div className="bg-[var(--theme-card-bg)] p-8 rounded-xl border border-[var(--theme-outline)] mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-[var(--theme-text)]">Log Your Day</h2>
                    <form onSubmit={handleLogSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <md-outlined-text-field label="Steps" type="number" value={steps} onInput={e => setSteps(e.target.value)}></md-outlined-text-field>
                        <md-outlined-text-field label="Hours of Sleep" type="number" step="0.1" value={sleep} onInput={e => setSleep(e.target.value)}></md-outlined-text-field>
                        <md-outlined-text-field label="Glasses of Water" type="number" value={water} onInput={e => setWater(e.target.value)}></md-outlined-text-field>
                        <div className="md:col-span-3 flex flex-col items-center justify-center">
                            <label className="mb-2 text-sm text-[var(--theme-text)]">Mood</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(val => (
                                    <md-icon-button key={val} type="button" onClick={() => setMood(val)}>
                                        <md-icon>{mood === val ? 'radio_button_checked' : 'radio_button_unchecked'}</md-icon>
                                    </md-icon-button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-3 flex justify-center mt-4">
                            <md-filled-button type="submit">Submit Log</md-filled-button>
                        </div>
                    </form>
                    {message && <p className="mt-4 text-center text-green-500 opacity-90">{message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)]">
                        <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Daily Steps (7 days)</h3>
                        <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_steps}</p>
                    </div>
                     <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)]">
                        <h3 className="font-bold mb-2 text-[var(--theme-text)]">Avg. Daily Sleep (7 days)</h3>
                        <p className="text-2xl font-semibold text-[var(--theme-primary)]">{summary.avg_sleep}</p>
                    </div>
                </div>

                {logs.length > 0 && (
                    <div className="bg-[var(--theme-card-bg)] p-4 rounded-xl border border-[var(--theme-outline)]">
                        <md-tabs aria-label="Select metric to display" onchange={(e) => setMetric(e.target.activeTab.id)}>
                            <md-primary-tab id="steps" active>Steps</md-primary-tab>
                            <md-primary-tab id="sleep_hours">Sleep</md-primary-tab>
                            <md-primary-tab id="water_glasses">Water</md-primary-tab>
                            <md-primary-tab id="mood">Mood</md-primary-tab>
                        </md-tabs>
                        <HealthChart data={logs} metric={metric} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
