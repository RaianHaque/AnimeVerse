import { useState, useEffect, useCallback } from "react"
import { searchAnime, getGenres, normalizeAnime } from "../services/api"
import AnimeCard from "../components/AnimeCard"

export default function AnimeList() {
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [genres, setGenres] = useState([])
  const [selGenre, setSelGenre] = useState("")
  const [selStatus, setSelStatus] = useState("")
  const [sortBy, setSortBy] = useState("score")
  const [viewMode, setViewMode] = useState("grid")

  useEffect(() => {
    getGenres().then(setGenres).catch(() => {})
  }, [])

  const fetchAnime = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        order_by: sortBy,
        sort: "desc",
      }
      if (selGenre) params.genres = selGenre
      if (selStatus) params.status = selStatus
      const res = await searchAnime(search, page, params)
      setAnime((res.data || []).map(normalizeAnime))
      setTotalPages(res.pagination?.last_visible_page || 1)
    } catch (err) {
      console.error("Failed to fetch anime:", err)
    } finally {
      setLoading(false)
    }
  }, [search, page, selGenre, selStatus, sortBy])

  useEffect(() => { fetchAnime() }, [fetchAnime])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "airing", label: "Airing" },
    { value: "complete", label: "Completed" },
    { value: "upcoming", label: "Upcoming" },
  ]

  const Loader = () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="font-orbitron text-4xl md:text-5xl font-black text-white text-glow-purple mb-3">ANIME <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">LIBRARY</span></h1>
          <p className="text-gray-400 text-lg">Explore every anime ever made - powered by MyAnimeList</p>
        </div>

        {/* Search & Filters */}
        <div className="glass rounded-2xl p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search any anime..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
            </div>
            <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.3)] transition-all">Search</button>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }} className="px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-gray-300 focus:outline-none focus:border-purple-400 cursor-pointer">
              <option value="score">Sort by Rating</option>
              <option value="start_date">Sort by Year</option>
              <option value="title">Sort by Title</option>
              <option value="episodes">Sort by Episodes</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="favorites">Sort by Favorites</option>
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setViewMode("grid")} className={`p-3 rounded-xl border transition-all ${viewMode === "grid" ? "border-purple-400 bg-purple-500/20 text-purple-300" : "border-purple-500/20 text-gray-500 hover:text-gray-300"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button type="button" onClick={() => setViewMode("list")} className={`p-3 rounded-xl border transition-all ${viewMode === "list" ? "border-purple-400 bg-purple-500/20 text-purple-300" : "border-purple-500/20 text-gray-500 hover:text-gray-300"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </form>

          {/* Genre filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-500 font-semibold uppercase mr-2 self-center">Genre:</span>
            <button onClick={() => { setSelGenre(""); setPage(1) }} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${!selGenre ? "bg-purple-500/30 text-purple-300 border border-purple-400/50" : "bg-[#0d0a1a] text-gray-400 border border-purple-500/10 hover:border-purple-500/30"}`}>All</button>
            {genres.slice(0, 20).map(g => (
              <button key={g.mal_id} onClick={() => { setSelGenre(String(g.mal_id)); setPage(1) }} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${selGenre === String(g.mal_id) ? "bg-purple-500/30 text-purple-300 border border-purple-400/50" : "bg-[#0d0a1a] text-gray-400 border border-purple-500/10 hover:border-purple-500/30 hover:text-purple-300"}`}>{g.name}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 font-semibold uppercase mr-2 self-center">Status:</span>
            {statusOptions.map(s => (
              <button key={s.value} onClick={() => { setSelStatus(s.value); setPage(1) }} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${selStatus === s.value ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/50" : "bg-[#0d0a1a] text-gray-400 border border-purple-500/10 hover:border-cyan-500/30 hover:text-cyan-300"}`}>{s.label}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-400 text-sm">Page <span className="text-purple-300 font-semibold">{page}</span> of <span className="text-purple-300 font-semibold">{totalPages}</span></span>
        </div>

        {loading ? <Loader /> : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {anime.map(a => <AnimeCard key={a.mal_id} anime={a} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {anime.map(a => (
              <div key={a.mal_id} className="flex gap-4 glass rounded-xl p-4 hover:border-purple-500/30 transition-all group">
                <img src={a.image} alt={a.title} className="w-20 h-28 object-cover rounded-lg" />
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">{a.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                    <span>&#11088; {a.rating || "N/A"}</span>
                    <span>&#127916; {a.episodes || "?"} eps</span>
                    <span>{a.year || "N/A"}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.airing ? "bg-green-500/20 text-green-300" : "bg-cyan-500/20 text-cyan-300"}`}>{a.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {a.genre.map(g => (
                      <span key={g} className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">{g}</span>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {anime.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">&#128533;</div>
            <h3 className="font-orbitron text-xl text-white mb-2">No anime found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-5 py-2 rounded-xl border border-purple-500/20 text-gray-300 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">&#8592; Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p
              if (totalPages <= 5) p = i + 1
              else if (page <= 3) p = i + 1
              else if (page >= totalPages - 2) p = totalPages - 4 + i
              else p = page - 2 + i
              return (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === p ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "border border-purple-500/20 text-gray-400 hover:bg-purple-500/10"}`}>{p}</button>
              )
            })}
            {totalPages > 5 && page < totalPages - 2 && <span className="text-gray-500">...</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-5 py-2 rounded-xl border border-purple-500/20 text-gray-300 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next &#8594;</button>
          </div>
        )}
      </div>
    </div>
  )
}
