const QUICK_ACTIONS_BASE = [
  {
    icon: '📊',
    label: 'Perfil de inversor',
    question: 'Explica los diferentes perfiles de inversor y cual seria mejor para mi situacion'
  },
  {
    icon: '💰',
    label: 'Donde invertir',
    question: 'En que puedo invertir en Colombia con un capital inicial de 5 millones de pesos?'
  },
  {
    icon: '📈',
    label: 'Interes compuesto',
    question: 'Explicame como funciona el interes compuesto y como puedo aprovecharlo'
  },
  {
    icon: '🏦',
    label: 'CDTs vs Fondos',
    question: 'Cual es la diferencia entre CDTs y fondos de inversion? Cual me conviene mas?'
  }
]

const PROFILE_ACTIONS = {
  Conservador: [
    {
      icon: '🔒',
      label: 'Opciones seguras',
      question: 'Como perfil conservador, cuales son las inversiones mas seguras que puedo hacer en Colombia?'
    },
    {
      icon: '📋',
      label: 'CDTs recomendados',
      question: 'Cuales son los mejores CDTs disponibles actualmente en Colombia para un perfil conservador?'
    }
  ],
  Moderado: [
    {
      icon: '⚖️',
      label: 'Balance riesgo',
      question: 'Como puedo balancear mi portafolio entre renta fija y variable siendo un perfil moderado?'
    },
    {
      icon: '🌎',
      label: 'ETFs globales',
      question: 'Cuales ETFs internacionales recomiendas para diversificar mi portafolio moderado?'
    }
  ],
  Agresivo: [
    {
      icon: '🚀',
      label: 'Alto rendimiento',
      question: 'Cuales son las opciones de inversion de mayor rendimiento disponibles para mi perfil agresivo?'
    },
    {
      icon: '💹',
      label: 'Acciones tech',
      question: 'Como puedo invertir en acciones tecnologicas desde Colombia siendo un perfil agresivo?'
    }
  ]
}

export default function QuickActions({ onSelect, userProfile }) {
  const profileActions = userProfile?.perfil ? PROFILE_ACTIONS[userProfile.perfil] || [] : []
  const allActions = [...profileActions, ...QUICK_ACTIONS_BASE].slice(0, 6)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
      {allActions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(action.question)}
          className="card p-4 text-left hover:border-brand-500/30 hover:bg-brand-500/5
                     transition-all duration-200 group"
        >
          <span className="text-2xl mb-2 block">{action.icon}</span>
          <span className="text-white/70 text-sm group-hover:text-white transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}
