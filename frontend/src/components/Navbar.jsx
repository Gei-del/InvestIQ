import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/advisor', label: 'Asesor IA' },
  { to: '/dashboard', label: 'Simulador' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-brand-500/40">
            IQ
          </span>
          <span className="font-display font-bold text-lg text-white group-hover:text-brand-400 transition-colors">
            InvestIQ
          </span>
          <span className="text-xs text-white/30 font-mono">Colombia</span>
        </Link>

        {/* Links */}
        <div className="hidden sm:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === to
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link to="/assessment" className="btn-primary text-sm py-2 px-4 hidden sm:block">
          Iniciar Análisis
        </Link>
      </div>
    </nav>
  )
}
