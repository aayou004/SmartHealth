import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // for redirection

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // hook

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      setMessage(res.data.message);
      localStorage.setItem("user", JSON.stringify({ username }));
      navigate("/upload"); // redirect after login
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
  <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
    <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="text"
        placeholder="Username"
        className="w-full p-2 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
    </form>

    {message && (
      <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
    )}

    {/* ✅ Add this below the message */}
    <p className="mt-6 text-center text-sm text-gray-600">
      New user?{" "}
      <Link to="/register" className="text-blue-600 hover:underline">
        Sign up here
      </Link>
    </p>
  </div>
);
};

export default LoginPage;
