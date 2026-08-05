"use client";
import { useState, useRef, useCallback } from "react";

interface UseMovieTrailerOptions {
  movieId: number;
  delayMs?: number;
  defaultVideoKey?: string;
}

export function useMovieTrailer({
  movieId,
  delayMs = 300,
  defaultVideoKey = "dQw4w9WgXcQ",
}: UseMovieTrailerOptions) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTrailer = useCallback(async () => {
    if (videoKey) return; // Prevent duplicate requests if already cached in state

    setIsLoading(true);
    try {
      const apiKey =
        process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`
      );
      
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const trailer = data.results?.find(
        (v: any) => v.type === "Trailer" && v.site === "YouTube"
      );

      setVideoKey(trailer ? trailer.key : defaultVideoKey);
    } catch {
      setVideoKey(defaultVideoKey);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, videoKey, defaultVideoKey]);

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