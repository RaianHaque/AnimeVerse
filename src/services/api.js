// Local anime data service — replaces Jikan API with local JSON
import animeRawData from "../data/animeDatabase.json"

// Filter out placeholder/skip entries
const animeDB = animeRawData.filter(a => !a.skip)

// Normalize anime from local JSON to match the shape used by components
// Made idempotent: handles both raw (genres) and already-normalized (genre) data
export function normalizeAnime(a) {
  return {
    mal_id: a.mal_id,
    title: a.title || a.title_english || "Unknown",
    title_english: a.title_english,
    title_japanese: a.title_japanese,
    image: a.image || a.images?.jpg?.large_image_url || "",
    rating: a.rating || a.score || 0,
    episodes: a.episodes || "?",
    status: a.status || "Unknown",
    year: a.year || "N/A",
    description: a.description || a.synopsis || "No description available.",
    genre: a.genre || a.genres || [],
    type: a.type,
    source: a.source,
    duration: a.duration,
    airing: a.status === "Currently Airing",
    studios: a.studios || [],
    score: a.score,
    scored_by: a.scored_by,
    rank: a.rank,
    popularity: a.popularity,
    aired: a.aired,
    season: a.season,
    themes: a.themes || [],
    demographics: a.demographics || [],
    trailer_url: a.trailer_url || null,
    characters: a.characters || [],
    trending: a.trending,
    topRated: a.topRated,
    synopsis: a.synopsis,
    rating_label: a.rating,
    favorites: a.scored_by ? Math.floor(a.scored_by / 100) : 0,
    members: a.scored_by || 0,
  }
}

// All anime normalized
const allAnime = animeDB.map(normalizeAnime)

// Simulate pagination
function paginate(arr, page = 1, limit = 25) {
  const start = (page - 1) * limit
  const end = start + limit
  return {
    data: arr.slice(start, end),
    pagination: {
      last_visible_page: Math.ceil(arr.length / limit),
      has_next_page: end < arr.length,
      current_page: page,
    },
  }
}

// Get top anime (sorted by score)
export async function getTopAnime(page = 1, limit = 25, filter = "") {
  let filtered = [...allAnime]

  if (filter === "airing") {
    filtered = filtered.filter(a => a.airing)
  } else if (filter === "upcoming") {
    filtered = filtered.filter(a => a.status === "Not yet aired")
  } else if (filter === "bypopularity") {
    filtered.sort((a, b) => (a.popularity || 9999) - (b.popularity || 9999))
    return paginate(filtered, page, limit)
  } else if (filter === "favorite") {
    filtered.sort((a, b) => (b.favorites || 0) - (a.favorites || 0))
    return paginate(filtered, page, limit)
  }

  filtered.sort((a, b) => (b.score || 0) - (a.score || 0))
  return paginate(filtered, page, limit)
}

// Search anime with filters
export async function searchAnime(query = "", page = 1, params = {}) {
  let filtered = [...allAnime]

  // Text search
  if (query) {
    const q = query.toLowerCase()
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.title_english && a.title_english.toLowerCase().includes(q)) ||
      (a.title_japanese && a.title_japanese.includes(q)) ||
      (a.description && a.description.toLowerCase().includes(q))
    )
  }

  // Genre filter
  if (params.genres) {
    const genreId = params.genres
    const genreMap = getGenreMap()
    const genreName = genreMap[genreId]
    if (genreName) {
      filtered = filtered.filter(a =>
        a.genre.some(g => g.toLowerCase() === genreName.toLowerCase())
      )
    }
  }

  // Status filter
  if (params.status) {
    if (params.status === "airing") {
      filtered = filtered.filter(a => a.airing)
    } else if (params.status === "complete") {
      filtered = filtered.filter(a => a.status === "Finished Airing")
    } else if (params.status === "upcoming") {
      filtered = filtered.filter(a => a.status === "Not yet aired")
    }
  }

  // Type filter
  if (params.type) {
    filtered = filtered.filter(a => a.type && a.type.toLowerCase() === params.type.toLowerCase())
  }

  // Sort
  const sortBy = params.order_by || "score"
  const sortDir = params.sort === "asc" ? 1 : -1

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "score": return ((b.score || 0) - (a.score || 0)) * sortDir
      case "title": return a.title.localeCompare(b.title) * sortDir
      case "start_date": return ((b.year || 0) - (a.year || 0)) * sortDir
      case "episodes": return ((b.episodes || 0) - (a.episodes || 0)) * sortDir
      case "popularity": return ((a.popularity || 9999) - (b.popularity || 9999)) * sortDir
      case "favorites": return ((b.favorites || 0) - (a.favorites || 0)) * sortDir
      default: return ((b.score || 0) - (a.score || 0)) * sortDir
    }
  })

  return paginate(filtered, page, 25)
}

