"use client";

import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, PlusCircle, BarChart3, User, LogOut, Sun, Moon, Menu, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JournalistNavLink = ({ href, icon: Icon, children, theme }) => (
  <a
    href={href}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 group relative ${
      theme === 'dark'
        ? 'text-slate-300 hover:text-orange-300 hover:bg-slate-700'
        : 'text-slate-600 hover:text-orange-500 hover:bg-gray-200'
    }`}
    aria-label={children}
  >
    <Icon size={20} />
    <span>{children}</span>
    <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs rounded px-2 py-1">
      {children}
    </span>
  </a>
);

export default function JournalistHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const API_BASE = "http://localhost:8000/api/articles";

  // Load user from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');

        if (userId || userEmail) {
          setUserData({
            id: userId,
            email: userEmail,
            role: userRole,
            username: userName || userEmail?.split('@')[0] || 'Journalist',
          });
        }
      } catch (err) {
        console.error('Error reading localStorage:', err);
      }
    };

    getUserData();
  }, []);

  // Fetch all articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/get/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.success && Array.isArray(data.data?.articles)) {
          setArticles(data.data.articles);
        } else {
          setArticles([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    ['authToken', 'userId', 'userEmail', 'userRole', 'isLoggedIn', 'userName'].forEach(key =>
      localStorage.removeItem(key)
    );
    window.location.href = '/login';
  };

  const handleViewArticle = (articleId) => {
    window.location.href = `/article/${articleId}`;
  };

  // Theme classes
  const themeClasses = {
    bg: theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100',
    text: theme === 'dark' ? 'text-white' : 'text-slate-800',
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    headerBg: theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90 shadow-md',
    cardBg: theme === 'dark' ? 'bg-slate-800' : 'bg-white',
    border: theme === 'dark' ? 'border-slate-700' : 'border-gray-200',
  };

  // Featured article
  const featuredArticle = articles.find(a => a.published) || articles[0];

  // Content preview
  const renderContentPreview = (content) => {
    if (!content) return 'No content available';
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      if (Array.isArray(parsed)) {
        const p = parsed.find(b => b.type === 'paragraph');
        return p?.value ? p.value.substring(0, 100) + '...' : 'No content available';
      }
      return String(content).substring(0, 100) + '...';
    } catch {
      return String(content).substring(0, 100) + '...';
    }
  };

  // Article image
  const getArticleImage = (article) => {
    if (article.media?.[0]) return article.media[0];
    const cat = (article.category || 'general').toLowerCase();
    const colors = {
      politics: '0369A1', entertainment: 'EA580C', sports: '16A34A',
      technology: '7C3AED', health: 'DC2626', business: 'CA8A04', default: '475569'
    };
    const color = colors[cat] || colors.default;
    return `https://placehold.co/600x400/${color}/FFFFFF?text=${encodeURIComponent(article.category || 'Article')}`;
  };

  // Estimate read time
  const estimateReadTime = (content) => {
    const words = content ? String(content).split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200); // Average reading speed: 200 WPM
    return minutes > 0 ? `${minutes} min read` : '1 min read';
  };

  // Count user's articles
  const userArticleCount = articles.filter(article => {
    const author = article.author;
    if (!author || !userData) return false;
    return (
      (author.id != null && String(author.id) === String(userData.id)) ||
      (author.email && author.email === userData.email) ||
      (author.username && author.username === userData.username)
    );
  }).length;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-t-2 border-orange-500"
        ></motion.div>
        <p className={`mt-4 ${themeClasses.text} font-medium`}>Loading articles...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors ${themeClasses.bg} ${themeClasses.text}`}>
      <style jsx global>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`backdrop-blur-md border-b sticky top-0 z-50 ${themeClasses.headerBg} ${themeClasses.border}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="text-2xl font-bold tracking-tight">
              NewsNow <span className="text-orange-500 font-light">| Journalist</span>
            </a>

            <nav className="hidden md:flex items-center space-x-3">
              <JournalistNavLink href="/journalist-dashboard" icon={LayoutDashboard} theme={theme}>Dashboard</JournalistNavLink>
              <JournalistNavLink href="/new-article" icon={PlusCircle} theme={theme}>New Article</JournalistNavLink>
              <JournalistNavLink href="#" icon={BarChart3} theme={theme}>Analytics</JournalistNavLink>
              <JournalistNavLink href="#" icon={User} theme={theme}>Profile</JournalistNavLink>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-full transition-colors relative group ${
                  theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'
                }`}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-slate-600" size={20} />}
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs rounded px-2 py-1">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </motion.button>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">{userData?.username || 'Journalist'}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </motion.button>
              </div>
            </nav>

            <div className="md:hidden flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-full transition-colors relative group ${
                  theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'
                }`}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="text-yellow-400" size={24} /> : <Moon className="text-slate-600" size={24} />}
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs rounded px-2 py-1">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full transition-colors"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden border-t ${themeClasses.border} ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
              ref={menuRef}
            >
              <nav className="container mx-auto px-4 pt-4 pb-6 flex flex-col space-y-4">
                <JournalistNavLink href="/journalist-dashboard" icon={LayoutDashboard} theme={theme}>Dashboard</JournalistNavLink>
                <JournalistNavLink href="/new-article" icon={PlusCircle} theme={theme}>New Article</JournalistNavLink>
                <JournalistNavLink href="#" icon={BarChart3} theme={theme}>Analytics</JournalistNavLink>
                <JournalistNavLink href="#" icon={User} theme={theme}>Profile</JournalistNavLink>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">{userData?.username || 'Journalist'}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all w-full justify-center"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { title: 'Total Articles', value: articles.length, color: 'text-orange-500' },
            { title: 'Published', value: articles.filter(a => a.published).length, color: 'text-green-500' },
            { title: 'Drafts', value: articles.filter(a => !a.published).length, color: 'text-yellow-500' },
            { title: 'Your Articles', value: userArticleCount, color: 'text-blue-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${themeClasses.cardBg} p-6 rounded-2xl shadow-lg border ${themeClasses.border} hover:shadow-xl transition-shadow`}
            >
              <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured */}
        {featuredArticle && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div
              className={`${themeClasses.cardBg} rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-0 relative`}
              style={{ background: 'linear-gradient(90deg, #f97316, #dc2626)' }}
            >
              <div className="p-8 md:p-12 flex flex-col justify-center text-white">
                <span className="text-sm font-semibold uppercase tracking-wider">{featuredArticle.category || 'Uncategorized'}</span>
                <h1 className="text-3xl md:text-4xl font-extrabold my-3 leading-tight line-clamp-2">{featuredArticle.title}</h1>
                <div className="flex items-center space-x-4 text-sm mb-4">
                  <span>By {featuredArticle.author?.username || 'Unknown'}</span>
                  <span>•</span>
                  <span>{new Date(featuredArticle.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{estimateReadTime(featuredArticle.content)}</span>
                </div>
                <p className="leading-relaxed mb-6 text-sm">{renderContentPreview(featuredArticle.content)}</p>
                <div className="flex items-center gap-2 mb-4">
                  {!featuredArticle.published && (
                    <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-xs font-medium">DRAFT</span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewArticle(featuredArticle.id)}
                  className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-3 px-6 rounded-lg transition-all self-start"
                >
                  Read Full Story
                </motion.button>
              </div>
              <div className="relative">
                <img src={getArticleImage(featuredArticle)} alt={featuredArticle.title} className="w-full h-64 lg:h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Articles Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold border-l-4 border-orange-500 pl-4">
              All Articles ({articles.length})
            </h2>
            <a
              href="/new-article"
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              <PlusCircle size={20} />
              <span>New Article</span>
            </a>
          </div>

          {error && (
            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'}`}>
              Error: {error}
            </div>
          )}

          {articles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-12 rounded-2xl border-2 border-dashed ${themeClasses.border}`}
            >
              <Eye size={48} className={`mx-auto mb-4 ${themeClasses.textMuted}`} />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className={themeClasses.textMuted}>No articles yet.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {articles.map(article => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${themeClasses.cardBg} rounded-xl overflow-hidden group transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-lg border ${themeClasses.border} cursor-pointer`}
                  onClick={() => handleViewArticle(article.id)}
                >
                  <div className="relative">
                    <img src={getArticleImage(article)} alt={article.title} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-3 right-3 flex gap-1">
                      {!article.published && (
                        <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs font-medium">DRAFT</span>
                      )}
                      {userArticleCount > 0 && article.author?.id != null && String(article.author.id) === String(userData?.id) && (
                        <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">YOURS</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${article.published ? 'text-green-500' : 'text-yellow-500'}`}>
                      {article.category || 'Uncategorized'}
                    </span>
                    <h3 className="text-lg font-bold mt-2 mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className={`text-sm ${themeClasses.textMuted} mb-3 flex items-center space-x-2`}>
                      <span>By {article.author?.username || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{estimateReadTime(article.content)}</span>
                    </div>
                    <p className={`text-sm ${themeClasses.textMuted} mb-4 line-clamp-2`}>
                      {renderContentPreview(article.content)}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${article.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye size={14} />
                        <span>Read</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}