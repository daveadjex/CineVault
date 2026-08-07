"use client";
import { useCallback, useEffect, useRef } from "react";

interface SyncProgressParams {
  movieId: string;
  mediaType: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  intervalMs?: number;
}

export function useVideoProgress({
  movieId,
  mediaType,
  videoRef,
  intervalMs = 5000,
}: SyncProgressParams) {
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load saved position from localStorage or API on mount
  useEffect(() => {
    const localSavedTime = localStorage.getItem(`cv_progress_${mediaType}_${movieId}`);
    if (localSavedTime && videoRef.current) {
      videoRef.current.currentTime = parseFloat(localSavedTime);
    }
  }, [movieId, mediaType, videoRef]);

  // 2. Offline sync handler (saves to LocalStorage immediately, pushes to DB asynchronously)
  const syncProgress = useCallback(async (currentTime: number, duration: number) => {
    const key = `cv_progress_${mediaType}_${movieId}`;
    localStorage.setItem(key, currentTime.toString());

    // Attempt to sync to Neon DB via API route
    if (navigator.onLine) {
      try {
        await fetch("/api/user/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieId,
            mediaType,
            currentTime,
            duration,
            updatedAt: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.warn("Neon DB sync failed, progress saved locally:", err);
      }
    }
  });

  // 3. Periodic timer to trigger sync during playback
  useEffect(() => {
    syncTimerRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        syncProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, intervalMs);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [movieId, mediaType, intervalMs, videoRef, syncProgress]);

  return { syncProgress };
}