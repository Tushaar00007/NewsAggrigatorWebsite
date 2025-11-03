"use client";

import { useState } from "react";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

// Google Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12
         c3.059 0 5.842 1.154 7.961 3.039L38.802 9.122C34.556 5.166 29.658 3 24 3
         C12.955 3 4 11.955 4 23s8.955 20 20 20s20-8.955 20-20
         c0-1.341-.138-2.65-.389-3.917z"
    ></path>
  </svg>
);

export default function SignupPage() {
  // Theme & password toggles
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Submit form → connect to Django backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: "reader", // ✅ default role always reader
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setMessage("✅ Account created successfully!");
      setFormData({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Optional: redirect to login
      // window.location.href = "/login";
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-orange-50 text-gray-800"
      }`}
    >
      {/* Home + Dark Mode */}
      <a
        href="/"
        className={`absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition ${
          darkMode
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-white hover:bg-orange-100 text-orange-600"
        }`}
      >
        <ArrowLeft size={20} />
        <span>Home</span>
      </a>

      <button
        onClick={toggleDarkMode}
        className={`absolute top-6 right-6 px-4 py-2 rounded-lg font-semibold transition ${
          darkMode
            ? "bg-orange-600 hover:bg-orange-500 text-white"
            : "bg-white text-orange-600 hover:bg-orange-100"
        }`}
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* Signup Form Card */}
      <div
        className={`w-full max-w-md p-8 space-y-6 rounded-2xl shadow-lg transition-colors ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Create an Account
          </h1>
          <p
            className={`mt-2 text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Join NewsNow to get the latest updates
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="relative">
            <span
              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <User size={20} />
            </span>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-700 border-gray-600 focus:border-orange-500"
                  : "bg-orange-50 border-orange-200 focus:border-orange-400"
              } focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span
              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Mail size={20} />
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-700 border-gray-600 focus:border-orange-500"
                  : "bg-orange-50 border-orange-200 focus:border-orange-400"
              } focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span
              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Lock size={20} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-700 border-gray-600 focus:border-orange-500"
                  : "bg-orange-50 border-orange-200 focus:border-orange-400"
              } focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-orange-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <span
              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Lock size={20} />
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-700 border-gray-600 focus:border-orange-500"
                  : "bg-orange-50 border-orange-200 focus:border-orange-400"
              } focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-orange-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              darkMode
                ? "bg-orange-600 hover:bg-orange-700 active:scale-[0.98]"
                : "bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 active:scale-[0.98]"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Feedback */}
        {message && (
          <p
            className={`text-center mt-2 text-sm font-medium ${
              message.startsWith("✅") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center justify-center space-x-2">
          <span
            className={`h-px w-full ${
              darkMode ? "bg-gray-600" : "bg-gray-300"
            }`}
          ></span>
          <span
            className={`text-sm font-medium ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            OR
          </span>
          <span
            className={`h-px w-full ${
              darkMode ? "bg-gray-600" : "bg-gray-300"
            }`}
          ></span>
        </div>

        {/* Google Signup */}
        <button
          className={`w-full flex items-center justify-center space-x-3 py-3 rounded-lg border font-semibold transition-colors ${
            darkMode
              ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
              : "bg-white border-gray-300 hover:bg-orange-50"
          }`}
        >
          <GoogleIcon />
          <span>Sign up with Google</span>
        </button>

        {/* Links */}
        <div className="space-y-4 text-center text-sm">
          <p>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Are you a writer?{" "}
            </span>
            <a
              href="/writer-signup"
              className="font-semibold text-orange-500 hover:text-orange-400"
            >
              Click here
            </a>
          </p>
          <p>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Already have an account?{" "}
            </span>
            <a
              href="/login"
              className="font-semibold text-orange-500 hover:text-orange-400"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
