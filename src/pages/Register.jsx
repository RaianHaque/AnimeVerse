import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiPost } from "../services/db"

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirm) {
      return setError("Passwords do not match")
    }
    if (!agreed) {
      return setError("Please agree to the Terms of Service")
    }

    setLoading(true)
    try {
      const data = await apiPost("/api/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      })
      login(data.user, data.token)
      navigate("/profile")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
    if (/[0-9!@#$%^&*]/.test(p)) s++
    return s
  }
  const strength = getPasswordStrength()
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"]

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center hero-gradient">
        <div className="absolute inset-0 grid-overlay opacity-50" />
        <div className="absolute top-32 left-16 w-64 h-64 bg-pink-500/15 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/15 rounded-full blur-[80px]" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] animate-float" style={{ animationDelay: "0.5s" }} />

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center font-orbitron font-black text-white text-3xl mx-auto mb-8 animate-float">A</div>
          <h2 className="font-orbitron text-4xl font-black text-white text-glow-pink mb-4">Join the Community</h2>
          <p className="text-gray-400 text-lg max-w-sm mx-auto">Create your account and start your anime journey. Discover, track, and connect with fellow otaku.</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#03010a]/60 backdrop-blur-md relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-cyan-400 to-pink-500 flex items-center justify-center font-orbitron font-black text-white text-xl">A</div>
            <span className="font-orbitron font-bold text-2xl bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">AnimeVerse</span>
          </div>

          <h2 className="font-orbitron text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-8">Fill in the details below to get started.</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">&#128100;</span>
                <input type="text" value={form.username} onChange={handleChange("username")} placeholder="Choose a username" className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">&#9993;</span>
                <input type="email" value={form.email} onChange={handleChange("email")} placeholder="your@email.com" className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">&#128274;</span>
                <input type="password" value={form.password} onChange={handleChange("password")} placeholder="Create a password" className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full ${i < strength ? strengthColors[strength - 1] : "bg-gray-700"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">Password strength: <span className={`font-semibold ${strength >= 3 ? "text-green-400" : strength >= 2 ? "text-yellow-400" : "text-red-400"}`}>{strengthLabels[strength - 1] || "Too short"}</span></span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-semibold">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">&#128274;</span>
                <input type="password" value={form.confirm} onChange={handleChange("confirm")} placeholder="Confirm your password" className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
              </div>
              {form.confirm && form.confirm !== form.password && (
                <span className="text-xs text-red-400 mt-1 block">Passwords do not match</span>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 rounded border-purple-500/30 bg-[#0d0a1a] text-purple-500 focus:ring-purple-500" />
              <span className="text-sm text-gray-400">I agree to the <span className="text-purple-400 cursor-pointer">Terms of Service</span> and <span className="text-purple-400 cursor-pointer">Privacy Policy</span></span>
            </label>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-bold hover:shadow-[0_0_30px_rgba(180,79,255,0.4)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-purple-500/20" />
            <span className="text-gray-500 text-xs">OR SIGN UP WITH</span>
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
            Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
