import React from "react";
import HeroBanner from "@/components/HeroBanner";
import MediaGridSection from "@/components/MediaGridSection";

async function getLiveTmdbData(endpointPath: string) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(
    `https://themoviedb.org{endpointPath}?api_key=${apiKey}&language=en-US&page=1`,
    { next: { revalidate: 3600 } } // Refresh cache definitions hourly
  );
  if (!res.ok) throw new Error(`TMDb Connection Error on endpoint: ${endpointPath}`);
  const data = await res.json();
  return data.results || [];
}

export default async function HomePage() {
  // Fetch movie data in parallel
  const [trendingDayList, popularMoviesList] = await Promise.all([
    getLiveTmdbData("trending/movie/day"),
    getLiveTmdbData("movie/popular")
  ]);

  // Use the top trending movie as the hero, fallback to a standard title if missing
  const heroMovieItem = trendingDayList[0] || {
    id: 299534,
    title: "CineVault Cinema",
    overview: "Your ultimate platform for high-resolution automated streaming.",
    backdrop_path: ""
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden pb-20 dark">
      {/* 1. CineVault Navigation Bar Wrapper */}
      <nav className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-16 py-6 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-12">
          <span className="text-primary font-black text-2xl tracking-tighter md:text-3xl uppercase">
            CineVault
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="text-foreground font-semibold cursor-pointer">Home</span>
            <span className="hover:text-foreground transition cursor-pointer">Profil</span>
            <span className="hover:text-foreground transition cursor-pointer">Drama</span>
            <span className="hover:text-foreground transition cursor-pointer">Movie</span>
            <span className="hover:text-foreground transition cursor-pointer">Help</span>
          </div>
        </div>
      </nav>

      {/* 2. Live Core Dynamic Hero Layout Banner */}
      <HeroBanner 
        movie={{
          id: heroMovieItem.id,
          title: heroMovieItem.title || heroMovieItem.name || "Untitled Film",
          overview: heroMovieItem.overview,
          backdrop_path: heroMovieItem.backdrop_path,
          rating: `★ ${Number(heroMovieItem.vote_average || 8.5).toFixed(1)}`,
          meta: `${heroMovieItem.release_date?.split("-")[0] || "2026"} • Live Action • Pop Trend`
        }} 
      />

      {/* 3. Media Sections Content Loop Block */}
      <div className="px-6 md:px-16 space-y-16 -mt-24 relative z-30">
        <MediaGridSection title="Trends Now" movies={trendingDayList.slice(0, 12)} />
        <MediaGridSection title="Popular Movies" movies={popularMoviesList.slice(0, 12)} />
      </div>
    </div>
  );
}
