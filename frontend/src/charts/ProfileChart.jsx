import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = {
  Conservador: '#22c55e',
  Moderado: '#3b82f6',
  Agresivo: '#f59e0b',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-sm">
      <p className="text-white font-semibold">{payload[0].payload.name}</p>
      <p style={{ color: payload[0].fill }}>{payload[0].value.toFixed(1)}% probabilidad</p>
    </div>
  )
}

export default function ProfileChart({ probabilidades }) {
  const data = Object.entries(probabilidades).map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#2a2d3a' }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#6b7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
