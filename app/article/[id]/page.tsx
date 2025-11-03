// src/app/article/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Heart, Bookmark, MessageCircle } from "lucide-react";
import Link from "next/link";

/**
 * Article detail page integrated with updated Django endpoints.
 * Uses the new ArticleInteraction model for likes, saves, and comments.
 */

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User state
  const [userId, setUserId] = useState<string | null>(null);

  // Interaction states
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const API_BASE = "http://localhost:8000/api/articles";

  // -------------------------
  // Helper utilities
  // -------------------------
  const getAuthToken = () => {
    try {
      return (
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("auth") ||
        localStorage.getItem("userid") ||
        null
      );
    } catch {
      return null;
    }
  };

  const readStoredUserId = (): string | null => {
    try {
      const explicit = localStorage.getItem("userid");
      if (explicit) return explicit;

      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const parsed = JSON.parse(userJson);
          if (parsed?.id) return parsed.id;
          if (parsed?.userid) return parsed.userid;
        } catch {}
      }

      return null;
    } catch {
      return null;
    }
  };

  const saveUserIdToLocalStorage = (uid: string | null) => {
    try {
      if (uid) {
        localStorage.setItem("userid", uid);
      } else {
        localStorage.removeItem("userid");
      }
    } catch {
      // ignore
    }
  };

  // Ensure user id is resolved once and cached
  const ensureUserId = async (): Promise<string | null> => {
    const stored = readStoredUserId();
    if (stored) {
      setUserId(stored);
      return stored;
    }
    setUserId(null);
    return null;
  };

  // -------------------------
  // Data fetching
  // -------------------------
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/get-by-id/?id=${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const response = await res.json();
        const articleData = response?.data?.article;
        if (!articleData) throw new Error("Invalid response format");
        setArticle(articleData);
        
        // Use counts from article data if available
        if (articleData.likes_count !== undefined) {
          setLikesCount(articleData.likes_count);
        }
        if (articleData.comments_count !== undefined) {
          setCommentsCount(articleData.comments_count);
        }
      })
      .catch((err) => {
        console.error("Fetch article error:", err);
        setError("Failed to load article");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch user interaction status
  useEffect(() => {
    if (!id || !userId) return;

    fetch(`${API_BASE}/user-interaction/?article_id=${id}&user_id=${userId}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success) {
          setLiked(data.data.liked);
          setSaved(data.data.saved);
        }
      })
      .catch((err) => console.error("Error fetching user interaction:", err));
  }, [id, userId]);

  // Fetch comments
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/get-comments/?article_id=${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && Array.isArray(data?.data?.comments)) {
          setComments(data.data.comments);
          setCommentsCount(data.data.comments_count || data.data.comments.length);
        }
      })
      .catch((err) => console.error("Error fetching comments:", err));
  }, [id]);

  // Ensure we resolve user id once on mount
  useEffect(() => {
    ensureUserId();
  }, []);

  // -------------------------
  // Actions
  // -------------------------
  const handleToggleLike = async () => {
    let uid = userId;
    if (!uid) {
      uid = readStoredUserId();
    }

    if (!uid) {
      alert("Please log in to like this article.");
      return;
    }

    // Optimistic update
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const body = { 
        article_id: id, 
        user_id: uid
      };
      
      const res = await fetch(`${API_BASE}/add-like/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to update like");
      }

      // Update with server count if provided
      if (data?.success && typeof data?.data?.likes_count === "number") {
        setLikesCount(data.data.likes_count);
      }
    } catch (err: any) {
      console.error("Failed to update like", err);
      // Rollback optimistic update
      setLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1);
      alert(err.message);
    }
  };

  const handleToggleSave = async () => {
    let uid = userId;
    if (!uid) {
      uid = readStoredUserId();
    }

    if (!uid) {
      alert("Please log in to save this article.");
      return;
    }

    // Optimistic update
    const newSavedState = !saved;
    setSaved(newSavedState);

    try {
      const body = { 
        article_id: id, 
        user_id: uid
      };
      
      const res = await fetch(`${API_BASE}/toggle-save-article/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to update save status");
      }

      // Ensure UI matches server state
      if (data?.success) {
        setSaved(data.data.saved);
      }
    } catch (err: any) {
      console.error("Failed to update save", err);
      // Rollback optimistic update
      setSaved(!newSavedState);
      alert(err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    let uid = userId;
    if (!uid) {
      uid = readStoredUserId();
    }

    if (!uid) {
      alert("Please log in to post a comment.");
      return;
    }

    const commentText = newComment.trim();

    // Optimistic update
    const optimisticComment = {
      id: `temp_${Date.now()}`,
      comment: commentText,
      author: { id: uid, username: "You" },
      created_at: new Date().toISOString(),
      liked: false,
      saved: false,
    };
    
    setComments(prev => [optimisticComment, ...prev]);
    setCommentsCount(prev => prev + 1);
    setNewComment("");

    try {
      const body = { 
        article_id: id, 
        user_id: uid,
        comment: commentText 
      };
      
      const res = await fetch(`${API_BASE}/add-comment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to add comment");
      }

      if (data?.success) {
        // Replace optimistic comment with server response
        const serverComment = {
          id: data.data?.comment_id || optimisticComment.id,
          comment: data.data?.comment || commentText,
          author: { id: uid, username: "You" },
          created_at: new Date().toISOString(),
          liked: false,
          saved: false,
        };
        
        setComments(prev => {
          const filtered = prev.filter(c => c.id !== optimisticComment.id);
          return [serverComment, ...filtered];
        });

        // Update comments count from server if provided
        if (typeof data.data?.comments_count === "number") {
          setCommentsCount(data.data.comments_count);
        }
      }
    } catch (err: any) {
      console.error("Add comment failed:", err);
      // Rollback optimistic update
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      setCommentsCount(prev => Math.max(0, prev - 1));
      alert(err.message);
    }
  };

  // -------------------------
  // UI states
  // -------------------------
  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <p>Loading article...</p>
      </div>
    );

  if (error || !article)
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500">{error ?? "Article not found"}</p>
        <Link href="/" className="text-orange-600 mt-2 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );

  const authorName = article?.author?.username ?? "Unknown";

  const renderContent = (blocks: any[]) =>
    blocks.map((block, i) => {
      if (block.type === "paragraph") {
        return (
          <p key={i} className="mb-4 text-lg leading-relaxed text-gray-800">
            {block.value}
          </p>
        );
      }
      if (block.type === "image" && block.value) {
        return (
          <div key={i} className="mb-6">
            <img 
              src={block.value} 
              alt={block.caption || "Article image"} 
              className="w-full h-auto rounded-lg"
            />
            {block.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">{block.caption}</p>
            )}
          </div>
        );
      }
      return null;
    });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-orange-600 hover:underline mb-4 inline-block">
        ← Back to home
      </Link>

      <h1 className="text-4xl font-bold mb-2">{article.title}</h1>

      <div className="text-gray-500 text-sm mb-6 flex items-center gap-2">
        <span>By {authorName}</span>•{" "}
        <span>{new Date(article.created_at).toLocaleString()}</span>
        {article.category && (
          <>
            • <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{article.category}</span>
          </>
        )}
        <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-medium">
          {article.status?.toUpperCase() ?? "DRAFT"}
        </span>
      </div>

      <article className="prose max-w-none mb-8">
        {Array.isArray(article.content) 
          ? renderContent(article.content) 
          : <p className="text-lg leading-relaxed text-gray-800">{article.content}</p>
        }
      </article>

      {/* Interaction Buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleToggleLike}
          className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-colors ${
            liked 
              ? "bg-red-600 text-white border-red-600" 
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} /> 
          {likesCount}
        </button>

        <button
          onClick={handleToggleSave}
          className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-colors ${
            saved 
              ? "bg-orange-600 text-white border-orange-600" 
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} /> 
          {saved ? "Saved" : "Save"}
        </button>

        <div className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 flex items-center gap-2">
          <MessageCircle size={18} /> {commentsCount} comments
        </div>
      </div>

      {/* Comments Section */}
      <section className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Comments ({commentsCount})</h2>

        <form onSubmit={handleAddComment} className="flex gap-3 mb-8">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
          />
          <button 
            type="submit" 
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            disabled={!newComment.trim()}
          >
            Post
          </button>
        </form>

        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.author?.username || "Anonymous"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}