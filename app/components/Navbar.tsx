"use client";

import { Menu, Sun, Moon, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
}

export default function Navbar({ darkMode, toggleDarkMode, toggleSidebar }: NavbarProps) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user info from localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userName = localStorage.getItem("userName") || "User";
    if (isLoggedIn && userEmail) {
      setUser({ name: userName, email: userEmail });
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userid");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  // Toggle mobile search
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b ${
        darkMode
          ? "bg-gray-900 border-gray-800 text-white"
          : "bg-white border-orange-200 text-gray-900"
      } transition-colors duration-300 shadow-lg`}
    >
      <style jsx>{`
        :root {
          --primary-orange: #f97316;
          --dark-orange: #ea580c;
          --light-orange: #fed7aa;
          --dark-bg: #1f2937;
          --light-bg: #ffffff;
        }
        .tooltip {
          position: absolute;
          background: var(--primary-orange);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          top: 100%;
          margin-top: 8px;
          z-index: 100;
          white-space: nowrap;
        }
      `}</style>

      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left: Logo & Menu */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors relative group ${
              darkMode
                ? "hover:bg-gray-800 text-orange-400"
                : "hover:bg-orange-100 text-orange-600"
            }`}
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
            <span className="tooltip hidden group-hover:block">Menu</span>
          </motion.button>

          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                darkMode ? "from-orange-500 to-orange-700" : "from-orange-600 to-orange-800"
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
            className={`relative w-full rounded-full overflow-hidden shadow-md ${
              darkMode ? "bg-gray-800" : "bg-orange-50"
            }`}
          >
            <input
              type="text"
              placeholder="Search news..."
              className={`w-full py-2 pl-10 pr-10 focus:outline-none transition-colors ${
                darkMode
                  ? "bg-gray-800 text-white placeholder-gray-400"
                  : "bg-orange-50 text-gray-900 placeholder-orange-400"
              }`}
              aria-label="Search news"
            />
            <Search
              size={20}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-orange-500"
              }`}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMobileSearch}
          className={`md:hidden p-2 rounded-lg transition-colors relative group ${
            darkMode
              ? "hover:bg-gray-800 text-orange-400"
              : "hover:bg-orange-100 text-orange-600"
          }`}
          aria-label="Toggle search"
        >
          <Search size={24} />
          <span className="tooltip hidden group-hover:block">Search</span>
        </motion.button>

        {/* Right: User Section */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors relative group ${
              darkMode
                ? "hover:bg-gray-800 text-orange-400"
                : "hover:bg-orange-100 text-orange-600"
            }`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="tooltip hidden group-hover:block">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </motion.button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold cursor-pointer transition-colors ${
                  darkMode
                    ? "bg-gradient-to-r from-orange-500 to-orange-700 border-orange-500 text-white"
                    : "bg-gradient-to-r from-orange-600 to-orange-800 border-orange-600 text-white"
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </motion.div>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 ${
                      darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                    }`}
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-orange-100 hover:text-orange-600"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 hover:bg-orange-100 hover:text-orange-600"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-orange-100 hover:text-orange-600"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-1.5 rounded-full border transition-all font-medium ${
                    darkMode
                      ? "border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                      : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                  }`}
                >
                  Login
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-1.5 rounded-full transition-all font-medium ${
                    darkMode
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  Register
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden px-4 pb-3"
          >
            <div
              className={`relative w-full rounded-full overflow-hidden shadow-md ${
                darkMode ? "bg-gray-800" : "bg-orange-50"
              }`}
            >
              <input
                type="text"
                placeholder="Search news..."
                className={`w-full py-2 pl-10 pr-10 focus:outline-none transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-white placeholder-gray-400"
                    : "bg-orange-50 text-gray-900 placeholder-orange-400"
                }`}
                aria-label="Search news"
              />
              <Search
                size={20}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-400" : "text-orange-500"
                }`}
              />
              <button
                onClick={toggleMobileSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}