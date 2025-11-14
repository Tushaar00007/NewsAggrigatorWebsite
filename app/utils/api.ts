// src/utils/api.ts
import type { Article } from "../types/article";

export type ArticlesResponse = {
  success: boolean;
  data: {
    articles: Article[];
    total: number;
  };
};

// Admin API Types
export type PendingArticle = {
  id: string;
  title: string;
  summary?: string;
  authorName?: string;
  createdAt?: string;
  status?: string;
  published?: boolean;
  category?: string;
};

export type UserCountsResponse = {
  success: boolean;
  data: {
    readersCount: number;
    journalistsCount: number;
  };
};

export type PendingArticlesResponse = {
  success: boolean;
  data: {
    articles: PendingArticle[];
    total: number;
  };
};

export type AdminActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const possibleKeys = ['authToken', 'token', 'accessToken', 'jwtToken', 'userToken'];
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }
  
  // Also check if token is stored in user object
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.token) return user.token;
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  return null;
}

// Helper function to create auth headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch("http://localhost:8000/api/articles/get/", {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  const json: ArticlesResponse = await res.json();

  if (!json.success) {
    throw new Error("API returned success: false");
  }

  return json.data.articles;
}

// ==================== ADMIN API FUNCTIONS ====================

/**
 * Get pending articles (admin only)
 */
export async function fetchPendingArticles(): Promise<PendingArticle[]> {
  const res = await fetch("http://localhost:8000/api/articles/admin/pending/", {
    method: "GET",
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  const json: PendingArticlesResponse = await res.json();

  if (!json.success) {
    throw new Error(json.message || "API returned success: false");
  }

  return json.data.articles;
}

/**
 * Get approved/published articles (admin only)
 */
export async function fetchApprovedArticles(): Promise<PendingArticle[]> {
  const res = await fetch("http://localhost:8000/api/articles/admin/approved/", {
    method: "GET",
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  const json: PendingArticlesResponse = await res.json();

  if (!json.success) {
    throw new Error(json.message || "API returned success: false");
  }

  return json.data.articles;
}

/**
 * Get user counts (readers and journalists) - admin only
 */
export async function fetchUserCounts(): Promise<{ readersCount: number; journalistsCount: number }> {
  const res = await fetch("http://localhost:8000/auth/admin/counts/", {
    method: "GET",
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  const json: UserCountsResponse = await res.json();

  if (!json.success) {
    throw new Error(json.message || "API returned success: false");
  }

  return json.data;
}

/**
 * Approve article(s) - admin only
 * Supports both single article approval and bulk approval
 */
export async function approveArticle(articleId: string): Promise<AdminActionResponse> {
  const res = await fetch("http://localhost:8000/api/articles/admin/approve/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ article_id: articleId }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  return await res.json();
}

/**
 * Bulk approve articles - admin only
 */
export async function bulkApproveArticles(articleIds: string[]): Promise<AdminActionResponse> {
  const res = await fetch("http://localhost:8000/api/articles/admin/approve/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ article_ids: articleIds }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  return await res.json();
}

/**
 * Reject article - admin only
 */
export async function rejectArticle(articleId: string): Promise<AdminActionResponse> {
  const res = await fetch("http://localhost:8000/api/articles/admin/reject/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ article_id: articleId }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  return await res.json();
}

/**
 * Delete article - admin only
 */
export async function deleteArticleAdmin(articleId: string): Promise<AdminActionResponse> {
  const res = await fetch(`http://localhost:8000/api/articles/admin/delete/?id=${articleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  return await res.json();
}

/**
 * Get saved articles for a user
 */
export async function fetchSavedArticles(userId: string): Promise<Array<{ article: Article; saved_at: string }>> {
  const res = await fetch(`http://localhost:8000/api/articles/get-saved-articles/?user_id=${userId}`, {
    method: "GET",
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error: ${res.status} ${txt}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "API returned success: false");
  }

  return json.data.saved_articles.map((item: any) => ({
    article: item.article,
    saved_at: item.saved_at,
  }));
}