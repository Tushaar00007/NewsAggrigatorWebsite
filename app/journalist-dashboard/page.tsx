"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, DollarSign, Eye, MessageSquare, TrendingUp, TrendingDown, Edit, Sun, Moon, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Reusable Stat Card Component
const StatCard = ({ icon: Icon, title, value, change, changeType, themeClasses }) => (
  <div className={`${themeClasses.cardBg} p-6 rounded-xl border ${themeClasses.border} flex flex-col justify-between`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className={themeClasses.textMuted}>{title}</h3>
      <Icon className="text-slate-500" size={24} />
    </div>
    <div>
      <p className={`text-3xl font-bold ${themeClasses.text} mb-1`}>{value}</p>
      {change && (
        <div className={`flex items-center text-sm ${changeType === "increase" ? "text-green-500" : "text-red-500"}`}>
          {changeType === "increase" ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  </div>
);

// Main Dashboard Component
export default function JournalistDashboardPage() {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    monthlyEarnings: 0,
    engagementRate: 0
  });

  const API_BASE = "http://localhost:8000/api/articles";

  // Theme-based classes
  const themeClasses = {
    bg: theme === "dark" ? "bg-slate-900" : "bg-gray-100",
    text: theme === "dark" ? "text-white" : "text-slate-800",
    textMuted: theme === "dark" ? "text-slate-400" : "text-slate-600",
    headerBg: theme === "dark" ? "bg-slate-800/80" : "bg-white/80 shadow-sm",
    cardBg: theme === "dark" ? "bg-slate-800" : "bg-white",
    border: theme === "dark" ? "border-slate-700" : "border-gray-200",
  };

  // Step 1: Load user from localStorage (with fallback)
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingUser(true);
      setUserError(null);

      try {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName'); // Use stored name

        console.log('LocalStorage Data:', { userId, userEmail, userRole, userName });

        if (userId || userEmail) {
          setUser({
            id: userId,
            email: userEmail,
            role: userRole,
            username: userName || userEmail?.split('@')[0] || 'Journalist',
            profileUrl: `https://placehold.co/100x100/0891B2/FFFFFF?text=${(userName || userEmail)?.charAt(0).toUpperCase() || 'J'}`
          });
        } else {
          setUserError("User not found in localStorage");
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setUserError("Failed to load user profile");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Step 2: Fetch articles and calculate stats (only after user loads)
  useEffect(() => {
    if (!user) return;

    const fetchArticlesAndStats = async () => {
      setLoadingArticles(true);
      setArticlesError(null);

      try {
        console.log('Fetching articles from API...');
        const response = await fetch(`${API_BASE}/get/`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);

        if (data.success && Array.isArray(data.data?.articles)) {
          const userId = localStorage.getItem('userId');
          const userEmail = localStorage.getItem('userEmail');
          const userName = localStorage.getItem('userName');

          // Step 3: Filter articles by author (id, email, OR name)
          const userArticles = data.data.articles.filter(article => {
            const author = article.author;
            if (!author) {
              console.warn('Article missing author:', article);
              return false;
            }

            const matchesId = author.id && author.id === userId;
            const matchesEmail = author.email && author.email === userEmail;
            const matchesName = author.name && author.name === userName;

            console.log(`Article "${article.title}" → ID: ${matchesId}, Email: ${matchesEmail}, Name: ${matchesName}`);

            return matchesId || matchesEmail || matchesName;
          });

          console.log('Filtered Articles for User:', userArticles.length, userArticles);

          setArticles(userArticles);

          // Step 4: Calculate real stats
          const totalArticles = userArticles.length;
          const publishedArticles = userArticles.filter(a => a.published).length;
          const totalLikes = userArticles.reduce((sum, a) => sum + (a.likes_count || 0), 0);
          const totalComments = userArticles.reduce((sum, a) => sum + (a.comments_count || 0), 0);
          const engagementRate = totalArticles > 0
            ? Math.round((totalLikes + totalComments) / totalArticles)
            : 0;

          setStats({
            totalArticles,
            totalViews: totalLikes * 10, // Estimated views
            monthlyEarnings: publishedArticles * 45.50,
            engagementRate
          });

        } else {
          console.warn('No articles in response or invalid format');
          setArticles([]);
          setArticlesError("No articles found");
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setArticlesError(err.message || "Failed to load articles");
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchArticlesAndStats();
  }, [user]);

  // Step 5: Generate real monthly earnings data from articles
  const generateEarningsData = () => {
    const monthlyMap = {};

    articles.forEach(article => {
      if (article.published) {
        const date = new Date(article.created_at);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 45.50;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      name: month,
      earnings: Math.round(monthlyMap[month] || 0)
    }));
  };

  const earningsData = generateEarningsData();

  // Step 6: Prepare stats for display
  const displayStats = [
    { 
      title: "Total Articles", 
      value: stats.totalArticles.toString(), 
      change: "+2 this month", 
      icon: FileText, 
      changeType: "increase" 
    },
    { 
      title: "Total Views", 
      value: stats.totalViews.toLocaleString(), 
      change: "+12% this month", 
      icon: Eye, 
      changeType: "increase" 
    },
    { 
      title: "Monthly Earnings", 
      value: `$${stats.monthlyEarnings.toFixed(2)}`, 
      change: "-3.2% vs last month", 
      icon: DollarSign, 
      changeType: "decrease" 
    },
    { 
      title: "Engagement Rate", 
      value: `${stats.engagementRate}%`, 
      change: "+1.5%", 
      icon: MessageSquare, 
      changeType: "increase" 
    },
  ];

  // Helper: Status badge
  const getStatusBadge = (article) => {
    if (!article.published) {
      return { text: "Draft", class: "bg-yellow-500/20 text-yellow-400" };
    }
    return { text: "Published", class: "bg-green-500/20 text-green-400" };
  };

  // Helper: Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditArticle = (articleId) => {
    window.location.href = `/edit-article?id=${articleId}`;
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Display name & avatar
  const displayName = user?.username || user?.email || "Journalist";
  const avatarUrl = user?.profileUrl || "https://placehold.co/100x100/0891B2/FFFFFF?text=J";

  return (
    <div className={`min-h-screen font-sans transition-colors ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-10 ${themeClasses.headerBg} ${themeClasses.border}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <img src={avatarUrl} alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover" />
              <div>
                <h1 className={`text-xl font-bold ${themeClasses.text}`}>
                  {loadingUser ? "Welcome back!" : `Welcome back, ${displayName}!`}
                </h1>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  {loadingUser ? "Loading profile…" : userError ? userError : "Here's your performance snapshot."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-full transition-colors ${theme === "dark" ? "hover:bg-slate-700" : "hover:bg-gray-200"}`}
                aria-label="Refresh data"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`p-2 rounded-full transition-colors ${theme === "dark" ? "hover:bg-slate-700" : "hover:bg-gray-200"}`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-600" />}
              </button>
              <a 
                href="/new-article" 
                className="flex items-center gap-2 px-5 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Plus size={18} />
                <span>Write New Article</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayStats.map((stat, index) => (
            <StatCard key={index} {...stat} themeClasses={themeClasses} />
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Articles */}
          <div className={`lg:col-span-2 p-6 rounded-xl border ${themeClasses.cardBg} ${themeClasses.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Articles</h2>
              <span className={`text-sm ${themeClasses.textMuted}`}>
                {loadingArticles ? "Loading..." : `${articles.length} articles`}
              </span>
            </div>

            {articlesError && (
              <div className={`p-4 rounded-lg mb-4 ${theme === "dark" ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800"}`}>
                Error: {articlesError}
              </div>
            )}

            {loadingArticles ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="animate-spin mr-2" size={20} />
                <span>Loading articles...</span>
              </div>
            ) : articles.length === 0 ? (
              <div className={`text-center py-12 rounded-lg border-2 border-dashed ${themeClasses.border}`}>
                <FileText size={48} className={`mx-auto mb-4 ${themeClasses.textMuted}`} />
                <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                <p className={themeClasses.textMuted}>Create your first article to see it here</p>
                <a
                  href="/new-article"
                  className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 mt-4"
                >
                  <Plus size={18} />
                  <span>Create First Article</span>
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className={`grid grid-cols-12 gap-4 text-sm font-semibold p-4 border-b ${themeClasses.textMuted} ${themeClasses.border}`}>
                    <div className="col-span-5">Title</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Likes</div>
                    <div className="col-span-2 text-right">Date</div>
                    <div className="col-span-1 text-center"></div>
                  </div>
                  <div className="space-y-2 mt-2">
                    {articles.slice(0, 6).map(article => {
                      const status = getStatusBadge(article);
                      return (
                        <div key={article.id} className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg ${theme === "dark" ? "hover:bg-slate-700/50" : "hover:bg-gray-50"} transition-colors duration-200`}>
                          <div className="col-span-5 font-medium truncate" title={article.title}>
                            {article.title}
                          </div>
                          <div className="col-span-2 text-center">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.class}`}>
                              {status.text}
                            </span>
                          </div>
                          <div className={`col-span-2 text-right ${themeClasses.textMuted}`}>
                            {article.likes_count || 0}
                          </div>
                          <div className={`col-span-2 text-right text-sm ${themeClasses.textMuted}`}>
                            {formatDate(article.created_at)}
                          </div>
                          <div className="col-span-1 text-center">
                            <button 
                              onClick={() => handleEditArticle(article.id)}
                              className={`${themeClasses.textMuted} hover:text-orange-500`}
                              title="Edit article"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance Analytics */}
          <div className={`p-6 rounded-xl border ${themeClasses.cardBg} ${themeClasses.border}`}>
            <h2 className="text-xl font-bold mb-4">Performance Analytics</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", 
                      border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}` 
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: "14px" }} />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#f97316" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: "#f97316" }} 
                    activeDot={{ r: 8 }} 
                    name="Monthly Earnings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className={`text-center p-4 rounded-lg ${theme === "dark" ? "bg-slate-700" : "bg-gray-100"}`}>
                <div className="text-2xl font-bold text-orange-500">{stats.totalArticles}</div>
                <div className={`text-sm ${themeClasses.textMuted}`}>Articles</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${theme === "dark" ? "bg-slate-700" : "bg-gray-100"}`}>
                <div className="text-2xl font-bold text-green-500">{articles.filter(a => a.published).length}</div>
                <div className={`text-sm ${themeClasses.textMuted}`}>Published</div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Panel (Remove in production) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-900/30 rounded-lg text-xs font-mono">
            <p><strong>Debug Info:</strong></p>
            <p>User ID: {localStorage.getItem('userId') || '—'}</p>
            <p>Email: {localStorage.getItem('userEmail') || '—'}</p>
            <p>Name: {localStorage.getItem('userName') || '—'}</p>
            <p>Articles Loaded: {articles.length}</p>
            <button 
              onClick={() => console.log('Articles:', articles)} 
              className="underline text-orange-400"
            >
              Log Articles to Console
            </button>
          </div>
        )} */}
      </main>
    </div>
  );
}