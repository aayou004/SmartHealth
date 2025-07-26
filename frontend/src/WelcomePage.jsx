import React from "react";
import { Link } from "react-router-dom";

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--theme-bg)]">
      <h1 className="text-4xl font-bold mb-6 text-[var(--theme-text)]">Welcome to SmartHealth</h1>
      <div className="space-x-4">
        <Link to="/login">
          <button className="bg-[var(--theme-primary)] text-[var(--theme-primary-text)] px-6 py-2 rounded hover:opacity-90">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="bg-[var(--theme-secondary)] text-[var(--theme-primary-text)] px-6 py-2 rounded hover:opacity-90">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;