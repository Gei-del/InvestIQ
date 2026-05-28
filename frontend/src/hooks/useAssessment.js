import { useState } from 'react'
import { predictProfile } from '../services/api'

// Fallback local ML simulation when backend is unavailable
function localMLPrediction(formData) {
  const { edad, riesgo, horizonte, liquidez, objetivo, experiencia } = formData
  
  // Calculate weighted score (simulating DecisionTree logic)
  const weights = {
    riesgo: 0.30,
    horizonte: 0.25,
    objetivo: 0.20,
    experiencia: 0.15,
    liquidez: 0.10,
  }
  
  // Age factor: younger = more aggressive potential
  const edadFactor = edad < 30 ? 0.2 : edad < 45 ? 0 : edad < 60 ? -0.2 : -0.4
  
  const score = (
    riesgo * weights.riesgo +
    horizonte * weights.horizonte +
    objetivo * weights.objetivo +
    experiencia * weights.experiencia +
    (6 - liquidez) * weights.liquidez + // Invert liquidez (low need = higher score)
    edadFactor
  )
  
  // Normalize to 0-100 scale
  const normalizedScore = Math.round(Math.min(100, Math.max(0, (score / 5) * 100)))
  
  // Determine profile based on score
  let perfil, probabilidades
  
  if (normalizedScore < 35) {
    perfil = 'Conservador'
    probabilidades = {
      Conservador: 0.70 + Math.random() * 0.15,
      Moderado: 0.15 + Math.random() * 0.10,
      Agresivo: 0.05 + Math.random() * 0.05,
    }
  } else if (normalizedScore < 65) {
    perfil = 'Moderado'
    probabilidades = {
      Conservador: 0.15 + Math.random() * 0.10,
      Moderado: 0.60 + Math.random() * 0.20,
      Agresivo: 0.15 + Math.random() * 0.10,
    }
  } else {
    perfil = 'Agresivo'
    probabilidades = {
      Conservador: 0.05 + Math.random() * 0.05,
      Moderado: 0.20 + Math.random() * 0.10,
      Agresivo: 0.65 + Math.random() * 0.20,
    }
  }
  
  // Normalize probabilities to sum to 100%
  const total = Object.values(probabilidades).reduce((a, b) => a + b, 0)
  Object.keys(probabilidades).forEach(k => {
    probabilidades[k] = Math.round((probabilidades[k] / total) * 1000) / 10 // e.g., 70.5%
  })
  
  // Generate recommendations based on profile
  const recomendaciones = getRecommendations(perfil)
  const profileDetails = getProfileDetails(perfil)
  
  return {
    perfil,
    score: normalizedScore,
    probabilidades,
    recomendaciones,
    descripcion: profileDetails.descripcion,
    caracteristicas: profileDetails.caracteristicas,
    isLocalPrediction: true, // Flag to indicate this is a local prediction
  }
}

function getProfileDetails(perfil) {
  const details = {
    Conservador: {
      descripcion: 'Tu perfil es conservador, lo que significa que priorizas la seguridad y estabilidad de tu capital sobre los altos rendimientos. Prefieres instrumentos de bajo riesgo con rentabilidad predecible, ideal para proteger tu patrimonio.',
      caracteristicas: [
        'Prioriza la preservacion del capital',
        'Prefiere inversiones de renta fija',
        'Baja tolerancia a la volatilidad del mercado',
        'Horizonte de inversion tipicamente corto a mediano',
        'Busca ingresos estables y predecibles',
      ],
    },
    Moderado: {
      descripcion: 'Tu perfil es moderado, buscando un balance entre seguridad y crecimiento. Estas dispuesto a asumir cierto nivel de riesgo para obtener mejores rendimientos, manteniendo una base estable en tu portafolio.',
      caracteristicas: [
        'Balance entre seguridad y rentabilidad',
        'Acepta volatilidad moderada en el corto plazo',
        'Portafolio diversificado entre renta fija y variable',
        'Horizonte de inversion mediano a largo plazo',
        'Busca crecimiento sostenido del capital',
      ],
    },
    Agresivo: {
      descripcion: 'Tu perfil es agresivo, lo que indica que buscas maximizar tus rendimientos y estas dispuesto a asumir mayor riesgo. Tienes tolerancia a la volatilidad y un horizonte de inversion largo que te permite recuperarte de caidas temporales.',
      caracteristicas: [
        'Alta tolerancia al riesgo y volatilidad',
        'Enfocado en maximizar rendimientos a largo plazo',
        'Invierte principalmente en renta variable',
        'Horizonte de inversion largo (5+ anos)',
        'Aprovecha oportunidades de alto crecimiento',
      ],
    },
  }
  return details[perfil] || details.Moderado
}

