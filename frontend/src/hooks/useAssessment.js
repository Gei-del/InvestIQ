import { useState } from 'react'
import { predictProfile } from '../services/api'

export function useAssessment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const submitAssessment = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await predictProfile({
        edad: Number(formData.edad),
        riesgo: Number(formData.riesgo),
        horizonte: Number(formData.horizonte),
        liquidez: Number(formData.liquidez),
        objetivo: Number(formData.objetivo),
        experiencia: Number(formData.experiencia),
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

  return { loading, error, result, submitAssessment, reset }
}
