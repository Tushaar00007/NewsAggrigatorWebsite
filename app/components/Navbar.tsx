"use client";

import { Menu, Sun, Moon, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
}

export default function Navbar({ darkMode, toggleDarkMode, toggleSidebar }: NavbarProps) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // ✅ Fetch user info from localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userName = localStorage.getItem("userName") || "User"; // store name separately or extract from API
    if (isLoggedIn && userEmail) {
      setUser({ name: userName, email: userEmail });
    }
  }, []);

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userid");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    window.location.href = "/login"; // redirect to login page
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b ${
        darkMode
          ? "bg-gray-900 border-gray-800 text-white"
          : "bg-white border-orange-200 text-gray-900"
      } transition-colors duration-300 shadow-md`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo & Menu */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-800 text-orange-400"
                : "hover:bg-orange-100 text-orange-600"
            }`}
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full ${
                darkMode ? "bg-orange-500" : "bg-orange-600"
              }`}
            />
            <span className="text-xl font-bold">
              News<span className="text-orange-600">Now</span>
            </span>
          </Link>
        </div>

        {/* Center: Search bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4">
          <div
            className={`relative w-full rounded-full overflow-hidden ${
              darkMode ? "bg-gray-800" : "bg-orange-50"
            }`}
          >
            <input
              type="text"
              placeholder="Search news..."
              className={`w-full py-2 pl-10 pr-4 focus:outline-none ${
                darkMode
                  ? "bg-gray-800 text-white placeholder-gray-400"
                  : "bg-orange-50 text-gray-900 placeholder-orange-400"
              }`}
            />
            <Search
              size={20}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-orange-500"
              }`}
            />
          </div>
        </div>

        {/* Right: User Section */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-800 text-orange-400"
                : "hover:bg-orange-100 text-orange-600"
            }`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            // ✅ Logged-in user view
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold cursor-pointer transition-colors hover:opacity-80 ${
                  darkMode
                    ? "bg-gray-800 border-orange-500 text-orange-400"
                    : "bg-orange-100 border-orange-600 text-orange-700"
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">
                {user.name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className={`px-4 py-1.5 rounded-full border transition-all font-medium ${
                  darkMode
                    ? "border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                    : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                }`}
              >
                Logout
              </button>
            </div>
          ) : (
            // ❌ Not logged in — show Login/Register
            <>
              <Link href="/login">
                <button
                  className={`px-4 py-1.5 rounded-full border transition-all font-medium ${
                    darkMode
                      ? "border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                      : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                  }`}
                >
                  Login
                </button>
              </Link>

              <Link href="/signup">
                <button
                  className={`px-4 py-1.5 rounded-full transition-all font-medium ${
                    darkMode
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
