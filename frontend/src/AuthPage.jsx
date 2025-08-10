import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/button/filled-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    const endpoint = mode === "login" ? "login" : "register";
    try {
      const res = await axios.post(`http://localhost:5000/${endpoint}`, {
        username,
        password,
      });

      if (mode === "register") {
        setMessage(res.data.message + " Please log in.");
        setMode("login");
        setUsername("");
        setPassword("");
      } else {
        localStorage.setItem("user", JSON.stringify({ username, user_id: res.data.user_id }));
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || `${mode} failed`);
    }
  };

  const switchMode = (newMode) => {
    setUsername("");
    setPassword("");
    setMessage("");
    setMode(newMode);
  };

    return (
        <div className="relative min-h-screen flex justify-center items-center bg-[var(--theme-bg)] transition-colors duration-300 p-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-4xl">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-[var(--theme-text)]">
                        SmartHealth
                    </h1>
                    <p className="mt-2 text-lg text-[var(--theme-text)] opacity-75">
                        Your Personalized Wellness Companion.
                    </p>
                </div>

                <div className="w-full max-w-sm p-8 bg-[var(--theme-card-bg)] shadow-xl rounded-2xl border border-[var(--theme-outline)] backdrop-blur-lg">
                    <h2 className="text-3xl font-bold mb-6 text-center text-[var(--theme-text)]">
                        {mode === "login" ? "Login" : "Register"}
                    </h2>
                    <form onSubmit={handleAuthAction} className="space-y-6">
                        <md-outlined-text-field
                            label="Username"
                            class="w-full"
                            value={username}
                            onInput={(e) => setUsername(e.target.value)}
                            required
                        ></md-outlined-text-field>
                        <md-outlined-text-field
                            label="Password"
                            type="password"
                            class="w-full"
                            value={password}
                            onInput={(e) => setPassword(e.target.value)}
                            required
                        ></md-outlined-text-field>
                        <md-filled-button type="submit" class="w-full">
                            {mode === "login" ? "Login" : "Register"}
                        </md-filled-button>
                    </form>

                    {mode === "login" ? (
                        <p className="mt-6 text-center text-sm text-[var(--theme-text)] opacity-80">
                            Don't have an account?{" "}
                            <button
                                onClick={() => switchMode("register")}
                                className="font-semibold text-[var(--theme-primary)] hover:underline"
                            >
                                Register
                            </button>
                        </p>
                    ) : (
                        <p className="mt-6 text-center text-sm text-[var(--theme-text)] opacity-80">
                            Already have an account?{" "}
                            <button
                                onClick={() => switchMode("login")}
                                className="font-semibold text-[var(--theme-primary)] hover:underline"
                            >
                                Log In
                            </button>
                        </p>
                    )}

                    {message && (
                        <p className="mt-4 text-center text-sm text-red-500 opacity-90">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
