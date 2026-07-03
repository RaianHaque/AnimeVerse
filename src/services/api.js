const BASE = "https://api.jikan.moe/v4"

// Rate limiter - Jikan allows 3 requests/sec
let lastRequest = 0
async function rateLimited(url) {
  const now = Date.now()
  const diff = now - lastRequest
  if (diff < 350) {
    await new Promise(r => setTimeout(r, 350 - diff))
  }
  lastRequest = Date.now()
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Get top anime
export async function getTopAnime(page = 1, limit = 25, filter = "") {
  const params = new URLSearchParams({ page, limit, sfw: false })
  if (filter) params.set("filter", filter)
  const data = await rateLimited(`${BASE}/top/anime?${params}`)
  return data
}

// Search anime
export async function searchAnime(query, page = 1, params = {}) {
  const p = new URLSearchParams({ page, limit: 25, sfw: false })
  if (query) p.set("q", query)
  if (params.genres) p.set("genres", params.genres)
  if (params.status) p.set("status", params.status)
  if (params.order_by) p.set("order_by", params.order_by)
  if (params.sort) p.set("sort", params.sort)
  if (params.rating) p.set("rating", params.rating)
  if (params.type) p.set("type", params.type)
  const data = await rateLimited(`${BASE}/anime?${p}`)
  return data
}

// Get single anime by ID
export async function getAnimeById(id) {
  const data = await rateLimited(`${BASE}/anime/${id}/full`)
  return data.data
}

// Get anime characters
export async function getAnimeCharacters(id) {
  const data = await rateLimited(`${BASE}/anime/${id}/characters`)
  return data.data
}

// Get anime episodes
export async function getAnimeEpisodes(id, page = 1) {
  const data = await rateLimited(`${BASE}/anime/${id}/episodes?page=${page}`)
  return data
}

// Get anime reviews
export async function getAnimeReviews(id) {
  const data = await rateLimited(`${BASE}/anime/${id}/reviews`)
  return data.data
}

// Get currently airing / seasonal anime
export async function getSeasonNow(page = 1) {
  const data = await rateLimited(`${BASE}/seasons/now?page=${page}&limit=25&sfw=false`)
  return data
}

// Get anime recommendations
export async function getAnimeRecommendations(id) {
  const data = await rateLimited(`${BASE}/anime/${id}/recommendations`)
  return data.data
}

// Get all genres
export async function getGenres() {
  const data = await rateLimited(`${BASE}/genres/anime`)
  return data.data
}

// Helper to normalize anime data from API
export function normalizeAnime(a) {
  return {
    mal_id: a.mal_id,
    title: a.title || a.title_english || "Unknown",
    title_english: a.title_english,
    title_japanese: a.title_japanese,
    image: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || "",
    rating: a.score || 0,
    episodes: a.episodes || "?",
    status: a.status || "Unknown",
    year: a.year || (a.aired?.prop?.from?.year) || "N/A",
    description: a.synopsis || "No description available.",
    genre: (a.genres || []).map(g => g.name),
    type: a.type,
    source: a.source,
    duration: a.duration,
    airing: a.airing,
    studios: (a.studios || []).map(s => s.name),
    score: a.score,
    scored_by: a.scored_by,
    rank: a.rank,
    popularity: a.popularity,
    members: a.members,
    favorites: a.favorites,
    aired: a.aired,
    season: a.season,
    themes: (a.themes || []).map(t => t.name),
    demographics: (a.demographics || []).map(d => d.name),
  }
}
