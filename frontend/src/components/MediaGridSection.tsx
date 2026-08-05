"use client";

import React, { useState } from "react";
import MovieHoverCard from "./MovieHoverCard";

interface Movie {
  id: number;
  title: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[] | string[];
  [key: string]: any;
}

interface SectionProps {
  title: string;
  movies: Movie[];
}

const GENRE_ROW_LIST = [
  "All",
  "Action",
  "Adventure",
  "Biography",
  "Crime",
  "Comedy",
  "Documentary",
  "Drama",
];

export default function MediaGridSection({ title, movies }: SectionProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  // Filter movies dynamically based on active selected pill
  const filteredMovies =
    selectedGenre === "All"
      ? movies
      : movies.filter((movie) => {
          if (!movie.genres && !movie.genre_ids) return true;
          if (Array.isArray(movie.genres)) {
            return movie.genres.some((g) =>
              typeof g === "string"
                ? g.toLowerCase() === selectedGenre.toLowerCase()
                : g.name?.toLowerCase() === selectedGenre.toLowerCase()
            );
          }
          return true;
        });

  return (
    <section className="space-y-6">
      {/* Modernized Section Header */}
      <div className="flex items-center justify-between border-b border-border/20 pb-3">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
          <span className="text-primary animate-pulse">⚡</span>
          <span>{title}</span>
        </h2>
        
        {/* Real-time movie count pill */}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted/50 border border-border/40 text-muted-foreground">
          {filteredMovies.length} Items
        </span>
      </div>

      {/* Interactive Category Filter Bar with Fade Masks */}
      <div className="relative group/scroll">
        {/* Left Fade Overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 scroll-smooth">
          {GENRE_ROW_LIST.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`relative text-xs px-4 py-2 rounded-full font-bold transition-all duration-300 cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 border-transparent"
                    : "bg-card text-muted-foreground border border-border/40 hover:border-border hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Right Fade Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      </div>

      {/* Grid Layout Container */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 pt-1">
          {filteredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
              style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
            >
              <MovieHoverCard movie={movie} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="h-44 w-full rounded-xl border border-dashed border-border/40 bg-card/50 flex flex-col items-center justify-center text-center p-6 space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">
            No movies found for <span className="text-primary font-bold">"{selectedGenre}"</span>
          </p>
          <button
            onClick={() => setSelectedGenre("All")}
            className="text-xs text-primary underline underline-offset-4 hover:text-primary/80 font-bold cursor-pointer"
          >
            Reset filter
          </button>
        </div>
      )}
    </section>
  );
}