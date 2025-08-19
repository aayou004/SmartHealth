import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HealthChart from "./HealthChart";
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
    const [daysToShow, setDaysToShow] = useState(30);
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

    const summary = useMemo(() => {
        if (logs.length === 0) return { 
            avg_steps: 'N/A', avg_sleep: 'N/A', avg_calories: 'N/A', avg_active_minutes: 'N/A',
            avg_water_glasses: 'N/A', avg_protein: 'N/A', avg_carbs: 'N/A', avg_fat: 'N/A',
            avg_mood: 'N/A', avg_stress_level: 'N/A', avg_mindful_minutes: 'N/A', avg_weight: 'N/A',
            avg_heart_rate: 'N/A', avg_workout_intensity: 'N/A'
        };
        const recentLogs = logs.slice(-daysToShow);
        const calcAverage = (field, precision = 0) => {
            const filteredLogs = recentLogs.filter(log => log[field] != null);
            if (filteredLogs.length === 0) return 'N/A';
            const total = filteredLogs.reduce((sum, log) => sum + log[field], 0);
            return (total / filteredLogs.length).toFixed(precision);
        }
        return {
            avg_steps: calcAverage('steps'),
            avg_sleep: calcAverage('sleep_hours', 1),
            avg_calories: calcAverage('calorie_intake'),
            avg_active_minutes: calcAverage('active_minutes'),
            avg_water_glasses: calcAverage('water_glasses'),
            avg_protein: calcAverage('protein', 1),
            avg_carbs: calcAverage('carbs', 1),
            avg_fat: calcAverage('fat', 1),
            avg_mood: calcAverage('mood', 1),
            avg_stress_level: calcAverage('stress_level', 1),
            avg_mindful_minutes: calcAverage('mindful_minutes'),
            avg_weight: calcAverage('weight', 1),
            avg_heart_rate: calcAverage('heart_rate'),
            avg_workout_intensity: calcAverage('workout_intensity', 1),
        };
    }, [logs, daysToShow]);
    
    const summaryCards = [
        { title: "Avg. Steps", value: summary.avg_steps },
        { title: "Avg. Sleep", value: summary.avg_sleep === 'N/A' ? 'N/A' : `${summary.avg_sleep} hrs` },
        { title: "Avg. Heart Rate", value: summary.avg_heart_rate === 'N/A' ? 'N/A' : `${summary.avg_heart_rate} bpm` },
        { title: "Avg. Workout Intensity", value: summary.avg_workout_intensity === 'N/A' ? 'N/A' : `${summary.avg_workout_intensity} / 5` },
        { title: "Avg. Weight", value: summary.avg_weight === 'N/A' ? 'N/A' : `${summary.avg_weight} kg` },
        { title: "Avg. Water", value: summary.avg_water_glasses === 'N/A' ? 'N/A' : `${summary.avg_water_glasses} glasses` },
        { title: "Avg. Calories", value: summary.avg_calories === 'N/A' ? 'N/A' : `${summary.avg_calories} kcal` },
        { title: "Avg. Protein / Carbs / Fat", value: `${summary.avg_protein === 'N/A' ? 'N/A' : summary.avg_protein + ' g'} / ${summary.avg_carbs === 'N/A' ? 'N/A' : summary.avg_carbs + ' g'} / ${summary.avg_fat === 'N/A' ? 'N/A' : summary.avg_fat + ' g'}` },
        { title: "Avg. Active Mins", value: summary.avg_active_minutes === 'N/A' ? 'N/A' : `${summary.avg_active_minutes} min` },
        { title: "Avg. Mindful Mins", value: summary.avg_mindful_minutes === 'N/A' ? 'N/A' : `${summary.avg_mindful_minutes} min` },
        { title: "Avg. Mood", value: summary.avg_mood === 'N/A' ? 'N/A' : `${summary.avg_mood} / 5` },
        { title: "Avg. Stress", value: summary.avg_stress_level === 'N/A' ? 'N/A' : `${summary.avg_stress_level} / 5` },
    ];

    return (
        <div className="flex h-screen bg-transparent">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
                    <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0">
                        <div ref={scrollRef} className={`flex-1 overflow-y-auto ${isOverflowing ? 'pr-4' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {summaryCards.map((card, index) => (
                                    <div key={index} className="p-4 flex flex-col items-center justify-center rounded-xl border border-[var(--theme-outline)]">
                                        <h3 className="font-bold mb-2 text-[var(--theme-text)]">{card.title}</h3>
                                        <p className="text-2xl font-semibold text-[var(--theme-primary)]">{card.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-[var(--theme-card-bg)] p-4 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
                                <HealthChart 
                                    data={logs} 
                                    daysToShow={daysToShow} 
                                    setDaysToShow={setDaysToShow} 
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
