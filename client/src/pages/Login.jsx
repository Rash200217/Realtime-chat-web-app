import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/chat");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-app-bg p-4 font-sans relative overflow-hidden">
      <div className="bg-panel-bg p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-800 relative z-10">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-2">
          Welcome Back!
        </h2>
        <p className="text-center text-text-secondary mb-8 text-sm">
          Already have an account? Please login with your personal info.
        </p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-text-primary font-bold py-3 rounded-full shadow-lg transform transition-all duration-300 mb-4"
          >
            SIGN IN
          </button>
        </form>

        <p className="mt-6 text-center text-text-secondary">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:text-green-400 font-semibold hover:underline transition-all"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
