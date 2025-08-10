import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";

const Settings = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme, backgroundImage, setBackgroundImage } = useContext(ThemeContext);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [message, setMessage] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!user || !user.user_id) {
            navigate("/");
        }
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('background_image_file', file);

            axios.post(`http://localhost:5000/api/background/${user.user_id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then(res => {
                setMessage("Background updated successfully!");
                const newImageUrl = `http://localhost:5000/${res.data.profile.background_image}?${new Date().getTime()}`;
                setBackgroundImage(newImageUrl);
                localStorage.setItem('backgroundImage', newImageUrl);
                setTimeout(() => setMessage(""), 3000);
            })
            .catch(err => {
                setMessage("Failed to update background.");
                console.error("Background update error:", err);
                setTimeout(() => setMessage(""), 3000);
            });
        }
    };

    const handleClearBackground = () => {
        const formData = new FormData();
        formData.append('remove_background_image', 'true');

        axios.post(`http://localhost:5000/api/background/${user.user_id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(() => {
            setMessage("Background cleared successfully!");
            setBackgroundImage('');
            localStorage.removeItem('backgroundImage');
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
            setTimeout(() => setMessage(""), 3000);
        })
        .catch(err => {
            setMessage("Failed to clear background.");
            console.error("Background clear error:", err);
            setTimeout(() => setMessage(""), 3000);
        });
    };
    
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div className="relative bg-transparent min-h-screen transition-colors duration-300">
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
            <div className={`fixed top-0 left-0 h-full bg-[var(--theme-card-bg)] w-64 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} backdrop-blur-lg`}>
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
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" onClick={() => navigate('/settings')}>
                            <md-icon>settings</md-icon>
                            <span className="text-[var(--theme-text)]">Settings</span>
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

            <main className="container mx-auto p-6 pt-20">
                <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg">
                    <h2 className="text-3xl font-bold mb-6 text-center text-[var(--theme-text)]">Settings</h2>
                    <div className="p-4 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-bold mb-4">Custom Background</h2>
                        {backgroundImage ? (
                            <div className="flex flex-col items-center gap-4">
                                <p className="font-semibold text-green-500">
                                    ✅ Custom background is set!
                                </p>
                                <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                                    <img src={backgroundImage} alt="Current background" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col gap-2 w-full mt-2">
                                    <label htmlFor="bg-upload" className="font-semibold">
                                        Change background image
                                    </label>
                                    <input
                                        type="file"
                                        id="bg-upload"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                        onChange={handleImageUpload}
                                    />
                                    <button
                                        onClick={handleClearBackground}
                                        className="mt-2 py-2 px-4 bg-red-200 text-red-700 rounded-full font-semibold hover:bg-red-300 transition-colors"
                                    >
                                        Clear Background
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <label htmlFor="bg-upload" className="font-semibold mb-2">
                                    Upload a new background image
                                </label>
                                <input
                                    type="file"
                                    id="bg-upload"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        )}
                    </div>
                    {message && <p className="mt-4 text-center text-green-500 opacity-90">{message}</p>}
                </div>
            </main>
        </div>
    );
};

export default Settings;
