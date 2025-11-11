     

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { articleService } from "../services/articleService";

const TagListPage = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const data = await articleService.getAllTags();
        setTags(data.sort());      
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tags");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-500 mt-3">Loading Tags...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
        All Tags
      </h1>
      {tags.length === 0 ? (
        <p className="text-gray-500">No tags found.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag}
              to={`/tag/${encodeURIComponent(tag)}`}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-full text-sm hover:bg-indigo-200 hover:shadow-sm transition-all duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagListPage;
