// Local anime data service — replaces Jikan API with local JSON
import animeRawData from "../data/animeDatabase.json"

// Filter out placeholder/skip entries
const animeDB = animeRawData.filter(a => !a.skip)

// Intercept and repair broken media URLs (like old MAL CDN 404s or invalid short YouTube embed IDs)
export function fixBrokenAnimeMedia(title, image, trailer_url) {
  const t = (title || "").toString().toLowerCase();
  const img = (image || "").toString().toLowerCase();
  let newImg = image || "";
  let newTr = trailer_url || null;

  if (t.includes("solo leveling") || img.includes("140461")) {
    newImg = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176496-Vwbb3v54m75v.jpg";
    if (!newTr || newTr.includes("2u321155") || newTr.length < 25) newTr = "https://www.youtube.com/embed/94r_Y4vP5C8";
  } else if (t.includes("reze") || t.includes("chainsaw man") || img.includes("140082")) {
    newImg = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-bngyqUo15u4I.jpg";
    if (!newTr || newTr.length < 25) newTr = "https://www.youtube.com/embed/1vRzTzW6c6c";
  } else if (t.includes("one punch man") || img.includes("122627")) {
    newImg = "https://cdn.myanimelist.net/images/anime/1160/122627l.jpg";
    if (!newTr || newTr.includes("2u321155") || newTr.length < 25) newTr = "https://www.youtube.com/embed/e_q8D6bX604";
  } else if (t.includes("bleach") || img.includes("138036")) {
    newImg = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171638-q5tD5z6Rj75J.jpg";
    if (!newTr || newTr.includes("5a2223432") || newTr.length < 25) newTr = "https://www.youtube.com/embed/t0d2z9j39q8";
  } else if (t.includes("jujutsu kaisen") || img.includes("141018")) {
    newImg = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171017-Z1P8y3D4P70x.jpg";
    if (!newTr || newTr.includes("6b3334232") || newTr.length < 25) newTr = "https://www.youtube.com/embed/8n_7y7e44t0";
  }

  return { image: newImg, trailer_url: newTr };
}

