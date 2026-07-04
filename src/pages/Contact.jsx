import { useState } from "react"
import { apiPost } from "../services/db"

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" })
  const [openFaq, setOpenFaq] = useState(null)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess("")
    setError("")
    setLoading(true)
    try {
      const data = await apiPost("/api/contact", {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      })
      setSuccess(data.message)
      setForm({ name: "", email: "", subject: "General Inquiry", message: "" })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const faqs = [
    { q: "How do I create an account?", a: "Click the Sign Up button in the top right corner, fill in your details, and you are ready to start your anime journey!" },
    { q: "Is AnimeVerse free to use?", a: "Yes! AnimeVerse is completely free. You can browse, track, and review anime without any cost. We may offer premium features in the future." },
    { q: "How do I add anime to my watchlist?", a: "Navigate to any anime page and click the 'Add to Watchlist' button. You can also hover over anime cards and click the + icon for quick add." },
    { q: "Can I request new anime to be added?", a: "Absolutely! Use the contact form on this page or reach out to us on Discord. We regularly update our catalog based on user requests." },
    { q: "How does the rating system work?", a: "Each anime has a community rating out of 10. You can submit your own rating on any anime detail page after logging in. Ratings are averaged from all user submissions." },
  ]

  const contactInfo = [
    { icon: "&#9993;", label: "Email", value: "hello@animeverse.com" },
    { icon: "&#127918;", label: "Discord", value: "discord.gg/animeverse" },
    { icon: "&#128172;", label: "Twitter / X", value: "@AnimeVerse" },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="font-orbitron text-4xl md:text-5xl font-black text-white text-glow-purple mb-3">GET IN <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">TOUCH</span></h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Have questions, feedback, or just want to say hi? We would love to hear from you.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Left - Contact Info */}
          <div>
            <h2 className="font-orbitron text-xl font-bold text-white mb-6">Contact Information</h2>
            <div className="space-y-4 mb-10">
              {contactInfo.map(c => (
                <div key={c.label} className="glass rounded-xl p-5 flex items-center gap-4 hover:border-purple-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl shrink-0 group-hover:bg-purple-500/30 transition-colors" dangerouslySetInnerHTML={{ __html: c.icon }} />
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider">{c.label}</div>
                    <div className="text-white font-semibold">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative */}
            <div className="relative glass rounded-2xl p-8 overflow-hidden">
              <div className="absolute inset-0 hero-gradient opacity-50" />
              <div className="absolute top-4 right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px]" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-orbitron font-black text-2xl mb-4 animate-float">A</div>
                <h3 className="font-orbitron text-lg font-bold text-white mb-2">Join Our Community</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Connect with 2M+ anime fans. Share reviews, discuss episodes, and discover your next favorite series.</p>
                <button className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(180,79,255,0.3)] transition-all">Join Discord</button>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div>
            <h2 className="font-orbitron text-xl font-bold text-white mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
              {success && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm">{success}</div>
              )}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Name</label>
                <input value={form.name} onChange={handleChange("name")} placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Email</label>
                <input type="email" value={form.email} onChange={handleChange("email")} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Subject</label>
                <select value={form.subject} onChange={handleChange("subject")} className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-gray-300 focus:outline-none focus:border-purple-400 cursor-pointer">
                  <option>General Inquiry</option>
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>Anime Request</option>
                  <option>Partnership</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Message</label>
                <textarea value={form.message} onChange={handleChange("message")} rows={5} placeholder="Tell us what's on your mind..." className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(180,79,255,0.2)] transition-all resize-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold hover:shadow-[0_0_30px_rgba(180,79,255,0.4)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-center mb-10">
            <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-3">Frequently Asked <span className="text-glow-purple text-purple-400">Questions</span></h2>
            <p className="text-gray-400">Quick answers to common questions</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-purple-500/5 transition-colors">
                  <span className="text-white font-semibold text-sm pr-4">{faq.q}</span>
                  <span className={`text-purple-400 text-xl transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
