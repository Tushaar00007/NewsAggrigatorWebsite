"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Upload, Trash2, MoveUp, MoveDown, Sun, Moon, Plus, X, UploadCloud, ImageIcon, Type, Bold, Italic, Underline, Palette } from "lucide-react";

// Custom hook for auto-resizing textareas with formatting
const AutoResizeTextarea = ({ value, onChange, onFormat, placeholder, className, blockIndex }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            onFormat("bold");
            break;
          case "i":
            e.preventDefault();
            onFormat("italic");
            break;
          case "u":
            e.preventDefault();
            onFormat("underline");
            break;
          case "h":
            e.preventDefault();
            onFormat("heading");
            break;
        }
      }
    };
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("keydown", handleKeyDown);
      return () => textarea.removeEventListener("keydown", handleKeyDown);
    }
  }, [onFormat]);

  const handleFormat = (formatType, value = null) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    onFormat(formatType, value);
  };

  const hasSelection = () => {
    const textarea = textareaRef.current;
    return textarea && textarea.selectionStart !== textarea.selectionEnd;
  };

  return (
    <div className="relative mb-4">
      {/* Sticky Formatting Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-2 mb-4 p-3 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 shadow-lg">
        <button
          type="button"
          onClick={() => handleFormat("bold")}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            hasSelection()
              ? "bg-[#f97316] text-white hover:bg-[#ea580c]"
              : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
          } disabled:opacity-50`}
          title="Bold (⌘B)"
          disabled={!hasSelection()}
          aria-label="Toggle bold formatting"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat("italic")}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            hasSelection()
              ? "bg-[#f97316] text-white hover:bg-[#ea580c]"
              : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
          } disabled:opacity-50`}
          title="Italic (⌘I)"
          disabled={!hasSelection()}
          aria-label="Toggle italic formatting"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat("underline")}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            hasSelection()
              ? "bg-[#f97316] text-white hover:bg-[#ea580c]"
              : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
          } disabled:opacity-50`}
          title="Underline (⌘U)"
          disabled={!hasSelection()}
          aria-label="Toggle underline formatting"
        >
          <Underline size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat("heading")}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            hasSelection()
              ? "bg-[#f97316] text-white hover:bg-[#ea580c]"
              : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
          } disabled:opacity-50`}
          title="Heading (⌘H)"
          disabled={!hasSelection()}
          aria-label="Toggle heading formatting"
        >
          <Type size={16} />
        </button>
        <div className="w-px h-6 bg-slate-600 mx-2"></div>
        <div className="relative group">
          <button
            type="button"
            className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              hasSelection()
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            } disabled:opacity-50`}
            title="Text Color"
            disabled={!hasSelection()}
            aria-label="Select text color"
          >
            <Palette size={16} />
          </button>
          <div className="absolute left-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 grid grid-cols-5 gap-3 min-w-[200px]">
            {[
              { color: "#ffffff", name: "White" },
              { color: "#ef4444", name: "Red" },
              { color: "#f59e0b", name: "Amber" },
              { color: "#10b981", name: "Green" },
              { color: "#3b82f6", name: "Blue" },
              { color: "#8b5cf6", name: "Purple" },
              { color: "#ec4899", name: "Pink" },
              { color: "#000000", name: "Black" },
              { color: "#94a3b8", name: "Gray" },
              { color: "#f97316", name: "Orange" },
            ].map(({ color, name }) => (
              <button
                key={color}
                type="button"
                className="w-7 h-7 rounded-full border border-slate-600 hover:scale-110 transition-transform relative group/color"
                style={{ backgroundColor: color }}
                onClick={() => handleFormat("color", color)}
                title={name}
                aria-label={`Select ${name} color`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap">
                  {name}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto text-xs text-slate-500">⌘B, ⌘I, ⌘U, ⌘H</div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} rounded-xl shadow-md transition-all duration-200 hover:shadow-lg focus:shadow-xl`}
        rows={1}
        onSelect={() => {
          setTimeout(() => {
            const event = new Event("input", { bubbles: true });
            textareaRef.current?.dispatchEvent(event);
          }, 0);
        }}
      />
    </div>
  );
};

interface User {
  id: string;
  username: string;
  email: string;
}

interface ContentBlock {
  type: "paragraph" | "image";
  value: string;
  caption?: string;
  public_id?: string;
}

interface Article {
  id: string;
  title: string;
  content: ContentBlock[];
  author: User;
  media: string[];
  category: string;
  published: boolean;
  status: "draft" | "published" | "deleted";
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [category, setCategory] = useState<string>("");
  const [published, setPublished] = useState<boolean>(false);
  const [status, setStatus] = useState<"draft" | "published" | "deleted">("draft");
  const [theme, setTheme] = useState("dark");
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const getAuthToken = (): string | null => {
    const possibleKeys = ["token", "authToken", "accessToken", "jwtToken"];
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) return token;
    }
    return null;
  };

  const fetchArticle = async (): Promise<void> => {
    try {
      const token = getAuthToken();
      const response = await axios.get<ApiResponse<{ article: Article }>>(
        `http://localhost:8000/api/articles/get-by-id/?id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const articleData = response.data.data.article;
        setArticle(articleData);
        setTitle(articleData.title);
        setContent(articleData.content);
        setCategory(articleData.category);
        setPublished(articleData.published);
        setStatus(articleData.status);
      }
    } catch (error) {
      setError("Failed to load article");
      console.error("Error fetching article:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (saveAsDraft: boolean = true): Promise<void> => {
    if (!id) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const updateData = {
        id: id,
        title: title,
        content: content,
        category: category,
        published: saveAsDraft ? false : true,
        status: saveAsDraft ? "draft" : "published",
      };

      const response = await axios.put<ApiResponse<{ article: Article }>>(
        "http://localhost:8000/api/articles/update/",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess(`Article ${saveAsDraft ? "saved as draft" : "published"} successfully!`);
        if (!saveAsDraft) {
          setTimeout(() => router.push("/journalist-dashboard"), 2000);
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update article");
      console.error("Error updating article:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (index: number, field: "value" | "caption", value: string): void => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], [field]: value };
    setContent(newContent);
  };

  const wrapSelection = (prefix, suffix = prefix) => {
    const textarea = document.activeElement;
    if (!textarea || textarea.tagName !== "TEXTAREA") return null;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText.length === 0) {
      const newText = textarea.value.substring(0, start) + prefix + suffix + textarea.value.substring(end);
      return {
        newText,
        newSelectionStart: start + prefix.length,
        newSelectionEnd: start + prefix.length,
      };
    }

    const newText = textarea.value.substring(0, start) + prefix + selectedText + suffix + textarea.value.substring(end);
    return {
      newText,
      newSelectionStart: start + prefix.length,
      newSelectionEnd: end + prefix.length,
    };
  };

  const applyFormatting = (formatType, value = null) => {
    let formatResult = null;
    switch (formatType) {
      case "bold":
        formatResult = wrapSelection("**", "**");
        break;
      case "italic":
        formatResult = wrapSelection("*", "*");
        break;
      case "underline":
        formatResult = wrapSelection("<u>", "</u>");
        break;
      case "color":
        if (value) {
          formatResult = wrapSelection(`<span style="color: ${value}">`, "</span>");
        }
        break;
      case "heading":
        formatResult = wrapSelection("# ", "\n");
        break;
      default:
        return;
    }
    return formatResult;
  };

  const handleFormat = (index: number, formatType: string, value: string | null = null) => {
    const formatResult = applyFormatting(formatType, value);
    if (formatResult) {
      const updatedContent = [...content];
      updatedContent[index].value = formatResult.newText;
      setContent(updatedContent);
      setTimeout(() => {
        const textareas = document.querySelectorAll("textarea");
        if (textareas[index]) {
          const textarea = textareas[index];
          textarea.focus();
          textarea.setSelectionRange(formatResult.newSelectionStart, formatResult.newSelectionEnd);
        }
      }, 0);
    }
  };

  const handleAddParagraph = (): void => {
    setContent([...content, { type: "paragraph", value: "" }]);
  };

  const handleAddImage = (): void => {
    setContent([...content, { type: "image", value: "", caption: "" }]);
  };

  const handleRemoveBlock = (index: number): void => {
    const newContent = content.filter((_, i) => i !== index);
    setContent(newContent);
  };

  const handleImageUpload = async (index: number, file: File): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("image", file);

      setUploadingImages((prev) => new Set(prev).add(`image-${index}`));

      const uploadResponse = await axios.post<ApiResponse<{
        url: string;
        public_id: string;
        width: number;
        height: number;
        format: string;
      }>>("http://localhost:8000/api/articles/upload-image/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (uploadResponse.data.success) {
        const imageUrl = uploadResponse.data.data.url;
        handleContentChange(index, "value", imageUrl);
      }
    } catch (error) {
      setError("Failed to upload image");
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(`image-${index}`);
        return newSet;
      });
    }
  };

  const moveBlockUp = (index: number): void => {
    if (index === 0) return;
    const newContent = [...content];
    [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
    setContent(newContent);
  };

  const moveBlockDown = (index: number): void => {
    if (index === content.length - 1) return;
    const newContent = [...content];
    [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
    setContent(newContent);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Article not found</div>
      </div>
    );
  }

  // Theme-based classes
  const themeClasses = {
    bg: theme === "dark" ? "bg-slate-900" : "bg-gray-50",
    text: theme === "dark" ? "text-white" : "text-slate-800",
    textMuted: theme === "dark" ? "text-slate-400" : "text-slate-500",
    inputBg: theme === "dark" ? "bg-slate-800" : "bg-white",
    inputBorder: theme === "dark" ? "border-slate-700" : "border-gray-300",
    focusRing: theme === "dark" ? "focus:ring-orange-500" : "focus:ring-orange-500",
    previewBg: theme === "dark" ? "bg-slate-950" : "bg-gray-100",
    previewBorder: theme === "dark" ? "border-slate-800" : "border-gray-200",
  };

  // Markdown to HTML conversion for preview
  const renderHTMLContent = (content) => {
    let html = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/<span style="color: (.*?)">(.*?)<\/span>/g, '<span style="color: $1">$2</span>')
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      .replace(/\n/g, "<br>");
    return { __html: html };
  };

  return (
    <>
      {error && (
        <div className="fixed top-24 right-8 bg-red-500 text-white py-3 px-6 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-white hover:text-gray-200">
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="fixed top-24 right-8 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in-out">
          <span>{success}</span>
        </div>
      )}

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`fixed top-6 right-8 z-50 p-3 rounded-full transition-colors ${theme === "dark" ? "bg-slate-700 hover:bg-slate-600" : "bg-white hover:bg-gray-200 shadow"}`}
      >
        {theme === "dark" ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-600" />}
      </button>

      <div className={`min-h-screen font-sans grid grid-cols-1 md:grid-cols-2 ${themeClasses.bg} ${themeClasses.text}`}>
        {/* Editor Side */}
        <div className="p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className={`text-3xl font-bold mb-8 border-l-4 border-orange-500 pl-4`}>Edit Article</h1>

            <div className="mb-6">
              <label htmlFor="title" className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Article Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Future of..."
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition`}
              />
            </div>

            {/* Dynamic Content Blocks */}
            <div className="space-y-4 mb-6">
              <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Content</label>
              {content.map((block, index) => (
                <div key={index} className="group relative">
                  {block.type === "paragraph" ? (
                    <AutoResizeTextarea
                      value={block.value}
                      onChange={(e) => handleContentChange(index, "value", e.target.value)}
                      onFormat={(formatType, value) => handleFormat(index, formatType, value)}
                      blockIndex={index}
                      placeholder="Start writing a paragraph..."
                      className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg p-4 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition resize-none overflow-hidden min-h-[100px]`}
                    />
                  ) : (
                    <div className={`p-4 border ${themeClasses.inputBorder} rounded-lg ${themeClasses.inputBg} space-y-3`}>
                      <label className={`text-xs font-semibold ${themeClasses.textMuted}`}>
                        IMAGE BLOCK
                        {uploadingImages.has(`image-${index}`) && (
                          <span className="ml-2 text-orange-500">Uploading...</span>
                        )}
                      </label>

                      {!block.value && !uploadingImages.has(`image-${index}`) && (
                        <label
                          htmlFor={`image-upload-${index}`}
                          className={`w-full flex flex-col justify-center items-center gap-2 p-6 border-2 border-dashed ${themeClasses.inputBorder} rounded-lg cursor-pointer transition hover:bg-slate-700/50 hover:border-orange-500`}
                        >
                          <UploadCloud size={24} className={themeClasses.textMuted} />
                          <span className="text-sm font-semibold">Choose a file</span>
                          <span className="text-xs text-slate-500">JPEG, PNG, GIF, WebP (max 5MB)</span>
                        </label>
                      )}

                      {uploadingImages.has(`image-${index}`) && (
                        <div className={`w-full flex flex-col justify-center items-center gap-2 p-6 border-2 border-dashed border-orange-500 rounded-lg`}>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                          <span className="text-sm font-semibold">Uploading image...</span>
                        </div>
                      )}

                      <input
                        id={`image-upload-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(index, e.target.files[0]);
                          }
                        }}
                        disabled={uploadingImages.has(`image-${index}`)}
                      />

                      {block.value && !uploadingImages.has(`image-${index}`) && (
                        <div className="mt-2">
                          <img src={block.value} alt="Preview" className="w-full max-h-96 rounded-md object-cover" />
                        </div>
                      )}

                      <input
                        type="text"
                        value={block.caption || ""}
                        onChange={(e) => handleContentChange(index, "caption", e.target.value)}
                        placeholder="Optional: Image caption"
                        className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${themeClasses.focusRing} transition`}
                        disabled={uploadingImages.has(`image-${index}`)}
                      />
                    </div>
                  )}
                  <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleAddParagraph()}
                      className={`p-2 rounded-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} hover:bg-opacity-80`}
                      title="Add Paragraph Below"
                      disabled={uploadingImages.has(`image-${index}`)}
                    >
                      <Type size={16} />
                    </button>
                    <button
                      onClick={() => handleAddImage()}
                      className={`p-2 rounded-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} hover:bg-opacity-80`}
                      title="Add Image Below"
                      disabled={uploadingImages.has(`image-${index}`)}
                    >
                      <ImageIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveBlock(index)}
                      className={`p-2 rounded-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} text-red-500`}
                      title="Remove Block"
                      disabled={uploadingImages.has(`image-${index}`)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label htmlFor="category" className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Category</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Technology, Science, Business"
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition`}
              />
            </div>

            <div className="mb-8">
              <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published" | "deleted")}
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleSave(true)}
                disabled={saving || uploadingImages.size > 0}
                className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UploadCloud size={18} />
                <span>{saving ? "Saving..." : "Save as Draft"}</span>
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || uploadingImages.size > 0}
                className="flex items-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-semibold transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{saving ? "Publishing..." : "Publish Article"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className={`${themeClasses.previewBg} p-8 lg:p-12 overflow-y-auto border-l ${themeClasses.previewBorder} hidden md:block`}>
          <h2 className={`text-xl font-bold ${themeClasses.textMuted} mb-6 uppercase tracking-wider`}>Live Preview</h2>
          <article className={`prose ${theme === "dark" ? "prose-invert" : ""} prose-lg max-w-none`}>
            <h1>{title || "Your Article Title"}</h1>
            <div className={`flex items-center space-x-4 text-sm ${themeClasses.textMuted} mb-4`}>
              <span>By {article.author.username || "Author Name"}</span>
              <span>•</span>
              <span>{new Date(article.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              {category && <span>•</span>}
              {category && <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded-full text-xs">{category}</span>}
            </div>
            <div className="whitespace-pre-wrap">
              {content.map((block, index) => {
                if (block.type === "paragraph") {
                  return (
                    <div
                      key={index}
                      dangerouslySetInnerHTML={renderHTMLContent(block.value || (index === 0 ? "Your content will appear here..." : ""))}
                    />
                  );
                }
                if (block.type === "image" && block.value) {
                  return (
                    <figure key={index}>
                      <img src={block.value} alt={block.caption || "Article image"} className="rounded-lg object-cover w-full" />
                      {block.caption && <figcaption className="text-center text-sm italic mt-2">{block.caption}</figcaption>}
                    </figure>
                  );
                }
                return null;
              })}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

// Add CSS for the fade-in-out animation
if (typeof window !== "undefined") {
  const styleId = "fade-in-out-animation";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes fade-in-out {
        0% { opacity: 0; transform: translateY(-20px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
      }
      .animate-fade-in-out {
        animation: fade-in-out 3s ease-in-out forwards;
      }
    `;
    document.head.appendChild(style);
  }
}