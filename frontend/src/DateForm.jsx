import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/textfield/outlined-text-field.js";

const AccordionCategory = ({ title, children, initialOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    return (
        <div>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-4 text-left">
                <span className="text-xl font-semibold text-[var(--theme-text)]">{title}</span>
                <md-icon>{isOpen ? 'expand_less' : 'expand_more'}</md-icon>
            </button>
            {isOpen && <div className="pb-2">{children}</div>}
        </div>
    );
};

const FormField = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3 gap-4">
        <div className="w-1/2">
            <label className="font-semibold text-[var(--theme-text)]">{label}</label>
            <p className="text-xs text-[var(--theme-text)] opacity-70 mt-1">{description}</p>
        </div>
        <div className="w-1/2 flex justify-end">
            {children}
        </div>
    </div>
);

const DateForm = () => {
    const { date: selectedDate } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [logData, setLogData] = useState({});
    const [message, setMessage] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const calendarState = location.state?.calendarState;

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
            setMessage("Log submitted successfully!");
            setTimeout(() => {
                setMessage("");
                navigate("/calendar", { state: calendarState });
            }, 1500);
        } catch (error) {
            setMessage("Failed to submit log.");
            console.error("Log submission error:", error);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const handleBackToCalendar = () => {
        navigate('/calendar', { state: calendarState });
    };

    return (
        <div className="relative bg-[var(--theme-bg)] min-h-screen transition-colors duration-300">
             <div className="absolute top-0 left-0 p-4 z-40">
                <md-icon-button onClick={toggleSidebar}>
                    <md-icon>{isSidebarOpen ? "close" : "menu"}</md-icon>
                </md-icon-button>
            </div>
            <div className="absolute top-0 right-0 p-4 z-40 flex items-center gap-2">
                <md-outlined-button onClick={handleBackToCalendar}>Back to Calendar</md-outlined-button>
                <md-filled-button type="button" onClick={() => document.getElementById('log-form')?.requestSubmit()}>Save Entry</md-filled-button>
                <md-icon-button onClick={toggleTheme}>
                    <md-icon>{theme === "light" ? "dark_mode" : "light_mode"}</md-icon>
                </md-icon-button>
            </div>

            {isSidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-20" onClick={toggleSidebar}></div>}
            <div className={`fixed top-0 left-0 h-full bg-[var(--theme-card-bg)] w-64 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="mt-16 mb-8">
                        <h1 className="text-2xl font-bold text-[var(--theme-primary)]">SmartHealth</h1>
                    </div>
                     <nav className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <md-icon>dashboard</md-icon>
                            <span className="text-[var(--theme-text)]">Dashboard</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" onClick={() => navigate('/calendar')}>
                            <md-icon>calendar_month</md-icon>
                            <span className="text-[var(--theme-text)]">Calendar</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" onClick={() => navigate('/profile')}>
                            <md-icon>person</md-icon>
                            <span className="text-[var(--theme-text)]">Profile</span>
                        </div>
                    </nav>
                    <nav className="flex flex-col gap-4 mt-auto">
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" onClick={handleLogout}>
                            <md-icon>logout</md-icon>
                            <span className="text-[var(--theme-text)]">Log Out</span>
                        </div>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto p-6 pt-24">
                <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)]">
                    <h2 className="text-3xl font-bold mb-1 text-center text-[var(--theme-text)]">
                        Daily Log
                    </h2>
                    <p className="text-center text-md text-[var(--theme-text)] opacity-70 mb-6">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <form id="log-form" onSubmit={handleLogSubmit}>
                        <md-outlined-text-field
                            class="w-full mb-4"
                            id="journal_entry"
                            type="textarea"
                            rows="8"
                            placeholder="Write a brief entry about your day..."
                            value={logData.journal_entry || ""}
                            onInput={handleInputChange}
                        ></md-outlined-text-field>
                        
                        <AccordionCategory title="Physical Activity">
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
                                         <md-icon-button key={val} type="button" onClick={() => handleRatingChange('workout_intensity', val)} className={`${(logData.workout_intensity || 0) < val ? 'opacity-40' : ''}`}>
                                             <md-icon>star</md-icon>
                                         </md-icon-button>
                                     ))}
                                 </div>
                            </FormField>
                        </AccordionCategory>

                        <AccordionCategory title="Nutrition & Hydration">
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
                        </AccordionCategory>

                        <AccordionCategory title="General Health & Wellness">
                             <FormField label="Mood" description="Rate your overall mood on a scale of 1 to 5.">
                                <div className="flex gap-2">
                                     {[1, 2, 3, 4, 5].map(val => (
                                         <md-icon-button key={val} type="button" onClick={() => handleRatingChange('mood', val)} className={`${(logData.mood || 0) < val ? 'opacity-40' : ''}`}>
                                             <md-icon>sentiment_satisfied</md-icon>
                                         </md-icon-button>
                                     ))}
                                 </div>
                            </FormField>
                            <FormField label="Stress Level" description="Rate your stress level on a scale of 1 to 5.">
                                <div className="flex gap-2">
                                     {[1, 2, 3, 4, 5].map(val => (
                                         <md-icon-button key={val} type="button" onClick={() => handleRatingChange('stress_level', val)} className={`${(logData.stress_level || 0) < val ? 'opacity-40' : ''}`}>
                                             <md-icon>battery_alert</md-icon>
                                         </md-icon-button>
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
                        </AccordionCategory>
                    </form>
                    {message && <p className="mt-4 text-center text-green-500 opacity-90">{message}</p>}
                </div>
            </main>
        </div>
    );
};

export default DateForm;
