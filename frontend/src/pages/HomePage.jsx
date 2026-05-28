import { Link } from 'react-router-dom'

const features = [
  {
    icon: '🧠',
    title: 'Machine Learning',
    desc: 'Clasificacion de perfil con DecisionTree entrenado con datos representativos del mercado colombiano.',
  },
  {
    icon: '💬',
    title: 'Asesor IA',
    desc: 'Conversa con nuestro asistente inteligente para resolver tus dudas sobre inversiones y finanzas.',
  },
  {
    icon: '📊',
    title: 'Recomendaciones',
    desc: 'Estrategias personalizadas: CDTs, TES, ETFs, acciones BVC e instrumentos internacionales.',
  },
  {
    icon: '📈',
    title: 'Simulador Avanzado',
    desc: 'Compara escenarios, calcula metas financieras y proyecta tu inversion con interes compuesto.',
  },
]

const profiles = [
  {
    label: 'Conservador',
    color: 'brand',
    icon: '🛡️',
    desc: 'CDTs, Bonos TES, Fondos de bajo riesgo',
    ret: '10–13%',
  },
  {
    label: 'Moderado',
    color: 'blue',
    icon: '⚖️',
    desc: 'ETFs globales, Fondos mixtos, Acciones BVC',
    ret: '10–14%',
  },
  {
    label: 'Agresivo',
    color: 'amber',
    icon: '🚀',
    desc: 'Nasdaq ETFs, Acciones internacionales, Cripto',
    ret: '15–25%+',
  },
]

const colorMap = {
  brand: { bg: 'bg-brand-500/10', border: 'border-brand-500/20', text: 'text-brand-400' },
  blue:  { bg: 'bg-blue-500/10',  border: 'border-blue-500/20',  text: 'text-blue-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge badge-green mb-8 animate-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Powered by Machine Learning · Colombia 🇨🇴
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-in"
            style={{ animationDelay: '80ms' }}
          >
            Descubre tu{' '}
            <span className="gradient-text">perfil financiero</span>
            <br />inteligente
          </h1>

          <p
            className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-in"
            style={{ animationDelay: '160ms' }}
          >
            Responde 6 preguntas, nuestro modelo de ML clasifica tu perfil y te entrega
            estrategias de inversión personalizadas para el mercado colombiano.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-4 animate-in"
            style={{ animationDelay: '240ms' }}
          >
            <Link to="/assessment" className="btn-primary text-base px-8 py-4">
              Analizar mi perfil
            </Link>
            <Link to="/advisor" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Hablar con Asesor IA
            </Link>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto animate-in"
            style={{ animationDelay: '320ms' }}
          >
            {[
              { val: '3', label: 'Perfiles' },
              { val: '9+', label: 'Instrumentos' },
              { val: '50', label: 'Años sim.' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-3xl gradient-text">{val}</div>
                <div className="text-white/40 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profiles */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-2">
            Perfiles de Inversión
          </h2>
          <p className="text-white/40 text-center text-sm mb-10">
            El ML determina cuál encaja con tu situación financiera actual
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {profiles.map((p) => {
              const c = colorMap[p.color]
              return (
                <div key={p.label} className={`card p-6 border ${c.border} ${c.bg} text-center`}>
                  <span className="text-4xl block mb-3">{p.icon}</span>
                  <h3 className={`font-display font-bold text-xl mb-2 ${c.text}`}>{p.label}</h3>
                  <p className="text-white/50 text-sm mb-4">{p.desc}</p>
                  <span className={`badge ${c.bg} ${c.text} border ${c.border}`}>
                    Rentabilidad est. {p.ret}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-10">
            ¿Qué incluye el análisis?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="card p-6 flex gap-4 hover:border-white/20 transition-colors">
                <span className="text-3xl shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-display font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center card p-10 border-brand-500/20 bg-brand-500/5">
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            ¿Listo para invertir con inteligencia?
          </h2>
          <p className="text-white/50 mb-8">
            El análisis tarda menos de 2 minutos. Gratuito y sin registro.
          </p>
          <Link to="/assessment" className="btn-primary text-base px-10 py-4">
            Comenzar ahora →
          </Link>
        </div>
      </section>
    </div>
  )
}
