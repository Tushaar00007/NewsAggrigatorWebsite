"use client";

import React from "react";

// AdminPanelUI.tsx — UI-only React component for Next.js (TailwindCSS)
// Props-driven, no data fetching or backend logic included. Plug your handlers where needed.
// Added: light/dark theme toggle with persistence (localStorage) and Tailwind dark: variants.

type Article = {
  id: string;
  title: string;
  summary?: string;
  authorName?: string;
  createdAt?: string;
};

type Props = {
  readersCount?: number | null;
  journalistsCount?: number | null;
  pendingArticles?: Article[];
  loading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onBulkApprove?: (ids: string[]) => void;
  onRefreshCounts?: () => void;
};

export default function AdminPanelUI({
  readersCount = null,
  journalistsCount = null,
  pendingArticles = [],
  loading = false,
  onApprove = () => {},
  onReject = () => {},
  onDelete = () => {},
  onBulkApprove = () => {},
  onRefreshCounts = () => {},
}: Props) {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [search, setSearch] = React.useState("");
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // initialize theme from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.classList.toggle("dark", saved === "dark");
      } else {
        // default: follow OS preference
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "light";
        setTheme(initial);
        document.documentElement.classList.toggle("dark", initial === "dark");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  const filtered = pendingArticles.filter((a) =>
    [a.title, a.summary, a.authorName].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function bulkApprove() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return alert("Select articles to bulk approve");
    onBulkApprove(ids);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">Moderate articles, manage users and site content.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRefreshCounts}
            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            Refresh counts
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? (
              <span className="text-sm">🌙 Dark</span>
            ) : (
              <span className="text-sm">☀️ Light</span>
            )}
          </button>

          <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm">Sign out</button>
        </div>
      </header>

      {/* Overview cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-300">Readers</div>
          <div className="text-2xl font-semibold">{readersCount ?? "—"}</div>
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-300">Journalists</div>
          <div className="text-2xl font-semibold">{journalistsCount ?? "—"}</div>
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-300">Pending Articles</div>
          <div className="text-2xl font-semibold">{pendingArticles.length}</div>
        </div>
      </section>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Search pending articles..."
          />
          <button
            onClick={bulkApprove}
            disabled={loading}
            className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm disabled:opacity-60"
          >
            Bulk Approve
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-300">{loading ? "Processing..." : "Ready"}</div>
      </div>

      {/* Pending articles list */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b flex items-center gap-4 border-gray-200 dark:border-gray-700">
          <input
            type="checkbox"
            onChange={(e) => {
              const checked = e.target.checked;
              const newSel: Record<string, boolean> = {};
              if (checked) pendingArticles.forEach((a) => (newSel[a.id] = true));
              setSelected(newSel);
            }}
            checked={Object.keys(selected).length > 0 && Object.keys(selected).length === pendingArticles.length}
          />
          <div className="font-medium">Title</div>
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-300">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-300">No pending articles found.</div>
        ) : (
          filtered.map((a) => (
            <div key={a.id} className="px-4 py-4 flex items-start gap-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                checked={!!selected[a.id]}
                onChange={() => toggle(a.id)}
                className="mt-1"
              />

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{a.title}</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-300">{a.createdAt ?? "—"}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{a.summary ?? "No summary provided."}</p>
                <div className="text-xs text-gray-400 dark:text-gray-300 mt-2">By {a.authorName ?? "Unknown"}</div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => onApprove(a.id)}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(a.id)}
                  className="px-3 py-1 border rounded-md text-sm border-gray-200 dark:border-gray-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="px-3 py-1 text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer short actions */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
        <div>© {new Date().getFullYear()} News Aggregator</div>
        <div>Admin quick actions: Edit categories • Manage tags • View logs</div>
      </div>
    </div>
  );
}




