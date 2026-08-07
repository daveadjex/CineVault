"use client";

import { useState, useRef, useCallback } from "react";

interface UseMovieTrailerOptions {
  movieId: number;
  delayMs?: number;
}

// Global memory cache
const trailerCache = new Map<number, string | null>();

export function useMovieTrailer({
  movieId,
  delayMs = 500,
}: UseMovieTrailerOptions) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTrailer = useCallback(async () => {
    // Already cached
    if (trailerCache.has(movieId)) {
      setVideoKey(trailerCache.get(movieId) ?? null);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

    if (!apiKey) {
      console.warn("Missing TMDB API key");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`
      );

      if (!response.ok) {
        throw new Error("TMDB request failed");
      }

      const data = await response.json();

      const trailer = data.results?.find(
        (video: any) =>
          video.site === "YouTube" && video.type === "Trailer"
      );

      const key = trailer?.key ?? null;

      trailerCache.set(movieId, key);
      setVideoKey(key);
    } catch (error) {
      console.error("Trailer fetch failed", error);
      trailerCache.set(movieId, null);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);

    timerRef.current = setTimeout(() => {
      fetchTrailer();
    }, delayMs);
  }, [fetchTrailer, delayMs]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    isHovered,
    videoKey,
    isLoading,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}