import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getTopAnime, normalizeAnime } from "../services/api"

export default function TopRated() {
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    getTopAnime(page, 25, filter).then(res => {
      setAnime((res.data || []).map(normalizeAnime))
      setTotalPages(res.pagination?.last_visible_page || 1)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, filter])

  const podiumColors = [
    { bg: "from-yellow-500/20 to-yellow-600/10", border: "border-yellow-500/40", text: "text-yellow-400", badge: "bg-yellow-500", label: "#1" },
    { bg: "from-gray-300/20 to-gray-400/10", border: "border-gray-400/40", text: "text-gray-300", badge: "bg-gray-400", label: "#2" },
    { bg: "from-amber-600/20 to-amber-700/10", border: "border-amber-600/40", text: "text-amber-500", badge: "bg-amber-600", label: "#3" },
  ]

  const top3 = anime.slice(0, 3)
  const rest = anime.slice(3)

  const Loader = () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-5xl font-black text-white text-glow-purple mb-3">&#127942; TOP <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">RATED</span> ANIME</h1>
          <p className="text-gray-400 text-lg">The highest rated anime of all time from MyAnimeList</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            { value: "", label: "All" },
            { value: "airing", label: "Airing" },
            { value: "upcoming", label: "Upcoming" },
            { value: "bypopularity", label: "Popular" },
            { value: "favorite", label: "Favorites" },
          ].map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1) }} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === f.value ? "bg-purple-500/30 text-purple-300 border border-purple-400/50 glow-purple" : "bg-[#0d0a1a] text-gray-400 border border-purple-500/10 hover:border-purple-500/30"}`}>{f.label}</button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            {page === 1 && top3.length >= 3 && (
              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {[top3[1], top3[0], top3[2]].map((anime, idx) => {
                  const origIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2
                  const style = podiumColors[origIdx]
                  return (
                    <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className={`relative glass rounded-2xl overflow-hidden border ${style.border} p-6 text-center group hover:scale-105 transition-all ${origIdx === 0 ? "md:-translate-y-6" : ""}`}>
                      <div className={`absolute top-4 left-4 w-10 h-10 ${style.badge} rounded-full flex items-center justify-center font-orbitron font-black text-white text-sm`}>{style.label}</div>
                      <div className={`absolute inset-0 bg-gradient-to-b ${style.bg} opacity-50`} />
                      <div className="relative">
                        <div className="mx-auto w-32 h-44 rounded-xl overflow-hidden mb-4 shadow-lg">
                          <img src={anime.image} alt={anime.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h3 className={`font-orbitron text-lg font-bold ${style.text} mb-2 truncate`}>{anime.title}</h3>
                        <div className="flex justify-center gap-1 mb-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-lg ${i < Math.round(anime.rating / 2) ? "text-yellow-400" : "text-gray-700"}`}>&#9733;</span>
                          ))}
                        </div>
                        <span className="text-2xl font-orbitron font-black text-white">{anime.rating}</span>
                        <div className="flex flex-wrap justify-center gap-1 mt-3">
                          {anime.genre.slice(0, 2).map(g => (
                            <span key={g} className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">{g}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            <div className="space-y-3">
              {rest.map((anime, i) => {
                const rank = (page - 1) * 25 + i + 4
                return (
                  <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className="flex items-center gap-4 glass rounded-xl p-4 hover:border-purple-500/30 transition-all group">
                    <span className="w-12 h-12 rounded-xl bg-[#0d0a1a] border border-purple-500/20 flex items-center justify-center font-orbitron font-bold text-purple-400 text-lg shrink-0">#{rank}</span>
                    <img src={anime.image} alt={anime.title} className="w-14 h-20 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">{anime.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span>&#127916; {anime.episodes || "?"} eps</span>
                        <span>{anime.year || "N/A"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${anime.airing ? "bg-green-500/20 text-green-300" : "bg-cyan-500/20 text-cyan-300"}`}>{anime.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-32 h-2 rounded-full bg-[#0d0a1a] overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{ width: `${(anime.rating || 0) * 10}%` }} />
                      </div>
                      <span className="font-orbitron font-bold text-yellow-400">{anime.rating || "N/A"}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-5 py-2 rounded-xl border border-purple-500/20 text-gray-300 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">&#8592; Prev</button>
                <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-5 py-2 rounded-xl border border-purple-500/20 text-gray-300 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next &#8594;</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
