// src/utils/api.ts
import type { Article } from "../types/article";

export type ArticlesResponse = {
  success: boolean;
  data: {
    articles: Article[];
    total: number;
  };
};

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