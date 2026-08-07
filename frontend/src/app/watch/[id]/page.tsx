"use client";

import React, { useState, useRef, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Star,
  Film,
  List,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Overwrite } from '../../../../../backend/prisma/generated/client/internal/prismaNamespace';

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function WatchPage({ params, searchParams }: WatchPageProps) {
  // 1. Unwrap Dynamic Route Promises using React.use()
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const movieId = resolvedParams.id;
  const mediaType = resolvedSearchParams.type === "tv" ? "tv" : "movie";

  // Data States
  const [media, setMedia] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Player Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Video Stream URL Source
  const [videoSrc, setVideoSrc] = useState<string>(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const castScrollRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
  const endpoint = mediaType === "tv" ? "tv" : "movie";

  // Connect Frontend Offline & Database Sync Hook
  const { syncProgress } = useVideoProgress({
    movieId,
    mediaType,
    videoRef,
    intervalMs: 5000,
  });

  // Fetch Metadata from TMDB API
  useEffect(() => {
    async function fetchData() {
      if (!apiKey) return;
      setLoading(true);
      try {
        const resDetails = await fetch(
          `https://api.themoviedb.org/3/${endpoint}/${movieId}?api_key=${apiKey}&language=en-US`
        );
        const dataDetails = await resDetails.json();

        const resCredits = await fetch(
          `https://api.themoviedb.org/3/${endpoint}/${movieId}/credits?api_key=${apiKey}`
        );
        const dataCredits = await resCredits.json();
        setCast(dataCredits.cast || []);

        const resSimilar = await fetch(
          `https://api.themoviedb.org/3/${endpoint}/${movieId}/similar?api_key=${apiKey}&language=en-US&page=1`
        );
        const dataSimilar = await resSimilar.json();
        setSimilar(dataSimilar.results || []);

        if (endpoint === "tv") {
          const resEp = await fetch(
            `https://api.themoviedb.org/3/tv/${movieId}/season/1?api_key=${apiKey}&language=en-US`
          );
          const dataEp = await resEp.json();
          setEpisodes(dataEp.episodes || []);
        }
        setMedia(dataDetails);
      } catch (err) {
        console.error("Failed to fetch media details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [movieId, endpoint, apiKey]);

  // Handle Autohiding Player HUD Controls on Inactivity
  const triggerUserMovement = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);

    if (isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3500);
      setControlsTimeout(timeout);
    }
  };

  // Video Control Functions
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setShowControls(true);
    } else {
      videoRef.current.play();
      triggerUserMovement();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      syncProgress(time, duration);
    }
  };

  const skipAhead = (seconds: number) => {
    if (!videoRef.current) return;
    let targetTime = videoRef.current.currentTime + seconds;
    if (targetTime < 0) targetTime = 0;
    if (targetTime > duration) targetTime = duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleEpisodeSelect = (epNumber: number) => {
    setActiveEpisode(epNumber);
    setVideoSrc("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4");
    setIsPlaying(true);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(videoSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = (media?.title || media?.name || "video").replace(/\s+/g, "_") + ".mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(videoSrc, "_blank");
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");
  };

  const scrollCast = (direction: "left" | "right") => {
    if (castScrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      castScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none dark">
      {/* 1. BRAND PLATFORM HEADER OVERLAY */}
      <header className="h-16 border-b border-border/10 px-6 flex items-center justify-between bg-card/60 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition" />
          <div className="flex items-center gap-1.5 text-primary font-black text-xl tracking-tighter uppercase">
            <Sparkles className="w-5 h-5 fill-current" />
            <span>CINEVAULT</span>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-full shadow-sm shadow-primary/5">
          <ShieldCheck className="w-4 h-4 text-primary animate-pulse" /> Offline DB Sync Active
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-6 space-y-12">
        {/* 2. THE VIDEO PLAYER FRAME */}
        {loading ? (
          <div className="relative w-full aspect-video rounded-xl bg-card border border-border/10 flex items-center justify-center shadow-inner">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div
            ref={playerContainerRef}
            onMouseMove={triggerUserMovement}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              if (isPlaying) setShowControls(false);
            }}
            className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-border/10 group"
          >
            {/* Native Media Element Track */}
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover cursor-pointer"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
            />

            {/* TOP METADATA OVERLAY */}
            <div
              className={`absolute top-0 inset-x-0 p-6 bg-linear-to-b from-black/95 via-black/40 to-transparent flex items-start justify-between transition-all duration-300 z-20 pointer-events-none ${
                showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase shadow shadow-primary/30">
                    STREAMING {endpoint === "tv" && "• EPISODE " + activeEpisode}
                  </span>
                  <span className="text-zinc-300 text-xs font-bold">
                    {(media?.release_date || media?.first_air_date)?.split("-")[0]}
                  </span>
                </div>
                <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">
                  {media?.title || media?.name}
                </h1>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {Number(media?.vote_average || 7.5).toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{media?.genres?.map((g: any) => g.name).join(", ")}</span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xs px-3.5 py-2 rounded-lg font-semibold transition"
              >
                <Download className="w-4 h-4" /> Save Video
              </button>
            </div>

            {/* TV SHOW EPISODES DRAWER */}
            {episodes.length > 0 && (
              <div
                className={`absolute left-0 top-0 bottom-0 w-80 bg-zinc-950/95 backdrop-blur-2xl border-r border-border/20 p-5 transition-transform duration-300 z-30 overflow-y-auto no-scrollbar shadow-2xl ${
                  showControls && isHovered ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wider">
                  <List className="w-4 h-4 text-primary" /> Episodes Library
                </div>
                <div className="space-y-2">
                  {episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => handleEpisodeSelect(ep.episode_number)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${
                        activeEpisode === ep.episode_number
                          ? "bg-primary/20 border-primary/50 text-foreground font-bold shadow-lg shadow-primary/5"
                          : "bg-card/40 border-transparent hover:bg-accent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="relative w-16 aspect-video rounded overflow-hidden bg-zinc-800 flex-shrink-0 flex items-center justify-center text-[9px] text-zinc-500 font-bold">
                        {ep.still_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${ep.still_path}`}
                            alt={ep.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          "NO ART"
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate text-white">
                          Ep {ep.episode_number}: {ep.name}
                        </p>
                        <span className="text-[10px] text-zinc-400">
                          {ep.runtime ? ep.runtime + " mins" : "45 mins"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            <div>
              <p>
                {media.Overwrite}
              </p>
            </div>

            {/* PLAYER CONTROLS BAR */}
            <div
              className={`absolute bottom-0 inset-x-0 p-6 bg-linear-to-t from-black/95 via-black/60 to-transparent transition-all duration-300 z-20 flex flex-col gap-3 ${
                showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {/* Timeline Track */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
                <Input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-zinc-700/80 rounded-full appearance-none cursor-pointer accent-primary border-none outline-none transition-all hover:h-2"
                />
                <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-4">
                  <Button onClick={togglePlay} className="text-white hover:text-primary hover:bg-background transition">
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </Button>

                  <button
                    onClick={() => skipAhead(-10)}
                    className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer transition"
                  >
                    -10s
                  </button>
                  <button
                    onClick={() => skipAhead(10)}
                    className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer transition"
                  >
                    +10s
                  </button>

                  <button onClick={toggleMute} className="text-white hover:text-primary hover:bg-transparent transition">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <button>
                </button>

                <button onClick={toggleFullscreen} className="text-white hover:text-primary transition">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. CAST AND CREW GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Cast & Crew</h2>
            {!loading && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCast("left")}
                  className="p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCast("right")}
                  className="p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div
            ref={castScrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-none w-36 bg-card rounded-xl p-3 border border-border/10 animate-pulse text-center"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 mb-3" />
                    <div className="h-3 bg-zinc-800 rounded w-3/4 mx-auto mb-1" />
                    <div className="h-2 bg-zinc-800 rounded w-1/2 mx-auto" />
                  </div>
                ))
              : cast.map((person) => (
                  <div
                    key={person.id}
                    className="flex-none w-36 bg-card/60 rounded-xl p-3 border border-border/10 text-center group hover:bg-card transition"
                  >
                    <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 border-2 border-border/10 group-hover:border-primary transition bg-zinc-800">
                      {person.profile_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                          alt={person.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="text-xs font-bold text-foreground truncate">{person.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {person.character}
                    </p>
                  </div>
                ))}
          </div>
        </section>

        {/* 4. RECOMMENDATIONS BLOCK */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">More Like This</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] rounded-xl bg-card animate-pulse border border-border/10"
                  />
                ))
                : similar.map((sim) => (
                  <Link key={sim.id} href={`/watch/${sim.id}?type=${mediaType}`}>
                    <div className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-card border border-border/10 hover:scale-105 transition duration-300 cursor-pointer">
                      {sim.poster_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${sim.poster_path}`}
                          alt={sim.title || sim.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-end">
                        <p className="text-xs font-bold text-white truncate">
                          {sim.title || sim.name}
                        </p>
                        <span className="text-[10px] text-amber-400 font-bold">
                          ★ {Number(sim.vote_average || 7.0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}