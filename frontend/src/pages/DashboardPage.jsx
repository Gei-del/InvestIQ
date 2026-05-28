import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useSimulation } from '../hooks/useSimulation'
import SimulationChart from '../charts/SimulationChart'
import ComparisonChart from '../charts/ComparisonChart'
import RecommendationCard from '../components/RecommendationCard'
import ProfileBadge from '../components/ProfileBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import ScenarioComparison from '../components/ScenarioComparison'
import GoalCalculator from '../components/GoalCalculator'
import { formatCOP, formatPct } from '../utils/format'

const DEFAULT_PROFILE = 'Moderado'

// Sample recommendations for demo when no state
const DEMO_RECS = {
  Conservador: [
    { nombre: 'CDT Bancolombia', tipo: 'CDT', riesgo_nivel: 'Muy Bajo', rentabilidad_estimada: 11.5, explicacion: 'Certificado de deposito a termino con garantia Fogafin hasta $50M.', datos_extra: { mercado: 'Colombia' } },
    { nombre: 'Bonos TES', tipo: 'Bonos Gobierno', riesgo_nivel: 'Bajo', rentabilidad_estimada: 12.8, explicacion: 'Deuda del Gobierno colombiano, la mas segura del mercado local.', datos_extra: {} },
  ],
  Moderado: [
    { nombre: 'ETF ACWI', tipo: 'ETF Global', riesgo_nivel: 'Moderado', rentabilidad_estimada: 9.5, explicacion: 'Exposicion a 2,900 empresas de 50 paises.', datos_extra: { ticker: 'ACWI' } },
    { nombre: 'Fondo Mixto Porvenir', tipo: 'Fondo Mixto', riesgo_nivel: 'Moderado', rentabilidad_estimada: 10.8, explicacion: 'Combina 60% renta fija y 40% renta variable.', datos_extra: {} },
  ],
  Agresivo: [
    { nombre: 'ETF QQQ Nasdaq 100', tipo: 'ETF Tecnologico', riesgo_nivel: 'Alto', rentabilidad_estimada: 17.2, explicacion: 'Las 100 mayores empresas tecnologicas del mundo.', datos_extra: { ticker: 'QQQ' } },
    { nombre: 'Acciones S&P 500', tipo: 'Acciones Internacionales', riesgo_nivel: 'Alto', rentabilidad_estimada: 14.8, explicacion: 'Las 500 empresas mas grandes de EE.UU.', datos_extra: {} },
  ],
}

const DEFAULT_SIM = { capital_inicial: 10000000, tasa_anual: 12, anios: 10, inflacion: 6 }

const TABS = [
  { id: 'simulator', label: 'Simulador', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )},
  { id: 'scenarios', label: 'Comparar', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  )},
  { id: 'goals', label: 'Metas', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
]

