import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssessment } from '../hooks/useAssessment'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'

const STEPS = [
  {
    id: 'edad',
    label: 'Edad',
    question: '¿Cuántos años tienes?',
    hint: 'Tu edad influye en el horizonte de inversión recomendado.',
    type: 'number',
    min: 18, max: 100,
    placeholder: 'Ej: 35',
  },
  {
    id: 'riesgo',
    label: 'Tolerancia al Riesgo',
    question: '¿Cómo describes tu tolerancia al riesgo financiero?',
    hint: 'Piensa en cómo reaccionarías si tu inversión cae un 20% en un mes.',
    type: 'scale',
    options: [
      { value: 1, label: 'Muy Baja', desc: 'No tolero pérdidas' },
      { value: 2, label: 'Baja', desc: 'Acepto pérdidas mínimas' },
      { value: 3, label: 'Media', desc: 'Acepto cierta volatilidad' },
      { value: 4, label: 'Alta', desc: 'Tolero fluctuaciones importantes' },
      { value: 5, label: 'Muy Alta', desc: 'Busco máximo rendimiento' },
    ],
  },
  {
    id: 'horizonte',
    label: 'Horizonte de Inversión',
    question: '¿En cuánto tiempo necesitarás tu dinero?',
    hint: 'A mayor horizonte, más opciones de inversión rentables tienes.',
    type: 'scale',
    options: [
      { value: 1, label: 'Menos de 1 año', desc: 'Necesito liquidez pronto' },
      { value: 2, label: '1–3 años', desc: 'Corto plazo' },
      { value: 3, label: '3–5 años', desc: 'Mediano plazo' },
      { value: 4, label: '5–10 años', desc: 'Largo plazo' },
      { value: 5, label: 'Más de 10 años', desc: 'Muy largo plazo' },
    ],
  },
  {
    id: 'liquidez',
    label: 'Necesidad de Liquidez',
    question: '¿Qué tan importante es tener acceso rápido a tu dinero?',
    hint: 'Liquidez es la capacidad de convertir tu inversión en efectivo rápidamente.',
    type: 'scale',
    options: [
      { value: 1, label: 'Muy Alta', desc: 'Necesito acceso inmediato' },
      { value: 2, label: 'Alta', desc: 'Acceso en días' },
      { value: 3, label: 'Media', desc: 'Acceso en semanas' },
      { value: 4, label: 'Baja', desc: 'Puedo esperar meses' },
      { value: 5, label: 'Muy Baja', desc: 'No necesito el dinero pronto' },
    ],
  },
  {
    id: 'objetivo',
    label: 'Objetivo Financiero',
    question: '¿Cuál es tu principal objetivo al invertir?',
    hint: 'Desde preservar capital hasta multiplicarlo agresivamente.',
    type: 'scale',
    options: [
      { value: 1, label: 'Preservar Capital', desc: 'No perder dinero' },
      { value: 2, label: 'Superar Inflación', desc: 'Ganarle al IPC' },
      { value: 3, label: 'Crecimiento Moderado', desc: 'Rentas del 8–12%' },
      { value: 4, label: 'Crecimiento Alto', desc: 'Rentas del 12–20%' },
      { value: 5, label: 'Máximo Crecimiento', desc: 'Sin límite de riesgo' },
    ],
  },
  {
    id: 'experiencia',
    label: 'Experiencia Invirtiendo',
    question: '¿Cuánta experiencia tienes invirtiendo?',
    hint: 'Tu conocimiento del mercado define las opciones más adecuadas.',
    type: 'scale',
    options: [
      { value: 1, label: 'Ninguna', desc: 'Nunca he invertido' },
      { value: 2, label: 'Básica', desc: 'CDTs y cuentas de ahorro' },
      { value: 3, label: 'Intermedia', desc: 'Fondos y algo de acciones' },
      { value: 4, label: 'Avanzada', desc: 'Acciones y ETFs' },
      { value: 5, label: 'Experto', desc: 'Portafolios diversificados' },
    ],
  },
]

const initialForm = { edad: '', riesgo: '', horizonte: '', liquidez: '', objetivo: '', experiencia: '' }

export default function AssessmentPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const { loading, error, submitAssessment } = useAssessment()
  const navigate = useNavigate()

  const current = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  const isValid = () => {
    const val = form[current.id]
    if (!val && val !== 0) return false
    if (current.type === 'number') {
      const n = Number(val)
      return n >= current.min && n <= current.max
    }
    return true
  }

  const handleNext = async () => {
    if (!isValid()) return
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      try {
        const result = await submitAssessment(form)
        navigate('/result', { state: { result } })
      } catch (_) {
        // error shown by ErrorAlert
      }
    }
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  const setValue = (val) => setForm((f) => ({ ...f, [current.id]: val }))

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-sm font-mono">
              Paso {step + 1} de {STEPS.length}
            </span>
            <span className="text-brand-400 text-sm font-mono">{current.label}</span>
          </div>
          <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress + (100 / STEPS.length)}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card p-8 animate-in">
          <h2 className="font-display font-bold text-2xl text-white mb-2">
            {current.question}
          </h2>
          <p className="text-white/40 text-sm mb-8">{current.hint}</p>

          {/* Number Input */}
          {current.type === 'number' && (
            <input
              type="number"
              min={current.min}
              max={current.max}
              placeholder={current.placeholder}
              value={form[current.id]}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              className="input-field text-2xl font-mono text-center py-5 mb-2"
              autoFocus
            />
          )}

          {/* Scale Options */}
          {current.type === 'scale' && (
            <div className="space-y-2">
              {current.options.map((opt) => {
                const selected = Number(form[current.id]) === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setValue(opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150 ${
                      selected
                        ? 'border-brand-500/60 bg-brand-500/10 text-white'
                        : 'border-surface-border hover:border-white/20 text-white/70 hover:text-white hover:bg-white/3'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                        selected
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-surface-border text-white/30'
                      }`}
                    >
                      {opt.value}
                    </span>
                    <div>
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className="text-white/40 text-xs">{opt.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Error */}
          {error && <div className="mt-4"><ErrorAlert message={error} /></div>}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={handleBack} className="btn-secondary flex-1">
                ← Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!isValid() || loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analizando…
                </span>
              ) : step === STEPS.length - 1 ? (
                'Ver mi perfil →'
              ) : (
                'Siguiente →'
              )}
            </button>
          </div>
        </div>

        {/* Preview of filled answers */}
        {step > 0 && (
          <div className="mt-4 card p-4">
            <p className="text-white/30 text-xs font-mono mb-3">Respuestas guardadas</p>
            <div className="flex flex-wrap gap-2">
              {STEPS.slice(0, step).map((s) => (
                <span key={s.id} className="badge badge-green">
                  {s.label}: {form[s.id]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-surface/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card p-10">
            <LoadingSpinner message="Clasificando tu perfil con ML…" />
          </div>
        </div>
      )}
    </div>
  )
}
