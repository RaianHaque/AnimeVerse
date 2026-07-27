import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { quickSearchAnime } from "../services/api"

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const loc = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAdmin, isSuperAdmin, actualRole, viewMode, toggleViewMode } = useAuth()
  const isActive = (p) => loc.pathname === p

  useEffect(() => {
    if (!search || search.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    let active = true
    quickSearchAnime(search).then(res => {
      if (active) {
        setSuggestions(res)
        setShowSuggestions(true)
      }
    })
    return () => { active = false }
  }, [search])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const submitSearch = (e) => {
    if (e) e.preventDefault()
    if (!search.trim()) return
    setShowSuggestions(false)
    setSearchOpen(false)
    setMobileOpen(false)
    navigate(`/anime?search=${encodeURIComponent(search.trim())}`)
  }

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
                  <Link to="/admin?tab=stats" className="px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 font-semibold">📊 Full Dashboard</Link>
                  <Link to="/admin?tab=anime" className="px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 font-semibold">🎬 Manage Anime</Link>
                  <Link to="/admin?tab=users" className="px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 font-semibold">👥 Manage Users</Link>
                  <Link to="/admin?tab=reviews" className="px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 font-semibold">⭐ Manage Reviews</Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div ref={searchRef} className="relative hidden sm:block">
              {searchOpen || search.length > 0 ? (
                <form onSubmit={submitSearch} className="relative flex items-center">
                  <input
                    autoFocus
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value)
                      if (e.target.value.trim().length > 0) setShowSuggestions(true)
                    }}
                    onFocus={() => { if (search.trim().length > 0) setShowSuggestions(true) }}
                    placeholder="Search anime..."
                    className="w-64 pl-4 pr-10 py-1.5 rounded-full bg-[#0d0a1a] border border-purple-500/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 p-1 text-gray-400 hover:text-purple-300 transition-colors"
                    title="Search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>

                  {/* Autocomplete Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0a1a]/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-fadeIn">
                      <div className="p-2 text-[10px] font-orbitron font-bold uppercase tracking-wider text-purple-400 border-b border-white/5 bg-purple-950/20">
                        Top Suggestions ({suggestions.length})
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                        {suggestions.map(item => (
                          <div
                            key={item.mal_id || item.id}
                            onClick={() => {
                              setShowSuggestions(false)
                              setSearchOpen(false)
                              navigate(`/anime/${item.mal_id || item.id}`)
                            }}
                            className="flex items-center gap-3 p-2.5 hover:bg-purple-500/20 transition-all cursor-pointer group"
                          >
                            <img
                              src={item.image || (item.images?.jpg?.image_url) || "https://cdn.myanimelist.net/images/anime/10/47347.jpg"}
                              alt={item.title}
                              className="w-10 h-14 object-cover rounded-md shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 truncate transition-colors">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <span>{item.year !== "N/A" ? item.year : "TV"}</span>
                                <span>•</span>
                                <span className="truncate">{item.genre?.slice(0, 2).join(", ") || "Anime"}</span>
                              </div>
                            </div>
                            {item.score && item.score > 0 ? (
                              <div className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded text-[11px] font-bold font-orbitron flex items-center gap-0.5 flex-shrink-0">
                                ⭐ {Number(item.score).toFixed(1)}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <div
                        onClick={submitSearch}
                        className="p-2.5 text-center text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 cursor-pointer border-t border-white/5 transition-colors"
                      >
                        See all results for "{search}" →
                      </div>
                    </div>
                  )}
                </form>
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
            {/* Mobile Search */}
            <form onSubmit={submitSearch} className="relative mb-3">
              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  if (e.target.value.trim().length > 0) setShowSuggestions(true)
                }}
                placeholder="Search anime..."
                className="w-full pl-4 pr-10 py-2 rounded-full bg-[#0d0a1a] border border-purple-500/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-purple-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>

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
                    <Link to="/admin?tab=stats" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-semibold ${isActive("/admin") ? "bg-amber-500/20 text-amber-300" : "text-amber-400 hover:bg-amber-500/10"}`}>
                      👑 Full Dashboard
                    </Link>
                    <Link to="/admin?tab=anime" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-purple-500/10">
                      🎬 Manage Anime
                    </Link>
                    <Link to="/admin?tab=users" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-purple-500/10">
                      👥 Manage Users
                    </Link>
                    <Link to="/admin?tab=reviews" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-purple-500/10">
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
