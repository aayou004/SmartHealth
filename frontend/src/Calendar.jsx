import React, { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
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

    useEffect(() => {
        if (!user || !user.user_id) {
            navigate("/");
            return;
        }
        fetchData();
    }, [user.user_id, navigate]);

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

    const logsByDate = useMemo(() => {
        const map = new Map();
        logs.forEach(log => map.set(log.date, log));
        return map;
    }, [logs]);

    const handleDateClick = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const clickedDate = new Date(dateStr + "T00:00:00");

        if (clickedDate > today) {
            return;
        }
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

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const renderDayCell = (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const entryForDay = logsByDate.get(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isFutureDate = date > today;

        return (
            <div key={dateStr}
                onClick={() => !isFutureDate && handleDateClick(dateStr)}
                className={`aspect-square rounded-lg flex items-start justify-start p-1.5 transition-all
                ${isFutureDate
                    ? 'bg-black/10 dark:bg-white/10 opacity-50 cursor-not-allowed'
                    : entryForDay
                        ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] hover:bg-opacity-80 cursor-pointer'
                        : 'bg-[var(--theme-card-bg)] hover:bg-black/10 dark:hover:bg-white/10 border border-[var(--theme-outline)] cursor-pointer'}`
                }>
                <span className="font-semibold text-xl">{date.getDate()}</span>
            </div>
        );
    };

    const renderYearViewDayCell = (date, isCurrentMonth) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const entryForDay = logsByDate.get(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isFutureDate = date > today;
        const isToday = date.toDateString() === today.toDateString();

        let className = "h-7 w-7 flex items-center justify-center rounded-full text-xs transition-all";

        if (!isCurrentMonth) {
            className += " text-black/20 dark:text-white/20 cursor-not-allowed";
        } else if (isFutureDate) {
            className += " text-black/40 dark:text-white/40 cursor-not-allowed";
        } else if (isToday && !entryForDay) {
            className += " bg-blue-500 text-white font-bold cursor-pointer hover:bg-blue-600";
        } else if (entryForDay) {
            className += " bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-bold cursor-pointer hover:bg-opacity-80";
        } else {
            className += " cursor-pointer hover:bg-black/10 dark:hover:bg-white/10";
        }

        return (
            <div key={dateStr}
                onClick={() => isCurrentMonth && !isFutureDate && handleDateClick(dateStr)}
                className={className}>
                {date.getDate()}
            </div>
        );
    };

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

    const handleGoToToday = () => {
        setCurrentDate(new Date());
    }

    const getHeaderText = () => {
        if (viewMode === 'week') {
            const startOfWeek = getStartOfWeek(currentDate);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
        }
        if (viewMode === 'month') return `${monthNames[currentMonth]} ${currentYear}`;
        return `${currentYear}`;
    }

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
                    <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] mb-8 backdrop-blur-lg">
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
                                <md-outlined-select label="View" value={viewMode} onchange={e => setViewMode(e.target.value)}>
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
                                        monthGrid.push({
                                            date: new Date(prevMonthYear, prevMonthIndex, daysInPrevMonth - i),
                                            isCurrentMonth: false
                                        });
                                    }

                                    for (let i = 1; i <= daysInMonth; i++) {
                                        monthGrid.push({
                                            date: new Date(currentYear, monthIndex, i),
                                            isCurrentMonth: true
                                        });
                                    }

                                    const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
                                    const nextMonthYear = monthIndex === 11 ? currentYear + 1 : currentYear;
                                    const remainingCells = 42 - monthGrid.length;
                                    for (let i = 1; i <= remainingCells; i++) {
                                        monthGrid.push({
                                            date: new Date(nextMonthYear, nextMonthIndex, i),
                                            isCurrentMonth: false
                                        });
                                    }

                                    return (
                                        <div key={monthIndex}>
                                            <h3 className="text-lg font-semibold text-center mb-2 text-[var(--theme-text)]">{monthName}</h3>
                                            <div className="grid grid-cols-7 gap-y-1 text-center justify-items-center">
                                                {dayAbbreviations.map(day => (
                                                    <div key={day} className="text-xs font-bold text-[var(--theme-text)] opacity-50">{day.slice(0, 1)}</div>
                                                ))}
                                                {monthGrid.map(({ date, isCurrentMonth }) => (
                                                    renderYearViewDayCell(date, isCurrentMonth)
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Calendar;
