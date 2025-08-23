import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import Sidebar from "./Sidebar";
import { useOverflow } from "./useOverflow";
import { motion } from "framer-motion";
import StatusMessage from "./StatusMessage";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/textfield/outlined-text-field.js";

const FormField = ({ label, description, children }) => (
    <div className="p-4 rounded-lg border border-[var(--theme-outline)] mb-4 flex items-center justify-between gap-4">
        <div className="w-1/2">
            <label className="font-semibold text-[var(--theme-text)]">{label}</label>
            {description && <p className="text-xs text-[var(--theme-text)] opacity-70 mt-1">{description}</p>}
        </div>
        <div className="w-1/2 flex justify-end">
            {children}
        </div>
    </div>
);

const TextAreaFormField = ({ label, description, children }) => (
    <div className="p-4 rounded-lg border border-[var(--theme-outline)] mb-4">
        <div className="mb-2">
            <label className="font-semibold text-[var(--theme-text)] block">{label}</label>
            {description && <p className="text-xs text-[var(--theme-text)] opacity-70 mt-1">{description}</p>}
        </div>
        {children}
    </div>
);

const DateForm = () => {
    const { date: selectedDate } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [logData, setLogData] = useState({});
    const { statusMessage, setStatusMessage } = useContext(ThemeContext);
    const user = JSON.parse(localStorage.getItem("user"));
    const calendarState = location.state?.calendarState;
    const scrollRef = useRef(null);
    const isOverflowing = useOverflow(scrollRef);

    useEffect(() => {
        if (!user || !user.user_id) {
            navigate("/");
            return;
        }
        fetchDataForDate();
    }, [selectedDate, user.user_id, navigate]);

    const fetchDataForDate = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/logs/${user.user_id}`);
            const entry = res.data.find(log => log.date === selectedDate);
            setLogData(entry || {});
        } catch (error) {
            console.error("Failed to fetch log for date:", error);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setLogData(prev => ({ ...prev, [id]: value }));
    };

    const handleRatingChange = (field, value) => {
        setLogData(prev => ({...prev, [field]: value}));
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        const payload = { user_id: user.user_id, date: selectedDate };
        
        for (const key in logData) {
            if (['id', 'user_id', 'date'].includes(key)) {
                continue;
            }

            let value = logData[key];

            if (value === null || value === undefined) {
                continue;
            }

            if (typeof value === 'string') {
                value = value.trim();
            }

            if (value === '') {
                continue;
            }

            const numValue = Number(value);
            if (!isNaN(numValue) && String(value).trim() !== '') {
                payload[key] = numValue;
            } else {
                payload[key] = value;
            }
        }
        
        try {
            await axios.post("http://localhost:5000/api/log", payload);
            setStatusMessage("Log submitted successfully!");
            setTimeout(() => {
                navigate("/calendar", { state: calendarState });
            }, 1500);
        } catch (error) {
            setStatusMessage("Failed to submit log.");
            console.error("Log submission error:", error);
        }
    };

    const handleBackToCalendar = () => {
        navigate('/calendar', { state: calendarState });
    };

    return (
        <div className="flex h-screen bg-transparent">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
                    <div className="relative bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0">
                        <StatusMessage message={statusMessage} onDismiss={() => setStatusMessage("")} />
                        <div ref={scrollRef} className={`flex-1 overflow-y-auto ${isOverflowing ? 'pr-4' : ''}`}>
                            <h2 className="text-3xl font-bold mb-1 text-center text-[var(--theme-text)]">
                                Daily Log
                            </h2>
                            <p className="text-center text-md text-[var(--theme-text)] opacity-70 mb-6">
                                {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <form id="log-form" onSubmit={handleLogSubmit}>
                                <TextAreaFormField label="Journal Entry" description="Write a brief entry about your day...">
                                    <md-outlined-text-field
                                        class="w-full resize-none"
                                        id="journal_entry"
                                        type="textarea"
                                        rows="8"
                                        value={logData.journal_entry || ""}
                                        onInput={handleInputChange}
                                    ></md-outlined-text-field>
                                </TextAreaFormField>
                                
                                <FormField label="Steps" description="Enter the total number of steps taken.">
                                     <md-outlined-text-field class="w-full max-w-xs" id="steps" type="number" value={logData.steps || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Active Minutes" description="Enter the total minutes of physical activity.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="active_minutes" type="number" value={logData.active_minutes || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Workout Type" description="Specify the type of workout (e.g., Running).">
                                    <md-outlined-text-field class="w-full max-w-xs" id="workout_type" value={logData.workout_type || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Workout Intensity" description="Rate workout intensity on a scale of 1 to 5.">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(val => (
                                            <motion.div key={val} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                                                 <md-icon-button type="button" onClick={() => handleRatingChange('workout_intensity', val)} className={`${(logData.workout_intensity || 0) < val ? 'opacity-40' : ''}`}>
                                                     <md-icon>star</md-icon>
                                                 </md-icon-button>
                                             </motion.div>
                                         ))}
                                     </div>
                                </FormField>

                                <FormField label="Calories Consumed" description="Enter the total calorie intake for the day.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="calorie_intake" type="number" value={logData.calorie_intake || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Glasses of Water" description="Enter the number of water glasses consumed.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="water_glasses" type="number" value={logData.water_glasses || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Protein (g)" description="Enter the total protein intake in grams.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="protein" type="number" value={logData.protein || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Carbs (g)" description="Enter the total carbohydrate intake in grams.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="carbs" type="number" value={logData.carbs || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Fat (g)" description="Enter the total fat intake in grams.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="fat" type="number" value={logData.fat || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>

                                 <FormField label="Mood" description="Rate your overall mood on a scale of 1 to 5.">
                                    <div className="flex gap-2">
                                         {[1, 2, 3, 4, 5].map(val => (
                                             <motion.div key={val} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                                                 <md-icon-button type="button" onClick={() => handleRatingChange('mood', val)} className={`${(logData.mood || 0) < val ? 'opacity-40' : ''}`}>
                                                     <md-icon>sentiment_satisfied</md-icon>
                                                 </md-icon-button>
                                             </motion.div>
                                         ))}
                                     </div>
                                </FormField>
                                <FormField label="Stress Level" description="Rate your stress level on a scale of 1 to 5.">
                                    <div className="flex gap-2">
                                         {[1, 2, 3, 4, 5].map(val => (
                                             <motion.div key={val} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                                                 <md-icon-button type="button" onClick={() => handleRatingChange('stress_level', val)} className={`${(logData.stress_level || 0) < val ? 'opacity-40' : ''}`}>
                                                     <md-icon>battery_alert</md-icon>
                                                 </md-icon-button>
                                             </motion.div>
                                         ))}
                                     </div>
                                </FormField>
                                <FormField label="Mindful Minutes" description="Enter the total minutes of mindfulness.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="mindful_minutes" type="number" value={logData.mindful_minutes || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Hours of Sleep" description="Enter the total hours of sleep.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="sleep_hours" type="number" step="0.1" value={logData.sleep_hours || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Weight" description="Enter your current weight.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="weight" type="number" step="0.1" value={logData.weight || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Resting Heart Rate" description="Enter your resting heart rate in BPM.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="heart_rate" type="number" value={logData.heart_rate || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Symptoms" description="List any symptoms experienced today.">
                                    <md-outlined-text-field class="w-full max-w-xs" id="symptoms" value={logData.symptoms || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                            </form>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <md-outlined-button onClick={handleBackToCalendar}>Back to Calendar</md-outlined-button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <md-filled-button type="button" onClick={() => document.getElementById('log-form')?.requestSubmit()}>Save Entry</md-filled-button>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DateForm;
