import { useState } from "react"
import { Link } from "react-router-dom"
import { animeData } from "../data/animeData"

export default function Profile() {
  const [activeTab, setActiveTab] = useState("activity")

  const user = {
    username: "AnimeVerseFan",
    bio: "Passionate otaku exploring every universe. Lover of Shonen and Seinen. Always chasing the next great story.",
    joined: "January 2024",
    followers: 1247,
    following: 389,
  }

  const stats = [
    { label: "Anime Watched", value: "156", icon: "&#127916;" },
    { label: "Episodes Seen", value: "3,847", icon: "&#9654;" },
    { label: "Hours Watched", value: "1,539", icon: "&#9200;" },
    { label: "Favorites", value: "42", icon: "&#10084;" },
  ]

  const activity = [
    { action: "Completed watching", anime: "Attack on Titan", time: "2 hours ago" },
    { action: "Started watching", anime: "Demon Slayer S4", time: "Yesterday" },
    { action: "Added to watchlist", anime: "Chainsaw Man", time: "3 days ago" },
    { action: "Rated 9/10", anime: "Steins;Gate", time: "1 week ago" },
    { action: "Wrote a review for", anime: "Violet Evergarden", time: "2 weeks ago" },
  ]

  const genrePrefs = [
    { name: "Action", percent: 85 },
    { name: "Fantasy", percent: 72 },
    { name: "Drama", percent: 65 },
    { name: "Sci-Fi", percent: 48 },
    { name: "Romance", percent: 35 },
  ]

  const currentlyWatching = animeData.filter(a => a.status === "Ongoing").slice(0, 3).map((a, i) => ({
    ...a,
    currentEp: [18, 8, 45][i],
    totalEp: a.episodes,
  }))

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
                {user.username[0]}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="font-orbitron text-2xl font-bold text-white">{user.username}</h1>
              <p className="text-gray-400 text-sm mt-1 max-w-lg">{user.bio}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>&#128197; Joined {user.joined}</span>
                <span><strong className="text-gray-300">{user.followers.toLocaleString()}</strong> Followers</span>
                <span><strong className="text-gray-300">{user.following}</strong> Following</span>
              </div>
            </div>
            <button className="px-6 py-2 rounded-xl border border-purple-500/30 text-purple-300 font-semibold text-sm hover:bg-purple-500/10 transition-all">Edit Profile</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
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

              <h3 className="font-orbitron text-lg font-bold text-white mt-8">Currently Watching</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {currentlyWatching.map(a => (
                  <Link to={`/anime/${a.id}`} key={a.id} className="glass rounded-xl overflow-hidden group hover:border-purple-500/30 transition-all">
                    <img src={a.image} alt={a.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-3">
                      <h4 className="text-white text-sm font-semibold truncate">{a.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-2 mb-1">
                        <span>EP {a.currentEp}/{a.totalEp}</span>
                        <span>{Math.round((a.currentEp / a.totalEp) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#0d0a1a] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{ width: `${(a.currentEp / a.totalEp) * 100}%` }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-orbitron text-lg font-bold text-white mb-4">Favorite Genres</h3>
              <div className="glass rounded-xl p-6 space-y-4">
                {genrePrefs.map(g => (
                  <div key={g.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{g.name}</span>
                      <span className="text-purple-300">{g.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0d0a1a] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{ width: `${g.percent}%` }} />
                    </div>
                  </div>
                ))}
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
            {[
              { anime: "Attack on Titan", rating: 9, text: "A masterpiece of storytelling and world-building. Every episode keeps you on the edge of your seat." },
              { anime: "Violet Evergarden", rating: 10, text: "The most beautiful anime I have ever watched. The animation and emotional depth are unparalleled." },
            ].map(r => (
              <div key={r.anime} className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-purple-300 font-semibold">{r.anime}</h4>
                  <span className="text-yellow-400 font-bold">&#11088; {r.rating}/10</span>
                </div>
                <p className="text-gray-300 text-sm">{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-fade-in max-w-2xl">
            <div className="glass rounded-xl p-8 space-y-6">
              <h3 className="font-orbitron text-xl font-bold text-white">Account Settings</h3>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Username</label>
                <input defaultValue={user.username} className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Bio</label>
                <textarea defaultValue={user.bio} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Email</label>
                <input defaultValue="animefan@email.com" className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 transition-all" />
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
              <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.4)] transition-all">Save Changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
