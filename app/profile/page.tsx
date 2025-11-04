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
        
        const userId = localStorage.getItem("userId");
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
    if (userData) {
      fetchUserArticles(userData);
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

      // Fetch user's created articles
      console.log('Fetching user articles...');
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

      if (!articlesResponse.ok) {
        throw new Error(`Failed to fetch articles: ${articlesResponse.status} ${articlesResponse.statusText}`);
      }

      const articlesData = await articlesResponse.json();
      console.log('Articles data:', articlesData);
      
      if (articlesData.success) {
        setUserArticles(articlesData.data?.articles || []);
        console.log('User articles set:', articlesData.data?.articles?.length || 0);
      } else {
        throw new Error(articlesData.message || 'Failed to load articles');
      }

      // Fetch saved articles
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
      const allArticlesResponse = await fetch(
        'http://localhost:8000/api/articles/get/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!allArticlesResponse.ok) {
        console.log('Failed to fetch all articles, continuing without saved articles');
        return;
      }

      const allArticlesData = await allArticlesResponse.json();
      
      if (allArticlesData.success) {
        const articles = allArticlesData.data?.articles || [];
        console.log('Total articles available:', articles.length);
        
        // For each article, check if the current user has saved it
        const savedArticlesPromises = articles.map(async (article: Article) => {
          try {
            const interactionResponse = await fetch(
              `http://localhost:8000/api/articles/user-interaction/?article_id=${article.id}&user_id=${userData.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (interactionResponse.ok) {
              const interactionData = await interactionResponse.json();
              if (interactionData.success && interactionData.data.saved) {
                return {
                  article,
                  saved_at: article.created_at
                };
              }
            }
          } catch (err) {
            console.error('Error checking interaction for article:', article.id, err);
          }
          return null;
        });

        const savedArticlesResults = await Promise.all(savedArticlesPromises);
        const userSavedArticles = savedArticlesResults.filter(Boolean) as SavedArticle[];
        console.log('Saved articles found:', userSavedArticles.length);
        setSavedArticles(userSavedArticles);
      }
    } catch (err) {
      console.error('Error fetching saved articles:', err);
      // Don't set error here, as we can continue without saved articles
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans transition-all duration-500 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
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
        className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.a
              href="/journalist-dashboard"
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
                className="p-3 rounded-2xl bg-orange-100 text-orange-500 hover:bg-orange-200 transition-all duration-300 border border-orange-200 shadow-sm"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-300"
                aria-label="Logout"
              >
                <LogOut size={18} />
                <span>Logout</span>
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
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <strong>Debug Info:</strong> User ID: {userData?.id || 'Not found'}, 
          Email: {userData?.email || 'Not found'}, 
          Articles: {userArticles.length}, 
          Saved: {savedArticles.length}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-800 max-w-6xl mx-auto rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden"
        >
          {/* Profile header */}
          <div className="px-8 py-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-8">
                <div className="w-24 h-24 rounded-2xl bg-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {(userData?.username || "U").charAt(0).toUpperCase()}
                </div>

                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-bold mb-1">
                    @{userData?.username || "User"}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-slate-300 mb-2 font-medium">
                    {userData?.role || "Journalist"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center justify-center lg:justify-start space-x-1">
                    <Calendar size={14} />
                    <span>{formatDate(userData?.joinedAt)}</span>
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300"
              >
                <Pen size={18} />
                <span>Edit Profile</span>
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-8 pb-8 grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { icon: FileText, label: "Total Articles", value: stats.totalArticles },
              { icon: Eye, label: "Published", value: stats.published },
              { icon: Pen, label: "Drafts", value: stats.drafts },
              { icon: Bookmark, label: "Saved", value: stats.savedArticles },
              { icon: TrendingUp, label: "Total Views", value: formatNumber(stats.totalViews) },
              { icon: Users, label: "Followers", value: stats.followers },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-center hover:shadow-md"
              >
                <div className="text-2xl font-bold text-orange-500 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600 dark:text-slate-300 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200 dark:border-slate-700">
            <div className="px-8 flex space-x-8">
              {[
                { key: "articles", label: "My Articles" },
                { key: "saved", label: "Saved Articles" },
                { key: "drafts", label: "Drafts" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 font-medium relative ${
                    activeTab === tab.key
                      ? "text-gray-900 dark:text-slate-100 font-semibold"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    />
                  )}
                </button>
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
                    .map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-md cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div 
                            className="flex-1"
                            onClick={() => (window.location.href = `/article/${article.id}`)}
                          >
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-500 transition-colors">
                              {article.title}
                            </h3>
                            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-slate-400">
                              <span className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{formatDate(article.created_at)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{estimateReadTime(article.content)} min read</span>
                              </span>
                              {article.published && (
                                <span className="flex items-center space-x-1">
                                  <Eye size={14} />
                                  <span>{formatNumber(article.likes_count || 0)} likes</span>
                                </span>
                              )}
                              {article.category && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded-full text-xs">
                                  {article.category}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {article.published ? (
                              <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-medium border border-green-500/30">
                                Published
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-xs font-medium border border-yellow-500/30">
                                Draft
                              </span>
                            )}
                            
                            {activeTab === "saved" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnsaveArticle(article.id);
                                }}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Unsave article"
                              >
                                <Bookmark size={16} className="fill-current" />
                              </button>
                            )}
                            
                            {activeTab === "articles" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/Edit-Articles/${article.id}`;
                                }}
                                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit article"
                              >
                                <Pen size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {(activeTab === "articles" ? userArticles.length === 0 :
               activeTab === "saved" ? savedArticles.length === 0 :
               userArticles.filter(a => !a.published).length === 0) && (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                  <p className="text-lg text-gray-500 dark:text-slate-400">
                    No {activeTab === "saved" ? "saved" : activeTab} articles found.
                  </p>
                  {activeTab === "articles" && (
                    <a
                      href="/new-article"
                      className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Create Your First Article
                    </a>
                  )}
                </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>

              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 mb-4"
                placeholder="Enter your display name"
              />

              <label className="block text-sm font-medium mb-1">Bio (optional)</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 mb-4"
                placeholder="Tell us about yourself..."
                rows={3}
              />

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveProfile} 
                  className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}