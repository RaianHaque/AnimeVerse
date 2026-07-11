import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getAnimeById, getAnimeCharacters, getAnimeEpisodes, getAnimeRecommendations, normalizeAnime } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { apiGet, apiPost } from "../services/db"
import AnimeCard from "../components/AnimeCard"

export default function AnimeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [anime, setAnime] = useState(null)
  const [characters, setCharacters] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [related, setRelated] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)

  // User reviews from the site
  const [siteReviews, setSiteReviews] = useState([])
  const [avgUserRating, setAvgUserRating] = useState(0)
  const [userReviewCount, setUserReviewCount] = useState(0)
  const [reviewForm, setReviewForm] = useState({ rating: 8, review_text: "" })
  const [reviewMsg, setReviewMsg] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [loginPrompt, setLoginPrompt] = useState("")

  useEffect(() => {
    setLoading(true)
    setActiveTab("overview")
    setShowTrailer(false)
    window.scrollTo(0, 0)
    getAnimeById(id).then(data => {
      setAnime(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  // Fetch site reviews
  useEffect(() => {
    if (!id) return
    apiGet(`/api/reviews?anime_id=${id}`)
      .then(d => {
        setSiteReviews(d.reviews || [])
        setAvgUserRating(d.avg_rating || 0)
        setUserReviewCount(d.review_count || 0)
      })
      .catch(() => {})
  }, [id])

  useEffect(() => {
    if (!id) return
    if (activeTab === "characters" && characters.length === 0) {
      getAnimeCharacters(id).then(d => setCharacters(d || [])).catch(() => {})
    }
    if (activeTab === "episodes" && episodes.length === 0) {
      getAnimeEpisodes(id).then(d => setEpisodes(d.data || [])).catch(() => {})
    }
  }, [activeTab, id, characters.length, episodes.length])

  useEffect(() => {
    if (!id) return
    getAnimeRecommendations(id).then(d => {
      setRelated((d || []).slice(0, 6).map(r => normalizeAnime(r.entry)))
    }).catch(() => {})
  }, [id])

  // Combined score calculation
  const baseScore = anime?.score || 0
  const baseWeight = 1
  const userWeight = Math.min(userReviewCount / 10, 1)
  const combinedScore = userReviewCount > 0
    ? ((baseScore * baseWeight + avgUserRating * userWeight) / (baseWeight + userWeight)).toFixed(2)
    : baseScore

  // Submit review
  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!user) { setLoginPrompt("review"); return }
    setSubmittingReview(true)
    try {
      await apiPost("/api/reviews", {
        anime_mal_id: parseInt(id),
        anime_title: anime?.title || "Unknown",
        rating: parseInt(reviewForm.rating),
        review_text: reviewForm.review_text,
      })
      setReviewMsg("Review submitted! 🎉")
      setReviewForm({ rating: 8, review_text: "" })
      // Refresh reviews
      const d = await apiGet(`/api/reviews?anime_id=${id}`)
      setSiteReviews(d.reviews || [])
      setAvgUserRating(d.avg_rating || 0)
      setUserReviewCount(d.review_count || 0)
      setTimeout(() => setReviewMsg(""), 3000)
    } catch (err) {
      setReviewMsg(err.message || "Failed to submit review")
      setTimeout(() => setReviewMsg(""), 3000)
    }
    setSubmittingReview(false)
  }

  // Add to watchlist
  async function handleAddWatchlist() {
    if (!user) { setLoginPrompt("watchlist"); return }
    try {
      await apiPost("/api/watchlist", {
        anime_mal_id: parseInt(id),
        title: anime?.title || "Unknown",
        image: anime?.image || anime?.images?.jpg?.large_image_url || "",
        genres: JSON.stringify(anime?.genres || []),
        rating: anime?.score || 0,
        episodes: anime?.episodes || 0,
      })
      setReviewMsg("Added to watchlist! ✅")
      setTimeout(() => setReviewMsg(""), 3000)
    } catch (err) {
      setReviewMsg(err.message || "Failed to add")
      setTimeout(() => setReviewMsg(""), 3000)
    }
  }

  const tabs = ["overview", "episodes", "characters", "reviews"]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  )

  if (!anime) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="font-orbitron text-2xl text-white mb-2">Anime not found</h2>
        <Link to="/anime" className="text-purple-400 hover:text-purple-300">Browse anime →</Link>
      </div>
    </div>
  )

  const a = anime
  const image = a.image || a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || ""
  const genreList = [...(a.genres || []), ...(a.themes || [])].map(g => typeof g === "string" ? g : g.name)
  const isOngoing = a.airing || a.status === "Currently Airing"

  // Normalize any YouTube URL into embed format
  function getEmbedUrl(url) {
    if (!url) return null
    // Already embed format
    if (url.includes("/embed/")) return url
    // youtu.be short URL
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
    // youtube.com/watch?v= format
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
    return url
  }
  const trailerUrl = getEmbedUrl(a.trailer_url)

  return (
    <div className="min-h-screen pt-16">
      {/* Login Prompt Modal */}
      {loginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setLoginPrompt("")}>
          <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">{loginPrompt === "watchlist" ? "📋" : "✍️"}</div>
            <h3 className="font-orbitron text-xl font-bold text-white mb-2">Login Required</h3>
            <p className="text-gray-400 mb-6">
              {loginPrompt === "watchlist" ? "You need to be logged in to add anime to your watchlist." : "You need to be logged in to write a review."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm">Login</Link>
              <Link to="/register" className="px-6 py-2.5 rounded-xl border border-purple-500/30 text-purple-300 font-bold text-sm">Register</Link>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {reviewMsg && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-semibold animate-fade-in">
          {reviewMsg}
        </div>
      )}

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
            <button onClick={handleAddWatchlist} className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all">+ Add to Watchlist</button>
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
              {a.score && <span className="flex items-center gap-1 text-yellow-400 font-bold">⭐ {a.score}/10 <span className="text-gray-500 font-normal">({a.scored_by?.toLocaleString()} votes)</span></span>}
              <span className="text-gray-400">🎬 {a.episodes || "?"} Episodes</span>
              {a.year && <span className="text-gray-400">📅 {a.year}</span>}
              {a.rank && <span className="text-gray-400">🏆 Rank #{a.rank}</span>}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isOngoing ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"}`}>{a.status}</span>
            </div>

            {/* Combined Score Badge */}
            {a.score && (
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="glass rounded-xl px-5 py-3 flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-yellow-400 font-orbitron font-black text-2xl">{combinedScore}</div>
                    <div className="text-gray-500 text-[10px] uppercase font-bold">AnimeVerse Score</div>
                  </div>
                  <div className="w-px h-10 bg-purple-500/20" />
                  <div className="text-center">
                    <div className="text-gray-300 font-bold text-sm">{a.score}</div>
                    <div className="text-gray-600 text-[10px]">Base</div>
                  </div>
                  {userReviewCount > 0 && (
                    <>
                      <div className="text-gray-600 text-xs">+</div>
                      <div className="text-center">
                        <div className="text-cyan-300 font-bold text-sm">{avgUserRating}</div>
                        <div className="text-gray-600 text-[10px]">{userReviewCount} reviews</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <p className="text-gray-300 leading-relaxed text-base mb-6">{a.synopsis}</p>
            {a.score && (
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-2xl ${i < Math.round(a.score / 2) ? "text-yellow-400" : "text-gray-700"}`}>★</span>
                ))}
                <span className="text-gray-400 ml-2">{a.score} / 10</span>
              </div>
            )}
          </div>
        </div>

        {/* YouTube Trailer */}
        {trailerUrl && (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl">🎥</span>
              <h2 className="font-orbitron text-xl font-bold text-white">Trailer</h2>
              <div className="flex-1 neon-line opacity-30" />
            </div>
            <div className="relative rounded-2xl overflow-hidden glass" style={{ aspectRatio: "16/9", maxWidth: "800px" }}>
              {showTrailer ? (
                <iframe
                  src={`${trailerUrl.replace('youtube.com', 'youtube-nocookie.com')}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${a.title} Trailer`}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 cursor-pointer group" onClick={() => setShowTrailer(true)}>
                  <img src={image} alt="Trailer thumbnail" className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03010a] via-transparent to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-purple-600/80 border-2 border-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(180,79,255,0.5)] transition-all duration-300">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <span className="text-white font-semibold mt-4 text-sm group-hover:text-purple-300 transition-colors">Watch Trailer</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                      <span className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-500/40 transition-all shrink-0 ml-3">▶</span>
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
          <div className="animate-fade-in space-y-6">
            {/* Review Form */}
            <div className="glass rounded-xl p-6">
              {user ? (
                <>
                  <h3 className="font-orbitron text-lg font-bold text-white mb-4">✍️ Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-gray-400 text-sm font-semibold">Rating:</label>
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }, (_, i) => (
                          <button key={i} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${reviewForm.rating >= i + 1 ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50" : "bg-[#0d0a1a] text-gray-500 border border-purple-500/10 hover:border-yellow-500/30"}`}>
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <span className="text-yellow-400 font-bold">{reviewForm.rating}/10</span>
                    </div>
                    <textarea value={reviewForm.review_text} onChange={e => setReviewForm({ ...reviewForm, review_text: e.target.value })} placeholder="Share your thoughts about this anime..." rows={4} required className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm resize-none" />
                    <button type="submit" disabled={submittingReview} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.3)] transition-all disabled:opacity-50">
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">✍️</div>
                  <h3 className="font-orbitron text-lg font-bold text-white mb-2">Want to review this anime?</h3>
                  <p className="text-gray-400 mb-4">Login or create an account to share your thoughts</p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/login" className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm">Login</Link>
                    <Link to="/register" className="px-5 py-2 rounded-xl border border-purple-500/30 text-purple-300 font-bold text-sm">Register</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Site Reviews */}
            {siteReviews.length > 0 && (
              <div>
                <h3 className="font-orbitron text-lg font-bold text-white mb-4">User Reviews ({siteReviews.length})</h3>
                <div className="space-y-4">
                  {siteReviews.map(r => (
                    <div key={r.id} className="glass rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                            {r.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">{r.username}</h4>
                            <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="text-yellow-400 font-bold">⭐ {r.rating}/10</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{r.review_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {siteReviews.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No reviews yet. Be the first to review this anime!
              </div>
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
