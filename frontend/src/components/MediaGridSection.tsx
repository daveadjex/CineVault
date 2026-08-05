"use client";
import React from "react";
import MovieHoverCard from "./MovieHoverCard";

interface SectionProps {
  title: string;
  movies: any[];
}

const GENRE_ROW_LIST = ["Action", "Adventure", "Biography", "Crime", "Comedy", "Documentary", "Drama"];

export default function MediaGridSection({ title, movies }: SectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Head Title wrapper matching drawing specs */}
      <div className="border-b border-border/10 pb-2">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
          <span>⚡</span> {title}
        </h2>
      </div>

      {/* Continuous Category Pill Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {GENRE_ROW_LIST.map((genre) => {
          const isHighlighted = genre === "Action" || genre === "Drama" || genre === "Crime";
          return (
            <button
              key={genre}
              className={`text-xs px-4 py-1.5 rounded-full font-bold border transition cursor-pointer space-nowrap ${
                isHighlighted
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-card text-muted-foreground border-border/30 hover:text-foreground"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-2">
        {movies.map((movie) => (
          <MovieHoverCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
