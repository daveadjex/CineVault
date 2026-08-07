"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MediaGridSection from "@/components/MediaGridSection";

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
  const [isSearching, setIsSearching] = useState(false);

  // Fetch homepage data
  useEffect(() => {
    async function fetchData() {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      if (!apiKey) {
        console.error("Missing NEXT_PUBLIC_TMDB_API_KEY");
        return;
      }

      try {
        const [trendingRes, popularRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=en-US&page=1`
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
          ),
        ]);

        if (trendingRes.ok) {
          const trendingData = await trendingRes.json();
          setTrendingDayList(trendingData.results ?? []);
        }

        if (popularRes.ok) {
          const popularData = await popularRes.json();
          setPopularMoviesList(popularData.results ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch TMDB data:", error);
      }
    }

    fetchData();
  }, []);

  // Live Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      if (!apiKey) return;

      setIsSearching(true);

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
            searchQuery
          )}&language=en-US&page=1`
        );

        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results ?? []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Watch Later
  const handleWatchLater = (movie: Movie) => {
    const token = localStorage.getItem("cinevault_token");

    if (!token) {
      localStorage.setItem(
        "pending_watch_later",
        JSON.stringify(movie)
      );
      router.push("/auth?tab=register&reason=watch_later");
      return;
    }

    alert(`Added "${movie.title}" to your Watch Later list!`);
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {searchQuery.trim() ? (
        <main className="pt-28 px-6 md:px-16 max-w-7xl mx-auto min-h-screen space-y-6">
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <h2 className="text-xl md:text-2xl font-black uppercase">
              Search Results for{" "}
              <span className="text-primary">&quot;{searchQuery}&quot;</span>
            </h2>

            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold underline text-muted-foreground hover:text-foreground"
            >
              Clear Search
            </button>
          </div>

          {isSearching ? (
            <div className="grid grid-cols-2 gap-4 py-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl border border-border/20 bg-card animate-pulse"
                />
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
          <HeroBanner
            movies={trendingDayList}
            onWatchLater={handleWatchLater}
          />

          <div className="relative z-30 -mt-24 mx-auto max-w-7xl space-y-16 px-6 md:px-16">
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