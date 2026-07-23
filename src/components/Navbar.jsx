import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Bookmark, Menu, X, Tv, Command, User } from 'lucide-react'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/browse/airing', label: 'En emisión' },
  { to: '/browse/popular', label: 'Popular' },
  { to: '/explore', label: 'Explorar' },
  { to: '/surprise', label: 'Sorpréndeme' },
  { to: '/mylist', label: 'Mi Lista' },
]

const openPalette = () => window.dispatchEvent(new Event('open-command-palette'))

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      setOpen(false)
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/5 shadow-lg shadow-black/30' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 pr-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-black">
            <Tv size={18} strokeWidth={2.5} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Ani<span className="text-brand">Box</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-brand' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex-1" />

        {/* ⌘K search trigger */}
        <button
          onClick={openPalette}
          className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-panel/80 pl-3 pr-2 text-sm text-white/40 transition hover:border-brand/40 hover:text-white/70 sm:flex"
          aria-label="Buscar (Command K)"
        >
          <Search size={15} />
          <span>Buscar…</span>
          <kbd className="flex items-center gap-0.5 rounded border border-white/15 px-1.5 py-0.5 text-[11px] text-white/50">
            <Command size={11} /> K
          </kbd>
        </button>

        <Link
          to="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Mi perfil"
        >
          <User size={19} />
        </Link>
        <Link
          to="/mylist"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white sm:hidden"
          aria-label="Mi lista"
        >
          <Bookmark size={19} />
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white lg:hidden"
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="glass border-t border-white/5 lg:hidden">
          <form onSubmit={submit} className="relative p-4">
            <Search size={16} className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar anime..."
              className="h-11 w-full rounded-full border border-white/10 bg-panel pl-9 pr-4 text-sm outline-none focus:border-brand/60"
            />
          </form>
          <ul className="flex flex-col px-2 pb-3">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive ? 'bg-white/5 text-brand' : 'text-white/80'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
