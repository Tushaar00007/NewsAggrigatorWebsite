"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  fetchPendingArticles,
  fetchApprovedArticles,
  fetchUserCounts,
  approveArticle,
  bulkApproveArticles,
  rejectArticle,
  deleteArticleAdmin,
  type PendingArticle,
} from "../utils/api";

// AdminPanelUI.tsx — Enhanced UI for Next.js with TailwindCSS and Framer Motion
// Integrated with backend API for admin functionality

export default function AdminPanelUI() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [search, setSearch] = React.useState("");
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  
  // Data state
  const [readersCount, setReadersCount] = React.useState<number | null>(null);
  const [journalistsCount, setJournalistsCount] = React.useState<number | null>(null);
  const [pendingArticles, setPendingArticles] = React.useState<PendingArticle[]>([]);
  const [approvedArticles, setApprovedArticles] = React.useState<PendingArticle[]>([]);
  const [activeTab, setActiveTab] = React.useState<"pending" | "approved">("pending");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize theme from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.classList.toggle("dark", saved === "dark");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "light";
        setTheme(initial);
        document.documentElement.classList.toggle("dark", initial === "dark");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Check if user is admin and fetch data on mount
  React.useEffect(() => {
    const checkAdminAndLoad = async () => {
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "admin") {
        setError("Access denied. Admin privileges required.");
        // Optionally redirect to home
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      await loadData();
    };

    checkAdminAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load all admin data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load user counts, pending and approved articles in parallel
      const [countsData, pendingData, approvedData] = await Promise.all([
        fetchUserCounts(),
        fetchPendingArticles(),
        fetchApprovedArticles(),
      ]);

      setReadersCount(countsData.readersCount);
      setJournalistsCount(countsData.journalistsCount);
      setPendingArticles(pendingData);
      setApprovedArticles(approvedData);
    } catch (err: any) {
      console.error("Error loading admin data:", err);
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  // Refresh counts only
  const handleRefreshCounts = async () => {
    setLoading(true);
    try {
      const countsData = await fetchUserCounts();
      setReadersCount(countsData.readersCount);
      setJournalistsCount(countsData.journalistsCount);
    } catch (err: any) {
      console.error("Error refreshing counts:", err);
      setError(err.message || "Failed to refresh counts");
    } finally {
      setLoading(false);
    }
  };

  // Approve single article
  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this article?")) return;

    setLoading(true);
    try {
      await approveArticle(id);
      // Remove from pending list and reload approved articles
      setPendingArticles((prev) => prev.filter((a) => a.id !== id));
      // Reload approved articles to include the newly approved one
      const approvedData = await fetchApprovedArticles();
      setApprovedArticles(approvedData);
      // Refresh counts
      await handleRefreshCounts();
    } catch (err: any) {
      console.error("Error approving article:", err);
      alert(err.message || "Failed to approve article");
    } finally {
      setLoading(false);
    }
  };

  // Reject article
  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this article?")) return;

    setLoading(true);
    try {
      await rejectArticle(id);
      // Remove from pending list
      setPendingArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error("Error rejecting article:", err);
      alert(err.message || "Failed to reject article");
    } finally {
      setLoading(false);
    }
  };

  // Delete article
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;

    setLoading(true);
    try {
      await deleteArticleAdmin(id);
      // Remove from both pending and approved lists
      setPendingArticles((prev) => prev.filter((a) => a.id !== id));
      setApprovedArticles((prev) => prev.filter((a) => a.id !== id));
      // Refresh counts
      await handleRefreshCounts();
    } catch (err: any) {
      console.error("Error deleting article:", err);
      alert(err.message || "Failed to delete article");
    } finally {
      setLoading(false);
    }
  };

  // Bulk approve articles
  const handleBulkApprove = async (ids: string[]) => {
    if (!ids.length) {
      alert("Select articles to bulk approve");
      return;
    }

    if (!confirm(`Are you sure you want to approve ${ids.length} article(s)?`)) return;

    setLoading(true);
    try {
      await bulkApproveArticles(ids);
      // Remove approved articles from pending list and reload approved articles
      setPendingArticles((prev) => prev.filter((a) => !ids.includes(a.id)));
      // Reload approved articles to include newly approved ones
      const approvedData = await fetchApprovedArticles();
      setApprovedArticles(approvedData);
      // Clear selection
      setSelected({});
      // Refresh counts
      await handleRefreshCounts();
    } catch (err: any) {
      console.error("Error bulk approving articles:", err);
      alert(err.message || "Failed to bulk approve articles");
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete articles
  const handleBulkDelete = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) {
      alert("Select articles to delete");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${ids.length} article(s)? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      // Delete articles one by one
      const deletePromises = ids.map(id => deleteArticleAdmin(id));
      await Promise.all(deletePromises);
      
      // Remove deleted articles from both pending and approved lists
      setPendingArticles((prev) => prev.filter((a) => !ids.includes(a.id)));
      setApprovedArticles((prev) => prev.filter((a) => !ids.includes(a.id)));
      // Clear selection
      setSelected({});
      // Refresh counts
      await handleRefreshCounts();
    } catch (err: any) {
      console.error("Error bulk deleting articles:", err);
      alert(err.message || "Failed to delete articles");
    } finally {
      setLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userid");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  const currentArticles = activeTab === "pending" ? pendingArticles : approvedArticles;
  const filtered = currentArticles.filter((a) =>
    [a.title, a.summary, a.authorName].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function bulkApprove() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    handleBulkApprove(ids);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden"
    >
      <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage articles, users, and content with ease.</p>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefreshCounts}
            disabled={loading}
            className="px-4 py-2 border rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            aria-label="Refresh user and article counts"
          >
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="px-4 py-2 border rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            {theme === "dark" ? (
              <span className="text-sm">🌙 Dark</span>
            ) : (
              <span className="text-sm">☀️ Light</span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            aria-label="Sign out of admin panel"
          >
            Sign Out
          </motion.button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Overview cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Readers", value: readersCount ?? "—", icon: "👥" },
            { label: "Journalists", value: journalistsCount ?? "—", icon: "✍️" },
            { label: "Pending Articles", value: pendingArticles.length, icon: "📝" },
            { label: "Approved Articles", value: approvedArticles.length, icon: "✅" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="p-6 border rounded-xl shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
                  <div className="text-3xl font-bold">{item.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab("pending");
              setSelected({});
            }}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "pending"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Pending Articles ({pendingArticles.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab("approved");
              setSelected({});
            }}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "approved"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Approved Articles ({approvedArticles.length})
          </motion.button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <motion.input
              initial={{ width: "16rem" }}
              whileFocus={{ width: "20rem" }}
              transition={{ duration: 0.3 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder={`Search ${activeTab} articles by title, summary, or author...`}
              aria-label={`Search ${activeTab} articles`}
            />

            {activeTab === "pending" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={bulkApprove}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-emerald-700 transition-colors relative overflow-hidden"
                aria-label="Approve selected articles"
              >
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  </span>
                )}
                <span className={loading ? "opacity-0" : ""}>Bulk Approve</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBulkDelete}
              disabled={loading || Object.keys(selected).filter((k) => selected[k]).length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-red-700 transition-colors relative overflow-hidden"
              aria-label={`Delete selected ${activeTab} articles`}
            >
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </span>
              )}
              <span className={loading ? "opacity-0" : ""}>Bulk Delete</span>
            </motion.button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? "Processing..." : `${filtered.length} articles`}
          </div>
        </div>

        {/* Pending articles list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 border rounded-xl shadow-lg border-gray-200 dark:border-gray-600 overflow-hidden"
        >
          <div className="px-6 py-4 border-b flex items-center gap-4 border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              onChange={(e) => {
                const checked = e.target.checked;
                const newSel: Record<string, boolean> = {};
                if (checked) currentArticles.forEach((a) => (newSel[a.id] = true));
                setSelected(newSel);
              }}
              checked={Object.keys(selected).length > 0 && Object.keys(selected).length === currentArticles.length}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500"
              aria-label="Select all articles"
            />
            <div className="font-semibold text-gray-700 dark:text-gray-200">Title</div>
            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">Actions</div>
          </div>

          <AnimatePresence>
            {loading && currentArticles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 text-center text-gray-600 dark:text-gray-400"
              >
                Loading {activeTab} articles...
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 text-center text-gray-600 dark:text-gray-400"
              >
                No {activeTab} articles found.
              </motion.div>
            ) : (
              filtered.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-6 py-4 flex items-start gap-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!selected[a.id]}
                    onChange={() => toggle(a.id)}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
                    aria-label={`Select article: ${a.title}`}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{a.title}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{a.createdAt ?? "—"}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{a.summary ?? "No summary provided."}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">By {a.authorName ?? "Unknown"}</div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {activeTab === "pending" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(a.id)}
                          disabled={loading}
                          className="px-4 py-1 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          aria-label={`Approve article: ${a.title}`}
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(a.id)}
                          disabled={loading}
                          className="px-4 py-1 border rounded-lg text-sm font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                          aria-label={`Reject article: ${a.title}`}
                        >
                          Reject
                        </motion.button>
                      </>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(a.id);
                      }}
                      disabled={loading}
                      className="px-4 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      aria-label={`Delete article: ${a.title}`}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
        <div>© {new Date().getFullYear()} News Aggregator</div>
        <div className="flex gap-4">
          <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="Edit article categories">
            Edit categories
          </button>
          <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="Manage article tags">
            Manage tags
          </button>
          <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="View system logs">
            View logs
          </button>
        </div>
      </footer>
    </motion.div>
  );
}