import { profileColor } from '../utils/format'

const profileIcons = {
  Conservador: '🛡️',
  Moderado: '⚖️',
  Agresivo: '🚀',
}

const profileEmoji = (perfil) => profileIcons[perfil] || '💼'

export default function ProfileBadge({ perfil, score, size = 'md' }) {
  const colors = profileColor(perfil)

  if (size === 'lg') {
    return (
      <div className={`inline-flex flex-col items-center gap-2 px-8 py-5 rounded-2xl border ${colors.bg} ${colors.border}`}>
        <span className="text-4xl">{profileEmoji(perfil)}</span>
        <span className={`font-display font-bold text-2xl ${colors.text}`}>{perfil}</span>
        {score !== undefined && (
          <span className="text-white/50 text-sm font-mono">Confianza: {score.toFixed(1)}%</span>
        )}
      </div>
    )
  }

  return (
    <span className={`badge ${colors.bg} ${colors.text} border ${colors.border}`}>
      {profileEmoji(perfil)} {perfil}
    </span>
  )
}
