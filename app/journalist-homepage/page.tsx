"use client";

import { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, BarChart3, User, LogOut, Sun, Moon, Menu, X, Eye } from 'lucide-react';

const JournalistNavLink = ({ href, icon: Icon, children, theme }) => (
  <a href={href} className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${theme === 'dark' ? 'text-slate-300 hover:text-orange-300 hover:bg-slate-700' : 'text-slate-600 hover:text-orange-500 hover:bg-gray-200'}`}>
    <Icon size={20} />
    <span>{children}</span>
  </a>
);

export default function JournalistHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const API_BASE = "http://localhost:8000/api/articles";

  // Step 1: Load user from localStorage (robust)
  useEffect(() => {
    const getUserData = () => {
      try {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');

        console.log('localStorage User Data:', { userId, userEmail, userRole, userName });

        if (userId || userEmail) {
          setUserData({
            id: userId,
            email: userEmail,
            role: userRole,
            username: userName || userEmail?.split('@')[0] || 'Journalist'
          });
        } else {
          console.warn('No user data in localStorage');
        }
      } catch (err) {
        console.error('Error reading localStorage:', err);
      }
    };

    getUserData();
  }, []);

  // Step 2: Fetch ALL articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        console.log('Fetching all articles...');

        const response = await fetch(`${API_BASE}/get/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        console.log('API Articles Response:', data);

        if (data.success && Array.isArray(data.data?.articles)) {
          const allArticles = data.data.articles;

          // Step 3: Filter user's own articles (smart match)
          const userId = localStorage.getItem('userId');
          const userEmail = localStorage.getItem('userEmail');
          const userName = localStorage.getItem('userName');

          const userArticles = allArticles.filter(article => {
            const author = article.author;
            if (!author) return false;

            const matchesId = author.id != null && String(author.id) === String(userId);
            const matchesEmail = author.email && author.email === userEmail;
            const matchesName = author.username && author.username === userName;

            console.log(`Article "${article.title}" → ID: ${matchesId}, Email: ${matchesEmail}, Name: ${matchesName}`);

            return matchesId || matchesEmail || matchesName;
          });

          console.log('User Articles Count:', userArticles.length);

          setArticles(allArticles);
        } else {
          setArticles([]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
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
    headerBg: theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80 shadow-sm',
    cardBg: theme === 'dark' ? 'bg-slate-800' : 'bg-white',
    border: theme === 'dark' ? 'border-slate-700' : 'border-gray-200',
  };

  // Featured article
  const featuredArticle = articles.find(a => a.published) || articles[0];

  // Search filter
  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Content preview
  const renderContentPreview = (content) => {
    if (!content) return 'No content';
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      if (Array.isArray(parsed)) {
        const p = parsed.find(b => b.type === 'paragraph');
        return p?.value ? p.value.substring(0, 150) + '...' : 'No content';
      }
      return String(content).substring(0, 150) + '...';
    } catch {
      return String(content).substring(0, 150) + '...';
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className={`mt-4 ${themeClasses.text}`}>Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 ${themeClasses.headerBg} ${themeClasses.border}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="text-2xl font-bold tracking-wider">
              NewsNow <span className="text-orange-500 font-light">| Journalist</span>
            </a>

            <div className="flex-1 mx-4 hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all articles..."
                className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                  theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-slate-800'
                }`}
              />
            </div>

            <nav className="hidden md:flex items-center space-x-2">
              <JournalistNavLink href="/journalist-dashboard" icon={LayoutDashboard} theme={theme}>Dashboard</JournalistNavLink>
              <JournalistNavLink href="/new-article" icon={PlusCircle} theme={theme}>New Article</JournalistNavLink>
              <JournalistNavLink href="#" icon={BarChart3} theme={theme}>Analytics</JournalistNavLink>
              <JournalistNavLink href="#" icon={User} theme={theme}>Profile</JournalistNavLink>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
              >
                {theme === 'dark' ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-600" />}
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{userData?.username || 'Journalist'}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-md font-semibold transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>

            <div className="md:hidden flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={`w-24 px-2 py-1 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                  theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-slate-800'
                }`}
              />
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
              >
                {theme === 'dark' ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-600" />}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className={`md:hidden border-t ${themeClasses.border} ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <nav className="container mx-auto px-4 pt-4 pb-6 flex flex-col space-y-4">
              <JournalistNavLink href="/journalist-dashboard" icon={LayoutDashboard} theme={theme}>Dashboard</JournalistNavLink>
              <JournalistNavLink href="/new-article" icon={PlusCircle} theme={theme}>New Article</JournalistNavLink>
              <JournalistNavLink href="#" icon={BarChart3} theme={theme}>Analytics</JournalistNavLink>
              <JournalistNavLink href="#" icon={User} theme={theme}>Profile</JournalistNavLink>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{userData?.username || 'Journalist'}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-md font-semibold transition-colors duration-200 w-full justify-center"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border ${themeClasses.border}`}>
            <h3 className="text-lg font-semibold mb-2">Total Articles</h3>
            <p className="text-3xl font-bold text-orange-500">{articles.length}</p>
          </div>
          <div className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border ${themeClasses.border}`}>
            <h3 className="text-lg font-semibold mb-2">Published</h3>
            <p className="text-3xl font-bold text-green-500">
              {articles.filter(a => a.published).length}
            </p>
          </div>
          <div className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border ${themeClasses.border}`}>
            <h3 className="text-lg font-semibold mb-2">Drafts</h3>
            <p className="text-3xl font-bold text-yellow-500">
              {articles.filter(a => !a.published).length}
            </p>
          </div>
          <div className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border ${themeClasses.border}`}>
            <h3 className="text-lg font-semibold mb-2">Your Articles</h3>
            <p className="text-3xl font-bold text-blue-500">{userArticleCount}</p>
          </div>
        </div>

        {/* Featured */}
        {featuredArticle && (
          <section className="mb-12">
            <div className={`${themeClasses.cardBg} rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-0`}
              style={{ background: 'linear-gradient(90deg, #EA580C, #DC2626)' }}>
              <div className="p-8 md:p-12 flex flex-col justify-center text-white">
                <span className="text-sm font-semibold uppercase tracking-wider">
                  {featuredArticle.category || 'Uncategorized'}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold my-3 leading-tight">
                  {featuredArticle.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm mb-4">
                  <span>By {featuredArticle.author?.username || 'Unknown'}</span>
                  <span>•</span>
                  <span>{new Date(featuredArticle.created_at).toLocaleDateString()}</span>
                </div>
                <p className="leading-relaxed mb-6">{renderContentPreview(featuredArticle.content)}</p>
                <div className="flex items-center gap-2 mb-4">
                  {!featuredArticle.published && (
                    <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-xs font-medium">DRAFT</span>
                  )}
                </div>
                <button
                  onClick={() => handleViewArticle(featuredArticle.id)}
                  className="bg-white hover:bg-gray-200 text-orange-600 font-bold py-3 px-6 rounded-lg transition-colors duration-300 self-start"
                >
                  Read Full Story
                </button>
              </div>
              <img src={getArticleImage(featuredArticle)} alt={featuredArticle.title} className="w-full h-64 lg:h-full object-cover" />
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold border-l-4 border-orange-500 pl-4">
              All Articles ({filteredArticles.length})
            </h2>
            <a href="/new-article" className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200">
              <PlusCircle size={20} />
              <span>New Article</span>
            </a>
          </div>

          {error && (
            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'}`}>
              Error: {error}
            </div>
          )}

          {filteredArticles.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border-2 border-dashed ${themeClasses.border}`}>
              <Eye size={48} className={`mx-auto mb-4 ${themeClasses.textMuted}`} />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className={themeClasses.textMuted}>
                {searchQuery ? 'Try adjusting your search.' : 'No articles yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  className={`${themeClasses.cardBg} rounded-xl overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 shadow-lg border ${themeClasses.border} cursor-pointer`}
                  onClick={() => handleViewArticle(article.id)}
                >
                  <div className="relative">
                    <img src={getArticleImage(article)} alt={article.title} className="w-full h-48 object-cover" />
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
                    <div className={`text-sm ${themeClasses.textMuted} mb-3`}>
                      <span>By {article.author?.username || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
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
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Debug Panel */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-10 p-4 bg-yellow-900/30 rounded-lg text-xs font-mono">
            <p><strong>Debug:</strong></p>
            <p>User ID: {localStorage.getItem('userId')}</p>
            <p>Email: {localStorage.getItem('userEmail')}</p>
            <p>Name: {localStorage.getItem('userName')}</p>
            <p>Your Articles: {userArticleCount}</p>
            <button onClick={() => console.log('Articles:', articles)} className="underline text-orange-400">
              Log Articles
            </button>
          </div>
        )} */}
      </main>
    </div>
  );
}