import { useLocation, useNavigate, Link } from 'react-router-dom'
import ProfileBadge from '../components/ProfileBadge'
import RecommendationCard from '../components/RecommendationCard'
import ProfileChart from '../charts/ProfileChart'
import ComparisonChart from '../charts/ComparisonChart'

export default function ResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.result) {
    return (
      <div className="min-h-screen pt-32 px-4 text-center">
        <p className="text-white/50 mb-6">No hay resultados disponibles.</p>
        <Link to="/assessment" className="btn-primary">Realizar análisis →</Link>
      </div>
    )
  }

  const { result } = state
  const {
    perfil,
    score,
    probabilidades,
    descripcion,
    caracteristicas,
    recomendaciones,
  } = result

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-in">
          <p className="text-white/40 text-sm font-mono mb-4">Resultado del análisis ML</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-6">
            Tu perfil es{' '}
            <span className="gradient-text">{perfil}</span>
          </h1>
          <ProfileBadge perfil={perfil} score={score} size="lg" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {/* Description */}
          <div className="lg:col-span-2 card p-6 animate-in" style={{ animationDelay: '80ms' }}>
            <h2 className="font-display font-semibold text-white text-lg mb-3">¿Qué significa?</h2>
            <p className="text-white/60 leading-relaxed mb-5">{descripcion}</p>
            <h3 className="text-white/50 text-sm font-mono uppercase tracking-wider mb-3">Características</h3>
            <ul className="space-y-2">
              {caracteristicas.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="text-brand-400 mt-0.5 shrink-0">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Probability chart */}
          <div className="card p-6 animate-in" style={{ animationDelay: '160ms' }}>
            <h2 className="font-display font-semibold text-white text-lg mb-4">Probabilidades</h2>
            <ProfileChart probabilidades={probabilidades} />
            <div className="mt-3 space-y-1">
              {Object.entries(probabilidades).map(([p, v]) => (
                <div key={p} className="flex items-center justify-between text-sm">
                  <span className="text-white/50">{p}</span>
                  <span className="font-mono text-white/70">{v.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison chart */}
        <div className="card p-6 mb-8 animate-in" style={{ animationDelay: '240ms' }}>
          <h2 className="font-display font-semibold text-white text-lg mb-1">
            Comparación de Perfiles
          </h2>
          <p className="text-white/40 text-sm mb-4">Tu perfil ({perfil}) resaltado</p>
          <ComparisonChart highlight={perfil} />
        </div>

        {/* Recommendations */}
        <div className="animate-in" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-2xl text-white">
              Recomendaciones para ti
            </h2>
            <ProfileBadge perfil={perfil} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recomendaciones.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-3 justify-center animate-in" style={{ animationDelay: '400ms' }}>
          <Link
            to="/dashboard"
            state={{ perfil, recomendaciones }}
            className="btn-primary px-8 py-3"
          >
            Ver Dashboard completo →
          </Link>
          <button
            onClick={() => navigate('/assessment')}
            className="btn-secondary px-8 py-3"
          >
            Repetir análisis
          </button>
        </div>
      </div>
    </div>
  )
}