// Normalize anime from local JSON to match the shape used by components
// Made idempotent: handles both raw (genres) and already-normalized (genre) data
export function normalizeAnime(a) {
  const rawTitle = a.title || a.title_english || "Unknown";
  const rawImg = a.image || a.images?.jpg?.large_image_url || "";
  const rawTr = a.trailer_url || null;
  const fixed = fixBrokenAnimeMedia(rawTitle, rawImg, rawTr);

  return {
    mal_id: a.mal_id,
    title: rawTitle,
    title_english: a.title_english,
    title_japanese: a.title_japanese,
    image: fixed.image,
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
    trailer_url: fixed.trailer_url,
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
  const customList = await getCustomAnime()
  let filtered = [...customList, ...allAnime]

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
  const customList = await getCustomAnime()
  let filtered = [...customList, ...allAnime]

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
  let anime = animeDB.find(a => a.mal_id === numId && !a.skip)
  if (!anime) {
    const customList = await getCustomAnime()
    const customMatch = customList.find(a => a.mal_id === numId || a.id === numId)
    if (customMatch) {
      return {
        mal_id: customMatch.mal_id,
        title: customMatch.title,
        title_english: customMatch.title_english,
        title_japanese: customMatch.title_japanese,
        synopsis: customMatch.synopsis,
        score: customMatch.score,
        scored_by: customMatch.scored_by,
        rank: customMatch.rank,
        popularity: customMatch.popularity,
        episodes: customMatch.episodes,
        status: customMatch.status,
        type: customMatch.type,
        source: customMatch.source,
        duration: customMatch.duration,
        rating: customMatch.rating_label,
        aired: customMatch.aired,
        season: customMatch.season,
        year: customMatch.year,
        airing: customMatch.airing,
        genres: (customMatch.genre || []).map(g => ({ name: g, mal_id: g })),
        themes: [],
        demographics: [],
        studios: (customMatch.studios || []).map(s => ({ name: s, mal_id: s })),
        images: { jpg: { large_image_url: customMatch.image, image_url: customMatch.image } },
        trailer_url: customMatch.trailer_url,
        characters: [],
        members: customMatch.members || 0,
        favorites: 0,
        isCustom: true,
        id: customMatch.id
      }
    }
    return null
  }

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
  const customList = await getCustomAnime()
  const combined = [...customList, ...allAnime]
  const trending = combined.filter(a => a.trending || a.airing)
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

const DEMO_CUSTOM_ANIME = [
  {
    mal_id: 9001, id: 9001, title: "Solo Leveling Season 2: Arise from the Shadow",
    title_english: "Solo Leveling Season 2",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176496-Vwbb3v54m75v.jpg",
    score: 9.2, rating: 9.2, episodes: 12, status: "Currently Airing", year: 2025,
    synopsis: "After surviving the Double Dungeon and unlocking the mysterious System, Sung Jinwoo continues his ascent as the world's only leveling hunter. With new shadow monarchs at his command, he must face threats that could destroy both hunters and humanity.",
    description: "After surviving the Double Dungeon and unlocking the mysterious System, Sung Jinwoo continues his ascent as the world's only leveling hunter. With new shadow monarchs at his command, he must face threats that could destroy both hunters and humanity.",
    genre: ["Action", "Fantasy", "Adventure"], genres: ["Action", "Fantasy", "Adventure"],
    type: "TV", source: "Web Manhwa", duration: "24 min per ep", airing: true,
    studios: ["A-1 Pictures"], scored_by: 145000, rank: 5, popularity: 12,
    trailer_url: "https://www.youtube.com/embed/94r_Y4vP5C8", isCustom: true, isDemo: true, trending: true, topRated: true
  },
  {
    mal_id: 9002, id: 9002, title: "Chainsaw Man - The Movie: Reze Arc",
    title_english: "Chainsaw Man - The Movie: Reze Arc",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-bngyqUo15u4I.jpg",
    score: 9.1, rating: 9.1, episodes: 1, status: "Not yet aired", year: 2025,
    synopsis: "Denji meets a mysterious girl named Reze in a cafe who shows him affection he has never experienced before. However, Reze harbors a deadly secret that will plunge Denji and Public Safety into one of their most explosive battles yet.",
    description: "Denji meets a mysterious girl named Reze in a cafe who shows him affection he has never experienced before. However, Reze harbors a deadly secret that will plunge Denji and Public Safety into one of their most explosive battles yet.",
    genre: ["Action", "Supernatural", "Romance"], genres: ["Action", "Supernatural", "Romance"],
    type: "Movie", source: "Manga", duration: "1 hr 45 min", airing: false,
    studios: ["MAPPA"], scored_by: 98000, rank: 12, popularity: 18,
    trailer_url: "https://www.youtube.com/embed/1vRzTzW6c6c", isCustom: true, isDemo: true, trending: true, topRated: true
  },
  {
    mal_id: 9003, id: 9003, title: "One Punch Man Season 3",
    title_english: "One Punch Man Season 3",
    image: "https://cdn.myanimelist.net/images/anime/1160/122627l.jpg",
    score: 8.9, rating: 8.9, episodes: 12, status: "Not yet aired", year: 2025,
    synopsis: "The Monster Association launches an all-out war against the Hero Association. While S-Class heroes engage in brutal combat with dragon-level threats beneath City Z, Saitama is drawn into the subterranean battlefield.",
    description: "The Monster Association launches an all-out war against the Hero Association. While S-Class heroes engage in brutal combat with dragon-level threats beneath City Z, Saitama is drawn into the subterranean battlefield.",
    genre: ["Action", "Comedy", "Sci-Fi"], genres: ["Action", "Comedy", "Sci-Fi"],
    type: "TV", source: "Web Manga", duration: "24 min per ep", airing: false,
    studios: ["J.C.Staff"], scored_by: 210000, rank: 25, popularity: 8,
    trailer_url: "https://www.youtube.com/embed/e_q8D6bX604", isCustom: true, isDemo: true, trending: true, topRated: false
  },
  {
    mal_id: 9004, id: 9004, title: "Bleach: Thousand-Year Blood War - Part 3",
    title_english: "Bleach: Thousand-Year Blood War - The Conflict",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171638-q5tD5z6Rj75J.jpg",
    score: 9.0, rating: 9.0, episodes: 13, status: "Currently Airing", year: 2024,
    synopsis: "The war between the Soul Reapers and the Quincy reaches the Royal Palace. Ichigo Kurosaki and his allies must confront Yhwach and his elite Schutzstaffel before the Soul King is destroyed and the realms collapse.",
    description: "The war between the Soul Reapers and the Quincy reaches the Royal Palace. Ichigo Kurosaki and his allies must confront Yhwach and his elite Schutzstaffel before the Soul King is destroyed and the realms collapse.",
    genre: ["Action", "Supernatural"], genres: ["Action", "Supernatural"],
    type: "TV", source: "Manga", duration: "24 min per ep", airing: true,
    studios: ["Pierrot"], scored_by: 120000, rank: 15, popularity: 30,
    trailer_url: "https://www.youtube.com/embed/t0d2z9j39q8", isCustom: true, isDemo: true, trending: false, topRated: true
  },
  {
    mal_id: 9005, id: 9005, title: "Jujutsu Kaisen Season 3: Culling Game",
    title_english: "Jujutsu Kaisen Season 3",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171017-Z1P8y3D4P70x.jpg",
    score: 9.3, rating: 9.3, episodes: 24, status: "Not yet aired", year: 2025,
    synopsis: "Following the catastrophic Shibuya Incident, Kenjaku initiates the Culling Game—a battle royale involving newly awakened sorcerers and ancient curses across Japan. Megumi Fushiguro and Yuji Itadori enter the deadly game to rescue Tsumiki and unseal Satoru Gojo.",
    description: "Following the catastrophic Shibuya Incident, Kenjaku initiates the Culling Game—a battle royale involving newly awakened sorcerers and ancient curses across Japan. Megumi Fushiguro and Yuji Itadori enter the deadly game to rescue Tsumiki and unseal Satoru Gojo.",
    genre: ["Action", "Supernatural", "Dark Fantasy"], genres: ["Action", "Supernatural", "Dark Fantasy"],
    type: "TV", source: "Manga", duration: "24 min per ep", airing: false,
    studios: ["MAPPA"], scored_by: 310000, rank: 3, popularity: 4,
    trailer_url: "https://www.youtube.com/embed/8n_7y7e44t0", isCustom: true, isDemo: true, trending: true, topRated: true
  }
];

let customAnimeCache = null
let customAnimePromise = null

export function getCustomAnime() {
  if (customAnimeCache) return Promise.resolve(customAnimeCache)
  if (!customAnimePromise) {
    customAnimePromise = fetch("/api/custom-anime")
      .then(res => res.json())
      .then(data => {
        let list = (data.anime || []).map(a => {
          let parsedGenres = []
          try { parsedGenres = typeof a.genres === "string" ? JSON.parse(a.genres) : (a.genres || []) } catch (e) {}
          let parsedStudios = []
          try { parsedStudios = typeof a.studios === "string" ? JSON.parse(a.studios) : (a.studios || []) } catch (e) {}
          const fixed = fixBrokenAnimeMedia(a.title, a.image || "", a.trailer_url || null);
          return {
            mal_id: a.mal_id || a.id,
            title: a.title,
            title_english: a.title_english,
            title_japanese: a.title_japanese,
            image: fixed.image,
            rating: a.score || 0,
            episodes: a.episodes || "?",
            status: a.status || "Unknown",
            year: a.year || "N/A",
            description: a.synopsis || "No description available.",
            genre: parsedGenres,
            type: a.type || "TV",
            source: a.source || "",
            duration: a.duration || "",
            airing: a.status === "Currently Airing",
            studios: parsedStudios,
            score: Number(a.score || 0),
            scored_by: Number(a.scored_by || 0),
            rank: a.rank_num || 999,
            popularity: a.popularity || 999,
            aired: { string: a.aired_string || "" },
            season: a.season || "",
            themes: [],
            demographics: [],
            trailer_url: fixed.trailer_url,
            characters: [],
            trending: a.trending || false,
            topRated: a.top_rated || false,
            synopsis: a.synopsis || "",
            rating_label: a.rating || "",
            favorites: 0,
            members: Number(a.scored_by || 0),
            isCustom: true,
            id: a.id
          }
        })
        if (!list || list.length === 0) list = DEMO_CUSTOM_ANIME
        customAnimeCache = list
        return list
      })
      .catch(err => {
        console.error("Failed to load custom anime:", err)
        return DEMO_CUSTOM_ANIME
      })
  }
  return customAnimePromise
}

export function clearCustomAnimeCache() {
  customAnimeCache = null
  customAnimePromise = null
}

export async function quickSearchAnime(query) {
  if (!query || query.trim().length === 0) return []
  const customList = await getCustomAnime()
  const combined = [...customList, ...allAnime]
  const q = query.toLowerCase().trim()
  return combined.filter(a =>
    (a.title && a.title.toLowerCase().includes(q)) ||
    (a.title_english && a.title_english.toLowerCase().includes(q)) ||
    (a.title_japanese && a.title_japanese.toLowerCase().includes(q))
  ).slice(0, 6)
}

