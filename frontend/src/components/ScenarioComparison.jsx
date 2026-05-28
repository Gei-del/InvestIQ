import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatCOP, formatPct } from '../utils/format'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

const PRESET_SCENARIOS = [
  { name: 'CDT Conservador', tasa: 11.5, descripcion: 'CDT bancario tradicional' },
  { name: 'Fondo Moderado', tasa: 13, descripcion: 'Fondo mixto balanceado' },
  { name: 'ETF S&P 500', tasa: 14.8, descripcion: 'Promedio historico S&P 500' },
  { name: 'ETF Nasdaq', tasa: 17, descripcion: 'ETF tecnologico QQQ' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-sm shadow-xl border border-surface-border">
      <p className="text-white/50 font-mono mb-2">Ano {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-white/70 truncate max-w-[100px]">{entry.name}:</span>
          <span className="text-white font-semibold">{formatCOP(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function ScenarioComparison({ baseCapital = 10000000, baseYears = 10, inflacion = 6 }) {
  const [scenarios, setScenarios] = useState([
    { id: 1, name: 'CDT Conservador', tasa: 11.5, active: true },
    { id: 2, name: 'Fondo Moderado', tasa: 13, active: true },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newScenario, setNewScenario] = useState({ name: '', tasa: '' })

  const toggleScenario = (id) => {
    setScenarios(prev => 
      prev.map(s => s.id === id ? { ...s, active: !s.active } : s)
    )
  }

  const removeScenario = (id) => {
    setScenarios(prev => prev.filter(s => s.id !== id))
  }

  const addScenario = (scenario) => {
    const newId = Math.max(...scenarios.map(s => s.id), 0) + 1
    setScenarios(prev => [...prev, { ...scenario, id: newId, active: true }])
    setShowAddModal(false)
    setNewScenario({ name: '', tasa: '' })
  }

  const addPreset = (preset) => {
    if (!scenarios.find(s => s.name === preset.name)) {
      addScenario({ name: preset.name, tasa: preset.tasa })
    }
  }

  // Generate comparison data
  const activeScenarios = scenarios.filter(s => s.active)
  const chartData = []
  
  for (let year = 0; year <= baseYears; year++) {
    const dataPoint = { anio: year }
    activeScenarios.forEach(scenario => {
      const tasa = scenario.tasa / 100
      dataPoint[scenario.name] = Math.round(baseCapital * Math.pow(1 + tasa, year))
    })
    chartData.push(dataPoint)
  }

  // Calculate final values and differences
  const results = activeScenarios.map((scenario, idx) => {
    const tasa = scenario.tasa / 100
    const valorFinal = baseCapital * Math.pow(1 + tasa, baseYears)
    const valorReal = baseCapital * Math.pow((1 + tasa) / (1 + inflacion / 100), baseYears)
    const ganancia = valorFinal - baseCapital
    return {
      ...scenario,
      color: COLORS[idx % COLORS.length],
      valorFinal,
      valorReal,
      ganancia,
      rendimientoTotal: ((valorFinal - baseCapital) / baseCapital) * 100
    }
  })

  return (
    <div className="space-y-6">
      {/* Scenario Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {scenarios.map((scenario, idx) => (
          <div
            key={scenario.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              scenario.active
                ? 'bg-white/5 border-white/20'
                : 'bg-transparent border-surface-border opacity-50'
            }`}
            onClick={() => toggleScenario(scenario.id)}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: COLORS[idx % COLORS.length] }}
            />
            <span className="text-sm text-white/80">{scenario.name}</span>
            <span className="text-xs text-white/40">{scenario.tasa}%</span>
            <button
              onClick={(e) => { e.stopPropagation(); removeScenario(scenario.id) }}
              className="text-white/30 hover:text-red-400 ml-1 transition-colors"
            >
              x
            </button>
          </div>
        ))}
        
        {scenarios.length < 5 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-surface-border
                       text-white/40 hover:text-white/60 hover:border-white/30 transition-all text-sm"
          >
            <span>+</span>
            <span>Agregar</span>
          </button>
        )}
      </div>

      {/* Presets */}
      {showAddModal && (
        <div className="card p-4 space-y-4">
          <h4 className="text-white/70 text-sm font-medium">Escenarios predefinidos</h4>
          <div className="flex flex-wrap gap-2">
            {PRESET_SCENARIOS.map(preset => (
              <button
                key={preset.name}
                onClick={() => addPreset(preset)}
                disabled={scenarios.find(s => s.name === preset.name)}
                className="px-3 py-2 rounded-lg bg-surface border border-surface-border text-sm
                           hover:border-brand-500/30 hover:bg-brand-500/5 transition-all
                           disabled:opacity-30 disabled:cursor-not-allowed text-left"
              >
                <div className="text-white/80">{preset.name}</div>
                <div className="text-white/40 text-xs">{preset.tasa}% - {preset.descripcion}</div>
              </button>
            ))}
          </div>
          
          <div className="border-t border-surface-border pt-4">
            <h4 className="text-white/70 text-sm font-medium mb-3">Escenario personalizado</h4>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nombre"
                value={newScenario.name}
                onChange={(e) => setNewScenario(prev => ({ ...prev, name: e.target.value }))}
                className="input-field flex-1"
              />
              <input
                type="number"
                placeholder="Tasa %"
                value={newScenario.tasa}
                onChange={(e) => setNewScenario(prev => ({ ...prev, tasa: e.target.value }))}
                className="input-field w-24"
                min="0"
                max="100"
                step="0.1"
              />
              <button
                onClick={() => {
                  if (newScenario.name && newScenario.tasa) {
                    addScenario({ name: newScenario.name, tasa: Number(newScenario.tasa) })
                  }
                }}
                disabled={!newScenario.name || !newScenario.tasa}
                className="btn-primary px-4"
              >
                Agregar
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(false)}
            className="text-white/40 hover:text-white/60 text-sm"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Chart */}
      {activeScenarios.length > 0 && (
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis
                dataKey="anio"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#2a2d3a' }}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px', paddingTop: '16px' }} />
              
              {activeScenarios.map((scenario, idx) => (
                <Line
                  key={scenario.id}
                  type="monotone"
                  dataKey={scenario.name}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 font-mono text-xs uppercase border-b border-surface-border">
                <th className="text-left pb-2 pr-4">Escenario</th>
                <th className="text-right pb-2 pr-4">Tasa</th>
                <th className="text-right pb-2 pr-4">Valor Final</th>
                <th className="text-right pb-2 pr-4">Valor Real</th>
                <th className="text-right pb-2 pr-4">Ganancia</th>
                <th className="text-right pb-2">Rendimiento</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-surface-border/50 hover:bg-white/2">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                      <span className="text-white/80">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-white/60">{formatPct(r.tasa)}</td>
                  <td className="py-3 pr-4 text-right font-semibold" style={{ color: r.color }}>
                    {formatCOP(r.valorFinal)}
                  </td>
                  <td className="py-3 pr-4 text-right text-blue-400">{formatCOP(r.valorReal)}</td>
                  <td className="py-3 pr-4 text-right text-white/70">{formatCOP(r.ganancia)}</td>
                  <td className="py-3 text-right text-brand-400 font-mono">+{formatPct(r.rendimientoTotal, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Insights */}
      {results.length >= 2 && (
        <div className="card p-4 bg-brand-500/5 border-brand-500/20">
          <h4 className="text-brand-400 text-sm font-medium mb-2">Insight</h4>
          <p className="text-white/60 text-sm">
            {(() => {
              const sorted = [...results].sort((a, b) => b.valorFinal - a.valorFinal)
              const best = sorted[0]
              const worst = sorted[sorted.length - 1]
              const diff = best.valorFinal - worst.valorFinal
              return `Con ${baseYears} anos de inversion, "${best.name}" generaria ${formatCOP(diff)} mas que "${worst.name}". La diferencia de ${formatPct(best.tasa - worst.tasa, 1)} en tasa anual se multiplica significativamente con el interes compuesto.`
            })()}
          </p>
        </div>
      )}
    </div>
  )
}
