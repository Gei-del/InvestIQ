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
  { id: 'simulator', label: 'Simulador Basico', icon: '📊' },
  { id: 'scenarios', label: 'Comparar Escenarios', icon: '📈' },
  { id: 'goals', label: 'Metas Financieras', icon: '🎯' },
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
    setSimForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const statCards = result
    ? [
        { label: 'Capital Inicial', value: formatCOP(result.capital_inicial), icon: '💰' },
        { label: 'Valor Futuro', value: formatCOP(result.valor_futuro), icon: '📈', highlight: true },
        { label: 'Ganancia Total', value: formatCOP(result.ganancia_total), icon: '✨' },
        { label: 'Valor Real (ajust. inflacion)', value: formatCOP(result.valor_real), icon: '🔒' },
        { label: 'Crecimiento Nominal', value: formatPct(result.crecimiento_porcentual), icon: '📊' },
        { label: 'Crecimiento Real', value: formatPct(result.crecimiento_real_porcentual), icon: '🌱' },
      ]
    : []

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-1">Dashboard</h1>
            <p className="text-white/40 text-sm">Analisis completo de tu estrategia de inversion</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/advisor" 
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Asesor IA
            </Link>
            <ProfileBadge perfil={perfil} size="sm" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'simulator' && (
          <>
            {/* Simulator form */}
            <div className="card p-6 mb-6">
              <h2 className="font-display font-semibold text-white text-lg mb-4">
                Simulador de Interes Compuesto
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {[
                  { name: 'capital_inicial', label: 'Capital Inicial (COP)', placeholder: '10,000,000', min: 1 },
                  { name: 'tasa_anual', label: 'Tasa Anual (%)', placeholder: '12', min: 0, max: 100, step: 0.1 },
                  { name: 'anios', label: 'Anos', placeholder: '10', min: 1, max: 50 },
                  { name: 'inflacion', label: 'Inflacion Anual (%)', placeholder: '6', min: 0, max: 50, step: 0.1 },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-white/50 text-xs font-mono mb-1.5 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={simForm[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step || 1}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSimulate} disabled={loading} className="btn-primary">
                {loading ? 'Calculando...' : 'Simular'}
              </button>
            </div>

            {/* Simulation results */}
            {loading && <LoadingSpinner message="Calculando proyeccion..." />}
            {error && <ErrorAlert message={error} onRetry={handleSimulate} />}

            {result && (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {statCards.map((s, i) => (
                    <div
                      key={i}
                      className={`card p-5 animate-in ${s.highlight ? 'border-brand-500/30 bg-brand-500/5' : ''}`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{s.icon}</span>
                        <span className="text-white/40 text-xs font-mono">{s.label}</span>
                      </div>
                      <div className={`font-display font-bold text-xl ${s.highlight ? 'text-brand-400' : 'text-white'}`}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="card p-6 mb-6">
                  <h2 className="font-display font-semibold text-white text-lg mb-1">
                    Proyeccion a {result.anios} anos
                  </h2>
                  <p className="text-white/40 text-sm mb-5">
                    Tasa {formatPct(result.tasa_anual)} - Inflacion {formatPct(result.inflacion)}
                  </p>
                  <SimulationChart data={result.datos_anuales} />
                </div>

                {/* Annual table */}
                <div className="card p-6 mb-6 overflow-x-auto">
                  <h2 className="font-display font-semibold text-white text-lg mb-4">Tabla Anual</h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white/30 font-mono text-xs uppercase border-b border-surface-border">
                        {['Ano', 'Valor Nominal', 'Valor Real', 'Ganancia Acum.', 'Perd. Inflacion'].map((h) => (
                          <th key={h} className="text-left pb-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.datos_anuales.map((d) => (
                        <tr key={d.anio} className="border-b border-surface-border/50 hover:bg-white/2 transition-colors">
                          <td className="py-2 pr-4 font-mono text-white/50">{d.anio}</td>
                          <td className="py-2 pr-4 text-brand-400 font-semibold">{formatCOP(d.valor_nominal)}</td>
                          <td className="py-2 pr-4 text-blue-400">{formatCOP(d.valor_real)}</td>
                          <td className="py-2 pr-4 text-white/70">{formatCOP(d.ganancia_acumulada)}</td>
                          <td className="py-2 pr-4 text-red-400/70">{formatCOP(d.inflacion_acumulada)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'scenarios' && (
          <div className="card p-6 mb-6">
            <h2 className="font-display font-semibold text-white text-lg mb-1">
              Comparacion de Escenarios
            </h2>
            <p className="text-white/40 text-sm mb-6">
              Compara diferentes estrategias de inversion lado a lado
            </p>
            <ScenarioComparison 
              baseCapital={Number(simForm.capital_inicial)} 
              baseYears={Number(simForm.anios)}
              inflacion={Number(simForm.inflacion)}
            />
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="card p-6 mb-6">
            <h2 className="font-display font-semibold text-white text-lg mb-1">
              Calculadora de Metas Financieras
            </h2>
            <p className="text-white/40 text-sm mb-6">
              Calcula cuanto necesitas ahorrar para alcanzar tus objetivos
            </p>
            <GoalCalculator />
          </div>
        )}

        {/* Comparison chart and recommendations - always visible */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white text-lg mb-4">
              Radar de Perfiles
            </h2>
            <ComparisonChart highlight={perfil} />
          </div>

          {/* Recommendations */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white text-lg mb-4">
              Tus Recomendaciones
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {recs.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/advisor" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Hablar con Asesor IA
          </Link>
          <Link to="/assessment" className="btn-secondary">
            Volver a analizar
          </Link>
          <Link to="/" className="btn-secondary">
            Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
