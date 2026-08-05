"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Play, Plus, X } from "lucide-react";

interface HeroProps {
  movie: {
    id: number;
    title: string;
    overview: string;
    backdrop_path: string;
    rating: string;
    meta: string;
  };
}

export default function HeroBanner({ movie }: HeroProps) {
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);

  const fetchAndOpenTrailer = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const res = await fetch(`https://themoviedb.org{movie.id}/videos?api_key=${apiKey}`);
      const data = await res.json();
      const trailer = data.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      setActiveTrailerKey(trailer ? trailer.key : "dQw4w9WgXcQ");
    } catch {
      setActiveTrailerKey("dQw4w9WgXcQ");
    }
  };

  const backdropUrl = movie.backdrop_path 
    ? `https://tmdb.org{movie.backdrop_path}`
    : "https://unsplash.com";

  return (
    <div className="relative w-full h-[85vh] md:h-[95vh] bg-background overflow-hidden">
      {/* Performance Optimized Next.js Image Element Layout */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          priority
          unoptimized // Disable vercel pricing optimization overheads for test accounts
          className="object-cover brightness-[0.35] transition-transform duration-1000 scale-102"
        />
      </div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent z-1" />
      <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-transparent z-1" />

      {/* Left Info Column Wrapper */}
      <div className="absolute inset-x-0 bottom-36 px-6 md:px-16 space-y-4 max-w-2xl z-20">
        <span className="text-primary font-bold text-xs tracking-widest block uppercase">
          SEASON 1 • PREMERE FEATURE
        </span>
        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
          <span className="text-amber-400 font-bold">{movie.rating}</span>
          <span>{movie.meta}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase drop-shadow-md">
          {movie.title}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-3">
          {movie.overview}
        </p>

        {/* Dynamic Interactive Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={fetchAndOpenTrailer}
            className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-bold px-6 py-3 rounded text-sm transition shadow-lg cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> WATCH TRAILER
          </button>
          <button className="flex items-center gap-2 bg-card border border-border/40 hover:bg-accent text-foreground font-bold px-5 py-3 rounded text-sm transition cursor-pointer">
            <Plus className="w-4 h-4" /> ADD LIST
          </button>
        </div>
      </div>

      {/* Video Overlay Stream Modal Container */}
      {activeTrailerKey && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl aspect-video bg-card rounded-lg overflow-hidden border border-border/20">
            <button
              onClick={() => setActiveTrailerKey(null)}
              className="absolute top-4 right-4 bg-background border border-border text-foreground hover:bg-accent p-2 rounded-full z-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://youtube.com{activeTrailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title="Stream Trailer Overlay"
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
