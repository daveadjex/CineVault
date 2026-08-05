"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";

interface CardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    release_date?: string;
    vote_average?: number;
  };
}

export default function MovieHoverCard({ movie }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerMouseEnter = () => {
    setIsHovered(true);

    // Wait 300ms before fetching video streams to avoid layout lag on rapid cursor sweeps
    debounceTimerRef.current = setTimeout(async () => {
      if (!videoKey) {
        try {
          const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
          const res = await fetch(`https://themoviedb.org{movie.id}/videos?api_key=${apiKey}`);
          const data = await res.json();
          const trailer = data.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
          setVideoKey(trailer ? trailer.key : "dQw4w9WgXcQ");
        } catch {
          setVideoKey("dQw4w9WgXcQ");
        }
      }
    }, 300);
  };

  const triggerMouseLeave = () => {
    setIsHovered(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  };

  const posterUrl = movie.poster_path
    ? `https://tmdb.org{movie.poster_path}`
    : "https://unsplash.com";

  return (
    <div
      onMouseEnter={triggerMouseEnter}
      onMouseLeave={triggerMouseLeave}
      className="relative aspect-2/3 w-full rounded-md overflow-hidden bg-card border border-border/10 transition-all duration-300 hover:scale-105 hover:z-40 hover:shadow-2xl hover:border-primary/40 select-none group"
    >
      {/* State A: Optimized Vertical Cover Poster Component */}
      <Image
        src={posterUrl}
        alt={movie.title}
        fill
        sizes="(max-width: 768px) 50vw, 20vw"
        unoptimized // Prevents billing charges on free dev sandbox domains
        className={`object-cover transition-opacity duration-300 select-none pointer-events-none ${
          isHovered && videoKey ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* State B: Active Muted Background Embed Player */}
      {isHovered && videoKey && (
        <div className="absolute inset-0 w-full h-full bg-black animate-in fade-in duration-200">
          <iframe
            src={`https://youtube.com{videoKey}?autoplay=1&controls=0&mute=1&loop=1&playlist=${videoKey}&modestbranding=1&iv_load_policy=3&showinfo=0&rel=0`}
            title={movie.title}
            className="w-full h-full scale-140 object-cover pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* Text Info Layout Footer Mask */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/80 to-transparent p-3 text-left z-10">
        <p className="text-sm font-bold truncate text-white">{movie.title}</p>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium pt-0.5">
          <span>{movie.release_date?.split("-")[0] || "2026"}</span>
          <span className="text-amber-400 font-bold">
            ★ {Number(movie.vote_average || 7.5).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
