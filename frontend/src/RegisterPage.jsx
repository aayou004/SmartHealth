import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-[var(--theme-card-bg)] shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center text-[var(--theme-text)]">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded bg-transparent border-[var(--theme-outline)]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded bg-transparent border-[var(--theme-outline)]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-[var(--theme-secondary)] text-[var(--theme-primary-text)] p-2 rounded hover:opacity-90">
          Register
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-[var(--theme-text)] opacity-80">{message}</p>
      )}

      <div className="mt-4 text-center">
        <p className="text-[var(--theme-text)] opacity-80">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--theme-primary)] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
