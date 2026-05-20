/**
 * Formatea número como moneda COP
 */
export const formatCOP = (value) => {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea número como porcentaje
 */
export const formatPct = (value, decimals = 1) => {
  if (value === undefined || value === null) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Retorna clase de color según perfil
 */
export const profileColor = (perfil) => {
  const map = {
    Conservador: { text: 'text-brand-400', bg: 'bg-brand-500/15', border: 'border-brand-500/30' },
    Moderado:    { text: 'text-blue-400',  bg: 'bg-blue-500/15',  border: 'border-blue-500/30' },
    Agresivo:    { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  }
  return map[perfil] || { text: 'text-white', bg: 'bg-white/10', border: 'border-white/20' }
}

/**
 * Retorna ícono emoji según nivel de riesgo
 */
export const riskIcon = (nivel) => {
  const map = {
    'Muy Bajo': '🛡️',
    'Bajo': '🔵',
    'Moderado': '⚖️',
    'Moderado-Alto': '📈',
    'Alto': '🚀',
    'Muy Alto': '⚡',
  }
  return map[nivel] || '💼'
}
