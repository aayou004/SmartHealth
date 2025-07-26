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

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            SmartHealth
          </h1>
          <div className="flex items-center">
            <md-icon-button onClick={toggleTheme}>
              <md-icon>{theme === "light" ? "dark_mode" : "light_mode"}</md-icon>
            </md-icon-button>
            <md-text-button onClick={handleLogout}>Logout</md-text-button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
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
  );
}

export default UploadPage;