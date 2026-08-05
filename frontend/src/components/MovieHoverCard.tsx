"use client";
import React from "react";
import Image from "next/image";
import { useMovieTrailer } from "@/hooks/useMovieTrailer"; // Adjust path as needed

interface CardProps {
  movie: {
    id: number;
    title: string;
    poster_path?: string | null;
    release_date?: string;
    vote_average?: number;
  };
}

export default function MovieHoverCard({ movie }: CardProps) {
  const { isHovered, videoKey, hoverProps } = useMovieTrailer({
    movieId: movie.id,
    delayMs: 300,
  });

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path.trim()}`
    : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";

  return (
    <div
      {...hoverProps}
      className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-card border border-border/10 transition-all duration-300 hover:scale-105 hover:z-40 hover:shadow-2xl hover:border-primary/40 select-none group"
    >
      {/* State A: Poster Cover */}
      <Image
        src={posterUrl}
        alt={movie.title}
        fill
        sizes="(max-width: 768px) 50vw, 20vw"
        unoptimized
        className={`object-cover transition-opacity duration-300 select-none pointer-events-none ${
          isHovered && videoKey ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* State B: YouTube Embed Player */}
      {isHovered && videoKey && (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none animate-in fade-in duration-200">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&controls=0&mute=1&loop=1&playlist=${videoKey}&modestbranding=1&iv_load_policy=3&showinfo=0&rel=0&disablekb=1`}
            title={movie.title}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350%] h-[150%] max-w-none border-0 select-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* Footer Text Mask */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 text-left z-10">
        <p className="text-sm font-bold truncate text-white">{movie.title}</p>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium pt-0.5">
          <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
          <span className="text-amber-400 font-bold">
            ★ {Number(movie.vote_average || 7.5).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}