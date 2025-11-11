import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useArticles } from "./hooks/useArticles";
import LoginPage from "./pages/LoginPage";
import BlogListPage from "./pages/BlogListPage";
import Header from "./components/Header";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import AdminPage from "./pages/AdminPage";
import TagListPage from "./pages/TagListPage";
import { articleService } from "./services/articleService";
import type { Article } from "../types";
import ScrollToTopButton from "./components/ScrollToTopButton";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const BlogListPageWrapper = ({ searchQuery }: { searchQuery: string }) => {
  const navigate = useNavigate();

  const {
    articles,
    isLoading,
    currentPage,
    totalPages,
    totalArticles,
    goToPage,
  } = useArticles(null, searchQuery, null);

  return (
    <BlogListPage
      articles={articles}
      onSelectArticle={(id) => navigate(`/article/${id}`)}
      searchQuery={searchQuery}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalArticles={totalArticles}
      onPageChange={goToPage}
    />
  );
};

const TagArticleListPageWrapper = () => {
  const navigate = useNavigate();
  const { tagName } = useParams<{ tagName: string }>();

  const {
    articles,
    isLoading,
    currentPage,
    totalPages,
    totalArticles,
    goToPage,
  } = useArticles(null, "", tagName || null);

  return (
    <>
            
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Articles tagged: <span className="text-indigo-600"># {tagName}</span>
      </h2>

      <BlogListPage
        articles={articles}
        onSelectArticle={(id) => navigate(`/article/${id}`)}
        searchQuery=""
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalArticles={totalArticles}
        onPageChange={goToPage}
      />
    </>
  );
};

const ArticleDetailPageWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await articleService.getById(id);
        setArticle({ ...data, id: data._id || data.id });
      } catch (err) {
        console.error("Failed to fetch article", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-10">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-700 font-semibold text-lg mt-4">
            Article not found
          </p>
          <p className="text-gray-500 text-sm mt-2">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            ← Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return <ArticleDetailPage article={article} onBack={() => navigate("/")} />;
};

const AdminPageWrapper = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const { articles, addArticle, updateArticle, deleteArticle } = useArticles(
    token,
    "",
    null
  );

  return (
    <AdminPage
      articles={articles}
      addArticle={addArticle}
      updateArticle={updateArticle}
      deleteArticle={deleteArticle}
      onBack={() => navigate("/")}
    />
  );
};

const LoginPageWrapper = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    const success = await login(username, password);
    if (success) {
      navigate("/admin");
    }
    return success;
  };

  return <LoginPage onLogin={handleLogin} />;
};

const Layout = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, logout } = useAuth();

  const handleNavigateHome = () => {
    navigate("/");
  };

  const handleNavigateToAdmin = () => {
    navigate("/admin");
    setSearchQuery("");
  };

  const handleNavigateToTags = () => {
    navigate("/tags");
    setSearchQuery("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-100">
      <Header
        onNavigateHome={handleNavigateHome}
        onNavigateToAdmin={handleNavigateToAdmin}
        onNavigateToTags={handleNavigateToTags}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Routes>
          <Route
            path="/"
            element={<BlogListPageWrapper searchQuery={searchQuery} />}
          />
                
          <Route path="/tags" element={<TagListPage />} />
          <Route path="/tag/:tagName" element={<TagArticleListPageWrapper />} />

          <Route path="/article/:id" element={<ArticleDetailPageWrapper />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPageWrapper />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPageWrapper />} />
        </Routes>
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 dark:bg-black">
        <div>
          <span>&copy; 2025</span>&nbsp;|&nbsp;
          <span className="license">Mohamed Boussas</span>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
};

export default App;
