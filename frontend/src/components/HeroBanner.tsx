"use client";

import React, { useEffect, useRef, useState } from "react";
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
  onWatchLater?: (movie: Movie) => void;
}

const SLIDE_DURATION = 6000;

export default function HeroBanner({ movies, onWatchLater }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingTrailerKey, setPlayingTrailerKey] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const autoSlideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const carouselMovies = movies?.slice(0, 5) ?? [];
  const currentMovie = carouselMovies[currentIndex];

  /* Stop carousel timer */
  const stopAutoSlide = () => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }
  };

  /* Start carousel timer */
  const startAutoSlide = () => {
    stopAutoSlide();

    if (playingTrailerKey || isPaused || carouselMovies.length <= 1) {
      return;
    }

    autoSlideTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselMovies.length);
    }, SLIDE_DURATION);
  };

  /* Auto slide lifecycle */
  useEffect(() => {
    startAutoSlide();

    return () => {
      stopAutoSlide();
    };
  }, [playingTrailerKey, isPaused, carouselMovies.length]);

  /* Empty state */
  if (!currentMovie) {
    return null;
  }

  /* Fetch TMDB trailer */
  const handlePlayTrailer = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      if (!apiKey) {
        return;
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${currentMovie.id}/videos?api_key=${apiKey}&language=en-US`
      );

      const data = await response.json();

      const trailer = data.results?.find(
        (video: any) => video.site === "YouTube" && video.type === "Trailer"
      );

      if (trailer) {
        setPlayingTrailerKey(trailer.key);
        stopAutoSlide();
      }
    } catch (error) {
      console.error("Trailer error:", error);
    }
  };

  const handlePrevious = () => {
    setPlayingTrailerKey(null);
    setCurrentIndex((prev) =>
      prev === 0 ? carouselMovies.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setPlayingTrailerKey(null);
    setCurrentIndex((prev) => (prev + 1) % carouselMovies.length);
  };

  const backdropUrl = currentMovie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`
    : "/fallback-movie.jpg";

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative h-screen w-full overflow-hidden bg-background"
    >
      {/* BACKDROP / TRAILER AREA */}
      {playingTrailerKey ? (
        <>
          <iframe
            src={`https://www.youtube.com/embed/${playingTrailerKey}?autoplay=1&rel=0`}
            title="Movie Trailer"
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          <button
            onClick={() => {
              setPlayingTrailerKey(null);
              startAutoSlide();
            }}
            className="absolute right-6 top-24 z-40 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-bold text-white backdrop-blur"
          >
            <X className="h-4 w-4" />
            CLOSE
          </button>
        </>
      ) : (
        <Image
          src={backdropUrl}
          alt={currentMovie.title}
          fill
          priority
          unoptimized
          className="object-cover brightness-[0.45] transition-transform duration-[6000ms] scale-105"
        />
      )}

      {/* Cinematic gradients */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/30 to-transparent" />

      {/* Movie Information */}
      <div className="absolute bottom-24 md:bottom-28 left-0 z-20 max-w-3xl space-y-5 px-6 md:px-16">
        <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-primary">
          🔥 Trending Now • #{currentIndex + 1}
        </span>

        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
          <span className="text-yellow-400">
            ★ {Number(currentMovie.vote_average ?? 0).toFixed(1)}
          </span>
          <span>
            {currentMovie.release_date?.split("-")[0] ?? "2026"}
          </span>
          <span className="rounded bg-card/70 px-2 py-1 text-[10px] text-foreground">
            ULTRA HD
          </span>
        </div>

        <div
          key={currentMovie.id}
          className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-4"
        >
          <h1 className="max-w-2xl text-4xl md:text-6xl font-black uppercase leading-none tracking-tight text-foreground drop-shadow-xl">
            {currentMovie.title}
          </h1>

          <p className="max-w-xl line-clamp-3 text-sm md:text-base leading-relaxed text-muted-foreground">
            {currentMovie.overview}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          {!playingTrailerKey && (
            <button
              onClick={handlePlayTrailer}
              className="flex items-center gap-2 rounded bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground shadow-xl transition hover:bg-primary/90 active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              PLAY TRAILER
            </button>
          )}

          <button
            onClick={() => onWatchLater?.(currentMovie)}
            className="flex items-center gap-2 rounded border border-border bg-card/70 px-5 py-3.5 text-sm font-bold text-foreground backdrop-blur transition hover:bg-accent active:scale-95"
          >
            <Plus className="h-4 w-4" />
            WATCH LATER
          </button>
        </div>
      </div>

      {/* Slider Controls */}
      {!playingTrailerKey && carouselMovies.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur transition hover:bg-black/80 md:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur transition hover:bg-black/80 md:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Progress Indicators */}
          <div className="absolute bottom-10 right-6 z-30 flex items-center gap-2 md:right-16">
            {carouselMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setPlayingTrailerKey(null);
                  setCurrentIndex(index);
                }}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  currentIndex === index
                    ? "w-14 bg-primary"
                    : "w-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}