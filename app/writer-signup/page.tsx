"use client";

import { useEffect, useState } from "react";
import { Article, ArticleContent, fetchArticles } from "../utils/api";

export default function ArticlePageLayout() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Use the fetchArticles function from your API service
    fetchArticles(setLoading, setError, setArticles);
  }, []);

  const getContentPreview = (content: ArticleContent[] | string) => {
    if (typeof content === "string") {
      const text = content.replace(/\n/g, ' ').trim();
      return text.slice(0, 200) + (text.length > 200 ? "..." : "");
    }
    
    if (Array.isArray(content)) {
      const text = content
        .filter((c) => c.type === "paragraph" && c.value)
        .map((c) => c.value.replace(/\n/g, ' ').trim())
        .join(" ")
        .trim();
      return text.slice(0, 300) + (text.length > 300 ? "..." : "");
    }
    
    return "";
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Loading skeleton component
  const ArticleSkeleton = () => (
    <div className={`animate-pulse ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg`}>
      <div className="w-full h-64 bg-gray-300 dark:bg-gray-700"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );

  const SidebarSkeleton = () => (
    <div className={`animate-pulse flex gap-4 p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
      <div className="w-28 h-20 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  const hero = articles[0];
  const rightCol = articles.slice(1, 4);
  const below = articles.slice(4);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} min-h-screen p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with dark mode toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Latest Articles</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
            } transition-colors`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Debug info */}
        {!loading && articles.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded text-sm">
            <strong>Success:</strong> Loaded {articles.length} article(s)
          </div>
        )}

        {/* Top layout: hero (left) + right column (stacked cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hero Article */}
          <div className="lg:col-span-2">
            {loading ? (
              <ArticleSkeleton />
            ) : hero ? (
              <article className={`rounded-xl overflow-hidden shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                {hero.media && hero.media.length > 0 ? (
                  <img 
                    src={hero.media[0].url || hero.media[0]} 
                    alt={hero.title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className={`w-full h-64 flex items-center justify-center ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                    <span className={darkMode ? "text-gray-400" : "text-gray-500"}>No Image</span>
                  </div>
                )}

                <div className="p-6">
                  {hero.category && (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
                      darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                    }`}>
                      {hero.category}
                    </span>
                  )}
                  
                  <h2 className="text-3xl font-bold leading-tight mb-3">{hero.title}</h2>
                  <p className={`leading-relaxed mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {getContentPreview(hero.content)}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className={`flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <span>👤 {hero.author?.username || 'Unknown'}</span>
                      <span>•</span>
                      <span>{formatDate(hero.updated_at)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      hero.status === 'published' 
                        ? darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                        : darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {hero.status}
                    </span>
                  </div>
                </div>
              </article>
            ) : (
              !loading && (
                <div className={`h-72 rounded-xl flex items-center justify-center ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}>
                  <p className={darkMode ? "text-gray-400" : "text-gray-500"}>No featured article available</p>
                </div>
              )
            )}
          </div>

          {/* Sidebar Articles */}
          <div className="flex flex-col gap-4">
            {loading ? (
              <>
                <SidebarSkeleton />
                <SidebarSkeleton />
                <SidebarSkeleton />
              </>
            ) : rightCol.length > 0 ? (
              rightCol.map((article) => (
                <article 
                  key={article.id} 
                  className={`flex gap-4 p-4 rounded-xl transition-transform hover:scale-[1.02] ${
                    darkMode ? "bg-gray-800 hover:bg-gray-750" : "bg-white hover:bg-gray-50"
                  } shadow-sm cursor-pointer`}
                >
                  <div className="w-28 h-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                    {article.media && article.media.length > 0 ? (
                      <img 
                        src={article.media[0].url || article.media[0]} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}>
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">{article.title}</h3>
                    <p className={`text-sm mt-2 line-clamp-2 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {getContentPreview(article.content)}
                    </p>
                    <div className={`text-xs mt-2 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}>
                      {article.category || 'Uncategorized'}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              !loading && articles.length > 0 && (
                <div className={`text-center p-4 rounded-xl ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}>
                  <p className={darkMode ? "text-gray-400" : "text-gray-500"}>No additional articles</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Rest of your component remains the same... */}
      </div>
    </div>
  );
}