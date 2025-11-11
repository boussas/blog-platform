     

import type { Article } from "../types";      

const API_BASE_URL = "/api/articles";

     
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "An API error occurred");
  }
  return response.json();
};

export const articleService = {
  /**
   * Fetches a paginated list of all articles.
   * Can be filtered by search query.
   */
  getAll: (page: number, limit: number, search: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: search,
    });
    
    return fetch(`${API_BASE_URL}?${params.toString()}`)
      .then(handleResponse);
  },

  /**
   * Fetches a single article by its ID.
   */
  getById: (id: string) => {
    return fetch(`${API_BASE_URL}/${id}`).then(handleResponse);
  },
  
  /**
   * Fetches all unique tags.
   */
  getAllTags: () => {
    return fetch(`${API_BASE_URL}/tags`).then(handleResponse);
  },
  
  /**
   * Fetches articles for a specific tag, with pagination.
   */
  getArticlesByTag: (tagName: string, page: number, limit: number) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
         
    const encodedTagName = encodeURIComponent(tagName);
    
    return fetch(`${API_BASE_URL}/tag/${encodedTagName}?${params.toString()}`)
      .then(handleResponse);
  },

  /**
   * Creates a new article. (Requires auth token)
   */
  create: (articleData: Omit<Article, 'id' | '_id' | 'createdAt' | 'updatedAt'>, token: string) => {
    return fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    }).then(handleResponse);
  },

  /**
   * Updates an existing article. (Requires auth token)
   */
  update: (id: string, articleData: Partial<Article>, token: string) => {
    return fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    }).then(handleResponse);
  },

  /**
   * Deletes an article. (Requires auth token)
   */
  delete: (id: string, token: string) => {
    return fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(handleResponse);
  }
};
