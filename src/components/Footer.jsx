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
                <li key={g}><Link to={`/anime?genre=${g}`} className="text-gray-400 hover:text-cyan-300 text-sm cursor-pointer transition-colors">{g}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-orbitron text-sm font-bold text-pink-300 mb-4 tracking-wider">FOLLOW US</h3>
            <div className="flex gap-3 flex-wrap">
              <a href="https://twitter.com/AnimeVerse" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 text-xs hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/50 transition-all">X / Twitter</a>
              <a href="https://discord.gg/AnimeVerse" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 text-xs hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/50 transition-all">Discord</a>
              <a href="https://instagram.com/AnimeVerse" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 text-xs hover:bg-pink-500/20 hover:text-pink-300 hover:border-pink-500/50 transition-all">Instagram</a>
              <a href="https://youtube.com/@AnimeVerse" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 text-xs hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 transition-all">YouTube</a>
            </div>
            <div className="mt-6">
              <h4 className="text-sm text-gray-300 mb-2">Stay Updated</h4>
              <form 
                className="flex"
                onSubmit={(e) => {
                  e.preventDefault();
                  const btn = e.currentTarget.querySelector('button');
                  const orig = btn.innerText;
                  btn.innerText = "Subscribed!";
                  btn.classList.add("bg-green-500");
                  e.currentTarget.reset();
                  setTimeout(() => { btn.innerText = orig; btn.classList.remove("bg-green-500"); }, 3000);
                }}
              >
                <input required type="email" placeholder="Your email" className="flex-1 w-full min-w-[150px] px-3 py-1.5 rounded-l-lg bg-[#0d0a1a] border border-purple-500/20 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400" />
                <button type="submit" className="px-4 py-1.5 rounded-r-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold transition-all min-w-[50px]">Go</button>
              </form>
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
