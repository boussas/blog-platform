import { useState, useEffect, useCallback } from "react";
import { articleService } from "../services/articleService";
import type { Article } from "../types";

interface PaginatedArticleResponse {
  articles: Article[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const useArticles = (
  token: string | null,
  searchQuery: string,
  tagName: string | null = null
) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);

  const articlesPerPage = 10;

  const fetchArticles = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);
      try {
        let data: PaginatedArticleResponse;

        if (tagName) {
          data = await articleService.getArticlesByTag(
            tagName,
            page,
            articlesPerPage
          );
        } else {
          data = await articleService.getAll(
            page,
            articlesPerPage,
            searchQuery
          );
        }

        const formattedArticles = data.articles.map((article) => ({
          ...article,
          id: article._id || article.id,
        }));

        setArticles(formattedArticles);
        setTotalPages(data.totalPages);
        setCurrentPage(Number(data.currentPage));
        setTotalArticles(data.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch articles"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, tagName]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchArticles(1);
  }, [searchQuery, tagName, fetchArticles]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchArticles(page);
  };

  const addArticle = async (
    articleData: Omit<Article, "id" | "_id" | "createdAt" | "updatedAt">
  ) => {
    if (!token) throw new Error("Authentication required");
    try {
      const newArticle = await articleService.create(articleData, token);

      setArticles((prev) => [newArticle, ...prev]);
      setTotalArticles((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to add article:", err);
    }
  };

  const updateArticle = async (id: string, articleData: Partial<Article>) => {
    if (!token) throw new Error("Authentication required");
    try {
      const updatedArticle = await articleService.update(
        id,
        articleData,
        token
      );

      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updatedArticle } : a))
      );
    } catch (err) {
      console.error("Failed to update article:", err);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!token) throw new Error("Authentication required");
    try {
      await articleService.delete(id, token);

      setArticles((prev) => prev.filter((a) => a.id !== id));
      setTotalArticles((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete article:", err);
    }
  };

  return {
    articles,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalArticles,
    goToPage,
    addArticle,
    updateArticle,
    deleteArticle,
  };
};
