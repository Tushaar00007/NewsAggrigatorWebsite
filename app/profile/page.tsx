"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  LogOut,
  Sun,
  Moon,
  Pen,
  Eye,
  Clock,
  Calendar,
  TrendingUp,
  FileText,
  Users,
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  Settings,
  User,
  Mail,
  Award,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Article = {
  id: string;
  title: string;
  content: any[];
  author: {
    id: string;
    username: string;
    email: string;
  };
  media: string[];
  category: string;
  published: boolean;
  status: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
};

type SavedArticle = {
  article: Article;
  saved_at: string;
};

export default function Profile() {
  const [userData, setUserData] = useState<{
    id?: string | null;
    email?: string | null;
    role?: string | null;
    username?: string | null;
    joinedAt?: string | null;
  } | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"articles" | "saved" | "drafts">("articles");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get token from localStorage
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    
    const possibleKeys = ['token', 'authToken', 'accessToken', 'jwtToken', 'userToken'];
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`Found token in key: ${key}`);
        return token;
      }
    }
    
    // Also check if token is stored in user object
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          console.log('Found token in user object');
          return user.token;
        }
      } catch (e) {
        console.log('Could not parse user data');
      }
    }
    
    console.log('No token found in localStorage. Available keys:', Object.keys(localStorage));
    return null;
  };

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        console.log('Loading user data from localStorage...');
        
        // Check both 'userid' (lowercase - used by login) and 'userId' (camelCase - fallback)
        const userId = localStorage.getItem("userid") || localStorage.getItem("userId");
        const userEmail = localStorage.getItem("userEmail");
        const userRole = localStorage.getItem("userRole");
        const userName = localStorage.getItem("userName");
        const joinedAt = localStorage.getItem("userJoinedAt") || new Date().toISOString();

        console.log('User data from localStorage:', { userId, userEmail, userRole, userName });

        if (userId || userEmail) {
          const userData = {
            id: userId,
            email: userEmail,
            role: userRole || "journalist",
            username: userName || userEmail?.split('@')[0] || 'User',
            joinedAt: joinedAt,
          };
          
          console.log('Setting user data:', userData);
          setUserData(userData);
          return userData;
        } else {
          console.log('No user data found in localStorage');
          setError("User not found. Please log in again.");
          setLoading(false);
          return null;
        }
      } catch (err) {
        console.error("Error reading localStorage:", err);
        setError("Failed to load user data");
        setLoading(false);
        return null;
      }
    };

    const userData = loadUserData();
    
    // If we have user data, fetch articles
    if (userData && userData.id) {
      fetchUserArticles(userData);
    } else {
      setLoading(false);
    }
  }, []);

  // Apply dark mode before paint to avoid FOUC
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      const initialTheme: "dark" | "light" = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";

      const root = window.document.documentElement;
      root.classList.toggle("dark", initialTheme === "dark");
      setTheme(initialTheme);
    } catch (err) {
      console.error("Error setting theme:", err);
    }
  }, []);

  // Fetch user's articles
  const fetchUserArticles = async (userData: any) => {
    try {
      const token = getAuthToken();
      console.log('Fetching articles with token:', token ? 'Token found' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      if (!userData?.id) {
        console.warn('User ID not found in userData:', userData);
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch user's created articles (only if user is journalist)
      if (userData.role === 'journalist') {
        console.log('Fetching user articles...');
        try {
          const articlesResponse = await fetch(
            `http://localhost:8000/api/articles/get-by-author/?author=${userData.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('Articles response status:', articlesResponse.status);

          if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            console.log('Articles data:', articlesData);
            
            if (articlesData.success) {
              setUserArticles(articlesData.data?.articles || []);
              console.log('User articles set:', articlesData.data?.articles?.length || 0);
            }
          } else {
            const errorText = await articlesResponse.text();
            console.warn('Failed to fetch user articles:', articlesResponse.status, errorText);
            // Don't throw error, just set empty array
            setUserArticles([]);
          }
        } catch (err: any) {
          console.warn('Error fetching user articles:', err);
          setUserArticles([]);
        }
      } else {
        // For readers, set empty array
        setUserArticles([]);
      }

      // Fetch saved articles for all users
      console.log('Fetching saved articles...');
      await fetchSavedArticles(userData, token);

    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
      console.log('Loading complete');
    }
  };

  // Fetch saved articles
  const fetchSavedArticles = async (userData: any, token: string) => {
    try {
      if (!userData?.id) {
        console.log('No user ID, skipping saved articles fetch');
        return;
      }

      console.log('Fetching saved articles for user:', userData.id);
      const response = await fetch(
        `http://localhost:8000/api/articles/get-saved-articles/?user_id=${userData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Failed to fetch saved articles:', response.status, errorText);
        setSavedArticles([]);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.data?.saved_articles) {
        const savedArticlesList = data.data.saved_articles.map((item: any) => ({
          article: item.article,
          saved_at: item.saved_at || item.article?.created_at
        }));
        console.log('Saved articles found:', savedArticlesList.length);
        setSavedArticles(savedArticlesList);
      } else {
        console.log('No saved articles found');
        setSavedArticles([]);
      }
    } catch (err) {
      console.error('Error fetching saved articles:', err);
      // Don't set error here, as we can continue without saved articles
      setSavedArticles([]);
    }
  };

  // Toggle theme and persist choice
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        const root = window.document.documentElement;
        root.classList.toggle("dark", next === "dark");
        localStorage.setItem("theme", next);
      } catch (err) {
        console.error("Error saving theme:", err);
      }
      return next;
    });
  }, []);

  const handleLogout = useCallback(() => {
    const keysToRemove = [
      "authToken", "userId", "userEmail", "userRole", 
      "isLoggedIn", "userName", "token", "userToken"
    ];
    
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    window.location.href = "/login";
  }, []);

  // Calculate stats from real data
  const stats = useMemo(
    () => ({
      totalArticles: userArticles.length,
      published: userArticles.filter(article => article.published).length,
      drafts: userArticles.filter(article => !article.published).length,
      totalViews: userArticles.reduce((sum, article) => sum + (article.likes_count || 0) * 10, 0),
      savedArticles: savedArticles.length,
      followers: Math.floor(userArticles.length * 19.5), // Mock followers based on articles
    }),
    [userArticles, savedArticles]
  );

  const estimateReadTime = useCallback(
    (content: any[]) => {
      if (!content || !Array.isArray(content)) return 1;
      
      const totalWords = content.reduce((count, block) => {
        if (block && block.type === 'paragraph' && block.value) {
          return count + block.value.split(/\s+/).length;
        }
        return count;
      }, 0);
      return Math.max(1, Math.ceil(totalWords / 200));
    },
    []
  );

  const formatNumber = useCallback((num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  }, []);

  const formatDate = useCallback((iso?: string) => {
    if (!iso) return "Joined Recently";
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Joined Recently";
    }
  }, []);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (userData?.username) {
      setEditName(userData.username);
    }
  }, [userData]);

  const saveProfile = useCallback(() => {
    try {
      if (editName) {
        localStorage.setItem("userName", editName);
        setUserData((prev) => prev ? { ...prev, username: editName } : prev);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save profile");
    }
  }, [editName]);

  // Function to handle unsaving an article
  const handleUnsaveArticle = async (articleId: string) => {
    try {
      const token = getAuthToken();
      if (!token || !userData?.id) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        'http://localhost:8000/api/articles/toggle-save-article/',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            article_id: articleId,
            user_id: userData.id
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove from saved articles
          setSavedArticles(prev => prev.filter(item => item.article.id !== articleId));
        }
      }
    } catch (err) {
      console.error('Error unsaving article:', err);
      setError('Failed to unsave article');
    }
  };

  // Debug: Check what's in localStorage
  useEffect(() => {
    console.log('Current localStorage:', {
      userId: localStorage.getItem('userId'),
      userEmail: localStorage.getItem('userEmail'),
      userRole: localStorage.getItem('userRole'),
      userName: localStorage.getItem('userName'),
      hasToken: !!getAuthToken()
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-medium text-gray-600 dark:text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans transition-all duration-500 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-slate-100">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap");
        body {
          font-family: "Poppins", sans-serif;
        }
      `}</style>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.a
              href={userData?.role === 'admin' ? '/admin' : userData?.role === 'journalist' ? '/journalist-dashboard' : '/'}
              className="text-2xl font-bold flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-gray-900 dark:text-slate-100">NewsNow</span>
              <span className="text-orange-500 font-semibold">| Profile</span>
            </motion.a>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-slate-700 dark:to-slate-600 text-orange-500 dark:text-orange-400 hover:from-orange-200 hover:to-orange-100 transition-all duration-300 border border-orange-200/50 dark:border-slate-600 shadow-sm"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-300"
                aria-label="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
            <div className="mt-2 text-sm">
              <button 
                onClick={() => window.location.reload()} 
                className="underline text-blue-600 mr-4"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/login'} 
                className="underline text-blue-600"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}

        {/* Debug Info */}
       

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-800 max-w-6xl mx-auto rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden"
        >
          {/* Profile header with gradient background */}
          <div className="relative px-8 py-12 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative flex flex-col lg:flex-row items-center lg:items-start justify-between space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-white/30">
                    {(userData?.username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 shadow-lg"></div>
                </motion.div>

                <div className="text-center lg:text-left">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold mb-2 text-white"
                  >
                    {userData?.username || "User"}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center lg:justify-start space-x-3 mb-3"
                  >
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
                      {userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Journalist"}
                    </span>
                    {userData?.email && (
                      <span className="text-white/80 text-sm flex items-center space-x-1">
                        <Mail size={14} />
                        <span>{userData.email}</span>
                      </span>
                    )}
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-white/80 flex items-center justify-center lg:justify-start space-x-1"
                  >
                    <Calendar size={14} />
                    <span>Joined {formatDate(userData?.joinedAt || undefined)}</span>
                  </motion.p>
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-orange-600 dark:text-orange-500 px-6 py-3 rounded-xl font-medium shadow-xl transition-all duration-300 border border-white/20"
              >
                <Settings size={18} />
                <span>Edit Profile</span>
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-8 pb-8 -mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: FileText, label: "Total Articles", value: stats.totalArticles, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
                { icon: Eye, label: "Published", value: stats.published, color: "from-green-500 to-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" },
                { icon: Pen, label: "Drafts", value: stats.drafts, color: "from-yellow-500 to-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
                { icon: Bookmark, label: "Saved", value: stats.savedArticles, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
                { icon: TrendingUp, label: "Views", value: formatNumber(stats.totalViews), color: "from-pink-500 to-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
                { icon: Users, label: "Followers", value: formatNumber(stats.followers), color: "from-indigo-500 to-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, type: "spring" }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`${stat.bgColor} p-5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} className="text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
            <div className="px-8 flex space-x-1 overflow-x-auto">
              {[
                { key: "articles", label: "My Articles", icon: FileText, count: userArticles.length },
                { key: "saved", label: "Saved", icon: Bookmark, count: savedArticles.length },
                { key: "drafts", label: "Drafts", icon: Pen, count: userArticles.filter(a => !a.published).length }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative py-4 px-6 font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? "text-orange-600 dark:text-orange-400 font-semibold"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.key
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Articles List */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="px-8 pb-8"
            >
              <h2 className="text-2xl font-bold mb-6">
                {activeTab === "articles" && "My Articles"}
                {activeTab === "saved" && "Saved Articles"}
                {activeTab === "drafts" && "My Drafts"}
              </h2>

              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {(activeTab === "articles" ? userArticles : 
                    activeTab === "saved" ? savedArticles.map(sa => sa.article) : 
                    userArticles.filter(a => !a.published))
                    .map((article, index) => {
                      const articleImage = article.media && article.media.length > 0 ? article.media[0] : null;
                      return (
                        <motion.div
                          key={article.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ y: -4, scale: 1.01 }}
                          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 hover:shadow-xl cursor-pointer group overflow-hidden transition-all duration-300"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Article Image */}
                            {articleImage ? (
                              <div 
                                className="md:w-64 h-48 md:h-auto bg-gray-200 dark:bg-slate-700 relative overflow-hidden"
                                onClick={() => (window.location.href = `/article/${article.id}`)}
                              >
                                <img 
                                  src={articleImage} 
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                              </div>
                            ) : (
                              <div 
                                className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-orange-100 to-orange-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center"
                                onClick={() => (window.location.href = `/article/${article.id}`)}
                              >
                                <ImageIcon size={48} className="text-orange-400 dark:text-slate-400" />
                              </div>
                            )}
                            
                            {/* Article Content */}
                            <div 
                              className="flex-1 p-6"
                              onClick={() => (window.location.href = `/article/${article.id}`)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                                    {article.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-slate-400 mb-3">
                                    <span className="flex items-center space-x-1">
                                      <Calendar size={14} />
                                      <span>{formatDate(article.created_at)}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Clock size={14} />
                                      <span>{estimateReadTime(article.content)} min read</span>
                                    </span>
                                    {article.published && (
                                      <>
                                        <span className="flex items-center space-x-1">
                                          <Heart size={14} className="text-red-500" />
                                          <span>{formatNumber(article.likes_count || 0)}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                          <MessageCircle size={14} className="text-blue-500" />
                                          <span>{formatNumber(article.comments_count || 0)}</span>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {article.category && (
                                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-semibold mb-3 shadow-sm">
                                      {article.category}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex flex-col items-end space-y-2 ml-4">
                                  {article.published ? (
                                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-xs font-semibold border border-green-400/30 shadow-sm">
                                      Published
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full text-xs font-semibold border border-yellow-400/30 shadow-sm">
                                      Draft
                                    </span>
                                  )}
                                  
                                  {activeTab === "saved" && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnsaveArticle(article.id);
                                      }}
                                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                      title="Unsave article"
                                    >
                                      <Bookmark size={18} className="fill-current" />
                                    </motion.button>
                                  )}
                                  
                                  {activeTab === "articles" && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/Edit-Articles/${article.id}`;
                                      }}
                                      className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Edit article"
                                    >
                                      <Pen size={18} />
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Article Preview */}
                              {article.content && Array.isArray(article.content) && article.content.length > 0 && (
                                <p className="text-gray-600 dark:text-slate-300 text-sm line-clamp-2">
                                  {article.content.find((block: any) => block.type === 'paragraph')?.value || 'No preview available'}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              </div>

              {(activeTab === "articles" ? userArticles.length === 0 :
               activeTab === "saved" ? savedArticles.length === 0 :
               userArticles.filter(a => !a.published).length === 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 mb-6">
                    {activeTab === "saved" ? (
                      <Bookmark size={48} className="text-gray-400 dark:text-slate-400" />
                    ) : activeTab === "drafts" ? (
                      <Pen size={48} className="text-gray-400 dark:text-slate-400" />
                    ) : (
                      <FileText size={48} className="text-gray-400 dark:text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No {activeTab === "saved" ? "Saved" : activeTab === "drafts" ? "Draft" : ""} Articles Yet
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    {activeTab === "saved" 
                      ? "Start saving articles you love to read them later!" 
                      : activeTab === "drafts"
                      ? "Your draft articles will appear here once you create them."
                      : "Start creating amazing content to share with the world!"}
                  </p>
                  {activeTab === "articles" && (
                    <motion.a
                      href="/new-article"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300"
                    >
                      <Pen size={18} />
                      <span>Create Your First Article</span>
                    </motion.a>
                  )}
                  {activeTab === "saved" && (
                    <motion.a
                      href="/"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300"
                    >
                      <Eye size={18} />
                      <span>Browse Articles</span>
                    </motion.a>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, type: "spring" }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Settings size={24} />
                  <span>Edit Profile</span>
                </h3>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-slate-300">
                    Display Name
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    value={userData?.email || ""}
                    disabled
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-slate-300">
                    Bio (optional)
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveProfile}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg transition-all"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}