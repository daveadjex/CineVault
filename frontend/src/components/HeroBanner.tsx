"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  vote_average?: number;
  release_date?: string;
}

interface HeroProps {
  movies: Movie[];
}

const SLIDE_DURATION = 6000; // 6 seconds per slide

export default function HeroBanner({ movies }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingTrailerKey, setPlayingTrailerKey] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const carouselMovies = movies && movies.length > 0 ? movies.slice(0, 5) : [];

  // --- Automatic Slide Switcher Engine ---
  const startAutoSlide = () => {
    stopAutoSlide();
    if (playingTrailerKey || isPaused) return;

    autoSlideTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselMovies.length);
    }, SLIDE_DURATION);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
  };

  useEffect(() => {
    if (carouselMovies.length > 0) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [currentIndex, playingTrailerKey, isPaused, carouselMovies.length]);

  if (carouselMovies.length === 0) {
    return <div className="h-screen bg-background w-full animate-pulse" />;
  }

  const currentMovie = carouselMovies[currentIndex];

  // --- Fetch YouTube Trailer ---
  const handleInlinePlayback = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
      const fullUrl = `https://api.themoviedb.org/3/movie/${currentMovie.id}/videos?api_key=${apiKey.trim()}`;

      const res = await fetch(fullUrl);
      const data = await res.json();
      const trailer = data.results?.find(
        (v: any) => v.type === "Trailer" && v.site === "YouTube"
      );

      if (trailer) {
        setPlayingTrailerKey(trailer.key);
        stopAutoSlide();
      } else {
        setPlayingTrailerKey("dQw4w9WgXcQ");
      }
    } catch {
      setPlayingTrailerKey("dQw4w9WgXcQ");
    }
  };

  const handlePrevSlide = () => {
    setPlayingTrailerKey(null);
    setCurrentIndex((prev) => (prev === 0 ? carouselMovies.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setPlayingTrailerKey(null);
    setCurrentIndex((prev) => (prev + 1) % carouselMovies.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-screen bg-background overflow-hidden group/banner"
    >
      {/* 1. BACKGROUND SLIDER CAROUSEL */}
      <div className="absolute inset-0 z-0">
        {playingTrailerKey ? (
          /* VIDEO PLAYBACK MODE */
          <div className="w-full h-full bg-black relative animate-in fade-in duration-500">
            <iframe
              src={`https://www.youtube.com/embed/${playingTrailerKey}?autoplay=1&rel=0&modestbranding=1&controls=1`}
              title="Inline Hero Playback Stream"
              className="w-full h-full object-cover pointer-events-auto"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPlayingTrailerKey(null);
                startAutoSlide();
              }}
              className="absolute top-24 right-6 md:right-16 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-full cursor-pointer backdrop-blur-md transition-all active:scale-95"
            >
              <X className="w-4 h-4" /> CLOSE PREVIEW
            </button>
          </div>
        ) : (
          /* IMAGE SLIDES WITH CROSSFADE & SLIGHT ZOOM */
          carouselMovies.map((movie, index) => {
            const isActive = index === currentIndex;
            const backdropUrl = movie.backdrop_path
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path.trim()}`
              : "https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1920";

            return (
              <div
                key={movie.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={backdropUrl}
                  alt={movie.title}
                  fill
                  priority={index === 0}
                  unoptimized
                  className={`object-cover brightness-[0.45] transition-transform duration-[6000ms] ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                />
              </div>
            );
          })
        )}
      </div>

      {/* 2. GRADIENT VIGNETTES */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent z-10 pointer-events-none" />

      {/* 3. HERO MOVIE INFORMATION OVERLAY */}
      <div className="absolute inset-x-0 bottom-24 md:bottom-28 px-6 md:px-16 space-y-4 max-w-2xl z-20">
        <span className="inline-block text-primary font-black text-xs tracking-widest uppercase drop-shadow">
          🔥 TRENDING IN CINEMA • TOP {currentIndex + 1}
        </span>

        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground drop-shadow">
          <span className="text-amber-400">
            ★ {Number(currentMovie.vote_average || 8.0).toFixed(1)}
          </span>
          <span>{currentMovie.release_date?.split("-")[0] || "2026"}</span>
          <span className="bg-border/60 text-foreground px-2 py-0.5 rounded text-[10px]">
            ULTRA HD
          </span>
        </div>

        {/* Text Fade/Slide-Up Keyed Animation */}
        <div key={currentMovie.id} className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase drop-shadow-lg leading-none">
            {currentMovie.title}
          </h1>

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-3 drop-shadow max-w-xl">
            {currentMovie.overview}
          </p>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-3 pt-4">
          {!playingTrailerKey && (
            <button
              onClick={handleInlinePlayback}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3.5 rounded text-sm transition-transform active:scale-95 shadow-xl cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> PLAY TRAILER
            </button>
          )}
          <button className="flex items-center gap-2 bg-card/80 border border-border/60 hover:bg-accent text-foreground font-bold px-5 py-3.5 rounded text-sm transition cursor-pointer backdrop-blur-md">
            <Plus className="w-4 h-4" /> WATCH LATER
          </button>
        </div>
      </div>

      {/* 4. CAROUSEL CHEVRON CONTROLS */}
      {!playingTrailerKey && (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/80 border border-white/10 text-white p-3 rounded-full opacity-0 group-hover/banner:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-md active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/80 border border-white/10 text-white p-3 rounded-full opacity-0 group-hover/banner:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-md active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* 5. DYNAMIC EXPANDING & PROGRESS-FILLING INDICATORS */}
          <div className="absolute bottom-10 right-6 md:right-16 z-30 flex items-center gap-2.5">
            {carouselMovies.map((_, idx) => {
              const isCurrent = currentIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setPlayingTrailerKey(null);
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`relative h-2.5 rounded-full overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
                    isCurrent
                      ? "w-12 md:w-16 bg-white/30" // Expands into a pill bar when active
                      : "w-2.5 bg-white/40 hover:bg-white/70" // Compact dot when inactive
                  }`}
                >
                  {/* Fill progress inside the active indicator pill */}
                  {isCurrent && (
                    <div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all ease-linear w-full"
                      style={{
                        transitionDuration: isPaused ? "0ms" : `${SLIDE_DURATION}ms`,
                        width: isPaused ? "0%" : "100%",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}