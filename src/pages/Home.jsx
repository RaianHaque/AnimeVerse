import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getTopAnime, getSeasonNow, normalizeAnime } from "../services/api"
import AnimeCard from "../components/AnimeCard"

export default function Home() {
  const [trending, setTrending] = useState([])
  const [topRated, setTopRated] = useState([])
  const [featured, setFeatured] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [seasonRes, topRes] = await Promise.all([
          getSeasonNow(1),
          getTopAnime(1, 25),
        ])
        const trendingData = (seasonRes.data || []).map(normalizeAnime)
        const topData = (topRes.data || []).map(normalizeAnime)
        setTrending(trendingData.slice(0, 10))
        setTopRated(topData.slice(0, 8))
        setFeatured(topData[0] || trendingData[0] || null)
      } catch (err) {
        console.error("Failed to fetch:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const genres = [
    { name: "Action", icon: "&#9876;", color: "from-red-500 to-orange-500" },
    { name: "Romance", icon: "&#10084;", color: "from-pink-500 to-rose-500" },
    { name: "Fantasy", icon: "&#9733;", color: "from-purple-500 to-violet-500" },
    { name: "Sci-Fi", icon: "&#9883;", color: "from-cyan-500 to-blue-500" },
    { name: "Horror", icon: "&#9760;", color: "from-gray-600 to-gray-800" },
    { name: "Comedy", icon: "&#9786;", color: "from-yellow-500 to-amber-500" },
    { name: "Drama", icon: "&#127917;", color: "from-indigo-500 to-purple-600" },
    { name: "Adventure", icon: "&#9992;", color: "from-green-500 to-emerald-500" },
  ]

  const stats = [
    { label: "Anime Titles", value: "25,000+" },
    { label: "Episodes", value: "300,000+" },
    { label: "Users", value: "2M+" },
    { label: "Studios", value: "1,500+" },
  ]

  const Loader = () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen hero-gradient grid-overlay flex items-center overflow-hidden">
        <div className="absolute inset-0 particle-bg" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/8 rounded-full blur-[80px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse-glow" />
                <span className="text-purple-300 text-xs font-semibold tracking-wider uppercase">Discover New Worlds</span>
              </div>
              <h1 className="font-orbitron text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">DISCOVER</span><br />
                <span className="text-white">YOUR NEXT</span><br />
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">ANIME</span>
                <span className="text-white"> OBSESSION</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-lg mb-8 leading-relaxed">Explore thousands of anime titles, track your watchlist, discover hidden gems, and join a community of passionate fans.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/anime" className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(180,79,255,0.4)] transition-all hover:scale-105">Browse Anime</Link>
                <Link to="/top-rated" className="px-8 py-3 rounded-xl border border-purple-500/30 text-purple-300 font-bold text-sm hover:bg-purple-500/10 hover:border-purple-400 transition-all hover:scale-105">Top Rated</Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
                <div className="grid grid-cols-2 gap-4 relative">
                  {trending.slice(0, 4).map((a, i) => (
                    <Link to={`/anime/${a.mal_id}`} key={a.mal_id} className={`rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400/50 transition-all ${i === 0 ? "translate-y-6" : i === 3 ? "-translate-y-6" : ""}`}>
                      <img src={a.image} alt={a.title} className="w-40 h-56 object-cover hover:scale-110 transition-transform duration-500" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#03010a] to-transparent" />
      </section>

      {/* TRENDING */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">&#128293;</span>
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white">Trending <span className="text-glow-purple text-purple-400">Now</span></h2>
          <div className="flex-1 neon-line opacity-30" />
          <Link to="/anime" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">View All &#8594;</Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {trending.map(a => <AnimeCard key={a.mal_id} anime={a} />)}
          </div>
        )}
      </section>

      {/* FEATURED */}
      {featured && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl">&#11088;</span>
            <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white">Featured <span className="text-glow-blue text-cyan-400">Anime</span></h2>
            <div className="flex-1 neon-line opacity-30" />
          </div>
          <div className="relative rounded-2xl overflow-hidden glass">
            <div className="absolute inset-0">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover opacity-20 blur-sm" onError={(e) => { e.target.onerror = null; e.target.src = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tN1511AAsz5D6H90zRGEqjAGr4q.jpg"; }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a1a] via-[#0d0a1a]/90 to-transparent" />
            </div>
            <div className="relative grid md:grid-cols-[250px_1fr] gap-8 p-8">
              <img src={featured.image} alt={featured.title} className="rounded-xl w-full max-w-[250px] shadow-[0_0_30px_rgba(180,79,255,0.2)]" onError={(e) => { e.target.onerror = null; e.target.src = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tN1511AAsz5D6H90zRGEqjAGr4q.jpg"; }} />
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-3">
                  {featured.genre.map(g => (
                    <span key={g} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">{g}</span>
                  ))}
                </div>
                <h3 className="font-orbitron text-3xl font-bold text-white text-glow-purple mb-3">{featured.title}</h3>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                  <span>&#11088; {featured.rating}</span>
                  <span>&#127916; {featured.episodes} Episodes</span>
                  <span>{featured.year}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${featured.airing ? "bg-green-500/20 text-green-300" : "bg-cyan-500/20 text-cyan-300"}`}>{featured.status}</span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-xl line-clamp-4">{featured.description}</p>
                <div className="flex gap-4">
                  <Link to={`/anime/${featured.mal_id}`} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all">View Details</Link>
                  <button className="px-6 py-2.5 rounded-xl border border-purple-500/30 text-purple-300 font-bold text-sm hover:bg-purple-500/10 transition-all">+ Watchlist</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GENRES */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">&#127912;</span>
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white">Browse by <span className="text-glow-pink text-pink-400">Genre</span></h2>
          <div className="flex-1 neon-line opacity-30" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genres.map(g => (
            <Link to="/anime" key={g.name} className="group relative rounded-xl overflow-hidden bg-[#0d0a1a] border border-purple-500/10 hover:border-purple-500/30 p-6 text-center transition-all hover:scale-105">
              <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="text-3xl mb-3" dangerouslySetInnerHTML={{ __html: g.icon }} />
              <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{g.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center glass rounded-xl p-6 hover:glow-purple transition-all">
                <div className="font-orbitron text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP RATED PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">&#127942;</span>
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white">Top <span className="text-glow-blue text-cyan-400">Rated</span></h2>
          <div className="flex-1 neon-line opacity-30" />
          <Link to="/top-rated" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">View All &#8594;</Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {topRated.slice(0, 4).map(a => <AnimeCard key={a.mal_id} anime={a} />)}
          </div>
        )}
      </section>
    </div>
  )
}
