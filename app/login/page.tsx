// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

/* Minimal Google icon */
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.122C34.556 5.166 29.658 3 24 3C12.955 3 4 11.955 4 23s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691c-1.211 2.22-1.854 4.793-1.854 7.309c0 2.516.643 5.089 1.854 7.309l-5.495 4.28C.613 30.096 0 26.68 0 23s.613-7.096 1.811-10.601l5.495 4.292z"></path>
    <path fill="#4CAF50" d="M24 48c5.645 0 10.551-2.165 14.1-5.711l-5.495-4.282c-1.839 1.223-4.145 1.993-6.605 1.993c-4.903 0-9.081-3.111-10.612-7.375l-5.495 4.28C9.502 43.464 16.223 48 24 48z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.082 5.571l5.495 4.282c3.319-3.064 5.37-7.472 5.37-12.853c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

export default function LoginPage(): JSX.Element {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleDarkMode = () => setDarkMode((s) => !s);

  /**
   * This login expects the backend response shape:
   * {
   *   success: true,
   *   message: "Login successful",
   *   data: {
   *     user: { id, username, email, role, ... },
   *     token: "..."
   *   }
   * }
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const raw = await res.text();
      console.log("[login] status:", res.status, "raw response:", raw);

      let json: any = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch (err) {
        console.warn("[login] response is not JSON:", err);
        setErrorMsg("Server returned invalid response.");
        setLoading(false);
        return;
      }

      // If backend indicates failure via success:false
      if (json?.success === false) {
        const message = json?.message || json?.detail || `Login failed (status ${res.status})`;
        setErrorMsg(message);
        setLoading(false);
        return;
      }

      // Successful login should include data.token and data.user.role
      const token = json?.data?.token ?? null;
      const userObj = json?.data?.user ?? null;
      const role = userObj?.role ?? null;
      const emailReturned = userObj?.email ?? null;

      if (!token || !role) {
        // give clear debug message
        setErrorMsg("Invalid server response. Role or token missing in response.data.");
        setLoading(false);
        return;
      }

      // Save values for client-side checks (for demo; in production consider httpOnly cookies)
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);

      localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userid", userObj?.id ?? "");
    localStorage.setItem("userName", userObj?.username ?? "User");
    localStorage.setItem("savedarticles", JSON.stringify(userObj?.saved_articles ?? []));
      if (emailReturned) localStorage.setItem("userEmail", emailReturned);

      // Redirect by role
      if (role === "reader") router.push("/"); // or "/page" if your reader home sits there
      else if (role === "journalist") router.push("/journalist-homepage");
      else if (role === "admin") router.push("/admin");
      else router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-orange-50 text-gray-800"}`}>
      <a
        href="/"
        className={`absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-orange-100 text-orange-600"}`}
      >
        <ArrowLeft size={20} />
        <span>Home</span>
      </a>

      <button
        onClick={toggleDarkMode}
        className={`absolute top-6 right-6 px-4 py-2 rounded-lg font-semibold transition ${darkMode ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-white text-orange-600 hover:bg-orange-100"}`}
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <div className={`w-full max-w-md p-8 space-y-8 rounded-2xl shadow-lg transition-colors ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Sign in to continue to NewsNow</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

          <div className="relative">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <Mail size={20} />
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${darkMode ? "bg-gray-700 border-gray-600 focus:border-orange-500" : "bg-orange-50 border-orange-200 focus:border-orange-400"} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
              required
            />
          </div>

          <div className="relative">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <Lock size={20} />
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${darkMode ? "bg-gray-700 border-gray-600 focus:border-orange-500" : "bg-orange-50 border-orange-200 focus:border-orange-400"} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
              required
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-orange-500">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500/50" />
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Remember me</span>
            </label>
            <a href="#" className="font-semibold text-orange-500 hover:text-orange-400">Forgot password?</a>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${darkMode ? "bg-orange-600 hover:bg-orange-700" : "bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500"}`}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center justify-center space-x-2">
          <span className={`h-px w-full ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></span>
          <span className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>OR</span>
          <span className={`h-px w-full ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></span>
        </div>

        <div className="space-y-4">
          <button className={`w-full flex items-center justify-center space-x-3 py-3 rounded-lg border font-semibold transition-colors ${darkMode ? "bg-gray-700 border-gray-600 hover:bg-gray-600" : "bg-white border-gray-300 hover:bg-orange-50"}`}>
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>

          <a href="/journalist-homepage" className={`w-full flex items-center justify-center space-x-3 py-3 rounded-lg border font-semibold transition-colors ${darkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-cyan-400" : "bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-600"}`}>
            <UserCheck size={20} />
            <span>Login as Journalist</span>
          </a>
        </div>

        <p className="text-center text-sm">
          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Don't have an account? </span>
          <a href="/signup" className="font-semibold text-orange-500 hover:text-orange-400">Sign up</a>
        </p>
      </div>
    </div>
  );
}
