"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, UploadCloud, CheckCircle, Image as ImageIcon, Type, Sun, Moon, Bold, Italic, Underline, Palette, Eye } from "lucide-react";

// Custom hook for auto-resizing textareas with formatting
const AutoResizeTextarea = ({ value, onChange, placeholder, className, onFormat, blockIndex }) => {
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
          case 'b':
            e.preventDefault();
            onFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            onFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            onFormat('underline');
            break;
          case 'h':
            e.preventDefault();
            onFormat('heading');
            break;
        }
      }
    };
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
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
          onClick={() => handleFormat('bold')}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            hasSelection()
              ? 'bg-[#f97316] text-white hover:bg-[#ea580c]'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
          } disabled:opacity-50`}
          title="Bold (⌘B)"
          disabled={!hasSelection()}
          aria-label="Toggle bold formatting"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            hasSelection()
              ? 'bg-[#f97316] text-white hover:bg-[#ea580c]'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
          } disabled:opacity-50`}
          title="Italic (⌘I)"
          disabled={!hasSelection()}
          aria-label="Toggle italic formatting"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('underline')}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            hasSelection()
              ? 'bg-[#f97316] text-white hover:bg-[#ea580c]'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
          } disabled:opacity-50`}
          title="Underline (⌘U)"
          disabled={!hasSelection()}
          aria-label="Toggle underline formatting"
        >
          <Underline size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('heading')}
          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            hasSelection()
              ? 'bg-[#f97316] text-white hover:bg-[#ea580c]'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
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
                ? 'bg-slate-700 text-white hover:bg-slate-600'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            } disabled:opacity-50`}
            title="Text Color"
            disabled={!hasSelection()}
            aria-label="Select text color"
          >
            <Palette size={16} />
          </button>
          <div className="absolute left-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 grid grid-cols-5 gap-3 min-w-[200px]">
            <div className="col-span-5 text-xs text-slate-400 font-medium mb-2">Text Color</div>
            {[
              { color: '#ffffff', name: 'White' },
              { color: '#ef4444', name: 'Red' },
              { color: '#f59e0b', name: 'Amber' },
              { color: '#10b981', name: 'Green' },
              { color: '#3b82f6', name: 'Blue' },
              { color: '#8b5cf6', name: 'Purple' },
              { color: '#ec4899', name: 'Pink' },
              { color: '#000000', name: 'Black' },
              { color: '#94a3b8', name: 'Gray' },
              { color: '#f97316', name: 'Orange' },
            ].map(({ color, name }) => (
              <button
                key={color}
                type="button"
                className="w-7 h-7 rounded-full border border-slate-600 hover:scale-110 transition-transform relative group/color"
                style={{ backgroundColor: color }}
                onClick={() => handleFormat('color', color)}
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
            const event = new Event('input', { bubbles: true });
            textareaRef.current?.dispatchEvent(event);
          }, 0);
        }}
      />
    </div>
  );
};

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Author");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [articleContent, setArticleContent] = useState([{ type: "paragraph", value: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);

  // Formatting functions
  const wrapSelection = (prefix, suffix = prefix) => {
    const textarea = document.activeElement;
    if (!textarea || textarea.tagName !== 'TEXTAREA') return null;
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
      case 'bold':
        formatResult = wrapSelection('**', '**');
        break;
      case 'italic':
        formatResult = wrapSelection('*', '*');
        break;
      case 'underline':
        formatResult = wrapSelection('<u>', '</u>');
        break;
      case 'color':
        if (value) {
          formatResult = wrapSelection(`<span style="color: ${value}">`, '</span>');
        }
        break;
      case 'heading':
        formatResult = wrapSelection('# ', '\n');
        break;
      default:
        return;
    }
    return formatResult;
  };

  const handleFormat = (blockIndex, formatType, value = null) => {
    const formatResult = applyFormatting(formatType, value);
    if (formatResult) {
      const updatedContent = [...articleContent];
      updatedContent[blockIndex].value = formatResult.newText;
      setArticleContent(updatedContent);
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        if (textareas[blockIndex]) {
          const textarea = textareas[blockIndex];
          textarea.focus();
          textarea.setSelectionRange(formatResult.newSelectionStart, formatResult.newSelectionEnd);
        }
      }, 0);
    }
  };

  // Fetch profile to set author
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) return;
    const endpoints = ["http://127.0.0.1:8000/auth/profile/"];
    let mounted = true;

    (async () => {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const raw = await res.text();
          console.log("[profile] tried", url, "status", res.status, "raw:", raw);
          let json = {};
          try {
            json = raw ? JSON.parse(raw) : {};
          } catch (_) {
            json = {};
          }
          if (!res.ok) continue;
          const userObj = json?.data?.user ?? json?.user ?? json?.data ?? null;
          if (userObj && (userObj.username || userObj.email || userObj.profileUrl)) {
            if (!mounted) return;
            setAuthor(userObj.username ?? userObj.email ?? "Author");
            return;
          }
        } catch (err) {
          console.warn("[profile] error:", err);
          continue;
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Content helpers
  const handleContentChange = (index, newValue) => {
    const updatedContent = [...articleContent];
    updatedContent[index].value = newValue;
    setArticleContent(updatedContent);
  };

  const handleImageCaptionChange = (index, caption) => {
    const updatedContent = [...articleContent];
    updatedContent[index].caption = caption;
    setArticleContent(updatedContent);
  };

  // Image upload
  const handleImageFileChange = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid image format. Please use JPEG, PNG, GIF, or WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size too large. Please use images under 5MB.");
      return;
    }

    setUploadingImages(prev => new Set(prev).add(`image-${index}`));
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        setErrorMsg("Please log in to upload images.");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      const uploadResponse = await fetch("http://127.0.0.1:8000/api/articles/upload-image/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message || "Failed to upload image");
      }
      if (uploadResult.success) {
        const updatedContent = [...articleContent];
        updatedContent[index] = {
          ...updatedContent[index],
          value: uploadResult.data.url,
          caption: updatedContent[index].caption || "",
          public_id: uploadResult.data.public_id,
          uploaded: true,
        };
        setArticleContent(updatedContent);
      } else {
        throw new Error(uploadResult.message || "Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setErrorMsg(`Failed to upload image: ${error.message}`);
      const updatedContent = [...articleContent];
      updatedContent[index] = {
        ...updatedContent[index],
        value: "",
        caption: updatedContent[index].caption || "",
      };
      setArticleContent(updatedContent);
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(`image-${index}`);
        return newSet;
      });
    }
  };

  useEffect(() => {
    return () => {
      articleContent.forEach((block) => {
        if (block.type === "image" && block.value && block.value.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(block.value);
          } catch {}
        }
      });
    };
  }, [articleContent]);

  const addBlock = (type, index) => {
    const newBlock = type === "paragraph"
      ? { type: "paragraph", value: "" }
      : { type: "image", value: "", caption: "", uploaded: false };
    const updatedContent = [...articleContent];
    updatedContent.splice(index + 1, 0, newBlock);
    setArticleContent(updatedContent);
  };

  const removeBlock = (index) => {
    if (articleContent.length > 1) {
      const blockToRemove = articleContent[index];
      if (blockToRemove.type === "image" && blockToRemove.value && blockToRemove.value.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(blockToRemove.value);
        } catch {}
      }
      const updatedContent = articleContent.filter((_, i) => i !== index);
      setArticleContent(updatedContent);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && currentTag.trim() !== "" && !tags.includes(currentTag.trim())) {
      e.preventDefault();
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Markdown to HTML conversion for preview
  const renderHTMLContent = (content) => {
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/<span style="color: (.*?)">(.*?)<\/span>/g, '<span style="color: $1">$2</span>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\n/g, '<br>');
    return { __html: html };
  };

  // Publish article
  const handlePublish = async () => {
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg("Please provide an article title.");
      return;
    }
    if (!category.trim()) {
      setErrorMsg("Please provide a category.");
      return;
    }
    if (uploadingImages.size > 0) {
      setErrorMsg("Please wait for all images to finish uploading.");
      return;
    }
    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        setErrorMsg("Not authenticated — please login.");
        setSubmitting(false);
        return;
      }
      const contentToSend = articleContent
        .map((block) => {
          if (block.type === "paragraph") {
            return { type: "paragraph", value: block.value || "" };
          }
          if (block.type === "image") {
            return {
              type: "image",
              value: block.value || "",
              caption: block.caption || "",
            };
          }
          return null;
        })
        .filter(block => block !== null);
      const payload = {
        title: title.trim(),
        content: contentToSend,
        category: category.trim(),
        tags: tags,
        author: author.trim() || "Anonymous",
      };
      const BASE_API = "http://127.0.0.1:8000/";
      const createUrl = `${BASE_API}api/articles/create/`;
      const res = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      console.log("[create article] status:", res.status, "raw:", raw);
      let json = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch (e) {
        json = {};
      }
      if (!res.ok) {
        const msg = json?.message || json?.detail || `Failed to create article (status ${res.status})`;
        setErrorMsg(msg);
        setSubmitting(false);
        return;
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setTitle("");
      setCategory("");
      setTags([]);
      setCurrentTag("");
      setArticleContent([{ type: "paragraph", value: "" }]);
    } catch (err) {
      console.error("Publish error:", err);
      setErrorMsg("Network error while publishing. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg("Please provide an article title to save as draft.");
      return;
    }
    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        setErrorMsg("Not authenticated — please login.");
        setSubmitting(false);
        return;
      }
      const contentToSend = articleContent
        .map((block) => {
          if (block.type === "paragraph") {
            return { type: "paragraph", value: block.value || "" };
          }
          if (block.type === "image") {
            return {
              type: "image",
              value: block.value || "",
              caption: block.caption || "",
            };
          }
          return null;
        })
        .filter(block => block !== null);
      const payload = {
        title: title.trim(),
        content: contentToSend,
        category: category.trim() || "General",
        tags: tags,
        author: author.trim() || "Anonymous",
        status: "draft",
        published: false,
      };
      const BASE_API = "http://127.0.0.1:8000/";
      const createUrl = `${BASE_API}api/articles/create/`;
      const res = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let json = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch (e) {
        json = {};
      }
      if (!res.ok) {
        const msg = json?.message || json?.detail || `Failed to save draft (status ${res.status})`;
        setErrorMsg(msg);
        setSubmitting(false);
        return;
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Save draft error:", err);
      setErrorMsg("Network error while saving draft. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Theme-based classes
  const themeClasses = {
    bg: theme === 'dark' ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-gradient-to-b from-gray-50 to-gray-100',
    text: theme === 'dark' ? 'text-white' : 'text-slate-800',
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    inputBg: theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80',
    inputBorder: theme === 'dark' ? 'border-slate-700' : 'border-gray-300',
    focusRing: theme === 'dark' ? 'focus:ring-[#f97316]' : 'focus:ring-[#f97316]',
    previewBg: theme === 'dark' ? 'bg-gradient-to-b from-slate-950 to-slate-900' : 'bg-gradient-to-b from-gray-100 to-gray-200',
    previewBorder: theme === 'dark' ? 'border-slate-800' : 'border-gray-200',
  };

  // Inject custom styles
  useEffect(() => {
    const styleId = "custom-animations";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes slide-in {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-out {
          0% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px); }
        }
        @keyframes scale-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slide-out 0.3s ease-in;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <>
      {showSuccess && (
        <div className="fixed top-24 right-8 bg-green-500 text-white py-4 px-6 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle size={24} />
          <span className="font-medium">Article published successfully!</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-24 right-8 bg-red-500 text-white py-4 px-6 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-slide-in">
          <span className="font-medium">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-white hover:text-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`fixed top-6 right-8 z-50 p-3 rounded-full transition-colors ${
          theme === "dark" ? "bg-slate-700 hover:bg-slate-600" : "bg-white hover:bg-gray-200 shadow"
        }`}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-600" />}
      </button>
      <button
        onClick={() => setShowPreview(!showPreview)}
        className={`md:hidden fixed top-20 right-8 z-50 p-3 rounded-full transition-colors ${
          theme === "dark" ? "bg-slate-700 hover:bg-slate-600" : "bg-white hover:bg-gray-200 shadow"
        }`}
        aria-label={showPreview ? "Hide preview" : "Show preview"}
      >
        {showPreview ? <X size={20} /> : <Eye size={20} />}
      </button>
      <div className={`min-h-screen font-sans grid grid-cols-1 md:grid-cols-2 ${themeClasses.bg} ${themeClasses.text}`}>
        {/* Editor Side */}
        <div className="p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className={`text-3xl font-bold mb-8 border-l-4 border-[#f97316] pl-4`}>Create New Article</h1>
            <div className="mb-6">
              <label htmlFor="title" className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Article Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Future of..."
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition shadow-md hover:shadow-lg`}
                aria-label="Article title"
              />
            </div>
            {/* Dynamic Content Blocks */}
            <div className="space-y-6 mb-6">
              <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Content</label>
              <AnimatePresence>
                {articleContent.map((block, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="group relative"
                  >
                    {block.type === "paragraph" ? (
                      <AutoResizeTextarea
                        value={block.value}
                        onChange={(e) => handleContentChange(index, e.target.value)}
                        onFormat={(formatType, value) => handleFormat(index, formatType, value)}
                        blockIndex={index}
                        placeholder="Start writing a paragraph..."
                        className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg p-4 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition resize-none overflow-hidden min-h-[120px]`}
                      />
                    ) : (
                      <div
                        className={`p-4 border ${themeClasses.inputBorder} rounded-xl ${themeClasses.inputBg} space-y-3 shadow-md transition-all duration-200 hover:shadow-lg`}
                      >
                        <label className={`text-xs font-semibold ${themeClasses.textMuted}`}>
                          IMAGE BLOCK
                          {uploadingImages.has(`image-${index}`) && (
                            <span className="ml-2 text-[#f97316] animate-pulse">Uploading...</span>
                          )}
                          {block.uploaded && (
                            <span className="ml-2 text-green-500">✓ Uploaded</span>
                          )}
                        </label>
                        {!block.value && !uploadingImages.has(`image-${index}`) && (
                          <label
                            htmlFor={`image-upload-${index}`}
                            className={`w-full flex flex-col justify-center items-center gap-2 p-6 border-2 border-dashed ${themeClasses.inputBorder} rounded-lg cursor-pointer transition-all hover:bg-slate-700/50 hover:border-[#f97316] animate-scale-in`}
                          >
                            <UploadCloud size={24} className={themeClasses.textMuted} />
                            <span className="text-sm font-semibold">Choose a file</span>
                            <span className="text-xs text-slate-500">JPEG, PNG, GIF, WebP (max 5MB)</span>
                          </label>
                        )}
                        {uploadingImages.has(`image-${index}`) && (
                          <div className="w-full space-y-3">
                            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div className="bg-[#f97316] h-full animate-pulse" style={{ width: '75%' }}></div>
                            </div>
                            <div className="flex justify-center items-center gap-2 p-6 border-2 border-dashed border-[#f97316] rounded-lg">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
                              <span className="text-sm font-semibold">Uploading image...</span>
                            </div>
                          </div>
                        )}
                        <input
                          id={`image-upload-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(index, e)}
                          disabled={uploadingImages.has(`image-${index}`)}
                          aria-label="Upload image"
                        />
                        {block.value && !uploadingImages.has(`image-${index}`) && (
                          <div className="mt-2 animate-scale-in">
                            <img
                              src={block.value}
                              alt="Selected preview"
                              className="w-full max-h-96 rounded-lg object-cover shadow-md"
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) => handleImageCaptionChange(index, e.target.value)}
                          placeholder="Optional: Image caption"
                          className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${themeClasses.focusRing} transition`}
                          disabled={uploadingImages.has(`image-${index}`)}
                          aria-label="Image caption"
                        />
                      </div>
                    )}
                    <div className="absolute -right-12 top-8 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => addBlock("paragraph", index)}
                        className={`p-2 rounded-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} hover:bg-opacity-80`}
                        title="Add Paragraph Below"
                        disabled={uploadingImages.has(`image-${index}`)}
                        aria-label="Add paragraph below"
                      >
                        <Type size={16} />
                      </button>
                      <button
                        onClick={() => addBlock("image", index)}
                        className={`p-2 rounded-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} hover:bg-opacity-80`}
                        title="Add Image Below"
                        disabled={uploadingImages.has(`image-${index}`)}
                        aria-label="Add image below"
                      >
                        <ImageIcon size={16} />
                      </button>
                      <button
                        onClick={() => removeBlock(index)}
                        className={`p-2 rounded-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} text-red-500`}
                        title="Remove Block"
                        disabled={uploadingImages.has(`image-${index}`)}
                        aria-label="Remove block"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mb-6">
              <label htmlFor="author" className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Author</label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition shadow-md hover:shadow-lg`}
                aria-label="Author name"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="category" className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Category</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Technology, Science, Business"
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition shadow-md hover:shadow-lg`}
                aria-label="Article category"
              />
            </div>
            <div className="mb-8">
              <label htmlFor="tags" className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Tags (press Enter to add)</label>
              <div className={`flex flex-wrap items-center gap-2 ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg p-2`}>
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-2 bg-[#0891b2]/50 text-[#0891b2] px-3 py-1 rounded-full text-sm">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white"
                      aria-label={`Remove ${tag} tag`}
                    ><X size={14} /></button>
                  </span>
                ))}
                <input
                  type="text"
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add a tag"
                  className="bg-transparent focus:outline-none p-1 flex-grow"
                  aria-label="Add tags"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={handleSaveDraft}
                disabled={submitting || uploadingImages.size > 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#0891b2] hover:bg-[#0e7490] rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                aria-label="Save as draft"
              >
                <UploadCloud size={18} />
                <span>{submitting ? "Saving..." : "Save as Draft"}</span>
              </button>
              <button
                onClick={handlePublish}
                disabled={submitting || uploadingImages.size > 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                aria-label="Publish article"
              >
                <span>{submitting ? "Publishing..." : "Publish Article"}</span>
              </button>
            </div>
          </div>
        </div>
        {/* Preview Side */}
        <div className={`${themeClasses.previewBg} p-8 lg:p-12 overflow-y-auto ${showPreview ? 'block' : 'hidden md:block'} border-l ${themeClasses.previewBorder}`}>
          <h2 className={`text-xl font-bold ${themeClasses.textMuted} mb-6 uppercase tracking-wider`}>Live Preview</h2>
          <article className={`prose ${theme === "dark" ? "prose-invert" : ""} prose-lg max-w-none`}>
            <h1>{title || "Your Article Title"}</h1>
            <div className={`flex items-center space-x-4 text-sm ${themeClasses.textMuted} mb-4`}>
              <span>By {author || "Author Name"}</span><span>•</span>
              <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              {category && <span>•</span>}
              {category && <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded-full text-xs">{category}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 my-4">
              {tags.map((tag) => (
                <span key={tag} className="bg-[#0891b2]/50 text-[#0891b2] px-3 py-1 rounded-full text-sm">#{tag}</span>
              ))}
            </div>
            <div className="whitespace-pre-wrap">
              {articleContent.map((block, index) => {
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