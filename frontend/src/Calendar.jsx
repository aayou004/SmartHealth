import React, { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";
import "@material/web/textfield/outlined-text-field.js";

const Calendar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [logs, setLogs] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [steps, setSteps] = useState("");
  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");
  const [mood, setMood] = useState(3);
  const [message, setMessage] = useState("");

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
  }, []);

  useEffect(() => {
      if (isModalOpen && selectedDate) {
          const entry = logs.find(log => log.date === selectedDate);
          if (entry) {
              setSteps(entry.steps || "");
              setSleep(entry.sleep_hours || "");
              setWater(entry.water_glasses || "");
              setMood(entry.mood || 3);
          } else {
              setSteps("");
              setSleep("");
              setWater("");
              setMood(3);
          }
      }
  }, [isModalOpen, selectedDate, logs]);

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
              date: selectedDate,
              steps: Number(steps) || null,
              sleep_hours: Number(sleep) || null,
              water_glasses: Number(water) || null,
              mood: Number(mood)
          });
          setMessage("Log submitted successfully!");
          fetchData(); 
          setTimeout(() => {
              setMessage("");
              setIsModalOpen(false);
          }, 1500);
      } catch (error) {
          setMessage("Failed to submit log.");
          console.error("Log submission error:", error);
           setTimeout(() => setMessage(""), 3000);
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
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

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
        if(viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
        if(viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
        if(viewMode === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
    });
  };

  const handleNext = () => {
     setCurrentDate(prev => {
        const newDate = new Date(prev);
        if(viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
        if(viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
        if(viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
        return newDate;
    });
  };

  const handleGoToToday = () => {
      setCurrentDate(new Date());
  }
  
  const getHeaderText = () => {
      if(viewMode === 'week'){
          const startOfWeek = getStartOfWeek(currentDate);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
      }
      if(viewMode === 'month') return `${monthNames[currentMonth]} ${currentYear}`;
      return `${currentYear}`;
  }


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
      <div className={`fixed top-0 left-0 h-full bg-[var(--theme-card-bg)] w-64 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
          <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] mb-8">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <md-outlined-button onClick={handleGoToToday}>This {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</md-outlined-button>
                    <md-icon-button onClick={handlePrev}><md-icon>chevron_left</md-icon></md-icon-button>
                    <md-icon-button onClick={handleNext}><md-icon>chevron_right</md-icon></md-icon-button>
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
                          {Array.from({length: 7}).map((_, i) => {
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
              const emptyEndCellsCount = 42 - totalFilledCells;

              return (
                <div>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayAbbreviations.map(day => <div key={day} className="text-center font-bold text-sm text-[var(--theme-text)] opacity-70">{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-start-${i}`} className="aspect-square rounded-lg bg-black/5 dark:bg-white/5"></div>)}
                    {Array.from({ length: daysInMonth }).map((_, day) => renderDayCell(new Date(currentYear, currentMonth, day + 1)))}
                    {Array.from({ length: emptyEndCellsCount > 0 ? emptyEndCellsCount : 0 }).map((_, i) => <div key={`empty-end-${i}`} className="aspect-square rounded-lg bg-black/5 dark:bg-white/5"></div>)}
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
                                        <div key={day} className="text-xs font-bold text-[var(--theme-text)] opacity-50">{day.slice(0,1)}</div>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--theme-card-bg)] p-8 rounded-xl border border-[var(--theme-outline)] w-full max-w-md relative">
                 <md-icon-button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2">
                    <md-icon>close</md-icon>
                 </md-icon-button>
                 <h2 className="text-2xl font-semibold mb-6 text-center text-[var(--theme-text)]">
                    Log for {selectedDate}
                 </h2>
                 <form onSubmit={handleLogSubmit} className="grid grid-cols-1 gap-6">
                    <md-outlined-text-field label="Steps" type="number" value={steps} onInput={e => setSteps(e.target.value)}></md-outlined-text-field>
                    <md-outlined-text-field label="Hours of Sleep" type="number" step="0.1" value={sleep} onInput={e => setSleep(e.target.value)}></md-outlined-text-field>
                    <md-outlined-text-field label="Glasses of Water" type="number" value={water} onInput={e => setWater(e.target.value)}></md-outlined-text-field>
                    <div className="flex flex-col items-center justify-center">
                        <label className="mb-2 text-sm text-[var(--theme-text)]">Mood</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(val => (
                                <md-icon-button key={val} type="button" onClick={() => setMood(val)}>
                                    <md-icon>{mood === val ? 'radio_button_checked' : 'radio_button_unchecked'}</md-icon>
                                </md-icon-button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center mt-4">
                        <md-filled-button type="submit">Submit Log</md-filled-button>
                    </div>
                </form>
                {message && <p className="mt-4 text-center text-green-500 opacity-90">{message}</p>}
            </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
