import { useState, useEffect, useRef } from "react";
import { Sun, Moon } from "lucide-react";

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToTags: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const STORAGE_KEY = "theme-preference"; 

const Header = ({
  onNavigateHome,
  onNavigateToAdmin,
  onNavigateToTags,
  searchQuery,
  onSearchChange,
  isAuthenticated,
  onLogout,
}: HeaderProps) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as
      | "dark"
      | "light"
      | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setIsDarkMode(shouldBeDark);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        const shouldBeDark = e.matches;
        document.documentElement.classList.toggle("dark", shouldBeDark);
        setIsDarkMode(shouldBeDark);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onToggleDarkMode = () => {
    const willBeDark = !document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", willBeDark);
    localStorage.setItem(STORAGE_KEY, willBeDark ? "dark" : "light");
    setIsDarkMode(willBeDark);
  };

  return (
    <header
      className={`bg-gray-900 text-white shadow-md sticky top-0 z-10 dark:bg-black transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:py-0 sm:h-16 gap-3 sm:gap-4">
          {/* Logo + Mobile Buttons */}
          <div className="flex-shrink-0 w-full sm:w-auto flex justify-between items-center sm:block">
            <button
              onClick={onNavigateHome}
              className="text-2xl font-bold text-white hover:text-indigo-300 transition-colors duration-300 bg-transparent border-none cursor-pointer p-0"
              aria-label="Back to blog homepage"
            >
              My Blog
            </button>

            {/* Mobile Controls */}
            <div className="sm:hidden flex items-center gap-2">
              <button
                onClick={onNavigateToTags}
                className="font-bold text-white hover:text-indigo-300 transition-colors duration-300 px-3 py-1.5 rounded-md text-sm"
              >
                Tags
              </button>
              {isAuthenticated && (
                <button
                  onClick={onNavigateToAdmin}
                  className="font-medium text-white hover:text-indigo-300 transition-colors duration-300 px-3 py-1.5 rounded-md text-sm"
                >
                  Admin
                </button>
              )}
              {isAuthenticated && (
                <button
                  onClick={onLogout}
                  className="font-medium text-red-400 hover:text-red-300 transition-colors duration-300 px-3 py-1.5 rounded-md text-sm"
                >
                  Logout
                </button>
              )}
              <button
                onClick={onToggleDarkMode}
                className="text-white hover:text-indigo-300 transition-colors duration-300 p-2 rounded-md"
                aria-label={
                  isDarkMode ? "Activate light mode" : "Activate dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md w-full sm:w-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-4 py-2 pl-10 pr-10 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Clear search"
              >
                x
              </button>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex sm:items-center sm:gap-4 flex-shrink-0">
            <button
              onClick={onNavigateToTags}
              className="font-bold text-white cursor-pointer hover:text-indigo-300 transition-colors duration-300 px-4 py-2 rounded-md text-md"
            >
              Tags
            </button>
            {isAuthenticated && (
              <button
                onClick={onNavigateToAdmin}
                className="font-medium cursor-pointer text-white hover:text-indigo-300 transition-colors duration-300 px-4 py-2 rounded-md text-sm"
              >
                Admin
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="font-medium cursor-pointer text-red-400 hover:text-red-300 transition-colors duration-300 px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            )}
            <button
              onClick={onToggleDarkMode}
              className="text-white hover:text-indigo-300 transition-colors duration-300 p-2 rounded-md"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 cursor-pointer" />
              ) : (
                <Moon className="w-5 h-5 cursor-pointer" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
