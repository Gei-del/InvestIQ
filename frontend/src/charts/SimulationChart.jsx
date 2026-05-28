import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatCOP } from '../utils/format'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card p-3 text-sm shadow-xl rounded-lg border border-surface-border">
      <p className="text-white/50 font-mono mb-2">Ano {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="text-white font-semibold">{formatCOP(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SimulationChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-white/40">
        No hay datos para mostrar
      </div>
    )
  }

  const chartData = data.map((d) => ({
    anio: d.anio,
    nominal: Math.round(d.valor_nominal),
    real: Math.round(d.valor_real),
  }))

  // Find max value for proper scaling
  const maxValue = Math.max(...chartData.map(d => Math.max(d.nominal, d.real)))
  const yAxisMax = Math.ceil(maxValue / 5000000) * 5000000

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="gradientNominal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradientReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis
            dataKey="anio"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis
            domain={[0, yAxisMax]}
            tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={65}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => <span className="text-white/70 text-sm">{value === 'nominal' ? 'Valor Nominal' : 'Valor Real'}</span>}
          />
          <Area
            type="monotone"
            dataKey="nominal"
            name="nominal"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#gradientNominal)"
            dot={false}
            activeDot={{ r: 5, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="real"
            name="real"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradientReal)"
            dot={false}
            strokeDasharray="5 3"
            activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
