const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function getLiveTmdbData(endpointPath: string, queryParams: string = '') {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    throw new Error('❌ CineVault Error: TMDB API Key is missing from your environment configuration!');
  }

  // Next.js extends the fetch API to automatically handle caching
  const response = await fetch(
    `${TMDB_BASE_URL}${endpointPath}?api_key=${apiKey}&language=en-US${queryParams}`,
    { next: { revalidate: 3600 } } // Revalidate data and refresh cache every hour
  );

  if (!response.ok) {
    throw new Error(`❌ CineVault Error: TMDB API request failed with status: ${response.status}`);
  }

  return response.json();
}