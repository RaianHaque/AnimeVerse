import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-[#06020f] border-t border-purple-500/10 mt-20">
      <div className="neon-line w-full" />
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-cyan-400 to-pink-500 flex items-center justify-center font-orbitron font-black text-white text-sm">A</div>
              <span className="font-orbitron font-bold text-lg bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">AnimeVerse</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Your ultimate destination for discovering, tracking, and falling in love with anime. Join millions of fans worldwide.</p>
          </div>
          <div>
            <h3 className="font-orbitron text-sm font-bold text-purple-300 mb-4 tracking-wider">QUICK LINKS</h3>
            <ul className="space-y-2.5">
              <li><Link to="/anime" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">Browse Anime</Link></li>
              <li><Link to="/top-rated" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">Top Rated</Link></li>
              <li><Link to="/watchlist" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">My Watchlist</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-orbitron text-sm font-bold text-cyan-300 mb-4 tracking-wider">GENRES</h3>
            <ul className="space-y-2.5">
              {["Action","Romance","Fantasy","Sci-Fi","Horror","Comedy"].map(g => (
                <li key={g}><span className="text-gray-400 hover:text-cyan-300 text-sm cursor-pointer transition-colors">{g}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-orbitron text-sm font-bold text-pink-300 mb-4 tracking-wider">FOLLOW US</h3>
            <div className="flex gap-3 flex-wrap">
              {["X / Twitter","Discord","Instagram","YouTube"].map(s => (
                <span key={s} className="px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 text-xs cursor-pointer hover:bg-purple-500/20 hover:text-purple-300 transition-all">{s}</span>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="text-sm text-gray-300 mb-2">Stay Updated</h4>
              <div className="flex">
                <input placeholder="Your email" className="flex-1 px-3 py-1.5 rounded-l-lg bg-[#0d0a1a] border border-purple-500/20 text-sm text-white placeholder-gray-500 focus:outline-none" />
                <button className="px-4 py-1.5 rounded-r-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold">Go</button>
              </div>
            </div>
          </div>
        </div>
        <div className="neon-line mt-10 mb-6 opacity-40" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>&#169; 2026 AnimeVerse. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-purple-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-purple-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-purple-300 cursor-pointer transition-colors">FAQ</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
