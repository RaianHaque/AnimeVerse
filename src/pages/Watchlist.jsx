import { useState } from "react"
import { Link } from "react-router-dom"
import { animeData } from "../data/animeData"
import AnimeCard from "../components/AnimeCard"

const initialWatchlist = animeData.slice(0, 6).map((a, i) => ({
  ...a,
  watchStatus: ["Watching", "Completed", "Plan to Watch", "Watching", "Completed", "Dropped"][i],
  progress: [45, 100, 0, 67, 100, 12][i],
}))

export default function Watchlist() {
  const [filter, setFilter] = useState("All")
  const [watchlist] = useState(initialWatchlist)

  const filtered = filter === "All" ? watchlist : watchlist.filter(a => a.watchStatus === filter)

  const statusColors = {
    Watching: "bg-green-500/20 text-green-300 border-green-500/30",
    Completed: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "Plan to Watch": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Dropped: "bg-red-500/20 text-red-300 border-red-500/30",
  }

  const statCounts = {
    Total: watchlist.length,
    Watching: watchlist.filter(a => a.watchStatus === "Watching").length,
    Completed: watchlist.filter(a => a.watchStatus === "Completed").length,
    "Plan to Watch": watchlist.filter(a => a.watchStatus === "Plan to Watch").length,
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-orbitron text-4xl md:text-5xl font-black text-white text-glow-purple mb-3">MY <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">WATCHLIST</span></h1>
        <p className="text-gray-400 text-lg mb-8">Track and manage your anime journey</p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statCounts).map(([label, count]) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <div className="font-orbitron text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{count}</div>
              <div className="text-gray-400 text-sm">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", "Watching", "Completed", "Plan to Watch", "Dropped"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === s ? "bg-purple-500/30 text-purple-300 border border-purple-400/50" : "bg-[#0d0a1a] text-gray-400 border border-purple-500/10 hover:border-purple-500/30"}`}>{s}</button>
          ))}
        </div>

        {/* Watchlist Grid */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(a => (
              <div key={a.id} className="glass rounded-xl p-4 hover:border-purple-500/30 transition-all group">
                <div className="flex gap-4">
                  <Link to={`/anime/${a.id}`}>
                    <img src={a.image} alt={a.title} className="w-20 h-28 object-cover rounded-lg shrink-0" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link to={`/anime/${a.id}`} className="font-semibold text-white group-hover:text-purple-300 transition-colors">{a.title}</Link>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span>&#11088; {a.rating}</span>
                          <span>&#127916; {a.episodes} eps</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusColors[a.watchStatus]}`}>{a.watchStatus}</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{a.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#0d0a1a] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all" style={{ width: `${a.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.genre.map(g => (
                        <span key={g} className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">{g}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl">
            <div className="text-6xl mb-4">&#128218;</div>
            <h3 className="font-orbitron text-2xl text-white mb-3">Your watchlist is empty</h3>
            <p className="text-gray-400 mb-6">Start adding anime to your watchlist to track your progress</p>
            <Link to="/anime" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(180,79,255,0.4)] transition-all">Browse Anime</Link>
          </div>
        )}
      </div>
    </div>
  )
}
