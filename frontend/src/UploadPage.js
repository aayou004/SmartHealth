import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HealthChart from "./HealthChart";

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [metric, setMetric] = useState("steps");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
    setParsedData([]);
    setSummary(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
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
    localStorage.removeItem("user"); // or "token" depending on what you stored
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center flex-grow">
          Upload Health CSV
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
        >
          Logout
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 mb-6"
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="bg-white p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload
        </button>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </form>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-gray-700">Average Steps</h3>
            <p className="text-2xl">{summary.average_steps ?? "N/A"}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-gray-700">Average Heart Rate</h3>
            <p className="text-2xl">{summary.average_heart_rate ?? "N/A"}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-gray-700">Max Steps Day</h3>
            <p className="text-lg">{summary.max_steps_day ?? "N/A"}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-gray-700">Max Heart Rate Day</h3>
            <p className="text-lg">{summary.max_heart_rate_day ?? "N/A"}</p>
          </div>
        </div>
      )}

      {parsedData.length > 0 && (
        <>
          <div className="mb-6 flex justify-center gap-4">
            <button
              onClick={() => setMetric("steps")}
              className={`px-4 py-2 rounded ${
                metric === "steps"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 border"
              }`}
            >
              Steps
            </button>
            <button
              onClick={() => setMetric("heart_rate")}
              className={`px-4 py-2 rounded ${
                metric === "heart_rate"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 border"
              }`}
            >
              Heart Rate
            </button>
          </div>

          <HealthChart data={parsedData} metric={metric} />
        </>
      )}
    </div>
  );
}

export default UploadPage;
