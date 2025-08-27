import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HealthChart from "./HealthChart";
import Sidebar from "./Sidebar";
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
  const { mode } = useContext(ThemeContext);
  const [logs, setLogs] = useState([]);
  const [daysToShow, setDaysToShow] = useState(30);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Memoize user to prevent re-renders
  const user = useMemo(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }, []);

  useEffect(() => {
    if (!user?.user_id) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/logs/${user.user_id}`);
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  }, [user?.user_id]);

  const summary = useMemo(() => {
    if (logs.length === 0) return {
      avg_steps: 'N/A', avg_sleep: 'N/A', avg_calories: 'N/A', avg_active_minutes: 'N/A',
      avg_water_glasses: 'N/A', avg_protein: 'N/A', avg_carbs: 'N/A', avg_fat: 'N/A',
      avg_mood: 'N/A', avg_stress_level: 'N/A', avg_mindful_minutes: 'N/A', avg_weight: 'N/A',
      avg_heart_rate: 'N/A', avg_workout_intensity: 'N/A'
    };
    const recentLogs = logs.slice(-daysToShow);
    const calcAverage = (field, precision = 0) => {
      const filtered = recentLogs.filter(l => l[field] != null);
      if (!filtered.length) return 'N/A';
      const total = filtered.reduce((sum, l) => sum + l[field], 0);
      return (total / filtered.length).toFixed(precision);
    };
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

  // Memoize summary cards to prevent recreation on every render
  const summaryCards = useMemo(() => [
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
  ], [summary]);

  // Memoize the cardBgClass to prevent recalculation
  const cardBgClass = useMemo(() => 
    mode === 'custom' ? 'bg-[var(--theme-card-bg-alpha)]' : 'bg-[var(--theme-card-bg)]', 
    [mode]
  );

  // Memoize scroll handler to prevent recreation
  const handleScroll = useCallback((direction) => {
    const numCards = summaryCards.length;
    setActiveCardIndex(prev => direction === 'left' ? (prev - 1 + numCards) % numCards : (prev + 1) % numCards);
  }, [summaryCards.length]);

  // Memoize card click handler
  const handleCardClick = useCallback((index) => {
    setActiveCardIndex(index);
  }, []);

  // Memoize dot click handler  
  const handleDotClick = useCallback((index) => {
    setActiveCardIndex(index);
  }, []);

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
          <div className={`${cardBgClass} p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0`}>

            {/* Carousel */}
            <div className="relative mb-8">
              <div className="flex justify-center items-center gap-6 overflow-hidden no-scrollbar">
                {summaryCards.map((card, index) => {
                  const leftIndex = (activeCardIndex - 1 + summaryCards.length) % summaryCards.length;
                  const rightIndex = (activeCardIndex + 1) % summaryCards.length;

                  let classes = "transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg";

                  if (index === activeCardIndex) classes += " scale-100 opacity-100 z-20 min-w-[200px] max-w-[220px]";
                  else if (index === leftIndex || index === rightIndex) classes += " scale-90 opacity-70 z-10 min-w-[160px] max-w-[180px]";
                  else classes += " scale-75 opacity-0 z-0 hidden";

                  return (
                    <div key={index} onClick={() => handleCardClick(index)} className={classes}>
                      <h3 className="font-bold mb-2 text-[var(--theme-text)]">{card.title}</h3>
                      <p className="text-xl font-semibold text-[var(--theme-primary)]">{card.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="absolute inset-y-0 left-0 flex items-center">
                <md-icon-button className="bg-white/50 dark:bg-black/50 rounded-full" onClick={() => handleScroll("left")}>
                  <md-icon>chevron_left</md-icon>
                </md-icon-button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <md-icon-button className="bg-white/50 dark:bg-black/50 rounded-full" onClick={() => handleScroll("right")}>
                  <md-icon>chevron_right</md-icon>
                </md-icon-button>
              </div>

              {/* Dots */}
              <div className="flex justify-center mt-4">
                {summaryCards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-3 h-3 mx-1 rounded-full border-2 ${index === activeCardIndex ? "border-[var(--theme-primary)] bg-transparent" : "bg-[var(--theme-primary)] border-transparent"}`}
                  />
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className={`${cardBgClass} p-4 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1`}>
              <HealthChartMemo data={logs} daysToShow={daysToShow} setDaysToShow={setDaysToShow} />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

// Wrap HealthChart in React.memo with custom comparison function to prevent unnecessary re-renders
const HealthChartMemo = React.memo(HealthChart, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.daysToShow === nextProps.daysToShow &&
    prevProps.setDaysToShow === nextProps.setDaysToShow
  );
});

export default Dashboard;