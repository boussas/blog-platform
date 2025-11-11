     
import { useState, useEffect, useRef, useCallback } from "react";
import type { Article } from "../../types";

declare global {
  interface Window {
    Quill: any;
  }
}

interface AdminPageProps {
  articles: Article[];

       
       
  addArticle: (
    articleData: Omit<Article, "id" | "_id" | "createdAt" | "updatedAt">
  ) => Promise<any>;

       
  updateArticle: (
    id: string | number,
    articleData: Partial<Article>
  ) => Promise<any>;
       

  deleteArticle: (id: string | number) => Promise<void>;
  onBack: () => void;
}

const AdminPage = ({
  articles,
  addArticle,
  updateArticle,
  deleteArticle,
  onBack,
}: AdminPageProps) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");      
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isSettingContentRef = useRef(false);

       
  useEffect(() => {
    if (!document.getElementById("quill-css")) {
      const link = document.createElement("link");
      link.id = "quill-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
      document.head.appendChild(link);
    }

    if (!window.Quill) {
      const script = document.createElement("script");
      script.src = "https://cdn.quilljs.com/1.3.6/quill.js";
      script.onload = () => {
        console.log("Quill loaded successfully");
      };
      document.head.appendChild(script);
    }
  }, []);

       
  const uploadImageToServer = async (file: File): Promise<string> => {
    const token = localStorage.getItem("authToken");
    console.log("Auth token exists:", !!token);

    if (!token) {
      throw new Error("You must be logged in to upload images");
    }

         
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File is too large. Maximum size is 5MB");
    }

         
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed"
      );
    }

    const formData = new FormData();
    formData.append("image", file);

    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Response status:", response.status);

           
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
             
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(
            errorData.message || `Upload failed: ${response.status}`
          );
        } catch (parseError) {
               
          throw new Error(
            responseText || `Upload failed with status ${response.status}`
          );
        }
      }

           
      const data = JSON.parse(responseText);
      console.log("Upload successful:", data);
      return data.imageUrl;
    } catch (error: any) {
      console.error("Upload error details:", error);
      throw error;
    }
  };

       
  const imageHandler = useCallback(() => {
    console.log("Image handler triggered");

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        console.log("No file selected");
        return;
      }

      console.log("File selected:", file.name, file.type, file.size);

      const range = quillRef.current?.getSelection(true);
      console.log("Cursor range:", range);

           
      setUploadingImage(true);

      try {
             
        console.log("Starting upload...");
        const imageUrl = await uploadImageToServer(file);
        console.log("Upload successful, URL:", imageUrl);

             
        if (range && quillRef.current) {
          quillRef.current.insertEmbed(range.index, "image", imageUrl);
          quillRef.current.setSelection(range.index + 1);
          console.log("Image inserted into editor");
        } else {
          console.error("No range or quill instance available");
        }
      } catch (error: any) {
        console.error("Image upload error:", error);
        alert(`Failed to upload image: ${error.message}`);
      } finally {
        setUploadingImage(false);
      }
    };

    input.click();
  }, [uploadImageToServer]);      

       
  const initializeQuill = useCallback(() => {
    if (editorRef.current && !quillRef.current && window.Quill) {
      console.log("Initializing Quill editor");

      quillRef.current = new window.Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your article content here...",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              ["blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ color: [] }, { background: [] }],
              [{ align: [] }],
              ["link", "image", "video"],
              ["clean"],
            ],
            handlers: {
              image: imageHandler,
            },
          },
        },
      });

      console.log("Quill editor initialized successfully");
    }
  }, [imageHandler]);

       
  useEffect(() => {
    if (editingArticle) {
      setTitle(editingArticle.title);
      setImageUrl(editingArticle.imageUrl);
      setTags(editingArticle.tags?.join(", ") || "");      
      setFeaturedImagePreview(editingArticle.imageUrl);
      setFeaturedImageFile(null);
      setIsFormVisible(true);

           
      setTimeout(() => {
        if (quillRef.current) {
          isSettingContentRef.current = true;
          quillRef.current.root.innerHTML = editingArticle.body;
          quillRef.current.enable();
          setTimeout(() => {
            isSettingContentRef.current = false;
          }, 50);
        }
      }, 100);
    }
  }, [editingArticle]);

       
  useEffect(() => {
    if (
      isFormVisible &&
      !quillRef.current &&
      window.Quill &&
      editorRef.current
    ) {
      initializeQuill();
    }
  }, [isFormVisible, initializeQuill]);

       
  const handleCreateClick = () => {
    setEditingArticle(null);
    setTitle("");
    setImageUrl("");
    setTags("");      
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    setError(null);

    setTimeout(() => {
      if (quillRef.current) {
        quillRef.current.setText("");
        quillRef.current.enable();
      } else if (window.Quill && editorRef.current) {
        initializeQuill();
      }
    }, 0);

    setIsFormVisible(true);
  };

       
  const handleEditClick = (article: Article) => {
    setError(null);
    setEditingArticle(article);
  };

       
  const handleDeleteClick = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteArticle(id);
      } catch (error) {
        console.error("Failed to delete article:", error);
        alert("Failed to delete article. Please try again.");
      }
    }
  };

       
  const handleCancel = () => {
    setEditingArticle(null);
    setIsFormVisible(false);
    setTitle("");
    setImageUrl("");
    setTags("");      
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    setError(null);
    if (quillRef.current) {
      quillRef.current.setText("");
    }
  };

       
  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

         
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Featured image is too large. Maximum size is 5MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed"
      );
      return;
    }

    setFeaturedImageFile(file);
    setError(null);

         
    const reader = new FileReader();
    reader.onloadend = () => {
      setFeaturedImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

       
  const handleRemoveFeaturedImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    setImageUrl("");
  };

       
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log("=== SUBMIT STARTED ===");

    if (!quillRef.current) {
      setError("Editor not initialized");
      return;
    }

    const htmlBody = quillRef.current.root.innerHTML;
    const plainTextBody = quillRef.current.getText().trim();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!plainTextBody) {
      setError("Article body is required");
      return;
    }
    if (!featuredImageFile && !imageUrl.trim()) {
      setError("Featured image is required");
      return;
    }

         
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())      
      .filter((tag) => tag.length > 0);      

    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

           
      if (featuredImageFile) {
        console.log("Uploading featured image...");
        setUploadingFeaturedImage(true);
        try {
          finalImageUrl = await uploadImageToServer(featuredImageFile);
          console.log("Featured image uploaded:", finalImageUrl);
        } catch (error: any) {
          console.error("Featured image upload error:", error);
          setError(`Failed to upload featured image: ${error.message}`);
          setIsSubmitting(false);
          setUploadingFeaturedImage(false);
          return;
        }
        setUploadingFeaturedImage(false);
      }

           
      if (editingArticle) {
        console.log("Updating article:", editingArticle.id);

             
        const articleData: Partial<Article> = {
          title,
          body: htmlBody,
          imageUrl: finalImageUrl,
          tags: tagsArray,
        };

        const result = await updateArticle(editingArticle.id, articleData);
        console.log("Update result:", result);
      } else {
        console.log("Creating new article...");

             
        const articleData: Omit<
          Article,
          "id" | "_id" | "createdAt" | "updatedAt"
        > = {
          title,
          body: htmlBody,
          imageUrl: finalImageUrl,
          tags: tagsArray,
        };

        const result = await addArticle(articleData);
        console.log("Create result:", result);
      }
           

      console.log("Article saved successfully!");
      handleCancel();
    } catch (error: any) {
      console.error("Failed to save article:", error);
      setError(error.message || "Failed to save article. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadingFeaturedImage(false);
    }
  };

  const safeArticles = Array.isArray(articles) ? articles : [];

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-indigo-500 hover:text-indigo-700 mb-6 inline-block font-semibold bg-transparent border-none cursor-pointer p-0"
      >
        &larr; Back to All Articles
      </button>

      {     }
      {(uploadingImage || uploadingFeaturedImage) && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>
              {uploadingFeaturedImage
                ? "Uploading featured image..."
                : "Uploading image..."}
            </span>
          </div>
        </div>
      )}

      {isFormVisible ? (
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
            {editingArticle ? "Edit Article" : "Create New Article"}
          </h2>

          {     }
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-md">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {     }
            <div>
              <label
                htmlFor="title"
                className="block text-md font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-md"
                placeholder="Enter article title"
                required
                disabled={isSubmitting}
              />
            </div>

            {     }
            <div>
              <label
                htmlFor="tags"
                className="block text-md font-medium text-gray-700"
              >
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-md"
                placeholder="e.g., react, typescript, nodejs"
                disabled={isSubmitting}
              />
              <p className="mt-2 text-xs text-gray-500">
                Separate tags with a comma.
              </p>
            </div>

            {     }
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Upload an image or provide a URL. This will be displayed on the
                article list.
              </p>

              {     }
              {featuredImagePreview && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={featuredImagePreview}
                    alt="Featured preview"
                    className="w-full max-w-sm h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFeaturedImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {     }
              <div className="mb-3">
                <label className="block">
                  <div className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-md text-gray-600">
                        <span className="font-semibold text-indigo-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, WEBP up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFeaturedImageChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </label>
              </div>

              {     }
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-md">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {     }
              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-md font-medium text-gray-700 mb-1"
                >
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value) {
                      setFeaturedImagePreview(e.target.value);
                      setFeaturedImageFile(null);
                    }
                  }}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-md"
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting || !!featuredImageFile}
                />
              </div>
            </div>

            {     }
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                Article Content
              </label>
              <div
                ref={editorRef}
                className="bg-white border border-gray-300 rounded-md"
                style={{ minHeight: "300px" }}
              />
            </div>

            {     }
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting || uploadingImage}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || uploadingImage}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingArticle
                  ? "Update Article"
                  : "Add Article"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Manage Articles</h2>
          <button
            onClick={handleCreateClick}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Article
          </button>
        </div>
      )}

      {     }
      {!isFormVisible && (
        <div className="bg-white rounded-lg shadow-lg">
          <ul className="divide-y divide-gray-200">
            {safeArticles.length === 0 ? (
              <li className="p-4 text-gray-500 text-center">
                No articles available.
              </li>
            ) : (
              safeArticles.map((article) => (
                <li
                  key={article.id}
                  className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <span className="font-medium text-gray-900">
                      {article.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleEditClick(article)}
                      className="text-md text-indigo-600 hover:text-indigo-900 font-semibold bg-transparent border-none cursor-pointer p-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(article.id)}
                      className="text-md text-red-600 hover:text-red-900 font-semibold bg-transparent border-none cursor-pointer p-1"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
