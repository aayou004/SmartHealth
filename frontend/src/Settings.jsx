import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import { motion } from "framer-motion";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/button/text-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";

const Settings = () => {
    const navigate = useNavigate();
    const { theme, setTheme, backgroundImage, setBackgroundImage, isSidebarOpen, toggleSidebar } = useContext(ThemeContext);
    const [message, setMessage] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!user || !user.user_id) {
            navigate("/");
        }
    }, [navigate, user]);

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

    const handleDeleteProfile = async () => {
        if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:5000/api/profile/${user.user_id}`);
                
                localStorage.clear();
                setMessage("Profile deleted successfully.");
                setTimeout(() => navigate("/"), 2000);
            } catch (error) {
                setMessage("Failed to delete profile.");
                console.error("Profile deletion error:", error);
                setTimeout(() => setMessage(""), 3000);
            }
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <>
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
                            <h2 className="text-3xl font-bold mb-6 text-center text-[var(--theme-text)]">Settings</h2>
                            
                            <div className="p-4 rounded-lg border border-[var(--theme-outline)] mb-8">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[var(--theme-text)]">Theme</span>
                                    <md-outlined-select value={theme} onchange={(e) => setTheme(e.target.value)}>
                                        <md-select-option value="light">
                                            <div slot="headline">Light Theme</div>
                                        </md-select-option>
                                        <md-select-option value="dark">
                                            <div slot="headline">Dark Theme</div>
                                        </md-select-option>
                                    </md-outlined-select>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-[var(--theme-outline)] mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-semibold text-[var(--theme-text)]">Background</span>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            id="bg-upload"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <md-outlined-button onClick={() => fileInputRef.current.click()}>
                                                Upload Image
                                            </md-outlined-button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <md-outlined-button onClick={handleClearBackground} disabled={!backgroundImage}>
                                                Delete Image
                                            </md-outlined-button>
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="h-96 rounded-lg border-2 border-[var(--theme-outline)] flex items-center justify-center bg-black/5 text-[var(--theme-text)]/70">
                                    {backgroundImage ? (
                                        <img src={backgroundImage} alt="Current background" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span>No Image Uploaded</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-4 rounded-lg border border-[var(--theme-outline)]">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[var(--theme-text)]">Account</span>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <md-outlined-button onClick={handleDeleteProfile}>
                                            Delete Profile
                                        </md-outlined-button>
                                    </motion.div>
                                </div>
                            </div>
                            {message && <p className="mt-4 text-center text-green-500 opacity-90">{message}</p>}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Settings;
