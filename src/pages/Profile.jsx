import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiGet, apiPut } from "../services/db"

export default function Profile() {
  const [activeTab, setActiveTab] = useState("activity")
  const { user: authUser, loading: authLoading, login, token } = useAuth()
  const navigate = useNavigate()

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saveMsg, setSaveMsg] = useState("")
  const [saveErr, setSaveErr] = useState("")

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ username: "", bio: "", email: "" })

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate("/login")
    }
  }, [authLoading, authUser, navigate])

  // Fetch profile data
  useEffect(() => {
    if (!authUser) return
    apiGet("/api/profile")
      .then((data) => {
        setProfileData(data)
        setSettingsForm({
          username: data.user.username || "",
          bio: data.user.bio || "",
          email: data.user.email || "",
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authUser])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-purple-400 font-orbitron text-xl animate-pulse">Loading profile...</div>
      </div>
    )
  }

  if (!authUser || !profileData) return null

  const { user, stats, recent_watchlist, user_reviews } = profileData

  const displayStats = [
    { label: "In Watchlist", value: String(stats.watchlist_total), icon: "&#127916;" },
    { label: "Completed", value: String(stats.completed), icon: "&#9654;" },
    { label: "Reviews", value: String(stats.reviews), icon: "&#9200;" },
    { label: "Member Since", value: new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }), icon: "&#10084;" },
  ]

  const activity = recent_watchlist.map((w) => ({
    action: w.watch_status === "Completed" ? "Completed watching" : w.watch_status === "Watching" ? "Started watching" : "Added to watchlist",
    anime: w.title,
    time: new Date(w.added_at).toLocaleDateString(),
  }))

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSaveMsg("")
    setSaveErr("")
    try {
      const data = await apiPut("/api/profile", settingsForm)
      setSaveMsg("Profile updated successfully!")
      // Update auth context with new user data
      login(data.user, token)
    } catch (err) {
      setSaveErr(err.message)
    }
  }

  const tabs = ["activity", "watchlist", "reviews", "settings"]

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Banner */}
      <div className="relative h-52 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-cyan-500 to-pink-500 rounded-full blur-sm" />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-orbitron font-black text-4xl border-4 border-[#03010a]">
                {user.username[0].toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="font-orbitron text-2xl font-bold text-white">{user.username}</h1>
              <p className="text-gray-400 text-sm mt-1 max-w-lg">{user.bio || "No bio yet — add one in settings!"}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>&#128197; Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                <span>{user.email}</span>
              </div>
            </div>
            <button onClick={() => setActiveTab("settings")} className="px-6 py-2 rounded-xl border border-purple-500/30 text-purple-300 font-semibold text-sm hover:bg-purple-500/10 transition-all">Edit Profile</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {displayStats.map(s => (
            <div key={s.label} className="glass rounded-xl p-5 text-center hover:glow-purple transition-all">
              <div className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: s.icon }} />
              <div className="font-orbitron text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-gray-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-purple-500/20 mb-8">
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-3 text-sm font-semibold capitalize transition-all rounded-t-lg ${activeTab === t ? "bg-purple-500/20 text-purple-300 border-b-2 border-purple-400" : "text-gray-400 hover:text-purple-300 hover:bg-purple-500/10"}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "activity" && (
          <div className="animate-fade-in grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-orbitron text-lg font-bold text-white">Recent Activity</h3>
              {activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.map((a, i) => (
                    <div key={i} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/30 transition-all">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">&#9654;</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300"><span className="text-gray-500">{a.action}</span> <span className="text-purple-300 font-semibold">{a.anime}</span></p>
                        <span className="text-xs text-gray-500">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-400">No activity yet. Start adding anime to your watchlist!</p>
                  <Link to="/anime" className="inline-block mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all">Browse Anime</Link>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-orbitron text-lg font-bold text-white mb-4">Account Info</h3>
              <div className="glass rounded-xl p-6 space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Username</div>
                  <div className="text-gray-300">{user.username}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</div>
                  <div className="text-gray-300">{user.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Member Since</div>
                  <div className="text-gray-300">{new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "watchlist" && (
          <div className="animate-fade-in text-center py-12">
            <div className="text-5xl mb-4">&#128218;</div>
            <h3 className="font-orbitron text-xl text-white mb-2">View your full watchlist</h3>
            <Link to="/watchlist" className="inline-block mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all">Go to Watchlist</Link>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-fade-in space-y-4">
            {user_reviews && user_reviews.length > 0 ? (
              user_reviews.map((r, i) => (
                <div key={i} className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-purple-300 font-semibold">{r.anime_title}</h4>
                    <span className="text-yellow-400 font-bold">&#11088; {r.rating}/10</span>
                  </div>
                  <p className="text-gray-300 text-sm">{r.review_text}</p>
                  <p className="text-gray-500 text-xs mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass rounded-xl">
                <div className="text-5xl mb-4">✏️</div>
                <h3 className="font-orbitron text-xl text-white mb-2">No reviews yet</h3>
                <p className="text-gray-400 mb-4">Share your thoughts on the anime you&apos;ve watched!</p>
                <Link to="/anime" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all">Browse Anime</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-fade-in max-w-2xl">
            <form onSubmit={handleSaveSettings} className="glass rounded-xl p-8 space-y-6">
              <h3 className="font-orbitron text-xl font-bold text-white">Account Settings</h3>

              {saveMsg && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm">{saveMsg}</div>
              )}
              {saveErr && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{saveErr}</div>
              )}

              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Username</label>
                <input value={settingsForm.username} onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Bio</label>
                <textarea value={settingsForm.bio} onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Email</label>
                <input value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 transition-all" />
              </div>
              <div className="space-y-3">
                <h4 className="text-sm text-gray-300 font-semibold">Notifications</h4>
                {["New episode alerts", "Watchlist reminders", "Community updates", "Newsletter"].map(n => (
                  <label key={n} className="flex items-center justify-between py-2 border-b border-purple-500/10 cursor-pointer">
                    <span className="text-gray-400 text-sm">{n}</span>
                    <div className="w-10 h-5 rounded-full bg-purple-500/30 relative cursor-pointer">
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-purple-400 transition-transform" />
                    </div>
                  </label>
                ))}
              </div>
              <button type="submit" className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all">Save Changes</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