// Get single anime by ID
export async function getAnimeById(id) {
  const numId = parseInt(id)
  const anime = animeDB.find(a => a.mal_id === numId && !a.skip)
  if (!anime) return null

  // Return full data in the shape the detail page expects
  return {
    mal_id: anime.mal_id,
    title: anime.title,
    title_english: anime.title_english,
    title_japanese: anime.title_japanese,
    synopsis: anime.synopsis,
    score: anime.score,
    scored_by: anime.scored_by,
    rank: anime.rank,
    popularity: anime.popularity,
    episodes: anime.episodes,
    status: anime.status,
    type: anime.type,
    source: anime.source,
    duration: anime.duration,
    rating: anime.rating,
    aired: anime.aired,
    season: anime.season,
    year: anime.year,
    airing: anime.status === "Currently Airing",
    genres: (anime.genres || []).map(g => ({ name: g, mal_id: g })),
    themes: (anime.themes || []).map(t => ({ name: t, mal_id: t })),
    demographics: (anime.demographics || []).map(d => ({ name: d, mal_id: d })),
    studios: (anime.studios || []).map(s => ({ name: s, mal_id: s })),
    images: { jpg: { large_image_url: anime.image, image_url: anime.image } },
    trailer_url: anime.trailer_url,
    characters: anime.characters || [],
    members: anime.scored_by || 0,
    favorites: anime.scored_by ? Math.floor(anime.scored_by / 100) : 0,
  }
}

// Get anime characters
export async function getAnimeCharacters(id) {
  const numId = parseInt(id)
  const anime = animeDB.find(a => a.mal_id === numId && !a.skip)
  if (!anime || !anime.characters) return []

  return anime.characters.map(c => ({
    character: {
      mal_id: c.name.replace(/\s/g, "_"),
      name: c.name,
      images: { jpg: { image_url: c.image } },
    },
    role: c.role,
  }))
}

// Get anime episodes (generate placeholder episodes)
export async function getAnimeEpisodes(id, page = 1) {
  const numId = parseInt(id)
  const anime = animeDB.find(a => a.mal_id === numId && !a.skip)
  if (!anime) return { data: [] }

  const totalEps = typeof anime.episodes === "number" ? anime.episodes : 0
  const limit = 25
  const start = (page - 1) * limit
  const end = Math.min(start + limit, totalEps)

  const episodes = []
  for (let i = start; i < end; i++) {
    episodes.push({
      mal_id: i + 1,
      title: `Episode ${i + 1}`,
      aired: null,
    })
  }

  return {
    data: episodes,
    pagination: {
      last_visible_page: Math.ceil(totalEps / limit),
      has_next_page: end < totalEps,
    },
  }
}

// Get anime reviews (returns empty — user reviews come from DB)
export async function getAnimeReviews(id) {
  return []
}

// Get currently airing / seasonal anime
export async function getSeasonNow(page = 1) {
  const trending = allAnime.filter(a => a.trending || a.airing)
  const sorted = trending.sort((a, b) => (b.score || 0) - (a.score || 0))
  return paginate(sorted, page, 25)
}

// Get anime recommendations (similar genre)
export async function getAnimeRecommendations(id) {
  const numId = parseInt(id)
  const anime = animeDB.find(a => a.mal_id === numId && !a.skip)
  if (!anime) return []

  const genres = anime.genres || []
  const related = allAnime
    .filter(a => a.mal_id !== numId && a.genre.some(g => genres.includes(g)))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 6)

  return related.map(a => ({ entry: { ...a, images: { jpg: { large_image_url: a.image, image_url: a.image } } } }))
}

// Genre list with IDs (matching MAL genre IDs for compatibility)
function getGenreMap() {
  return {
    "1": "Action", "2": "Adventure", "4": "Comedy", "8": "Drama",
    "10": "Fantasy", "14": "Horror", "7": "Mystery", "22": "Romance",
    "24": "Sci-Fi", "36": "Slice of Life", "37": "Supernatural",
    "41": "Suspense", "25": "Shoujo", "27": "Shounen", "42": "Seinen",
  }
}

// Get all genres
export async function getGenres() {
  const genreMap = getGenreMap()
  return Object.entries(genreMap).map(([id, name]) => ({
    mal_id: parseInt(id),
    name,
    count: allAnime.filter(a => a.genre.includes(name)).length,
  }))
}

// Export all anime for admin usage
export function getAllAnimeRaw() {
  return animeDB.filter(a => !a.skip)
}
