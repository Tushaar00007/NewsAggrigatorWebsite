"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { fetchArticles } from "./utils/api";
import type { Article } from "./types/article";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Home");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const redirecttoarticle = (id: string) => {
    window.location.href = `/article/${id}`;
  }
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
    const text = `${art.title} ${art.content.map(c => c.value).join(" ")}`.toLowerCase();
    return text.includes(selectedCategory.toLowerCase());
  });

  const hero = filteredArticles[0] ?? null;
  const grid = filteredArticles.slice(1);

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
          {/* <h1 className="text-4xl md:text-6xl font-bold mb-8">
            News<span className="text-orange-600">Now</span>
          </h1> */}

          {loading ? (
            <p className="text-center py-20">Loading articles...</p>
          ) : filteredArticles.length === 0 ? (
            <p className="text-center py-20 text-gray-500">
              No articles found. Add some from Django Admin.
            </p>
          ) : (
            <>
              {/* HERO CARD */}
              {hero &&  (
                <div onClick={()=> redirecttoarticle(hero.id)}
                 className="relative h-96 md:h-[600px] rounded-3xl overflow-hidden mb-12 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500" />
                  <div className="relative z-10 flex flex-col justify-end h-full p-8 text-white">
                    <h1 className="text-4xl md:text-6xl font-bold line-clamp-3 mb-4">
                      {hero.title}
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 line-clamp-3 mb-6">
                      {hero.content.find(c => c.type === "paragraph")?.value.slice(0, 200)}...
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>By {hero.author.username}</span>
                      <span>•</span>
                      <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-medium">
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
                    />
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500 py-10">
                    No more articles
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// GRID CARD component remains the same...
function GridCard({ article, size = "small", darkMode }: { article: Article; size?: "small" | "medium"; darkMode: boolean }) {
  const para = article.content.find(c => c.type === "paragraph")?.value ?? "";
  const medium = size === "medium";

  return (
    <article className={`${medium ? "md:col-span-2" : ""} ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md overflow-hidden flex flex-col`}>
      <div className={`relative ${medium ? "h-48" : "h-32"} bg-gradient-to-br from-orange-400 to-orange-500`} />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-bold ${medium ? "text-lg" : "text-sm"} line-clamp-2`}>{article.title}</h3>
        {medium && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{para.slice(0, 130)}...</p>}
        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{article.author.username}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${article.status === "draft" ? "bg-orange-600 text-white" : "bg-green-600 text-white"}`}>
            {article.status.toUpperCase()}
          </span>
        </div>
      </div>
    </article>
  );
}