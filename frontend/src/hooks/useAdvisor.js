import { useState, useCallback, useEffect } from 'react'
import { chatWithAdvisor } from '../services/api'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hola! Soy tu asesor financiero virtual de InvestIQ. Estoy aqui para ayudarte con tus dudas sobre inversiones, ahorro y finanzas personales en Colombia. Puedes preguntarme lo que quieras.',
  timestamp: new Date()
}

export function useAdvisor() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('investiq_chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          setMessages(parsed.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })))
        }
      }
    } catch (e) {
      console.error('Error loading chat history:', e)
    }
  }, [])

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem('investiq_chat_history', JSON.stringify(messages))
      } catch (e) {
        console.error('Error saving chat history:', e)
      }
    }
  }, [messages])

  const sendMessage = useCallback(async (content) => {
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      // Get user profile for context
      let userProfile = null
      try {
        const stored = localStorage.getItem('investiq_profile')
        userProfile = stored ? JSON.parse(stored) : null
      } catch {
        // Ignore
      }

      // Try to get response from backend API
      const response = await chatWithAdvisor(content, userProfile)
      
      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      // Fallback to smart simulated response
      const fallbackResponse = generateSmartResponse(content, getUserProfile())
      
      const assistantMessage = {
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }, [])

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE])
    localStorage.removeItem('investiq_chat_history')
  }, [])

  return { messages, isTyping, sendMessage, clearChat }
}

