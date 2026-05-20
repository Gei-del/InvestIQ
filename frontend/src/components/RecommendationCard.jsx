import { riskIcon, formatPct } from '../utils/format'

const riskBadge = (nivel) => {
  const map = {
    'Muy Bajo':    'badge-green',
    'Bajo':        'badge-green',
    'Moderado':    'badge-blue',
    'Moderado-Alto':'badge-blue',
    'Alto':        'badge-amber',
    'Muy Alto':    'badge-red',
  }
  return map[nivel] || 'badge-blue'
}

export default function RecommendationCard({ rec, index }) {
  return (
    <div
      className="card p-5 hover:border-white/20 transition-all duration-300 animate-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{riskIcon(rec.riesgo_nivel)}</span>
            <h3 className="font-display font-semibold text-white text-sm leading-snug">
              {rec.nombre}
            </h3>
          </div>
          <span className="text-xs text-white/40 font-mono">{rec.tipo}</span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-brand-400 font-display font-bold text-xl">
            {formatPct(rec.rentabilidad_estimada)}
          </div>
          <div className="text-white/30 text-xs">est. anual</div>
        </div>
      </div>

      <p className="text-white/60 text-sm leading-relaxed mb-3 line-clamp-3">
        {rec.explicacion}
      </p>

      <div className="flex items-center justify-between">
        <span className={`badge ${riskBadge(rec.riesgo_nivel)}`}>
          {rec.riesgo_nivel}
        </span>
        {rec.datos_extra?.mercado && (
          <span className="text-xs text-white/30 font-mono">{rec.datos_extra.mercado}</span>
        )}
        {rec.datos_extra?.ticker && (
          <span className="text-xs text-white/30 font-mono">${rec.datos_extra.ticker}</span>
        )}
      </div>
    </div>
  )
}
