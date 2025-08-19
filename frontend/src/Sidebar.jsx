import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import "@material/web/icon/icon.js";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarOpen, toggleSidebar } = useContext(ThemeContext);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const getLinkClass = (path) => {
        const isActive = location.pathname.startsWith(path);
        return `flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${isSidebarOpen ? 'gap-2' : 'justify-center'} ${isActive ? 'bg-black/10 dark:bg-white/10' : ''}`;
    };
    
    const getCalendarLinkClass = () => {
        const isActive = location.pathname.startsWith('/calendar');
        return `flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${isSidebarOpen ? 'gap-2' : 'justify-center'} ${isActive ? 'bg-black/10 dark:bg-white/10' : ''}`;
    }

    return (
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
                <div className={getLinkClass('/dashboard')} onClick={() => navigate('/dashboard')}>
                    <md-icon>dashboard</md-icon>
                    <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Dashboard</span>
                </div>
                <div className={getCalendarLinkClass()} onClick={() => navigate('/calendar')}>
                    <md-icon>calendar_month</md-icon>
                    <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Calendar</span>
                </div>
                <div className={getLinkClass('/assistant')} onClick={() => navigate('/assistant')}>
                    <md-icon>auto_awesome</md-icon>
                    <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Assistant</span>
                </div>
                <div className={getLinkClass('/profile')} onClick={() => navigate('/profile')}>
                    <md-icon>person</md-icon>
                    <span className={`text-[var(--theme-text)] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Profile</span>
                </div>
                <div className={getLinkClass('/settings')} onClick={() => navigate('/settings')}>
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
    );
};

export default Sidebar;
