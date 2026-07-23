import { useEffect } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { MyListProvider } from './context/MyList.jsx'
import { WatchProgressProvider } from './context/WatchProgress.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import Genre from './pages/Genre.jsx'
import Search from './pages/Search.jsx'
import Detail from './pages/Detail.jsx'
import Watch from './pages/Watch.jsx'
import MyList from './pages/MyList.jsx'
import Explore from './pages/Explore.jsx'
import Surprise from './pages/Surprise.jsx'
import Profile from './pages/Profile.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-brand">404</p>
      <p className="mt-2 text-xl font-semibold">Página no encontrada</p>
      <Link
        to="/"
        className="mt-6 rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-black"
      >
        Volver al inicio
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <MyListProvider>
      <WatchProgressProvider>
        <ScrollToTop />
        <Navbar />
        <CommandPalette />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse/:category" element={<Browse />} />
            <Route path="/genre/:id" element={<Genre />} />
            <Route path="/search" element={<Search />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/surprise" element={<Surprise />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/anime/:id" element={<Detail />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/mylist" element={<MyList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </WatchProgressProvider>
    </MyListProvider>
  )
}
