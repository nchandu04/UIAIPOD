import { Link, useLocation } from 'react-router-dom'
import { Bot, Wrench, MessageSquare, Globe, BookOpen } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Chat', icon: MessageSquare },
  { to: '/agents', label: 'Agent Registry', icon: Bot },
  { to: '/tools', label: 'Tools Registry', icon: Wrench },
  { to: '/docs', label: 'Docs', icon: BookOpen },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="bg-[#002244] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-sm bg-[#009fda] group-hover:bg-[#40bfe8] transition-colors">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm tracking-wide">WORLD BANK</span>
              <span className="text-[#009fda] text-[10px] font-medium tracking-widest uppercase">AI Agent Platform</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to))
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-[#009fda] text-white'
                      : 'text-[#b8c0c8] hover:text-white hover:bg-[#003366]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side badge */}
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00a651] animate-pulse"></span>
            <span className="text-[#8a95a0] text-xs font-medium">System Online</span>
          </div>
        </div>
      </div>
    </header>
  )
}
