import React, { useState } from "react";
import API from "../utils/api";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-app-bg p-4 font-sans relative overflow-hidden">
      <div className="bg-panel-bg p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-800 relative z-10">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-6">
          Sign up
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="group">
            <input
              type="text"
              name="username"
              required
              className="w-full px-4 py-3 bg-input-bg text-text-primary border border-transparent focus:border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder-text-secondary"
              placeholder="Username"
              onChange={handleChange}
            />
          </div>

          <div className="group">
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 bg-input-bg text-text-primary border border-transparent focus:border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder-text-secondary"
              placeholder="Email"
              onChange={handleChange}
            />
          </div>

          <div className="group">
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-3 bg-input-bg text-text-primary border border-transparent focus:border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder-text-secondary"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-full shadow-lg transform transition-all duration-300 hover:-translate-y-1 mt-4"
          >
            SIGN UP
          </button>
        </form>

        <p className="mt-6 text-center text-text-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:text-orange-400 font-semibold hover:underline transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
