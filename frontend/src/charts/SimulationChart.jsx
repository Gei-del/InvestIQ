import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatCOP } from '../utils/format'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-sm shadow-xl">
      <p className="text-white/50 font-mono mb-2">Año {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="text-white font-semibold">{formatCOP(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SimulationChart({ data }) {
  const chartData = data.map((d) => ({
    anio: d.anio,
    'Valor Nominal': Math.round(d.valor_nominal),
    'Valor Real': Math.round(d.valor_real),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
        <XAxis
          dataKey="anio"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#2a2d3a' }}
          label={{ value: 'Años', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={70}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ color: '#9ca3af', fontSize: '13px', paddingTop: '16px' }}
        />
        <Area
          type="monotone"
          dataKey="Valor Nominal"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#colorNominal)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="Valor Real"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorReal)"
          dot={false}
          strokeDasharray="5 3"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