export default function DashboardPage() {
  const { state } = useLocation()
  const perfil = state?.perfil || DEFAULT_PROFILE
  const recs = state?.recomendaciones || DEMO_RECS[perfil] || []

  const [activeTab, setActiveTab] = useState('simulator')
  const [simForm, setSimForm] = useState(DEFAULT_SIM)
  const { loading, error, result, simulate } = useSimulation()

  useEffect(() => {
    simulate(simForm)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save profile to localStorage for advisor context
  useEffect(() => {
    if (state?.perfil) {
      try {
        localStorage.setItem('investiq_profile', JSON.stringify({
          perfil: state.perfil,
          score: state.score,
          timestamp: new Date().toISOString()
        }))
      } catch {
        // Ignore storage errors
      }
    }
  }, [state])

  const handleSimulate = () => simulate(simForm)

  const handleChange = (e) => {
    setSimForm((f) => ({ ...f, [e.target.name]: Number(e.target.value) }))
  }

  const handleSliderChange = (name, value) => {
    setSimForm((f) => ({ ...f, [name]: value }))
  }

  const statCards = result
    ? [
        { label: 'Capital Inicial', value: formatCOP(result.capital_inicial), icon: '💰', color: 'white' },
        { label: 'Valor Futuro', value: formatCOP(result.valor_futuro), icon: '📈', highlight: true, color: 'brand' },
        { label: 'Ganancia Total', value: formatCOP(result.ganancia_total), icon: '✨', color: 'blue' },
        { label: 'Valor Real', value: formatCOP(result.valor_real), icon: '🔒', color: 'amber', sublabel: 'Ajustado por inflacion' },
      ]
    : []

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">
                Centro de Simulacion
              </h1>
              <p className="text-white/50 text-sm md:text-base max-w-xl">
                Proyecta tu futuro financiero, compara estrategias y alcanza tus metas de inversion
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/advisor" 
                className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2 group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden sm:inline">Asesor IA</span>
              </Link>
              <ProfileBadge perfil={perfil} size="sm" />
            </div>
          </div>
        </div>

        {/* Tabs - Redesigned */}
        <div className="flex items-center gap-1 p-1 bg-surface/50 rounded-2xl border border-surface-border mb-8 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Simulator Card - Redesigned */}
            <div className="card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display font-semibold text-white text-lg">
                    Simulador de Interes Compuesto
                  </h2>
                  <p className="text-white/40 text-sm">Ajusta los parametros y visualiza el crecimiento de tu inversion</p>
                </div>
              </div>

              {/* Sliders for better UX */}
              <div className="space-y-6 mb-6">
                {/* Capital */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/60 text-sm">Capital Inicial</label>
                    <span className="text-brand-400 font-semibold">{formatCOP(simForm.capital_inicial)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="500000000"
                    step="1000000"
                    value={simForm.capital_inicial}
                    onChange={(e) => handleSliderChange('capital_inicial', Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider-brand"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>$1M</span>
                    <span>$500M</span>
                  </div>
                </div>

                {/* Rate and Years row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/60 text-sm">Tasa Anual</label>
                      <span className="text-brand-400 font-semibold">{simForm.tasa_anual}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="0.5"
                      value={simForm.tasa_anual}
                      onChange={(e) => handleSliderChange('tasa_anual', Number(e.target.value))}
                      className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider-brand"
                    />
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>1%</span>
                      <span>25%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/60 text-sm">Plazo</label>
                      <span className="text-brand-400 font-semibold">{simForm.anios} anos</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={simForm.anios}
                      onChange={(e) => handleSliderChange('anios', Number(e.target.value))}
                      className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider-brand"
                    />
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>1 ano</span>
                      <span>30 anos</span>
                    </div>
                  </div>
                </div>

                {/* Inflation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/60 text-sm">Inflacion Estimada</label>
                    <span className="text-amber-400 font-semibold">{simForm.inflacion}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={simForm.inflacion}
                    onChange={(e) => handleSliderChange('inflacion', Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider-amber"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>0%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSimulate} 
                disabled={loading} 
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Calculando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Calcular Proyeccion
                  </span>
                )}
              </button>
            </div>

            {/* Results */}
            {error && <ErrorAlert message={error} onRetry={handleSimulate} />}

            {result && (
              <>
                {/* Stats grid - Redesigned */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((s, i) => (
                    <div
                      key={i}
                      className={`card p-5 animate-in relative overflow-hidden ${
                        s.highlight ? 'border-brand-500/40 bg-gradient-to-br from-brand-500/10 to-transparent' : ''
                      }`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      {s.highlight && (
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-brand-500 text-white text-xs rounded-bl-lg font-medium">
                          Proyectado
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{s.icon}</span>
                      </div>
                      <div className={`font-display font-bold text-xl md:text-2xl mb-1 ${
                        s.highlight ? 'text-brand-400' : 
                        s.color === 'blue' ? 'text-blue-400' :
                        s.color === 'amber' ? 'text-amber-400' : 'text-white'
                      }`}>
                        {s.value}
                      </div>
                      <p className="text-white/40 text-xs">{s.label}</p>
                      {s.sublabel && <p className="text-white/30 text-xs mt-0.5">{s.sublabel}</p>}
                    </div>
                  ))}
                </div>

                {/* Growth indicators */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-0.5">Crecimiento Nominal</p>
                      <p className="text-white font-display font-bold text-xl">
                        +{formatPct(result.crecimiento_porcentual)}
                      </p>
                    </div>
                  </div>
                  <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-0.5">Crecimiento Real (sin inflacion)</p>
                      <p className="text-blue-400 font-display font-bold text-xl">
                        +{formatPct(result.crecimiento_real_porcentual)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display font-semibold text-white text-lg">
                        Proyeccion a {result.anios} anos
                      </h2>
                      <p className="text-white/40 text-sm">
                        Tasa {formatPct(result.tasa_anual)} | Inflacion {formatPct(result.inflacion)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-brand-500" />
                        <span className="text-white/50">Nominal</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-blue-500" />
                        <span className="text-white/50">Real</span>
                      </div>
                    </div>
                  </div>
                  <SimulationChart data={result.datos_anuales} />
                </div>

                {/* Annual table - Improved */}
                <div className="card p-6 overflow-x-auto">
                  <h2 className="font-display font-semibold text-white text-lg mb-4">
                    Detalle Anual
                  </h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white/30 font-mono text-xs uppercase border-b border-surface-border">
                        {['Ano', 'Valor Nominal', 'Valor Real', 'Ganancia Acum.', 'Perdida Inflacion'].map((h) => (
                          <th key={h} className="text-left pb-3 pr-4 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.datos_anuales.map((d, idx) => (
                        <tr 
                          key={d.anio} 
                          className="border-b border-surface-border/30 hover:bg-white/[0.02] transition-colors animate-in"
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          <td className="py-3 pr-4 font-mono text-white/40">{d.anio}</td>
                          <td className="py-3 pr-4 text-brand-400 font-semibold">{formatCOP(d.valor_nominal)}</td>
                          <td className="py-3 pr-4 text-blue-400">{formatCOP(d.valor_real)}</td>
                          <td className="py-3 pr-4 text-white/70">{formatCOP(d.ganancia_acumulada)}</td>
                          <td className="py-3 pr-4 text-red-400/60">{formatCOP(d.inflacion_acumulada)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display font-semibold text-white text-lg">
                  Comparacion de Escenarios
                </h2>
                <p className="text-white/40 text-sm">Compara diferentes estrategias de inversion lado a lado</p>
              </div>
            </div>
            <ScenarioComparison 
              baseCapital={Number(simForm.capital_inicial)} 
              baseYears={Number(simForm.anios)}
              inflacion={Number(simForm.inflacion)}
            />
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display font-semibold text-white text-lg">
                  Calculadora de Metas
                </h2>
                <p className="text-white/40 text-sm">Calcula cuanto necesitas ahorrar para alcanzar tus objetivos</p>
              </div>
            </div>
            <GoalCalculator />
          </div>
        )}

        {/* Bottom section - always visible */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white text-lg mb-4">
              Radar de Perfiles
            </h2>
            <ComparisonChart highlight={perfil} />
          </div>

          {/* Recommendations */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-white text-lg">
                Recomendaciones para Ti
              </h2>
              <ProfileBadge perfil={perfil} size="xs" />
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {recs.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/advisor" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Hablar con Asesor IA
          </Link>
          <Link to="/assessment" className="btn-secondary">
            Actualizar mi perfil
          </Link>
          <Link to="/" className="btn-secondary">
            Inicio
          </Link>
        </div>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .slider-brand::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
          transition: transform 0.15s ease;
        }
        .slider-brand::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider-amber::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
          transition: transform 0.15s ease;
        }
        .slider-amber::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider-brand::-moz-range-thumb,
        .slider-amber::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }
        .slider-brand::-moz-range-thumb {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }
        .slider-amber::-moz-range-thumb {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
      `}</style>
    </div>
  )
}
