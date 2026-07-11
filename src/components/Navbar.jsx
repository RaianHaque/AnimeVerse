import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const loc = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAdmin, isSuperAdmin, actualRole, viewMode, toggleViewMode } = useAuth()
  const isActive = (p) => loc.pathname === p

  const links = [
    { to: "/", label: "Home" },
    { to: "/anime", label: "Anime" },
    { to: "/top-rated", label: "Top Rated" },
    { to: "/watchlist", label: "Watchlist" },
    { to: "/contact", label: "Contact" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 via-cyan-400 to-pink-500 flex items-center justify-center font-orbitron font-black text-white text-lg group-hover:scale-110 transition-transform">A</div>
            <span className="font-orbitron font-bold text-xl bg-gradient-to-r from-purple-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent">AnimeVerse</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to} className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${isActive(l.to) ? "bg-purple-500/20 text-purple-300 text-glow-purple" : "text-gray-300 hover:text-purple-300 hover:bg-purple-500/10"}`}>
                {l.label}
              </Link>
            ))}
            {/* Desktop Admin Dropdown */}
            {user && (isAdmin || isSuperAdmin) && (
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-1 ${isActive("/admin") ? "bg-amber-500/20 text-amber-300" : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"}`}>
                  👑 Admin <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#0a0710] border border-purple-500/30 shadow-[0_0_20px_rgba(180,79,255,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden flex flex-col py-1">
                  <Link to="/admin" className="px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 font-semibold">📊 Full Dashboard</Link>
                  <Link to="/admin" className="px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 font-semibold">🎬 Manage Anime</Link>
                  <Link to="/admin" className="px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 font-semibold">👥 Manage Users</Link>
                  <Link to="/admin" className="px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 font-semibold">⭐ Manage Reviews</Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              {searchOpen ? (
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)} onBlur={() => { if (!search) setSearchOpen(false) }} placeholder="Search anime..." className="w-56 px-4 py-1.5 rounded-full bg-[#0d0a1a] border border-purple-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.3)] transition-all" />
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-purple-500/10 text-gray-400 hover:text-purple-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              )}
            </div>

            {/* Admin view toggle badge */}
            {user && (actualRole === "admin" || actualRole === "super_admin") && (
              <button
                onClick={toggleViewMode}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  viewMode === "default"
                    ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                    : "bg-gray-500/20 border border-gray-500/30 text-gray-400 hover:bg-gray-500/30"
                }`}
                title={viewMode === "default" ? "Viewing as Admin — Click to view as User" : "Viewing as User — Click to view as Admin"}
              >
                {viewMode === "default" ? "👑 Admin" : "👤 User"} View
              </button>
            )}

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-purple-500/10 transition-all group">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-orbitron font-bold text-xs">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 font-semibold group-hover:text-purple-300 transition-colors">{user.username}</span>
                </Link>
                <button onClick={handleLogout} className="px-4 py-1.5 rounded-full border border-purple-500/20 text-gray-400 text-sm font-semibold hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/10 transition-all">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold hover:from-purple-500 hover:to-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(180,79,255,0.4)]">Login</Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-300 hover:text-purple-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden glass border-t border-purple-500/20 animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-semibold ${isActive(l.to) ? "bg-purple-500/20 text-purple-300" : "text-gray-300 hover:bg-purple-500/10"}`}>{l.label}</Link>
            ))}

            {/* Admin Dashboard link in hamburger menu */}
            {user && (actualRole === "admin" || actualRole === "super_admin") && (
              <>
                <div className="border-t border-purple-500/10 my-2" />
                {(isAdmin || isSuperAdmin) && (
                  <>
                    <span className="block px-4 py-1 text-[10px] font-bold uppercase text-amber-500/50 tracking-wider">Admin Controls</span>
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-semibold ${isActive("/admin") ? "bg-amber-500/20 text-amber-300" : "text-amber-400 hover:bg-amber-500/10"}`}>
                      👑 Full Dashboard
                    </Link>
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-purple-500/10">
                      🎬 Manage Anime
                    </Link>
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-purple-500/10">
                      👥 Manage Users
                    </Link>
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-purple-500/10">
                      ⭐ Manage Reviews
                    </Link>
                  </>
                )}
                <button
                  onClick={() => { toggleViewMode(); setMobileOpen(false) }}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:bg-purple-500/10"
                >
                  {viewMode === "default" ? "👤 Switch to User View" : "👑 Switch to Admin View"}
                </button>
              </>
            )}

            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-purple-500/10">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-[10px]">{user.username[0].toUpperCase()}</span>
                    {user.username}
                  </span>
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold text-center mt-2">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
