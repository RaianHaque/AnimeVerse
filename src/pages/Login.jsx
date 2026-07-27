import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiPost } from "../services/db"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await apiPost("/api/auth/login", { email, password })
      login(data.user, data.token)
      navigate("/profile")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center hero-gradient">
        <div className="absolute inset-0 grid-overlay opacity-50" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-32 right-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-[80px]" style={{ animationDelay: "1s" }} />
        <div className="absolute top-40 right-32 w-40 h-40 bg-pink-500/10 rounded-full blur-[60px] animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-400 to-pink-500 flex items-center justify-center font-orbitron font-black text-white text-3xl mx-auto mb-8 animate-float">A</div>
          <h2 className="font-orbitron text-4xl font-black text-white text-glow-purple mb-4">Welcome Back</h2>
          <p className="text-gray-400 text-lg max-w-sm mx-auto">Enter your universe of anime. Track, discover, and share your passion with millions.</p>
          <div className="mt-10 flex justify-center gap-6">
            {["10K+ Anime", "2M+ Users", "50K+ Reviews"].map(s => (
              <div key={s} className="text-center">
                <div className="text-purple-300 font-orbitron font-bold text-sm">{s.split(" ")[0]}</div>
                <div className="text-gray-500 text-xs">{s.split(" ").slice(1).join(" ")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#03010a]/60 backdrop-blur-md relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-cyan-400 to-pink-500 flex items-center justify-center font-orbitron font-black text-white text-xl">A</div>
            <span className="font-orbitron font-bold text-2xl bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">AnimeVerse</span>
          </div>

          <h2 className="font-orbitron text-2xl font-bold text-white mb-2">Sign In</h2>
          <p className="text-gray-400 mb-8">Welcome back! Please enter your credentials.</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">&#9993;</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">&#128274;</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded border-purple-500/30 bg-[#0d0a1a] text-purple-500 focus:ring-purple-500" />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <span className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">Forgot password?</span>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold hover:shadow-[0_0_30px_rgba(180,79,255,0.4)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-purple-500/20" />
            <span className="text-gray-500 text-xs">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-purple-500/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-purple-500/20 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-sm font-semibold">
              <span className="text-lg">G</span> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-purple-500/20 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-sm font-semibold">
              <span className="text-lg">&#127918;</span> Discord
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Don&apos;t have an account? <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
