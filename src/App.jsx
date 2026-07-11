import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import AnimeList from "./pages/AnimeList"
import AnimeDetail from "./pages/AnimeDetail"
import TopRated from "./pages/TopRated"
import Watchlist from "./pages/Watchlist"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Contact from "./pages/Contact"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#03010a]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anime" element={<AnimeList />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
export default App