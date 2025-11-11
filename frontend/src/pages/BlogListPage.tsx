import type { Article } from "../../types";
import HomeProfile from "../components/HomeProfile";
import Pagination from "../components/Pagination";

interface BlogListPageProps {
  articles: Article[];
  onSelectArticle: (id: string | number) => void;
  searchQuery: string;

  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  onPageChange: (page: number) => void;
}

const BlogListPage = ({
  articles,
  onSelectArticle,
  searchQuery,
  isLoading,
  currentPage,
  totalPages,
  totalArticles,
  onPageChange,
}: BlogListPageProps) => {
  const getPlainText = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes < 1) return "Just now";
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="">
      <HomeProfile />

      {}
      {searchQuery && !isLoading && (
        <div className="max-w-4xl mx-auto mb-6">
          <p className="text-gray-600 text-center">
            {totalArticles > 0 ? (
              <>
                Found{" "}
                <span className="font-semibold text-indigo-600">
                  {totalArticles}
                </span>
                {totalArticles === 1 ? " article" : " articles"} matching "
                {searchQuery}"
              </>
            ) : (
              <>No articles found matching "{searchQuery}"</>
            )}
          </p>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mx-auto">
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading articles...</p>
          </div>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col"
            >
              <img
                className="w-full h-64 object-cover object-center cursor-pointer"
                src={article.imageUrl}
                alt={article.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/800x400?text=No+Image";
                }}
                onClick={() => onSelectArticle(article.id)}
              />
              <div className="px-4  py-3 flex-grow flex flex-col">
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <time dateTime={article.createdAt}>
                    {formatDate(article.createdAt)}
                  </time>
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  <button
                    onClick={() => onSelectArticle(article.id)}
                    className="text-left bg-transparent border-none cursor-pointer p-0 font-bold hover:text-indigo-600 transition-colors duration-300 w-full"
                  >
                    {article.title}
                  </button>
                </h3>
                <p className="text-gray-600  line-clamp-3 min-h-0">
                  {getPlainText(article.body)}
                </p>

                {}
                {}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-200 dark:bg-black dark:text-white text-gray-700 text-md font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        + {article.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                {}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-2">
              {searchQuery
                ? "No articles found matching your search."
                : "No articles yet. Create one to get started!"}
            </p>
          </div>
        )}
      </div>

      {}
      {}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default BlogListPage;
