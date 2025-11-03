"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, UploadCloud, CheckCircle, Image as ImageIcon, Type, Sun, Moon } from "lucide-react";

// Custom hook for auto-resizing textareas
const AutoResizeTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      rows={1}
    />
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

  // Try to fetch profile to set author automatically
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) return;

    const endpoints = [
      "http://127.0.0.1:8000/auth/profile/",
    ];

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
          if (!res.ok) {
            // try next endpoint
            continue;
          }
          const userObj = (json as any)?.data?.user ?? (json as any)?.user ?? (json as any)?.data ?? null;
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
  const handleContentChange = (index: any, newValue: any) => {
    const updatedContent = [...articleContent];
    updatedContent[index].value = newValue;
    setArticleContent(updatedContent);
  };

  const handleImageCaptionChange = (index: any, caption: any) => {
    const updatedContent = [...articleContent];
    updatedContent[index].caption = caption;
    setArticleContent(updatedContent);
  };

  // Upload image to Cloudinary first, then update content
  const handleImageFileChange = async (index: any, event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid image format. Please use JPEG, PNG, GIF, or WebP.");
      return;
    }

    // Validate file size (max 5MB)
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

      // Create FormData for image upload
      const formData = new FormData();
      formData.append("image", file);

      // Upload to Cloudinary endpoint
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
        // Update the content block with Cloudinary URL
        const updatedContent = [...articleContent];
        updatedContent[index] = {
          ...updatedContent[index],
          value: uploadResult.data.url,
          caption: updatedContent[index].caption || "",
          public_id: uploadResult.data.public_id, // Store public_id for future reference
          uploaded: true
        };
        setArticleContent(updatedContent);
      } else {
        throw new Error(uploadResult.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Image upload error:", error);
      setErrorMsg(`Failed to upload image: ${error.message}`);
      
      // Clean up the failed upload
      const updatedContent = [...articleContent];
      updatedContent[index] = {
        ...updatedContent[index],
        value: "",
        caption: updatedContent[index].caption || ""
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
      // Cleanup blob URLs if any
      articleContent.forEach((block) => {
        if (block.type === "image" && block.value && block.value.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(block.value);
          } catch {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBlock = (type: any, index: any) => {
    const newBlock = type === "paragraph" 
      ? { type: "paragraph", value: "" } 
      : { type: "image", value: "", caption: "", uploaded: false };
    const updatedContent = [...articleContent];
    updatedContent.splice(index + 1, 0, newBlock);
    setArticleContent(updatedContent);
  };

  const removeBlock = (index: any) => {
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

  const handleAddTag = (e: any) => {
    if (e.key === "Enter" && currentTag.trim() !== "" && !tags.includes(currentTag.trim())) {
      e.preventDefault();
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: any) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Core: prepare and send FormData to backend
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

    // Check if any images are still uploading
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

      // Prepare content for backend
      const contentToSend = articleContent.map((block) => {
        if (block.type === "paragraph") {
          return { type: "paragraph", value: block.value || "" };
        }
        if (block.type === "image") {
          return { 
            type: "image", 
            value: block.value || "", 
            caption: block.caption || "" 
          };
        }
        return null;
      }).filter(block => block !== null);

      // Create JSON payload for the article
      const payload = {
        title: title.trim(),
        content: contentToSend,
        category: category.trim(),
        tags: tags,
        author: author.trim() || "Anonymous"
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
        const msg = (json as any)?.message || (json as any)?.detail || `Failed to create article (status ${res.status})`;
        setErrorMsg(msg);
        setSubmitting(false);
        return;
      }

      // Success path
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setTitle("");
      setCategory("");
      setTags([]);
      setCurrentTag("");
      setArticleContent([{ type: "paragraph", value: "" }]);

    } catch (err: any) {
      console.error("Publish error:", err);
      setErrorMsg("Network error while publishing. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Save as draft functionality
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

      // Prepare content for backend
      const contentToSend = articleContent.map((block) => {
        if (block.type === "paragraph") {
          return { type: "paragraph", value: block.value || "" };
        }
        if (block.type === "image") {
          return { 
            type: "image", 
            value: block.value || "", 
            caption: block.caption || "" 
          };
        }
        return null;
      }).filter(block => block !== null);

      const payload = {
        title: title.trim(),
        content: contentToSend,
        category: category.trim() || "General",
        tags: tags,
        author: author.trim() || "Anonymous",
        status: "draft",
        published: false
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
        const msg = (json as any)?.message || (json as any)?.detail || `Failed to save draft (status ${res.status})`;
        setErrorMsg(msg);
        setSubmitting(false);
        return;
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err: any) {
      console.error("Save draft error:", err);
      setErrorMsg("Network error while saving draft. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <>
      {showSuccess && (
        <div className="fixed top-24 right-8 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in-out">
          <CheckCircle size={24} />
          <span>Article published successfully!</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-24 right-8 bg-red-500 text-white py-3 px-6 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-white hover:text-gray-200">
            <X size={16} />
          </button>
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
            <h1 className={`text-3xl font-bold mb-8 border-l-4 border-orange-500 pl-4`}>Create New Article</h1>

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
              {articleContent.map((block, index) => (
                <div key={index} className="group relative">
                  {block.type === "paragraph" ? (
                    <AutoResizeTextarea
                      value={block.value}
                      onChange={(e) => handleContentChange(index, e.target.value)}
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
                        {block.uploaded && (
                          <span className="ml-2 text-green-500">✓ Uploaded</span>
                        )}
                      </label>
                      
                      {!block.value && !uploadingImages.has(`image-${index}`) && (
                        <label htmlFor={`image-upload-${index}`} className={`w-full flex flex-col justify-center items-center gap-2 p-6 border-2 border-dashed ${themeClasses.inputBorder} rounded-lg cursor-pointer transition hover:bg-slate-700/50 hover:border-orange-500`}>
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
                        onChange={(e) => handleImageFileChange(index, e)}
                        disabled={uploadingImages.has(`image-${index}`)}
                      />

                      {block.value && !uploadingImages.has(`image-${index}`) && (
                        <div className="mt-2">
                          <img src={block.value} alt="Selected preview" className="w-full max-h-96 rounded-md object-cover" />
                        </div>
                      )}

                      <input
                        type="text"
                        value={block.caption || ""}
                        onChange={(e) => handleImageCaptionChange(index, e.target.value)}
                        placeholder="Optional: Image caption"
                        className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${themeClasses.focusRing} transition`}
                        disabled={uploadingImages.has(`image-${index}`)}
                      />
                    </div>
                  )}
                  <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => addBlock("paragraph", index)} 
                      className={`p-2 rounded-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} hover:bg-opacity-80`} 
                      title="Add Paragraph Below"
                      disabled={uploadingImages.has(`image-${index}`)}
                    >
                      <Type size={16} />
                    </button>
                    <button 
                      onClick={() => addBlock("image", index)} 
                      className={`p-2 rounded-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} hover:bg-opacity-80`} 
                      title="Add Image Below"
                      disabled={uploadingImages.has(`image-${index}`)}
                    >
                      <ImageIcon size={16} />
                    </button>
                    <button 
                      onClick={() => removeBlock(index)} 
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
              <label htmlFor="author" className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Author</label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition`}
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
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition`}
              />
            </div>

            <div className="mb-8">
              <label htmlFor="tags" className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Tags (press Enter to add)</label>
              <div className={`flex flex-wrap items-center gap-2 ${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-lg p-2`}>
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-2 bg-cyan-600/50 text-cyan-200 px-3 py-1 rounded-full text-sm">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-white"><X size={14} /></button>
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
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={handleSaveDraft} 
                disabled={submitting || uploadingImages.size > 0}
                className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UploadCloud size={18} />
                <span>{submitting ? "Saving..." : "Save as Draft"}</span>
              </button>
              <button 
                onClick={handlePublish} 
                disabled={submitting || uploadingImages.size > 0}
                className="flex items-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-semibold transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{submitting ? "Publishing..." : "Publish Article"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className={`${themeClasses.previewBg} p-8 lg:p-12 overflow-y-auto hidden md:block border-l ${themeClasses.previewBorder}`}>
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
                <span key={tag} className="bg-cyan-800 text-cyan-200 px-3 py-1 rounded-full text-sm">#{tag}</span>
              ))}
            </div>
            <div className="whitespace-pre-wrap">
              {articleContent.map((block, index) => {
                if (block.type === "paragraph") {
                  return <p key={index}>{block.value || (index === 0 ? "Your content will appear here..." : "")}</p>;
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