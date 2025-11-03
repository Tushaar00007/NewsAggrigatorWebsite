"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { fetchArticles } from "./utils/api";
import type { Article } from "./types/article";
import { Image as ImageIcon, Calendar, User } from "lucide-react";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Home");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const redirectToArticle = (id: string) => {
    window.location.href = `/article/${id}`;
  };

  // Theme persistence
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setDarkMode(saved === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Fetch articles
  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory === "Home") return true;
    if (selectedCategory === "Technology") return art.category?.toLowerCase().includes("tech") || art.title.toLowerCase().includes("tech");
    if (selectedCategory === "Science") return art.category?.toLowerCase().includes("science") || art.title.toLowerCase().includes("science");
    if (selectedCategory === "Business") return art.category?.toLowerCase().includes("business") || art.title.toLowerCase().includes("business");
    return art.category?.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const hero = filteredArticles[0] ?? null;
  const grid = filteredArticles.slice(1);

  // Function to get the first image from article content
  const getFirstImage = (article: Article) => {
    const imageBlock = article.content.find(block => block.type === "image" && block.value);
    return imageBlock?.value || null;
  };

  // Function to get first paragraph
  const getFirstParagraph = (article: Article) => {
    const paragraphBlock = article.content.find(block => block.type === "paragraph" && block.value);
    return paragraphBlock?.value || "";
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}>
      {/* NAVBAR */}
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex pt-16">
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:static lg:transform-none lg:z-auto ${
            sidebarOpen ? "" : "lg:hidden"
          }`}
        >
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            darkMode={darkMode}
          />
        </div>

        {/* Overlay - only show when sidebar is open on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className={`flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-300 ${
          sidebarOpen ? "lg:ml-0" : ""
        }`}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No articles found</p>
              <p className="text-gray-400 text-sm mt-2">Add some articles from the admin panel</p>
            </div>
          ) : (
            <>
              {/* HERO CARD */}
              {hero && (
                <div 
                  onClick={() => redirectToArticle(hero.id)}
                  className="relative h-96 md:h-[600px] rounded-3xl overflow-hidden mb-12 shadow-2xl cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
                >
                  {/* Background Image or Gradient */}
                  {getFirstImage(hero) ? (
                    <img 
                      src={getFirstImage(hero)} 
                      alt={hero.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500" />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col justify-end h-full p-8 text-white">
                    {hero.category && (
                      <span className="inline-block px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-medium mb-4 self-start">
                        {hero.category}
                      </span>
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold line-clamp-3 mb-4">
                      {hero.title}
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 line-clamp-3 mb-6">
                      {getFirstParagraph(hero).slice(0, 200)}...
                    </p>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{hero.author.username}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{formatDate(hero.created_at)}</span>
                      </div>
                      <span>•</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        hero.status === "published" 
                          ? "bg-green-600 text-white" 
                          : hero.status === "draft"
                          ? "bg-orange-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}>
                        {hero.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {grid.length > 0 ? (
                  grid.map((art, i) => (
                    <GridCard
                      key={art.id}
                      article={art}
                      size={i === 1 || i === 4 ? "medium" : "small"}
                      darkMode={darkMode}
                      getFirstImage={getFirstImage}
                      getFirstParagraph={getFirstParagraph}
                      formatDate={formatDate}
                      onClick={() => redirectToArticle(art.id)}
                    />
                  ))
                ) : (
                  hero && (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-500">No more articles in this category</p>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Enhanced GridCard component with Cloudinary images
function GridCard({ 
  article, 
  size = "small", 
  darkMode, 
  getFirstImage,
  getFirstParagraph,
  formatDate,
  onClick 
}: { 
  article: Article; 
  size?: "small" | "medium"; 
  darkMode: boolean;
  getFirstImage: (article: Article) => string | null;
  getFirstParagraph: (article: Article) => string;
  formatDate: (dateString: string) => string;
  onClick: () => void;
}) {
  const imageUrl = getFirstImage(article);
  const paragraph = getFirstParagraph(article);
  const medium = size === "medium";

  return (
    <article 
      onClick={onClick}
      className={`
        ${medium ? "md:col-span-2" : ""} 
        ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"} 
        rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer 
        transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group
      `}
    >
      {/* Image Section */}
      <div className={`relative ${medium ? "h-48" : "h-32"} overflow-hidden`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-white opacity-80" />
          </div>
        )}
        
        {/* Category Badge */}
        {article.category && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-orange-600 text-white rounded-full text-xs font-medium">
            {article.category}
          </span>
        )}
        
        {/* Status Badge */}
        <span className={`
          absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
          ${article.status === "published" 
            ? "bg-green-600 text-white" 
            : article.status === "draft"
            ? "bg-orange-600 text-white"
            : "bg-gray-600 text-white"
          }
        `}>
          {article.status.toUpperCase()}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-bold ${medium ? "text-lg" : "text-sm"} line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors`}>
          {article.title}
        </h3>
        
        {medium && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">
            {paragraph.slice(0, 130)}...
          </p>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User size={12} />
            <span>{article.author.username}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>

        {/* Interaction Stats */}
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>❤️ {article.likes_count || 0}</span>
          <span>💬 {article.comments_count || 0}</span>
        </div>
      </div>
    </article>
  );
}