import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import HealthChart from "./HealthChart";
import { ThemeContext } from "./ThemeContext";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/button/text-button.js";
import "@material/web/labs/card/elevated-card.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [metric, setMetric] = useState("steps");
  const fileInputRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus(`Selected file: ${selectedFile.name}`);
      setParsedData([]);
      setSummary(null);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading...");
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const { data, summary } = await response.json();
      setParsedData(data);
      setSummary(summary);
      setStatus("Upload successful!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus("Upload failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Hamburger Menu Icon - Fixed Position */}
      <div className="fixed top-0 left-0 p-4 z-40">
        <md-icon-button onClick={toggleSidebar}>
          <md-icon>{isSidebarOpen ? "close" : "menu"}</md-icon>
        </md-icon-button>
      </div>

      {/* Theme Toggle Icon - Fixed Position */}
      <div className="fixed top-0 right-0 p-4 z-40">
        <md-icon-button onClick={toggleTheme}>
          <md-icon>{theme === "light" ? "dark_mode" : "light_mode"}</md-icon>
        </md-icon-button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 w-64 z-30 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
            {/* Container for title, moved down to make space for the hamburger icon */}
            <div className="mt-16 mb-8">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  SmartHealth
                </h1>
            </div>
          {/* Logout button at the bottom */}
          <nav className="flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" onClick={handleLogout}>
                <md-icon>logout</md-icon>
                <span className="text-gray-700 dark:text-gray-300">Log Out</span>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* The hamburger icon that was here is now removed and placed in a fixed position. */}

        <main className="container mx-auto p-6 pt-20">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
                Upload Your Health Data
            </h2>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center gap-4"
            >
                <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                accept=".csv"
                />
                <md-outlined-button onClick={handleFileSelect}>
                Select CSV File
                </md-outlined-button>
                <md-filled-button type="submit" disabled={!file}>
                Upload and Analyze
                </md-filled-button>
            </form>
            {status && (
                <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                {status}
                </p>
            )}
            </div>

            {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <md-elevated-card className="p-4 flex flex-col items-center justify-center">
                <h3 className="font-bold mb-2">Total Steps</h3>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                    {summary.total_steps ?? "N/A"}
                </p>
                </md-elevated-card>
                <md-elevated-card className="p-4 flex flex-col items-center justify-center">
                <h3 className="font-bold mb-2">Avg. Heart Rate</h3>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                    {summary.average_heart_rate ?? "N/A"}
                </p>
                </md-elevated-card>
                <md-elevated-card className="p-4 flex flex-col items-center justify-center">
                <h3 className="font-bold mb-2">Max Steps Day</h3>
                <p className="text-lg text-blue-600 dark:text-blue-400">
                    {summary.max_steps_day ?? "N/A"}
                </p>
                </md-elevated-card>
                <md-elevated-card className="p-4 flex flex-col items-center justify-center">
                <h3 className="font-bold mb-2">Max Heart Rate Day</h3>
                <p className="text-lg text-blue-600 dark:text-blue-400">
                    {summary.max_heart_rate_day ?? "N/A"}
                </p>
                </md-elevated-card>
            </div>
            )}

            {parsedData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="mb-6 flex justify-center gap-4">
                {metric === "steps" ? (
                    <md-filled-button onClick={() => setMetric("steps")}>
                    Steps
                    </md-filled-button>
                ) : (
                    <md-outlined-button onClick={() => setMetric("steps")}>
                    Steps
                    </md-outlined-button>
                )}
                {metric === "heart_rate" ? (
                    <md-filled-button onClick={() => setMetric("heart_rate")}>
                    Heart Rate
                    </md-filled-button>
                ) : (
                    <md-outlined-button onClick={() => setMetric("heart_rate")}>
                    Heart Rate
                    </md-outlined-button>
                )}
                </div>
                <HealthChart data={parsedData} metric={metric} />
            </div>
            )}
        </main>
      </div>
    </div>
  );
}

export default UploadPage;
