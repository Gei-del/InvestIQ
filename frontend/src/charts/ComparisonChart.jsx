import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-sm">
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/70">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const INSTRUMENTS_RADAR = [
  { subject: 'Rentabilidad', Conservador: 6, Moderado: 7, Agresivo: 9 },
  { subject: 'Seguridad',    Conservador: 9, Moderado: 7, Agresivo: 4 },
  { subject: 'Liquidez',     Conservador: 7, Moderado: 6, Agresivo: 8 },
  { subject: 'Accesibilidad',Conservador: 8, Moderado: 7, Agresivo: 7 },
  { subject: 'Diversificación',Conservador:5,Moderado: 8, Agresivo: 9 },
  { subject: 'Horizonte',    Conservador: 3, Moderado: 6, Agresivo: 9 },
]

export default function ComparisonChart({ highlight }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={INSTRUMENTS_RADAR}>
        <PolarGrid stroke="#2a2d3a" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <Radar
          name="Conservador" dataKey="Conservador"
          stroke="#22c55e" fill="#22c55e"
          fillOpacity={highlight === 'Conservador' ? 0.3 : 0.1}
          strokeWidth={highlight === 'Conservador' ? 2 : 1}
        />
        <Radar
          name="Moderado" dataKey="Moderado"
          stroke="#3b82f6" fill="#3b82f6"
          fillOpacity={highlight === 'Moderado' ? 0.3 : 0.1}
          strokeWidth={highlight === 'Moderado' ? 2 : 1}
        />
        <Radar
          name="Agresivo" dataKey="Agresivo"
          stroke="#f59e0b" fill="#f59e0b"
          fillOpacity={highlight === 'Agresivo' ? 0.3 : 0.1}
          strokeWidth={highlight === 'Agresivo' ? 2 : 1}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px', paddingTop: '8px' }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
