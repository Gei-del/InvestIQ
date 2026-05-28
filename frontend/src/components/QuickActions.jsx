const QUICK_ACTIONS_BASE = [
  {
    icon: '🚀',
    label: 'Quiero empezar',
    question: 'Soy principiante y quiero empezar a invertir. Por donde comienzo?',
    description: 'Guia para principiantes'
  },
  {
    icon: '💰',
    label: 'Donde invertir',
    question: 'En que puedo invertir en Colombia con un capital de 5 a 10 millones de pesos?',
    description: 'Opciones de inversion'
  },
  {
    icon: '📈',
    label: 'Interes compuesto',
    question: 'Explicame como funciona el interes compuesto de forma simple',
    description: 'Aprende la magia del tiempo'
  },
  {
    icon: '🏦',
    label: 'CDTs explicados',
    question: 'Que son los CDTs y cuales son las mejores tasas actualmente en Colombia?',
    description: 'Inversion segura y estable'
  }
]

const PROFILE_ACTIONS = {
  Conservador: [
    {
      icon: '🔒',
      label: 'Inversiones seguras',
      question: 'Como perfil conservador, cuales son las inversiones mas seguras que puedo hacer sin arriesgar mi capital?',
      description: 'Protege tu dinero'
    },
    {
      icon: '📋',
      label: 'Mejores CDTs',
      question: 'Cuales bancos ofrecen los mejores CDTs actualmente? Dame tasas y recomendaciones',
      description: 'Compara opciones'
    }
  ],
  Moderado: [
    {
      icon: '⚖️',
      label: 'Balancear portafolio',
      question: 'Como deberia distribuir mi dinero entre opciones seguras y de mayor crecimiento?',
      description: 'Equilibrio ideal'
    },
    {
      icon: '🌎',
      label: 'ETFs recomendados',
      question: 'Cuales ETFs me recomiendas para diversificar y acceder a mercados internacionales?',
      description: 'Diversifica globalmente'
    }
  ],
  Agresivo: [
    {
      icon: '📊',
      label: 'Mayor rendimiento',
      question: 'Cuales son las opciones de inversion con mayor potencial de crecimiento para mi perfil?',
      description: 'Maximiza ganancias'
    },
    {
      icon: '💹',
      label: 'Invertir en tech',
      question: 'Como puedo invertir en empresas tecnologicas como Apple, Google o Amazon desde Colombia?',
      description: 'Accede a gigantes tech'
    }
  ]
}

export default function QuickActions({ onSelect, userProfile }) {
  const profileActions = userProfile?.perfil ? PROFILE_ACTIONS[userProfile.perfil] || [] : []
  const allActions = [...profileActions, ...QUICK_ACTIONS_BASE].slice(0, 6)

  return (
    <div className="space-y-4">
      <p className="text-white/40 text-sm text-center">Preguntas rapidas para comenzar:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {allActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(action.question)}
            className="card p-4 text-left hover:border-brand-500/40 hover:bg-brand-500/5
                       hover:shadow-lg hover:shadow-brand-500/5
                       transition-all duration-200 group animate-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform inline-block">
              {action.icon}
            </span>
            <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors block mb-0.5">
              {action.label}
            </span>
            {action.description && (
              <span className="text-white/30 text-xs group-hover:text-white/50 transition-colors">
                {action.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