function getUserProfile() {
  try {
    const stored = localStorage.getItem('investiq_profile')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Smart response generator for fallback
function generateSmartResponse(question, userProfile) {
  const q = question.toLowerCase()
  const perfil = userProfile?.perfil || 'general'
  
  // Pattern matching for common questions
  if (q.includes('cdt') || q.includes('certificado')) {
    return getCDTResponse(perfil)
  }
  
  if (q.includes('etf') || q.includes('fondo')) {
    return getETFResponse(perfil)
  }
  
  if (q.includes('accion') || q.includes('bolsa') || q.includes('acciones')) {
    return getStockResponse(perfil)
  }
  
  if (q.includes('interes compuesto') || q.includes('compuesto')) {
    return getCompoundInterestResponse()
  }
  
  if (q.includes('perfil') || q.includes('tipo de inversor')) {
    return getProfileResponse(perfil)
  }
  
  if (q.includes('donde invertir') || q.includes('invertir') || q.includes('inversion')) {
    return getInvestmentResponse(perfil)
  }
  
  if (q.includes('ahorro') || q.includes('ahorrar')) {
    return getSavingsResponse()
  }
  
  if (q.includes('riesgo')) {
    return getRiskResponse(perfil)
  }
  
  if (q.includes('inflacion') || q.includes('inflación')) {
    return getInflationResponse()
  }
  
  if (q.includes('diversif')) {
    return getDiversificationResponse(perfil)
  }
  
  // Default response
  return getDefaultResponse(perfil)
}

function getCDTResponse(perfil) {
  const base = `Los CDT (Certificados de Deposito a Termino) son una excelente opcion de inversion en Colombia, especialmente para perfiles conservadores.

**Caracteristicas principales:**
- Rentabilidad fija conocida desde el inicio
- Protegidos por Fogafin hasta $50 millones
- Plazos desde 30 dias hasta varios anos
- Tasas actuales entre 10% y 13% EA aproximadamente

**Mejores opciones actuales en Colombia:**
1. **Bancolombia** - Tasas competitivas y solidez
2. **Davivienda** - Buenas tasas a plazos medianos
3. **Banco de Bogota** - Opciones flexibles
4. **Pibank/Lulo Bank** - Tasas mas altas (bancos digitales)`

  if (perfil === 'Conservador') {
    return base + `\n\n**Para tu perfil Conservador:** Los CDTs son ideales para ti. Te recomiendo distribuir entre varios plazos (escalonamiento) para tener liquidez periodica.`
  }
  
  return base + `\n\nRecuerda que puedes usar el simulador en el Dashboard para calcular cuanto ganarias con diferentes tasas y plazos.`
}

function getETFResponse(perfil) {
  const base = `Los ETFs (Exchange Traded Funds) son fondos que replican indices y se negocian como acciones. Son excelentes para diversificar.

**ETFs populares accesibles desde Colombia:**
- **VOO/SPY** - Replican el S&P 500 (500 empresas de EE.UU.)
- **QQQ** - Nasdaq 100 (tecnologicas)
- **VTI** - Mercado total de EE.UU.
- **ACWI** - Mercado global (desarrollados + emergentes)
- **VWO** - Mercados emergentes

**Como invertir desde Colombia:**
1. Abrir cuenta en broker internacional (Interactive Brokers, TD Ameritrade)
2. Usar plataformas locales como Tyba o ualet
3. A traves de fondos de inversion colombianos que invierten en ETFs`

  if (perfil === 'Moderado') {
    return base + `\n\n**Para tu perfil Moderado:** Te recomiendo una combinacion de VOO (60%) y bonos/CDTs locales (40%) para balancear crecimiento y estabilidad.`
  }
  
  if (perfil === 'Agresivo') {
    return base + `\n\n**Para tu perfil Agresivo:** Puedes considerar QQQ para mayor exposicion a tecnologia, pero recuerda que la volatilidad es mayor.`
  }
  
  return base
}

function getStockResponse(perfil) {
  return `Invertir en acciones desde Colombia es posible de varias formas:

**Acciones Colombianas (BVC):**
- Ecopetrol, Bancolombia, Grupo Sura, ISA, Nutresa
- Comisiones bajas, sin conversion de moneda
- Menor liquidez que mercados internacionales

**Acciones Internacionales:**
1. **Brokers internacionales:** Interactive Brokers, TD Ameritrade, eToro
2. **Apps locales:** Tyba, ualet (acceso limitado)
3. **ADRs:** Algunas acciones extranjeras cotizan en la BVC

**Consideraciones importantes:**
- Declarar ingresos del exterior en tu declaracion de renta
- Considerar el riesgo cambiario (USD/COP)
- Diversificar entre sectores y geografias

${perfil === 'Agresivo' ? 'Tu perfil Agresivo te permite mayor exposicion a acciones individuales, pero siempre diversificando.' : 'Para tu perfil, considera empezar con ETFs antes que acciones individuales para reducir el riesgo especifico.'}`
}

function getCompoundInterestResponse() {
  return `El interes compuesto es la "octava maravilla del mundo" segun Einstein. Es cuando ganas intereses sobre tus intereses.

**Ejemplo practico:**
Si inviertes $10.000.000 COP al 12% anual:
- Ano 1: $11.200.000 (ganaste $1.200.000)
- Ano 5: $17.623.417 (ganaste $7.623.417)
- Ano 10: $31.058.482 (ganaste $21.058.482)
- Ano 20: $96.462.930 (ganaste $86.462.930!)

**Claves para aprovecharlo:**
1. **Empezar temprano** - El tiempo es tu mejor aliado
2. **Ser constante** - Aportes regulares potencian el efecto
3. **Reinvertir** - No retirar las ganancias
4. **Paciencia** - Los resultados mas impresionantes vienen despues del ano 10

Usa nuestro simulador en el Dashboard para ver proyecciones personalizadas con tu capital y plazo.`
}

function getProfileResponse(perfil) {
  const current = perfil !== 'general' ? `\n\n**Tu perfil actual es ${perfil}**, lo que significa que ` : ''
  
  return `Existen tres perfiles principales de inversor:

**1. Conservador**
- Prioriza la seguridad del capital
- Tolera poca volatilidad
- Preferencia por CDTs, bonos, fondos de renta fija
- Rentabilidad esperada: 8-12% anual

**2. Moderado**
- Balance entre seguridad y crecimiento
- Tolera volatilidad moderada
- Mezcla de renta fija (60%) y variable (40%)
- Rentabilidad esperada: 10-15% anual

**3. Agresivo**
- Busca maximizar rendimientos
- Alta tolerancia al riesgo
- Mayor peso en acciones y ETFs
- Rentabilidad esperada: 12-20%+ anual

${current}${getProfileDescription(perfil)}

Si no has hecho el test de perfil, te invito a hacerlo en la seccion "Mi Perfil" para obtener recomendaciones personalizadas.`
}

function getProfileDescription(perfil) {
  switch (perfil) {
    case 'Conservador':
      return 'tus inversiones ideales son CDTs, bonos del gobierno y fondos de renta fija.'
    case 'Moderado':
      return 'puedes combinar inversiones seguras con algo de exposicion a renta variable para mejorar rendimientos.'
    case 'Agresivo':
      return 'puedes aprovechar opciones de mayor rendimiento como acciones y ETFs de crecimiento.'
    default:
      return ''
  }
}

function getInvestmentResponse(perfil) {
  const recommendations = {
    Conservador: `**Recomendaciones para tu perfil Conservador:**
1. CDTs en bancos solidos (50%)
2. Bonos TES del gobierno (30%)
3. Fondos de renta fija (20%)`,
    Moderado: `**Recomendaciones para tu perfil Moderado:**
1. CDTs y bonos (40%)
2. ETFs globales como VOO o ACWI (35%)
3. Fondos mixtos colombianos (25%)`,
    Agresivo: `**Recomendaciones para tu perfil Agresivo:**
1. ETFs de crecimiento (QQQ, VGT) (50%)
2. Acciones individuales diversificadas (30%)
3. CDTs como reserva de liquidez (20%)`,
    general: `**Opciones de inversion en Colombia:**
- CDTs: Seguros, tasas del 10-13% EA
- Fondos de inversion: Diversificacion administrada
- ETFs internacionales: Acceso a mercados globales
- Acciones BVC: Empresas colombianas
- Bonos TES: Deuda del gobierno`
  }

  return `${recommendations[perfil] || recommendations.general}

**Pasos para empezar:**
1. Define tu meta financiera
2. Determina tu horizonte de inversion
3. Calcula cuanto puedes invertir mensualmente
4. Diversifica entre diferentes instrumentos

Te recomiendo usar el simulador para proyectar tus inversiones y el test de perfil si aun no lo has hecho.`
}

function getSavingsResponse() {
  return `El ahorro es el primer paso hacia la inversion. Aqui algunos consejos:

**Estrategia 50/30/20:**
- 50% para necesidades (arriendo, servicios, comida)
- 30% para deseos (entretenimiento, viajes)
- 20% para ahorro e inversion

**Tips practicos:**
1. **Automatiza:** Programa transferencias automaticas el dia de pago
2. **Fondo de emergencia:** 3-6 meses de gastos en cuenta de ahorros
3. **Metas claras:** Define para que ahorras (casa, retiro, viaje)
4. **Evita deudas caras:** Paga tarjetas de credito antes de invertir

**Donde poner tus ahorros:**
- Corto plazo (< 1 ano): Cuenta de ahorros o CDT a 90 dias
- Mediano plazo (1-5 anos): CDTs escalonados o fondos mixtos
- Largo plazo (> 5 anos): Fondos de inversion o ETFs

Recuerda: invertir es ahorrar de forma inteligente para que tu dinero trabaje para ti.`
}

function getRiskResponse(perfil) {
  return `El riesgo en inversiones se refiere a la posibilidad de perder parte de tu capital o no obtener los rendimientos esperados.

**Tipos de riesgo:**
1. **Riesgo de mercado:** Fluctuaciones generales del mercado
2. **Riesgo de credito:** El emisor no paga (ej: bonos corporativos)
3. **Riesgo de liquidez:** No poder vender cuando necesitas
4. **Riesgo cambiario:** Variaciones USD/COP en inversiones extranjeras
5. **Riesgo de inflacion:** Tu rendimiento no supera la inflacion

**Como gestionar el riesgo:**
- Diversifica entre diferentes activos y sectores
- No inviertas dinero que necesitaras pronto
- Mantén un fondo de emergencia separado
- Ajusta tu portafolio segun tu edad y objetivos

${perfil !== 'general' ? `Con tu perfil ${perfil}, tu tolerancia al riesgo esta ${perfil === 'Conservador' ? 'orientada a la seguridad' : perfil === 'Agresivo' ? 'preparada para mayor volatilidad' : 'en un punto intermedio balanceado'}.` : ''}`
}

function getInflationResponse() {
  return `La inflacion en Colombia ha sido variable, pero históricamente ronda el 4-7% anual. En 2023-2024 estuvo elevada (10-13%).

**Por que importa para tus inversiones:**
- Si tu inversion rinde 10% y la inflacion es 8%, tu ganancia REAL es solo 2%
- El "rendimiento real" = rendimiento nominal - inflacion
- El dinero en una cuenta de ahorros al 1% PIERDE valor con inflacion del 6%

**Como protegerte de la inflacion:**
1. **Inversiones con rendimiento > inflacion:** CDTs actuales superan la inflacion
2. **Activos reales:** Bienes raices, acciones (las empresas ajustan precios)
3. **Bonos indexados:** TES UVR se ajustan con inflacion
4. **Diversificacion internacional:** USD como cobertura parcial

En nuestro simulador puedes ver el "valor real" ajustado por inflacion para entender tu ganancia verdadera.`
}

function getDiversificationResponse(perfil) {
  return `La diversificacion es no poner todos los huevos en la misma canasta. Es la unica "comida gratis" en inversiones.

**Niveles de diversificacion:**
1. **Por tipo de activo:** Acciones, bonos, CDTs, inmuebles
2. **Por sector:** Tecnologia, finanzas, salud, energia
3. **Por geografia:** Colombia, EE.UU., Europa, Asia
4. **Por plazo:** Corto, mediano, largo plazo

**Portafolio diversificado ejemplo (${perfil || 'Moderado'}):**
${perfil === 'Conservador' ? 
  '- 60% Renta fija (CDTs, bonos)\n- 30% Fondos mixtos\n- 10% ETFs conservadores' :
  perfil === 'Agresivo' ?
  '- 20% Renta fija (liquidez)\n- 50% ETFs de crecimiento\n- 30% Acciones diversificadas' :
  '- 40% Renta fija (CDTs, bonos)\n- 40% ETFs globales\n- 20% Acciones o fondos activos'
}

**Regla practica:** No mas del 10-15% en una sola inversion, ni mas del 30% en un sector.`
}

function getDefaultResponse(perfil) {
  return `Gracias por tu pregunta. Como tu asesor financiero de InvestIQ, puedo ayudarte con:

- **Perfiles de inversion:** Cual se ajusta a ti
- **Opciones de inversion:** CDTs, fondos, ETFs, acciones
- **Ahorro:** Estrategias para comenzar
- **Riesgo:** Como entenderlo y gestionarlo
- **Simulaciones:** Proyecciones de tu dinero

${perfil !== 'general' ? `Teniendo en cuenta tu perfil ${perfil}, puedo darte recomendaciones mas personalizadas.` : 'Te recomiendo hacer el test de perfil en "Mi Perfil" para obtener consejos personalizados.'}

Algunas preguntas que podrias hacerme:
- "En que puedo invertir con 5 millones?"
- "Cual es la diferencia entre CDT y fondos?"
- "Como funciona el interes compuesto?"
- "Como puedo diversificar mi portafolio?"

Estoy aqui para ayudarte a tomar mejores decisiones financieras.`
}
