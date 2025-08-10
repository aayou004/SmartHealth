import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
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
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <md-icon>expand_more</md-icon>
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="pb-2 pt-2">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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
    const { isSidebarOpen, toggleSidebar } = useContext(ThemeContext);
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

    const handleBackToCalendar = () => {
        navigate('/calendar', { state: calendarState });
    };

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
                    <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
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
                        <div className="mt-6 flex justify-end gap-4">
                            <md-outlined-button onClick={handleBackToCalendar}>Back to Calendar</md-outlined-button>
                            <md-filled-button type="button" onClick={() => document.getElementById('log-form')?.requestSubmit()}>Save Entry</md-filled-button>
                        </div>
                        {message && <p className="mt-4 text-center text-green-500 opacity-90">{message}</p>}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DateForm;