function getRecommendations(perfil) {
  const recommendations = {
    Conservador: [
      {
        nombre: 'CDT Bancolombia',
        tipo: 'Renta Fija',
        rentabilidad: '11.5%',
        riesgo: 'Muy Bajo',
        descripcion: 'Certificado de deposito a termino con tasa fija garantizada. Protegido por Fogafin hasta 50 millones COP.',
        plazo: '12 meses',
        montoMinimo: '$1.000.000',
      },
      {
        nombre: 'TES Tasa Fija 2026',
        tipo: 'Deuda Publica',
        rentabilidad: '10.8%',
        riesgo: 'Bajo',
        descripcion: 'Titulos de deuda del gobierno colombiano. Maxima seguridad respaldada por la Nacion.',
        plazo: '24 meses',
        montoMinimo: '$500.000',
      },
      {
        nombre: 'Fondo de Inversion Conservador',
        tipo: 'Fondo Mutuo',
        rentabilidad: '9-11%',
        riesgo: 'Bajo',
        descripcion: 'Fondo diversificado en instrumentos de renta fija colombianos con liquidez semanal.',
        plazo: 'Abierto',
        montoMinimo: '$100.000',
      },
    ],
    Moderado: [
      {
        nombre: 'ETF S&P 500 (VOO)',
        tipo: 'ETF Internacional',
        rentabilidad: '10-14%',
        riesgo: 'Medio',
        descripcion: 'Fondo que replica las 500 empresas mas grandes de EE.UU. Diversificacion instantanea en un solo activo.',
        plazo: '3-5 anos',
        montoMinimo: '$200 USD',
      },
      {
        nombre: 'Acciones BVC - Ecopetrol',
        tipo: 'Renta Variable Local',
        rentabilidad: '8-15%',
        riesgo: 'Medio',
        descripcion: 'Accion de la petrolera mas grande de Colombia. Paga dividendos trimestrales.',
        plazo: '2-5 anos',
        montoMinimo: '$50.000',
      },
      {
        nombre: 'Fondo Moderado Skandia',
        tipo: 'Fondo Mixto',
        rentabilidad: '10-13%',
        riesgo: 'Medio',
        descripcion: 'Portafolio balanceado 60% renta fija, 40% renta variable. Gestion profesional.',
        plazo: 'Abierto',
        montoMinimo: '$500.000',
      },
    ],
    Agresivo: [
      {
        nombre: 'ETF Nasdaq 100 (QQQ)',
        tipo: 'ETF Tecnologia',
        rentabilidad: '15-25%',
        riesgo: 'Alto',
        descripcion: 'Exposicion a las 100 mayores tecnologicas: Apple, Microsoft, Amazon, Google, Tesla.',
        plazo: '5+ anos',
        montoMinimo: '$300 USD',
      },
      {
        nombre: 'Acciones Tecnologicas',
        tipo: 'Renta Variable',
        rentabilidad: '15-40%',
        riesgo: 'Alto',
        descripcion: 'Inversion directa en empresas de alto crecimiento como NVIDIA, AMD, Tesla.',
        plazo: '5+ anos',
        montoMinimo: '$100 USD',
      },
      {
        nombre: 'ETF Mercados Emergentes (VWO)',
        tipo: 'ETF Internacional',
        rentabilidad: '12-20%',
        riesgo: 'Alto',
        descripcion: 'Exposicion a mercados emergentes: China, India, Brasil, Taiwan.',
        plazo: '5+ anos',
        montoMinimo: '$100 USD',
      },
    ],
  }
  
  return recommendations[perfil] || recommendations.Moderado
}

export function useAssessment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const submitAssessment = async (formData) => {
    setLoading(true)
    setError(null)
    
    const numericData = {
      edad: Number(formData.edad),
      riesgo: Number(formData.riesgo),
      horizonte: Number(formData.horizonte),
      liquidez: Number(formData.liquidez),
      objetivo: Number(formData.objetivo),
      experiencia: Number(formData.experiencia),
    }
    
    try {
      // Try backend first
      const data = await predictProfile(numericData)
      setResult(data)
      return data
    } catch (err) {
      console.log('[v0] Backend unavailable, using local ML prediction')
      
      // Fallback to local prediction
      try {
        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const localResult = localMLPrediction(numericData)
        setResult(localResult)
        return localResult
      } catch (localErr) {
        setError('Error al procesar tu perfil. Por favor intenta de nuevo.')
        throw localErr
      }
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
