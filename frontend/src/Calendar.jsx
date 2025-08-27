import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import Sidebar from "./Sidebar";
import { useOverflow } from "./useOverflow";
import { motion } from "framer-motion";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";
import "@material/web/textfield/outlined-text-field.js";

const Calendar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarOpen, toggleSidebar } = useContext(ThemeContext);
    const scrollRef = useRef(null);
    const isOverflowing = useOverflow(scrollRef);

    const [logs, setLogs] = useState([]);
    const [viewMode, setViewMode] = useState(localStorage.getItem('calendarViewMode') || location.state?.viewMode || "month");
    const [currentDate, setCurrentDate] = useState(
        location.state?.currentDate ? new Date(location.state.currentDate) : new Date()
    );

    const user = JSON.parse(localStorage.getItem("user"));
    const dayAbbreviations = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);
    const monthNames = useMemo(() => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], []);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const [personalBests, setPersonalBests] = useState({ highestSteps: null, lowestWeight: null });
    
    useEffect(() => {
        if (!user || !user.user_id) {
            navigate("/");
            return;
        }
        fetchData();
    }, [user?.user_id, navigate]);

    useEffect(() => {
        localStorage.setItem('calendarViewMode', viewMode);
    }, [viewMode]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/logs/${user.user_id}`);
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        }
    };

    useEffect(() => {
        if (logs.length > 0) {
            const steps = logs.map(l => l.steps).filter(s => s !== null && s !== undefined);
            const weights = logs.map(l => l.weight).filter(w => w !== null && w !== undefined);

            const highestSteps = steps.length > 0 ? Math.max(...steps) : null;
            const lowestWeight = weights.length > 0 ? Math.min(...weights) : null;

            setPersonalBests({ highestSteps, lowestWeight });
        }
    }, [logs]);

    const logsByDate = useMemo(() => {
        const map = new Map();
        logs.forEach(log => map.set(log.date, log));
        return map;
    }, [logs]);

    const handleDateClick = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const clickedDate = new Date(dateStr + "T00:00:00");

        if (clickedDate > today) return;

        navigate(`/calendar/${dateStr}`, { 
            state: { 
                calendarState: { 
                    viewMode, 
                    currentDate: currentDate.toISOString() 
                } 
            } 
        });
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const handlePrev = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
            if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
            if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
            return newDate;
        });
    };

    const handleNext = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
            if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
            if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
            return newDate;
        });
    };

    const handleGoToToday = () => setCurrentDate(new Date());

    const getHeaderText = () => {
        if (viewMode === 'week') {
            const startOfWeek = getStartOfWeek(currentDate);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
        }
        if (viewMode === 'month') return `${monthNames[currentMonth]} ${currentYear}`;
        return `${currentYear}`;
    };

    // 🔑 Month/day cell with crown
    const renderDayCell = (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const entryForDay = logsByDate.get(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isFutureDate = date > today;

        const isStepsPB = entryForDay && entryForDay.steps === personalBests.highestSteps;
        const isWeightPB = entryForDay && entryForDay.weight === personalBests.lowestWeight;
        const showCrown = isStepsPB || isWeightPB;

        return (
            <div key={dateStr}
                onClick={() => !isFutureDate && handleDateClick(dateStr)}
                className={`relative aspect-square rounded-lg flex items-center justify-center transition-all
                ${isFutureDate
                    ? 'bg-black/10 dark:bg-white/10 opacity-50 cursor-not-allowed'
                    : entryForDay
                        ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] hover:bg-opacity-80 cursor-pointer'
                        : 'bg-[var(--theme-card-bg)] hover:bg-black/10 dark:hover:bg-white/10 border border-[var(--theme-outline)] cursor-pointer'}`}
            >
                {showCrown && (
                    <md-icon className="absolute top-1 left-1 text-yellow-400 text-3xl">
                        emoji_events
                    </md-icon>
                )}
                <span className="relative font-semibold text-xl z-10">{date.getDate()}</span>
            </div>
        );
    };

    // 🔑 Year view day cell with crown
    const renderYearViewDayCell = (date, isCurrentMonth) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const entryForDay = logsByDate.get(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isFutureDate = date > today;

        const isStepsPB = entryForDay && entryForDay.steps === personalBests.highestSteps;
        const isWeightPB = entryForDay && entryForDay.weight === personalBests.lowestWeight;
        const showCrown = isStepsPB || isWeightPB;

        let className = "relative h-7 w-7 flex items-center justify-center rounded-full text-xs transition-all";

        if (!isCurrentMonth) className += " text-black/20 dark:text-white/20 cursor-not-allowed";
        else if (isFutureDate) className += " text-black/40 dark:text-white/40 cursor-not-allowed";
        else if (date.toDateString() === today.toDateString() && !entryForDay) className += " bg-blue-500 text-white font-bold cursor-pointer hover:bg-blue-600";
        else if (entryForDay) className += " bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-bold cursor-pointer hover:bg-opacity-80";
        else className += " cursor-pointer hover:bg-black/10 dark:hover:bg-white/10";

        return (
            <div key={dateStr}
                onClick={() => isCurrentMonth && !isFutureDate && handleDateClick(dateStr)}
                className={className}>
                {showCrown && (
                    <md-icon className="absolute top-0.5 left-0.5 text-yellow-400 text-3xl">
                        emoji_events
                    </md-icon>
                )}
                <span className="relative z-10">{date.getDate()}</span>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-transparent">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
                    <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0">
                        <div ref={scrollRef} className={`flex-1 overflow-y-auto ${isOverflowing ? 'pr-4' : ''}`}>
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <md-outlined-button onClick={handleGoToToday}>This {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</md-outlined-button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <md-icon-button onClick={handlePrev}><md-icon>chevron_left</md-icon></md-icon-button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <md-icon-button onClick={handleNext}><md-icon>chevron_right</md-icon></md-icon-button>
                                    </motion.div>
                                    <h2 className="text-xl md:text-2xl font-bold text-[var(--theme-text)]">{getHeaderText()}</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <md-outlined-select value={viewMode} onchange={e => setViewMode(e.target.value)}>
                                        <md-select-option value="week">Week</md-select-option>
                                        <md-select-option value="month">Month</md-select-option>
                                        <md-select-option value="year">Year</md-select-option>
                                    </md-outlined-select>
                                </div>
                            </div>

                            {viewMode === 'week' && (
                                <div>
                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {dayAbbreviations.map(day => <div key={day} className="text-center font-bold text-sm text-[var(--theme-text)] opacity-70">{day}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: 7 }).map((_, i) => {
                                            const day = getStartOfWeek(currentDate);
                                            day.setDate(day.getDate() + i);
                                            return renderDayCell(day)
                                        })}
                                    </div>
                                </div>
                            )}

                            {viewMode === 'month' && (() => {
                                const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
                                const daysInMonth = getDaysInMonth(currentYear, currentMonth);
                                const totalFilledCells = firstDayOfMonth + daysInMonth;
                                const emptyEndCellsCount = (7 - (totalFilledCells % 7)) % 7;

                                return (
                                    <div>
                                        <div className="grid grid-cols-7 gap-2 mb-2">
                                            {dayAbbreviations.map(day => <div key={day} className="text-center font-bold text-sm text-[var(--theme-text)] opacity-70">{day}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-2">
                                            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-start-${i}`} className="aspect-square rounded-lg bg-black/5 dark:bg-white/5"></div>)}
                                            {Array.from({ length: daysInMonth }).map((_, day) => renderDayCell(new Date(currentYear, currentMonth, day + 1)))}
                                            {Array.from({ length: emptyEndCellsCount }).map((_, i) => <div key={`empty-end-${i}`} className="aspect-square rounded-lg bg-black/5 dark:bg-white/5"></div>)}
                                        </div>
                                    </div>
                                );
                            })()}

                            {viewMode === 'year' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                                    {monthNames.map((monthName, monthIndex) => {
                                        const firstDayOfMonth = getFirstDayOfMonth(currentYear, monthIndex);
                                        const daysInMonth = getDaysInMonth(currentYear, monthIndex);
                                        const monthGrid = [];

                                        const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
                                        const prevMonthYear = monthIndex === 0 ? currentYear - 1 : currentYear;
                                        const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);
                                        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                                            monthGrid.push({ date: new Date(prevMonthYear, prevMonthIndex, daysInPrevMonth - i), isCurrentMonth: false });
                                        }
                                        for (let i = 1; i <= daysInMonth; i++) {
                                            monthGrid.push({ date: new Date(currentYear, monthIndex, i), isCurrentMonth: true });
                                        }
                                        const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
                                        const nextMonthYear = monthIndex === 11 ? currentYear + 1 : currentYear;
                                        const remainingCells = 42 - monthGrid.length;
                                        for (let i = 1; i <= remainingCells; i++) {
                                            monthGrid.push({ date: new Date(nextMonthYear, nextMonthIndex, i), isCurrentMonth: false });
                                        }

                                        return (
                                            <div key={monthIndex}>
                                                <h3 className="text-lg font-semibold text-center mb-2 text-[var(--theme-text)]">{monthName}</h3>
                                                <div className="grid grid-cols-7 gap-y-1 text-center justify-items-center">
                                                    {dayAbbreviations.map(day => (
                                                        <div key={day} className="text-xs font-bold text-[var(--theme-text)] opacity-50">{day.slice(0, 1)}</div>
                                                    ))}
                                                    {monthGrid.map(({ date, isCurrentMonth }) => renderYearViewDayCell(date, isCurrentMonth))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Calendar;
