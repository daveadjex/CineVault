"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useMovieTrailer } from "@/hooks/useMovieTrailer";
import { Plus } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
  media_type?: "movie" | "tv";
}

interface CardProps {
  movie: Movie;
  onWatchLater?: (movie: Movie) => void;
}

export default function MovieHoverCard({ movie, onWatchLater }: CardProps) {
  const { isHovered, videoKey, hoverProps } = useMovieTrailer({
    movieId: movie.id,
    delayMs: 300,
  });

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/fallback-movie.jpg";

  const mediaType = movie.media_type ?? "movie";

  return (
    <div
      {...hoverProps}
      className="group relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border/40 bg-card transition-all duration-300 hover:z-40 hover:scale-105 hover:border-primary/50 hover:shadow-2xl cursor-pointer"
    >
      {/* Click Area */}
      <Link
        href={`/watch/${movie.id}?type=${mediaType}`}
        className="absolute inset-0 z-10"
      >
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          unoptimized
          className={`object-cover transition-opacity duration-300 ${
            isHovered && videoKey ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Trailer Preview */}
        {isHovered && videoKey && (
          <div className="absolute inset-0 overflow-hidden bg-black animate-in fade-in duration-200">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&controls=0&mute=1&loop=1&playlist=${videoKey}&rel=0`}
              title={movie.title}
              className="absolute left-1/2 top-1/2 h-[150%] w-[350%] max-w-none -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}
      </Link>

      {/* Watch Later Quick Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onWatchLater?.(movie);
        }}
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur opacity-0 transition group-hover:opacity-100 hover:bg-primary"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Bottom Information */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-10">
        <p className="truncate text-sm font-bold text-white">
          {movie.title}
        </p>

        <div className="flex items-center justify-between pt-1 text-[11px] font-medium text-zinc-400">
          <span>{movie.release_date?.split("-")[0] ?? "N/A"}</span>
          <span className="font-bold text-yellow-400">
            ★ {Number(movie.vote_average ?? 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}