"use client";

import React, { useState } from "react";
import MovieHoverCard from "./MovieHoverCard";

interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  genre_ids?: number[];
  vote_average?: number;
  release_date?: string;
  [key: string]: any;
}

interface SectionProps {
  title: string;
  movies: Movie[];
  onWatchLater?: (movie: Movie) => void;
}

const GENRES = [
  { name: "All", id: null },
  { name: "Action", id: 28 },
  { name: "Adventure", id: 12 },
  { name: "Animation", id: 16 },
  { name: "Comedy", id: 35 },
  { name: "Crime", id: 80 },
  { name: "Documentary", id: 99 },
  { name: "Drama", id: 18 },
  { name: "Horror", id: 27 },
];

export default function MediaGridSection({
  title,
  movies,
  onWatchLater,
}: SectionProps) {
  const [selectedGenre, setSelectedGenre] = useState("All");

  const activeGenre = GENRES.find((genre) => genre.name === selectedGenre);

  const filteredMovies =
    activeGenre?.id === null
      ? movies
      : movies.filter((movie) =>
          movie.genre_ids?.includes(activeGenre?.id ?? 0)
        );

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">
            <span>⚡</span>
            {title}
          </h2>

          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-bold text-muted-foreground">
            {filteredMovies.length}
          </span>
        </div>
      </div>

      {/* Genre Selector */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {GENRES.map((genre) => {
            const active = selectedGenre === genre.name;

            return (
              <button
                key={genre.name}
                onClick={() => setSelectedGenre(genre.name)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movie Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {filteredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="animate-in fade-in zoom-in-95 duration-500"
              style={{
                animationDelay: `${Math.min(index * 40, 300)}ms`,
              }}
            >
              <MovieHoverCard movie={movie} onWatchLater={onWatchLater} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            No movies found for{" "}
            <span className="text-primary font-bold">"{selectedGenre}"</span>
          </p>

          <button
            onClick={() => setSelectedGenre("All")}
            className="mt-2 text-xs font-bold text-primary underline"
          >
            Reset filter
          </button>
        </div>
      )}
    </section>
  );
}