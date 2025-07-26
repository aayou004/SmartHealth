import React from "react";
import { Link } from "react-router-dom";

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to SmartHealth</h1>
      <div className="space-x-4">
        <Link to="/login">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;
