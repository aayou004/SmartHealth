import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import Sidebar from "./Sidebar";
import { useOverflow } from "./useOverflow";
import { motion } from "framer-motion";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/textfield/outlined-text-field.js";

const FormField = ({ label, description, children }) => (
  <div className="p-4 rounded-lg border border-[var(--theme-outline)] mb-4 flex items-center justify-between gap-4">
    <div className="w-1/2">
      <label className="font-semibold text-[var(--theme-text)]">{label}</label>
      {description && (
        <p className="text-xs text-[var(--theme-text)] opacity-70 mt-1">{description}</p>
      )}
    </div>
    <div className="w-1/2 flex justify-end">{children}</div>
  </div>
);

const numericFields = ["steps", "weight", "sleep_hours"];

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
    if (!user?.user_id) {
      navigate("/");
      return;
    }
    fetchDataForDate();
  }, [selectedDate, user?.user_id, navigate]);

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
    if (numericFields.includes(id)) {
      setLogData(prev => ({
        ...prev,
        [id]: value === "" ? "" : parseFloat(value)
      }));
    } else {
      setLogData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    const payload = { user_id: user.user_id, date: selectedDate };

    Object.entries(logData).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        payload[key] = value;
      }
    });

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
    navigate("/calendar", { state: calendarState });
  };

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
          <div className="relative bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0">
            <div ref={scrollRef} className={`flex-1 overflow-y-auto ${isOverflowing ? "pr-4" : ""}`}>
              <h2 className="text-3xl font-bold mb-1 text-center text-[var(--theme-text)]">Daily Log</h2>
              <p className="text-center text-md text-[var(--theme-text)] opacity-70 mb-6">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>

              <form id="log-form" onSubmit={handleLogSubmit}>
                <FormField label="Steps" description="Enter the total number of steps taken.">
                  <md-outlined-text-field
                    class="w-full max-w-xs"
                    id="steps"
                    type="number"
                    value={logData.steps ?? ""}
                    onChange={handleInputChange}
                  ></md-outlined-text-field>
                </FormField>

                <FormField label="Weight" description="Enter your current weight.">
                  <md-outlined-text-field
                    class="w-full max-w-xs"
                    id="weight"
                    type="number"
                    step="0.1"
                    value={logData.weight ?? ""}
                    onChange={handleInputChange}
                  ></md-outlined-text-field>
                </FormField>

                <FormField label="Type of Workout" description="Specify the type of workout (e.g., Running).">
                  <md-outlined-text-field
                    class="w-full max-w-xs"
                    id="workout_type"
                    type="text"
                    value={logData.workout_type ?? ""}
                    onChange={handleInputChange}
                  ></md-outlined-text-field>
                </FormField>

                <FormField label="Hours of Sleep" description="Enter the total hours of sleep.">
                  <md-outlined-text-field
                    class="w-full max-w-xs"
                    id="sleep_hours"
                    type="number"
                    step="0.1"
                    value={logData.sleep_hours ?? ""}
                    onChange={handleInputChange}
                  ></md-outlined-text-field>
                </FormField>
              </form>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <md-outlined-button onClick={handleBackToCalendar}>Back to Calendar</md-outlined-button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <md-filled-button
                  type="button"
                  onClick={() => document.getElementById("log-form")?.requestSubmit()}
                >
                  Save Entry
                </md-filled-button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DateForm;
