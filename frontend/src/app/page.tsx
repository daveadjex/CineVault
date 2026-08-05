"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroBanner from "@/components/HeroBanner";
import MediaGridSection from "@/components/MediaGridSection";
import { Search, LogIn, UserPlus, Menu, X, Sparkles, User, LogOut } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average?: number;
  release_date?: string;
  [key: string]: any;
}

export default function HomePage() {
  const router = useRouter();

  const [trendingDayList, setTrendingDayList] = useState<Movie[]>([]);
  const [popularMoviesList, setPopularMoviesList] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Authentication state check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 1. Check client session on mount
  useEffect(() => {
    const token = localStorage.getItem("cinevault_token");
    setIsAuthenticated(!!token);
  }, []);

  // 2. Fetch TMDB Data
  useEffect(() => {
    async function fetchData() {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
      if (!apiKey) return;

      try {
        const [trendingRes, popularRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=en-US&page=1`),
          fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`),
        ]);

        if (trendingRes.ok) {
          const trendingData = await trendingRes.json();
          setTrendingDayList(trendingData.results || []);
        }

        if (popularRes.ok) {
          const popularData = await popularRes.json();
          setPopularMoviesList(popularData.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch TMDB data:", err);
      }
    }

    fetchData();
  }, []);

  // 3. Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 4. Live movie search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
            searchQuery
          )}&language=en-US&page=1`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auth Navigation Handlers
  const handleNavigateToAuth = (tab: "login" | "register") => {
    router.push(`/auth?tab=${tab}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("cinevault_token");
    localStorage.removeItem("cinevault_uid");
    setIsAuthenticated(false);
    router.refresh();
  };

  // Watch Later Protection Handler
  const handleWatchLater = (movie: Movie) => {
    const token = localStorage.getItem("cinevault_token");
    if (!token) {
      // Save targeted movie ID so you can auto-add it after login
      localStorage.setItem("pending_watch_later", JSON.stringify(movie));
      // Redirect to Auth page on Register tab
      router.push("/auth?tab=register&reason=watch_later");
      return;
    }

    // Authenticated user watch-later logic
    alert(`Added "${movie.title}" to your Watch Later list!`);
  };

  const navLinks = ["Home", "Profile", "Drama", "Anime", "Movie", "Help"];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden pb-20 dark">
      {/* 1. NAVBAR */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/40 py-3 shadow-2xl"
            : "bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Logo & Links */}
          <div className="flex items-center gap-8 md:gap-10">
            <a
              href="#"
              onClick={() => setActiveTab("Home")}
              className="flex items-center gap-1 text-primary font-black text-2xl md:text-3xl tracking-tighter uppercase transition transform active:scale-95"
            >
              <Sparkles className="w-6 h-6 fill-current text-primary" />
              <span>CineVault</span>
            </a>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
              {navLinks.map((link) => {
                const isActive = activeTab === link;
                return (
                  <button
                    key={link}
                    onClick={() => setActiveTab(link)}
                    className={`transition-colors cursor-pointer relative py-1 ${
                      isActive
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Controls & Auth State */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-44 md:w-60 bg-card/60 border border-border/50 focus:border-primary focus:bg-card text-xs text-foreground rounded-full pl-9 pr-4 py-2 outline-none transition-all duration-300 placeholder:text-muted-foreground/60 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-card/80 hover:bg-accent border border-border/50 px-4 py-2 rounded-full transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-primary" /> Account
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-xs text-muted-foreground hover:text-destructive transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleNavigateToAuth("login")}
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary bg-card/80 hover:bg-accent border border-border/50 px-4 py-2 rounded-full transition cursor-pointer active:scale-95 backdrop-blur-md"
                >
                  <LogIn className="w-3.5 h-3.5" /> Login
                </button>

                <button
                  onClick={() => handleNavigateToAuth("register")}
                  className="flex items-center gap-1.5 text-xs font-black text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-full shadow-lg shadow-primary/20 transition cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-primary transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-background/95 border-b border-border/40 px-6 py-4 space-y-4 animate-in slide-in-from-top-4 duration-300 backdrop-blur-2xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full bg-card border border-border/40 text-xs text-foreground rounded-full pl-9 pr-4 py-2.5 outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => {
                    setActiveTab(link);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-sm font-semibold py-2 transition ${
                    activeTab === link ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/30">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-xs font-bold py-2.5 rounded-full border border-destructive/40 text-destructive bg-card text-center"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigateToAuth("login")}
                    className="flex-1 text-xs font-bold py-2.5 rounded-full border border-border/50 text-foreground bg-card text-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavigateToAuth("register")}
                    className="flex-1 text-xs font-bold py-2.5 rounded-full bg-primary text-primary-foreground text-center"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. SEARCH RESULTS OR MAIN PAGE */}
      {searchQuery.trim().length > 0 ? (
        <main className="pt-28 px-6 md:px-16 space-y-6 max-w-7xl mx-auto min-h-screen">
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <h2 className="text-xl md:text-2xl font-black uppercase text-foreground">
              Search Results for <span className="text-primary">"{searchQuery}"</span>
            </h2>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground font-bold underline"
            >
              Clear Search
            </button>
          </div>

          {isSearching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-card animate-pulse border border-border/20" />
              ))}
            </div>
          ) : (
            <MediaGridSection
              title="Found Titles"
              movies={searchResults}
              onWatchLater={handleWatchLater}
            />
          )}
        </main>
      ) : (
        <main>
          <HeroBanner movies={trendingDayList} onWatchLater={handleWatchLater} />

          <div className="px-6 md:px-16 space-y-16 -mt-24 relative z-30 max-w-7xl mx-auto">
            <MediaGridSection
              title="Trends Now"
              movies={trendingDayList.slice(0, 12)}
              onWatchLater={handleWatchLater}
            />
            <MediaGridSection
              title="Popular Movies"
              movies={popularMoviesList.slice(0, 12)}
              onWatchLater={handleWatchLater}
            />
          </div>
        </main>
      )}
    </div>
  );
}