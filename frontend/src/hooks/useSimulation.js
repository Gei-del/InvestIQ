import { useState } from 'react'
import { runSimulation } from '../services/api'

export function useSimulation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const simulate = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await runSimulation({
        capital_inicial: Number(formData.capital_inicial),
        tasa_anual: Number(formData.tasa_anual),
        anios: Number(formData.anios),
        inflacion: Number(formData.inflacion ?? 6),
      })
      setResult(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return { loading, error, result, simulate, reset }
}
