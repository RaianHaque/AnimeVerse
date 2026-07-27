import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiGet, apiPost, apiPut, apiDelete } from "../services/db"
import { getAllAnimeRaw } from "../services/api"

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin, actualRole, hasPermission } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState("stats")
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [messages, setMessages] = useState([])
  const [customAnime, setCustomAnime] = useState([])
  const [coreAnimeList, setCoreAnimeList] = useState(() => {
    const hiddenIds = JSON.parse(localStorage.getItem("av_hidden_core_anime") || "[]")
    return getAllAnimeRaw().filter(a => !hiddenIds.includes(a.mal_id))
  })
  const [admins, setAdmins] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [animeForm, setAnimeForm] = useState({ title: "", title_english: "", synopsis: "", score: "", episodes: "", status: "Finished Airing", type: "TV", year: "", genres: "", studios: "", image: "", trailer_url: "", trending: false, top_rated: false })
  const [editingAnime, setEditingAnime] = useState(null)
  const [permModal, setPermModal] = useState(null)

  // Redirect non-admins
  useEffect(() => {
    if (!user) { navigate("/login"); return }
    if (actualRole !== "admin" && actualRole !== "super_admin") { navigate("/"); return }
  }, [user, actualRole, navigate])

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAdmin && actualRole !== "admin" && actualRole !== "super_admin") return
    if (tab === "stats") fetchStats()
    if (tab === "users") fetchUsers()
    if (tab === "reviews") fetchReviews()
    if (tab === "messages") fetchMessages()
    if (tab === "anime") fetchAnime()
    if (tab === "admins") fetchAdmins()
  }, [tab])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000) }

  async function fetchStats() {
    try { const d = await apiGet("/api/admin?action=stats"); setStats(d.stats) } catch {}
  }
  async function fetchUsers() {
    try { const d = await apiGet("/api/admin?action=users"); setUsers(d.users) } catch {}
  }
  async function fetchReviews() {
    try { const d = await apiGet("/api/admin?action=reviews"); setReviews(d.reviews) } catch {}
  }
  async function fetchMessages() {
    try { const d = await apiGet("/api/admin?action=messages"); setMessages(d.messages) } catch {}
  }
  async function fetchAnime() {
    try {
      const d = await apiGet("/api/admin?action=anime")
      if (d && d.anime && d.anime.length > 0) {
        setCustomAnime(d.anime)
      } else {
        setCustomAnime([
          { id: 9001, title: "Solo Leveling Season 2: Arise from the Shadow", type: "TV", year: 2025, episodes: 12, score: 9.2, image: "https://cdn.myanimelist.net/images/anime/1160/140461l.jpg", is_hidden: false, isDemo: true },
          { id: 9002, title: "Chainsaw Man - The Movie: Reze Arc", type: "Movie", year: 2024, episodes: 1, score: 9.1, image: "https://cdn.myanimelist.net/images/anime/1806/140082l.jpg", is_hidden: false, isDemo: true },
          { id: 9003, title: "One Punch Man Season 3", type: "TV", year: 2025, episodes: 12, score: 8.9, image: "https://cdn.myanimelist.net/images/anime/1160/122627l.jpg", is_hidden: false, isDemo: true },
          { id: 9004, title: "Bleach: Thousand-Year Blood War - Part 3", type: "TV", year: 2024, episodes: 13, score: 9.0, image: "https://cdn.myanimelist.net/images/anime/1764/138036l.jpg", is_hidden: false, isDemo: true },
          { id: 9005, title: "Jujutsu Kaisen Season 3: Culling Game", type: "TV", year: 2025, episodes: 24, score: 9.3, image: "https://cdn.myanimelist.net/images/anime/1171/141018l.jpg", is_hidden: false, isDemo: true }
        ])
      }
    } catch {
      setCustomAnime([
        { id: 9001, title: "Solo Leveling Season 2: Arise from the Shadow", type: "TV", year: 2025, episodes: 12, score: 9.2, image: "https://cdn.myanimelist.net/images/anime/1160/140461l.jpg", is_hidden: false, isDemo: true },
        { id: 9002, title: "Chainsaw Man - The Movie: Reze Arc", type: "Movie", year: 2024, episodes: 1, score: 9.1, image: "https://cdn.myanimelist.net/images/anime/1806/140082l.jpg", is_hidden: false, isDemo: true },
        { id: 9003, title: "One Punch Man Season 3", type: "TV", year: 2025, episodes: 12, score: 8.9, image: "https://cdn.myanimelist.net/images/anime/1160/122627l.jpg", is_hidden: false, isDemo: true },
        { id: 9004, title: "Bleach: Thousand-Year Blood War - Part 3", type: "TV", year: 2024, episodes: 13, score: 9.0, image: "https://cdn.myanimelist.net/images/anime/1764/138036l.jpg", is_hidden: false, isDemo: true },
        { id: 9005, title: "Jujutsu Kaisen Season 3: Culling Game", type: "TV", year: 2025, episodes: 24, score: 9.3, image: "https://cdn.myanimelist.net/images/anime/1171/141018l.jpg", is_hidden: false, isDemo: true }
      ])
    }
  }
  async function fetchAdmins() {
    try { const d = await apiGet("/api/admin?action=manage-admins"); setAdmins(d.admins) } catch {}
  }

  async function searchUsers() {
    if (searchQuery.length < 2) return
    try {
      const d = await apiGet(`/api/admin?action=search-users&q=${encodeURIComponent(searchQuery)}`)
      setSearchResults(d.users)
    } catch {}
  }

  async function promoteUser(uid) {
    try {
      await apiPost("/api/admin?action=promote", { user_id: uid })
      flash("User promoted to admin!")
      setSearchResults([])
      setSearchQuery("")
      fetchAdmins()
      fetchUsers()
    } catch (e) { flash(e.message) }
  }

  async function demoteUser(uid) {
    if (!confirm("Remove admin privileges from this user?")) return
    try {
      await apiPost("/api/admin?action=demote", { user_id: uid })
      flash("Admin demoted to user")
      fetchAdmins()
      fetchUsers()
    } catch (e) { flash(e.message) }
  }

  async function updatePermissions(uid, perms) {
    try {
      await apiPost("/api/admin?action=update-permissions", { user_id: uid, permissions: perms })
      flash("Permissions updated!")
      setPermModal(null)
      fetchAdmins()
    } catch (e) { flash(e.message) }
  }

  async function deleteUser(uid) {
    if (!confirm("Permanently delete this user and all their data?")) return
    try {
      await apiDelete("/api/admin?action=users", { user_id: uid })
      flash("User deleted")
      fetchUsers()
    } catch (e) { flash(e.message) }
  }

  async function toggleReviewHidden(rid, hide) {
    try {
      await apiPost("/api/admin?action=reviews", { review_id: rid, is_hidden: hide })
      flash(hide ? "Review hidden" : "Review restored")
      fetchReviews()
    } catch (e) { flash(e.message) }
  }

  async function deleteReview(rid) {
    if (!confirm("Permanently delete this review?")) return
    try {
      await apiDelete("/api/admin?action=reviews", { review_id: rid })
      flash("Review deleted")
      fetchReviews()
    } catch (e) { flash(e.message) }
  }

  async function toggleMessageRead(mid, read) {
    try {
      await apiPost("/api/admin?action=messages", { message_id: mid, is_read: read })
      fetchMessages()
    } catch {}
  }

  async function deleteMessage(mid) {
    if (!confirm("Permanently delete this message?")) return
    try {
      await apiDelete("/api/admin?action=messages", { message_id: mid })
      flash("Message deleted")
      fetchMessages()
    } catch (e) { flash(e.message) }
  }

  async function submitAnime(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const body = {
        ...animeForm,
        score: parseFloat(animeForm.score) || 0,
        episodes: parseInt(animeForm.episodes) || 0,
        year: parseInt(animeForm.year) || new Date().getFullYear(),
        genres: animeForm.genres ? animeForm.genres.split(",").map(g => g.trim()).filter(Boolean) : [],
        studios: animeForm.studios ? animeForm.studios.split(",").map(s => s.trim()).filter(Boolean) : [],
      }
      if (editingAnime) {
        await apiPut("/api/admin?action=anime", { ...body, id: editingAnime.id })
        flash("Anime updated!")
      } else {
        await apiPost("/api/admin?action=anime", body)
        flash("Anime added!")
      }
      setAnimeForm({ title: "", title_english: "", synopsis: "", score: "", episodes: "", status: "Finished Airing", type: "TV", year: "", genres: "", studios: "", image: "", trailer_url: "", trending: false, top_rated: false })
      setEditingAnime(null)
      fetchAnime()
    } catch (e) { flash(e.message) }
    setLoading(false)
  }

  async function deleteAnime(aid, isDemo = false, isCore = false) {
    if (!confirm(isSuperAdmin ? "Permanently delete this anime?" : "Hide this anime from user view?")) return
    if (isCore) {
      const hidden = JSON.parse(localStorage.getItem("av_hidden_core_anime") || "[]")
      hidden.push(aid)
      localStorage.setItem("av_hidden_core_anime", JSON.stringify(hidden))
      setCoreAnimeList(prev => prev.filter(a => a.mal_id !== aid))
      flash(isSuperAdmin ? "Core anime deleted!" : "Core anime hidden!")
      return
    }
    if (isDemo) {
      setCustomAnime(prev => prev.filter(a => a.id !== aid))
      flash(isSuperAdmin ? "Demo anime deleted!" : "Demo anime hidden!")
      return
    }
    try {
      await apiDelete("/api/admin?action=anime", { anime_id: aid })
      flash(isSuperAdmin ? "Anime deleted" : "Anime hidden")
      fetchAnime()
    } catch (e) { flash(e.message) }
  }

  function editAnime(a) {
    setAnimeForm({
      title: a.title || "",
      title_english: a.title_english || "",
      synopsis: a.synopsis || "",
      score: a.score?.toString() || "",
      episodes: a.episodes?.toString() || "",
      status: a.status || "Finished Airing",
      type: a.type || "TV",
      year: a.year?.toString() || "",
      genres: typeof a.genres === "string" ? JSON.parse(a.genres).join(", ") : (a.genres || []).join(", "),
      studios: typeof a.studios === "string" ? JSON.parse(a.studios).join(", ") : (a.studios || []).join(", "),
      image: a.image || "",
      trailer_url: a.trailer_url || "",
      trending: a.trending || false,
      top_rated: a.top_rated || false,
    })
    setEditingAnime(a)
    setTab("anime")
    window.scrollTo(0, 0)
  }

  if (!user || (actualRole !== "admin" && actualRole !== "super_admin")) return null

  const tabs = [
    { key: "stats", label: "📊 Stats", show: true },
    { key: "anime", label: "🎬 Anime", show: hasPermission("manage_anime") },
    { key: "users", label: "👥 Users", show: hasPermission("view_users") },
    { key: "reviews", label: "⭐ Reviews", show: hasPermission("moderate_reviews") },
    { key: "messages", label: "📩 Messages", show: hasPermission("view_messages") },
    { key: "admins", label: "👑 Admins", show: isSuperAdmin },
  ].filter(t => t.show)

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
  const btnPrimary = "px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.3)] transition-all"
  const btnDanger = "px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-all"
  const btnWarn = "px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-all"
  const btnGreen = "px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/30 transition-all"

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👑</span>
            <h1 className="font-orbitron text-3xl md:text-4xl font-black text-white">
              Admin <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Dashboard</span>
            </h1>
          </div>
          <p className="text-gray-400">
            {isSuperAdmin ? "Super Admin — Full Access" : "Admin — Limited Access"}
          </p>
        </div>

        {/* Toast */}
        {msg && (
          <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-semibold animate-fade-in">
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-purple-500/20 pb-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-purple-500/20 text-purple-300 border border-purple-400/50" : "text-gray-400 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── STATS TAB ─── */}
        {tab === "stats" && stats && (
          <div className="animate-fade-in grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Users", value: stats.total_users, icon: "👥", color: "from-purple-500 to-violet-500" },
              { label: "Reviews", value: stats.total_reviews, icon: "⭐", color: "from-yellow-500 to-amber-500" },
              { label: "Watchlist", value: stats.total_watchlist, icon: "📋", color: "from-cyan-500 to-blue-500" },
              { label: "Messages", value: stats.total_messages, icon: "📩", color: "from-pink-500 to-rose-500" },
              { label: "Admins", value: stats.total_admins, icon: "👑", color: "from-amber-500 to-orange-500" },
              { label: "Custom Anime", value: stats.total_custom_anime, icon: "🎬", color: "from-green-500 to-emerald-500" },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-5 text-center hover:glow-purple transition-all">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`font-orbitron text-2xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                <div className="text-gray-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ─── ANIME TAB ─── */}
        {tab === "anime" && (
          <div className="animate-fade-in space-y-8">
            {/* Add/Edit Form */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-orbitron text-lg font-bold text-white mb-4">{editingAnime ? "✏️ Edit Anime" : "➕ Add New Anime"}</h3>
              <form onSubmit={submitAnime} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input value={animeForm.title} onChange={e => setAnimeForm({...animeForm, title: e.target.value})} placeholder="Title *" required className={inputCls} />
                  <input value={animeForm.title_english} onChange={e => setAnimeForm({...animeForm, title_english: e.target.value})} placeholder="English Title" className={inputCls} />
                </div>
                <textarea value={animeForm.synopsis} onChange={e => setAnimeForm({...animeForm, synopsis: e.target.value})} placeholder="Synopsis / Description" rows={3} className={inputCls + " resize-none"} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <input value={animeForm.score} onChange={e => setAnimeForm({...animeForm, score: e.target.value})} placeholder="Score (0-10)" type="number" step="0.01" min="0" max="10" className={inputCls} />
                  <input value={animeForm.episodes} onChange={e => setAnimeForm({...animeForm, episodes: e.target.value})} placeholder="Episodes" type="number" min="0" className={inputCls} />
                  <select value={animeForm.status} onChange={e => setAnimeForm({...animeForm, status: e.target.value})} className={inputCls}>
                    <option value="Finished Airing">Finished Airing</option>
                    <option value="Currently Airing">Currently Airing</option>
                    <option value="Not yet aired">Not yet aired</option>
                  </select>
                  <select value={animeForm.type} onChange={e => setAnimeForm({...animeForm, type: e.target.value})} className={inputCls}>
                    <option value="TV">TV</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                    <option value="Special">Special</option>
                    <option value="ONA">ONA</option>
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input value={animeForm.year} onChange={e => setAnimeForm({...animeForm, year: e.target.value})} placeholder="Year" type="number" className={inputCls} />
                  <input value={animeForm.genres} onChange={e => setAnimeForm({...animeForm, genres: e.target.value})} placeholder="Genres (comma separated)" className={inputCls} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input value={animeForm.studios} onChange={e => setAnimeForm({...animeForm, studios: e.target.value})} placeholder="Studios (comma separated)" className={inputCls} />
                  <input value={animeForm.image} onChange={e => setAnimeForm({...animeForm, image: e.target.value})} placeholder="Image URL" className={inputCls} />
                </div>
                <input value={animeForm.trailer_url} onChange={e => setAnimeForm({...animeForm, trailer_url: e.target.value})} placeholder="YouTube Trailer URL (embed)" className={inputCls} />
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={animeForm.trending} onChange={e => setAnimeForm({...animeForm, trending: e.target.checked})} className="w-4 h-4 rounded bg-[#0d0a1a] border-purple-500/30 accent-purple-500" /> Trending
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={animeForm.top_rated} onChange={e => setAnimeForm({...animeForm, top_rated: e.target.checked})} className="w-4 h-4 rounded bg-[#0d0a1a] border-purple-500/30 accent-purple-500" /> Top Rated
                  </label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className={btnPrimary + " disabled:opacity-50"}>{editingAnime ? "Update Anime" : "Add Anime"}</button>
                  {editingAnime && (
                    <button type="button" onClick={() => { setEditingAnime(null); setAnimeForm({ title: "", title_english: "", synopsis: "", score: "", episodes: "", status: "Finished Airing", type: "TV", year: "", genres: "", studios: "", image: "", trailer_url: "", trending: false, top_rated: false }) }} className="px-4 py-2 rounded-xl border border-gray-500/30 text-gray-400 text-sm">Cancel</button>
                  )}
                </div>
              </form>
            </div>

            {/* Custom & Added Anime List */}
            <div className="space-y-3">
              <h3 className="font-orbitron text-lg font-bold text-white flex items-center gap-2">
                <span>🎬 Custom & Demo Anime</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">{customAnime.length}</span>
              </h3>
              {customAnime.length === 0 ? (
                <p className="text-gray-400 text-sm glass p-4 rounded-xl">No custom anime found. Add one above to see it here!</p>
              ) : (
                customAnime.map(a => (
                  <div key={a.id} className={`glass rounded-xl p-4 flex items-center gap-4 ${a.is_hidden ? "opacity-50" : ""}`}>
                    {a.image && <img src={a.image} alt={a.title} className="w-12 h-16 object-cover rounded-lg shrink-0 shadow-md" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm truncate">{a.title} {a.is_hidden && <span className="text-red-400 text-xs">(Hidden)</span>} {a.isDemo && <span className="text-cyan-400 text-[10px] ml-1 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">Demo</span>}</h4>
                      <p className="text-gray-500 text-xs">{a.type} • {a.year} • {a.episodes} eps • ⭐ {a.score}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => editAnime(a)} className={btnWarn}>Edit</button>
                      <button onClick={() => deleteAnime(a.id, a.isDemo, false)} className={btnDanger}>{isSuperAdmin ? "Delete" : "Hide"}</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Core Library Catalog List */}
            <div className="space-y-3 pt-6 border-t border-purple-500/20">
              <h3 className="font-orbitron text-lg font-bold text-white flex items-center gap-2">
                <span>📚 Core Library Catalog</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">{coreAnimeList.length}</span>
              </h3>
              <p className="text-xs text-gray-400 mb-2">You can manage, edit, or delete titles from your built-in anime database right here:</p>
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1 divide-y divide-white/5">
                {coreAnimeList.map(a => (
                  <div key={a.mal_id} className="glass rounded-xl p-3 flex items-center gap-4 pt-3">
                    <img src={a.image || (a.images?.jpg?.image_url) || "https://cdn.myanimelist.net/images/anime/10/47347.jpg"} alt={a.title} className="w-10 h-14 object-cover rounded-lg shrink-0 shadow" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm truncate">{a.title}</h4>
                      <p className="text-gray-500 text-xs">{a.type || "TV"} • {a.year || "N/A"} • {a.episodes || "?"} eps • ⭐ {a.score || "N/A"}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => editAnime({ ...a, id: a.mal_id, isCore: true })} className={btnWarn}>Edit</button>
                      <button onClick={() => deleteAnime(a.mal_id, false, true)} className={btnDanger}>{isSuperAdmin ? "Delete" : "Hide"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── USERS TAB ─── */}
        {tab === "users" && (
          <div className="animate-fade-in space-y-3">
            <h3 className="font-orbitron text-lg font-bold text-white mb-4">All Users ({users.length})</h3>
            {users.map(u => (
              <div key={u.id} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold text-sm">{u.username}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === "super_admin" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : u.role === "admin" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"}`}>
                      {u.role === "super_admin" ? "👑 Super Admin" : u.role === "admin" ? "🛡️ Admin" : "User"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">{u.email} • Joined {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                {isSuperAdmin && u.role === "user" && (
                  <button onClick={() => promoteUser(u.id)} className={btnGreen}>Promote</button>
                )}
                {isSuperAdmin && u.role !== "super_admin" && (
                  <button onClick={() => deleteUser(u.id)} className={btnDanger}>Delete</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── REVIEWS TAB ─── */}
        {tab === "reviews" && (
          <div className="animate-fade-in space-y-3">
            <h3 className="font-orbitron text-lg font-bold text-white mb-4">All Reviews ({reviews.length})</h3>
            {reviews.map(r => (
              <div key={r.id} className={`glass rounded-xl p-4 ${r.is_hidden ? "opacity-50 border-red-500/20" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{r.username}</span>
                    <span className="text-gray-500 text-xs">on {r.anime_title}</span>
                    {r.is_hidden && <span className="text-red-400 text-[10px] font-bold uppercase">Hidden</span>}
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">⭐ {r.rating}/10</span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">{r.review_text}</p>
                <div className="flex gap-2">
                  <button onClick={() => toggleReviewHidden(r.id, !r.is_hidden)} className={r.is_hidden ? btnGreen : btnWarn}>
                    {r.is_hidden ? "Restore" : "Hide"}
                  </button>
                  {isSuperAdmin && (
                    <button onClick={() => deleteReview(r.id)} className={btnDanger}>Delete</button>
                  )}
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet</p>}
          </div>
        )}

        {/* ─── MESSAGES TAB ─── */}
        {tab === "messages" && (
          <div className="animate-fade-in space-y-3">
            <h3 className="font-orbitron text-lg font-bold text-white mb-4">Contact Messages ({messages.length})</h3>
            {messages.map(m => (
              <div key={m.id} className={`glass rounded-xl p-4 ${m.is_read ? "opacity-60" : "border-cyan-500/20"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-white font-semibold text-sm">{m.name} <span className="text-gray-500 font-normal text-xs">({m.email})</span></h4>
                    <span className="text-purple-400 text-xs font-semibold">{m.subject}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{m.message}</p>
                <div className="flex gap-2">
                  <button onClick={() => toggleMessageRead(m.id, !m.is_read)} className={m.is_read ? btnWarn : btnGreen}>
                    {m.is_read ? "Mark Unread" : "Mark Read"}
                  </button>
                  {isSuperAdmin && (
                    <button onClick={() => deleteMessage(m.id)} className={btnDanger}>Delete</button>
                  )}
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="text-gray-500 text-center py-8">No messages yet</p>}
          </div>
        )}

        {/* ─── ADMINS TAB (Super Admin Only) ─── */}
        {tab === "admins" && isSuperAdmin && (
          <div className="animate-fade-in space-y-8">
            {/* Search & Invite */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-orbitron text-lg font-bold text-white mb-4">🔍 Invite Admin</h3>
              <p className="text-gray-400 text-sm mb-4">Search for a registered user by username or email to promote them to admin.</p>
              <div className="flex gap-3">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search username or email..." className={inputCls + " flex-1"} />
                <button onClick={searchUsers} className={btnPrimary}>Search</button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0a1a] border border-purple-500/10">
                      <div>
                        <span className="text-white font-semibold text-sm">{u.username}</span>
                        <span className="text-gray-500 text-xs ml-2">{u.email}</span>
                      </div>
                      <button onClick={() => promoteUser(u.id)} className={btnGreen}>Promote to Admin</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Admins */}
            <div className="space-y-3">
              <h3 className="font-orbitron text-lg font-bold text-white">Current Admins ({admins.length})</h3>
              {admins.map(a => (
                <div key={a.id} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {a.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-semibold text-sm">{a.username}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.role === "super_admin" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-purple-500/20 text-purple-300 border border-purple-500/30"}`}>
                        {a.role === "super_admin" ? "👑 Super Admin" : "🛡️ Admin"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">{a.email}</p>
                    {a.admin_permissions && a.role === "admin" && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(a.admin_permissions).map(([k, v]) => (
                          <span key={k} className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${v ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-400"}`}>
                            {k.replace(/_/g, " ")} {v ? "✓" : "✗"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {a.role === "admin" && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setPermModal(a)} className={btnWarn}>Permissions</button>
                      <button onClick={() => demoteUser(a.id)} className={btnDanger}>Demote</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permission Modal */}
        {permModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPermModal(null)}>
            <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="font-orbitron text-lg font-bold text-white mb-4">⚙️ Permissions for {permModal.username}</h3>
              <div className="space-y-3">
                {[
                  { key: "manage_anime", label: "Manage Anime (Add/Edit)" },
                  { key: "moderate_reviews", label: "Moderate Reviews (Hide)" },
                  { key: "view_messages", label: "View Contact Messages" },
                  { key: "view_users", label: "View User List" },
                  { key: "manage_anime_delete", label: "Soft-Delete Anime (Hide)" },
                ].map(p => {
                  const perms = permModal.admin_permissions || {}
                  return (
                    <label key={p.key} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0a1a] border border-purple-500/10 cursor-pointer hover:border-purple-500/30 transition-all">
                      <span className="text-gray-300 text-sm">{p.label}</span>
                      <input
                        type="checkbox"
                        checked={perms[p.key] || false}
                        onChange={e => {
                          const newPerms = { ...perms, [p.key]: e.target.checked }
                          setPermModal({ ...permModal, admin_permissions: newPerms })
                        }}
                        className="w-5 h-5 rounded accent-purple-500 cursor-pointer"
                      />
                    </label>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => updatePermissions(permModal.id, permModal.admin_permissions)} className={btnPrimary}>Save Permissions</button>
                <button onClick={() => setPermModal(null)} className="px-4 py-2 rounded-xl border border-gray-500/30 text-gray-400 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
