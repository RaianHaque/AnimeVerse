import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem("av_token"))
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("default") // "default" or "user" (for admin toggle)

  // Restore session on mount
  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem("av_token")
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, jwt) => {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem("av_token", jwt)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setViewMode("default")
    localStorage.removeItem("av_token")
  }

  // Role helpers
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin") && viewMode === "default"
  const isSuperAdmin = user && user.role === "super_admin" && viewMode === "default"
  const actualRole = user?.role || "user"

  // Permission check for regular admins
  const hasPermission = (perm) => {
    if (!user) return false
    if (user.role === "super_admin") return true
    if (user.role !== "admin") return false
    return user.admin_permissions?.[perm] === true
  }

  // Toggle between admin and user view
  const toggleViewMode = () => {
    setViewMode(v => v === "default" ? "user" : "default")
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, logout,
      isAdmin, isSuperAdmin, actualRole,
      hasPermission, viewMode, toggleViewMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
