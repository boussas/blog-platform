import type { Article } from "../../types";

interface ArticleDetailPageProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetailPage = ({ article, onBack }: ArticleDetailPageProps) => {
  const formatFullDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeDate = (dateString?: string) => {
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

    return formatFullDate(dateString);
  };

  return (
    <div className="bg-white md:p-8  p-3 rounded-lg shadow-xl max-w-[95%] mx-auto">
      <button
        onClick={onBack}
        className="text-indigo-500 hover:text-indigo-700 mb-6 inline-flex items-center font-semibold bg-transparent border-none cursor-pointer p-0 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to All Articles
      </button>

      <img
        src={article.imageUrl}
        alt={article.title}
        className="w-full h-auto max-h-[450px] object-cover rounded-lg mb-6 shadow-md"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://via.placeholder.com/800x400?text=No+Image";
        }}
      />

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-l-4 border-indigo-500 pl-4 py-2 bg-gray-50 rounded-r">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-600"
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
            <div>
              <div className="font-medium text-gray-700">Published</div>
              {/*<time dateTime={article.createdAt} className="text-gray-600">
                {formatRelativeDate(article.createdAt)}
              </time>*/}
              <time dateTime={article.createdAt} className="text-gray-600">
                {new Date(article.createdAt).toLocaleDateString("en-CA")}
              </time>
            </div>
          </div>

          {article.updatedAt && article.updatedAt !== article.createdAt && (
            <>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <div>
                  <div className="font-medium text-gray-700">Updated</div>
                  <time dateTime={article.updatedAt} className="text-gray-600">
                    {formatRelativeDate(article.updatedAt)}
                  </time>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-indigo-100 text-indigo-800 text-md font-medium px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div
        className="prose prose-base max-w-none text-gray-700 mt-6 text-base md:text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
    </div>
  );
};

export default ArticleDetailPage;
