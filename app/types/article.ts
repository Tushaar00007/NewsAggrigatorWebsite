// src/types/article.ts
export type ParagraphBlock = {
  type: "paragraph";
  value: string;
};

export type Author = {
  id: string;
  username: string;
  email: string;
};

export type Article = {
  id: string;
  title: string;
  content: ParagraphBlock[];
  author: Author;
  media: any[];
  category: string;
  published: boolean;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};