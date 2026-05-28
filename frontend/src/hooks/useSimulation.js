import { useState } from 'react'
import { runSimulation } from '../services/api'

// Local simulation fallback when backend is unavailable
function localSimulation({ capital_inicial, tasa_anual, anios, inflacion }) {
  const tasa = tasa_anual / 100
  const infl = inflacion / 100
  
  const datos_anuales = []
  let valorNominal = capital_inicial
  let valorReal = capital_inicial
  
  for (let i = 0; i <= anios; i++) {
    const gananciaAcumulada = valorNominal - capital_inicial
    const inflacionAcumulada = capital_inicial * (Math.pow(1 + infl, i) - 1)
    
    datos_anuales.push({
      anio: i,
      valor_nominal: Math.round(valorNominal),
      valor_real: Math.round(valorReal),
      ganancia_acumulada: Math.round(gananciaAcumulada),
      inflacion_acumulada: Math.round(inflacionAcumulada)
    })
    
    if (i < anios) {
      valorNominal = valorNominal * (1 + tasa)
      valorReal = valorNominal / Math.pow(1 + infl, i + 1)
    }
  }
  
  const valorFuturo = Math.round(capital_inicial * Math.pow(1 + tasa, anios))
  const valorRealFinal = Math.round(valorFuturo / Math.pow(1 + infl, anios))
  const gananciaTotal = valorFuturo - capital_inicial
  
  return {
    capital_inicial,
    tasa_anual,
    anios,
    inflacion,
    valor_futuro: valorFuturo,
    valor_real: valorRealFinal,
    ganancia_total: gananciaTotal,
    crecimiento_porcentual: ((valorFuturo - capital_inicial) / capital_inicial) * 100,
    crecimiento_real_porcentual: ((valorRealFinal - capital_inicial) / capital_inicial) * 100,
    datos_anuales
  }
}

export function useSimulation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const simulate = async (formData) => {
    setLoading(true)
    setError(null)
    
    const params = {
      capital_inicial: Number(formData.capital_inicial),
      tasa_anual: Number(formData.tasa_anual),
      anios: Number(formData.anios),
      inflacion: Number(formData.inflacion ?? 6),
    }
    
    try {
      const data = await runSimulation(params)
      setResult(data)
      return data
    } catch {
      // Fallback to local calculation
      const localResult = localSimulation(params)
      setResult(localResult)
      return localResult
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
