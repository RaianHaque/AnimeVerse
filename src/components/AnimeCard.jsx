import { Link } from "react-router-dom"
import { fixBrokenAnimeMedia } from "../services/api"

export default function AnimeCard({ anime }) {
  const rating = anime.rating || anime.score || 0
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating / 2))
  const statusText = anime.airing ? "Ongoing" : anime.status === "Currently Airing" ? "Ongoing" : anime.status === "Finished Airing" ? "Completed" : anime.status || "Unknown"
  const isOngoing = statusText === "Ongoing" || statusText === "Currently Airing"
  const fixedMedia = fixBrokenAnimeMedia(anime.title, anime.image, anime.trailer_url)

  return (
    <Link to={`/anime/${anime.mal_id}`} className="anime-card block rounded-xl overflow-hidden bg-[#0d0a1a] border border-purple-500/10 hover:border-purple-500/30 group relative">
      <div className="relative overflow-hidden aspect-[3/4]">
        <img src={fixedMedia.image} alt={anime.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1a] via-transparent to-transparent" />
        <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOngoing ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"}`}>{statusText}</span>
        {rating > 0 && <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold">&#11088; {rating}</span>}
        <div className="absolute inset-0 bg-purple-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <span className="w-10 h-10 rounded-full bg-purple-500/80 flex items-center justify-center text-white text-lg cursor-pointer hover:bg-purple-400 transition-colors">&#9654;</span>
          <span className="w-10 h-10 rounded-full bg-cyan-500/80 flex items-center justify-center text-white text-lg cursor-pointer hover:bg-cyan-400 transition-colors">+</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white truncate group-hover:text-purple-300 transition-colors">{anime.title}</h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400">&#127916; {anime.episodes || "?"} eps</span>
          <span className="text-[10px] text-gray-600">|</span>
          <span className="text-xs text-gray-400">{anime.year || "N/A"}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {(anime.genre || []).slice(0, 2).map(g => (
            <span key={g} className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">{g}</span>
          ))}
        </div>
        <div className="flex gap-0.5 mt-2">
          {stars.map((filled, i) => (
            <span key={i} className={`text-xs ${filled ? "text-yellow-400" : "text-gray-600"}`}>&#9733;</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
