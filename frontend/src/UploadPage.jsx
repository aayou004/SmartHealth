import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import HealthChart from "./HealthChart";
import { ThemeContext } from "./ThemeContext";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/button/text-button.js";
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

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-[var(--theme-card-bg)] w-64 z-30 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
            <div className="mt-16 mb-8">
                <h1 className="text-2xl font-bold text-[var(--theme-primary)]">
                  SmartHealth
                </h1>
            </div>
          <nav className="flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" onClick={handleLogout}>
                <md-icon>logout</md-icon>
                <span className="text-[var(--theme-text)]">Log Out</span>
            </div>
          </nav>
        </div>
      </div>
      
      <div className="relative z-10">
        <main className="container mx-auto p-6 pt-20">
            <div className="bg-[var(--theme-card-bg)] p-8 rounded-xl border border-[var(--theme-outline)] mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center text-[var(--theme-text)]">
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
                <p className="mt-4 text-center text-[var(--theme-text)] opacity-80">
                {status}
                </p>
            )}
            </div>

            {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)]">
                <h3 className="font-bold mb-2">Total Steps</h3>
                <p className="text-2xl font-semibold text-[var(--theme-primary)]">
                    {summary.total_steps ?? "N/A"}
                </p>
                </div>
                <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)]">
                <h3 className="font-bold mb-2">Avg. Heart Rate</h3>
                <p className="text-2xl font-semibold text-[var(--theme-primary)]">
                    {summary.average_heart_rate ?? "N/A"}
                </p>
                </div>
                <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)]">
                <h3 className="font-bold mb-2">Max Steps Day</h3>
                <p className="text-lg text-[var(--theme-primary)]">
                    {summary.max_steps_day ?? "N/A"}
                </p>
                </div>
                <div className="p-4 flex flex-col items-center justify-center bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-outline)]">
                <h3 className="font-bold mb-2">Max Heart Rate Day</h3>
                <p className="text-lg text-[var(--theme-primary)]">
                    {summary.max_heart_rate_day ?? "N/A"}
                </p>
                </div>
            </div>
            )}

            {parsedData.length > 0 && (
              <HealthChart data={parsedData} metric={metric} />
            )}
        </main>
      </div>
    </div>
  );
}

export default UploadPage;
