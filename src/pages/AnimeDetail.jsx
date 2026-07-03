import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getAnimeById, getAnimeCharacters, getAnimeEpisodes, getAnimeReviews, getAnimeRecommendations, normalizeAnime } from "../services/api"
import AnimeCard from "../components/AnimeCard"

export default function AnimeDetail() {
  const { id } = useParams()
  const [anime, setAnime] = useState(null)
  const [characters, setCharacters] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setActiveTab("overview")
    window.scrollTo(0, 0)
    getAnimeById(id).then(data => {
      setAnime(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    if (activeTab === "characters" && characters.length === 0) {
      getAnimeCharacters(id).then(d => setCharacters(d || [])).catch(() => {})
    }
    if (activeTab === "episodes" && episodes.length === 0) {
      getAnimeEpisodes(id).then(d => setEpisodes(d.data || [])).catch(() => {})
    }
    if (activeTab === "reviews" && reviews.length === 0) {
      getAnimeReviews(id).then(d => setReviews(d || [])).catch(() => {})
    }
  }, [activeTab, id, characters.length, episodes.length, reviews.length])

  useEffect(() => {
    if (!id) return
    getAnimeRecommendations(id).then(d => {
      setRelated((d || []).slice(0, 6).map(r => normalizeAnime(r.entry)))
    }).catch(() => {})
  }, [id])

  const tabs = ["overview", "episodes", "characters", "reviews"]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  )

  if (!anime) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">&#128533;</div>
        <h2 className="font-orbitron text-2xl text-white mb-2">Anime not found</h2>
        <Link to="/anime" className="text-purple-400 hover:text-purple-300">Browse anime &#8594;</Link>
      </div>
    </div>
  )

  const a = anime
  const image = a.images?.jpg?.large_image_url || a.images?.jpg?.image_url
  const genreList = [...(a.genres || []), ...(a.themes || [])].map(g => g.name)
  const isOngoing = a.airing || a.status === "Currently Airing"

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={image} alt={a.title} className="w-full h-full object-cover opacity-30 blur-sm scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03010a] via-[#03010a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03010a] via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-64 relative z-10">
        <div className="grid md:grid-cols-[250px_1fr] gap-8 mb-12">
          <div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-cyan-500 to-pink-500 rounded-xl blur-sm opacity-50" />
              <img src={image} alt={a.title} className="relative w-full rounded-xl shadow-2xl" />
            </div>
            <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all">+ Add to Watchlist</button>
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {genreList.map(g => (
                <span key={g} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">{g}</span>
              ))}
            </div>
            <h1 className="font-orbitron text-3xl md:text-5xl font-black text-white text-glow-purple mb-2">{a.title}</h1>
            {a.title_english && a.title_english !== a.title && <p className="text-gray-400 mb-4">{a.title_english}</p>}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              {a.score && <span className="flex items-center gap-1 text-yellow-400 font-bold">&#11088; {a.score}/10 <span className="text-gray-500 font-normal">({a.scored_by?.toLocaleString()} votes)</span></span>}
              <span className="text-gray-400">&#127916; {a.episodes || "?"} Episodes</span>
              {a.year && <span className="text-gray-400">&#128197; {a.year}</span>}
              {a.rank && <span className="text-gray-400">&#127942; Rank #{a.rank}</span>}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isOngoing ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"}`}>{a.status}</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-base mb-6">{a.synopsis}</p>
            {a.score && (
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-2xl ${i < Math.round(a.score / 2) ? "text-yellow-400" : "text-gray-700"}`}>&#9733;</span>
                ))}
                <span className="text-gray-400 ml-2">{a.score} / 10</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-purple-500/20 mb-8">
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-3 text-sm font-semibold capitalize transition-all rounded-t-lg ${activeTab === t ? "bg-purple-500/20 text-purple-300 border-b-2 border-purple-400" : "text-gray-400 hover:text-purple-300 hover:bg-purple-500/10"}`}>{t}</button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="animate-fade-in glass rounded-xl p-8">
            <h3 className="font-orbitron text-xl font-bold text-white mb-6">Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ["Type", a.type],
                ["Source", a.source],
                ["Episodes", a.episodes || "?"],
                ["Status", a.status],
                ["Aired", a.aired?.string || "N/A"],
                ["Duration", a.duration],
                ["Rating", a.rating],
                ["Score", a.score ? `${a.score} (${a.scored_by?.toLocaleString()} users)` : "N/A"],
                ["Rank", a.rank ? `#${a.rank}` : "N/A"],
                ["Popularity", a.popularity ? `#${a.popularity}` : "N/A"],
                ["Members", a.members?.toLocaleString()],
                ["Favorites", a.favorites?.toLocaleString()],
                ["Studios", (a.studios || []).map(s => s.name).join(", ") || "N/A"],
                ["Season", a.season ? `${a.season} ${a.year}` : "N/A"],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-purple-500/10">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-200 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "episodes" && (
          <div className="animate-fade-in">
            {episodes.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {episodes.map(ep => (
                  <div key={ep.mal_id} className="glass rounded-xl p-4 hover:border-purple-500/30 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <span className="text-purple-400 font-orbitron text-sm font-bold">EP {ep.mal_id}</span>
                        <h4 className="text-white font-semibold group-hover:text-purple-300 transition-colors truncate">{ep.title || `Episode ${ep.mal_id}`}</h4>
                        {ep.aired && <span className="text-gray-500 text-xs">{new Date(ep.aired).toLocaleDateString()}</span>}
                      </div>
                      <span className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-500/40 transition-all shrink-0 ml-3">&#9654;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">No episode data available</div>
            )}
          </div>
        )}

        {activeTab === "characters" && (
          <div className="animate-fade-in">
            {characters.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {characters.slice(0, 18).map(c => (
                  <div key={c.character.mal_id} className="glass rounded-xl p-4 text-center hover:border-purple-500/30 transition-all group">
                    <img src={c.character.images?.jpg?.image_url} alt={c.character.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-purple-500/30 group-hover:border-purple-400 transition-colors" />
                    <h4 className="text-white text-sm font-semibold truncate">{c.character.name}</h4>
                    <span className="text-gray-500 text-xs">{c.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">No character data available</div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-fade-in space-y-4">
            {reviews.length > 0 ? reviews.slice(0, 5).map(r => (
              <div key={r.mal_id} className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={r.user?.images?.jpg?.image_url} alt={r.user?.username} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-white font-semibold text-sm">{r.user?.username}</h4>
                      <span className="text-gray-500 text-xs">{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-bold">&#11088; {r.score}/10</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{r.review}</p>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">No reviews available</div>
            )}
          </div>
        )}

        {/* Related Anime */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-orbitron text-2xl font-bold text-white">Recommended <span className="text-cyan-400">Anime</span></h2>
              <div className="flex-1 neon-line opacity-30" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {related.map(r => <AnimeCard key={r.mal_id} anime={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
