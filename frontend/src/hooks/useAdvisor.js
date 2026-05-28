import { useState, useCallback, useEffect } from 'react'
import { chatWithAdvisor } from '../services/api'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hola, que gusto saludarte! Soy tu asesor financiero personal en InvestIQ. Estoy aqui para ayudarte a tomar mejores decisiones con tu dinero, ya sea que quieras empezar a invertir, entender mejor las opciones disponibles en Colombia, o simplemente resolver alguna duda. Cuentame, en que puedo ayudarte hoy?',
  timestamp: new Date()
}

// Personality traits for humanized responses
const PERSONALITY = {
  greetings: ['Claro que si!', 'Con gusto te explico.', 'Excelente pregunta!', 'Me alegra que preguntes eso.', 'Por supuesto!'],
  transitions: ['Ahora bien,', 'Por otro lado,', 'Ademas,', 'Algo importante es que', 'Vale la pena mencionar que'],
  encouragements: ['Vas muy bien!', 'Es una excelente decision informarte.', 'Me parece muy inteligente que investigues antes de invertir.'],
  closings: ['Cualquier otra duda, aqui estoy.', 'Si necesitas que profundice en algo, dimelo.', 'Estoy para ayudarte.', 'No dudes en preguntar mas.']
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

    // Simulate natural typing delay (500-1500ms)
    const typingDelay = 500 + Math.random() * 1000

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
      
      await new Promise(resolve => setTimeout(resolve, typingDelay))
      
      const assistantMessage = {
        role: 'assistant',
        content: humanizeResponse(response.message),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      // Fallback to smart simulated response
      await new Promise(resolve => setTimeout(resolve, typingDelay))
      
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

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function humanizeResponse(text) {
  // Add natural language touches if response seems too formal
  if (text && !text.includes('!') && Math.random() > 0.5) {
    return text + '\n\n' + randomPick(PERSONALITY.closings)
  }
  return text
}

// Smart response generator for fallback - MORE HUMANIZED
function generateSmartResponse(question, userProfile) {
  const q = question.toLowerCase()
  const perfil = userProfile?.perfil || 'general'
  
  // Pattern matching for common questions
  if (q.includes('hola') || q.includes('buenos') || q.includes('buenas') || q.includes('hey')) {
    return getGreetingResponse(perfil)
  }
  
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
  
  if (q.includes('donde invertir') || q.includes('invertir') || q.includes('inversion') || q.includes('mejor')) {
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

  if (q.includes('gracias') || q.includes('genial') || q.includes('excelente')) {
    return getThanksResponse()
  }

  if (q.includes('empezar') || q.includes('principiante') || q.includes('nuevo')) {
    return getBeginnerResponse(perfil)
  }

  if (q.includes('cuanto') && (q.includes('necesito') || q.includes('debo'))) {
    return getHowMuchResponse(perfil)
  }
  
  // Default response
  return getDefaultResponse(perfil)
}

function getGreetingResponse(perfil) {
  const greeting = perfil !== 'general' 
    ? `Hola! Que bueno verte de nuevo. Recuerdo que tienes un perfil ${perfil}, asi que ya tengo contexto para ayudarte mejor.`
    : 'Hola! Que gusto saludarte. Estoy aqui para ayudarte con cualquier duda sobre inversiones y finanzas personales.'
  
  return `${greeting}

Cuentame, en que estas pensando? Puedo ayudarte con:
- Recomendaciones de inversion para tu perfil
- Explicarte como funcionan diferentes instrumentos (CDTs, ETFs, acciones)
- Calcular proyecciones de tu dinero
- Estrategias de ahorro

Que te gustaria explorar?`
}

function getThanksResponse() {
  return `Me alegra haberte ayudado! Para eso estoy aqui.

Si mas adelante te surge otra duda o quieres que te explique algo con mas detalle, no dudes en escribirme. Recuerda que tambien puedes usar el simulador en el Dashboard para ver proyecciones concretas de tus inversiones.

Mucho exito con tus decisiones financieras!`
}

function getBeginnerResponse(perfil) {
  return `${randomPick(PERSONALITY.greetings)} Me encanta que quieras empezar a invertir, es una de las mejores decisiones que puedes tomar.

Dejame darte una guia sencilla para comenzar:

**Paso 1: Construye tu base**
Antes de invertir, asegurate de tener un fondo de emergencia (3-6 meses de gastos) en una cuenta de ahorros o CDT a corto plazo.

**Paso 2: Conoce tu perfil**
Te recomiendo hacer el test de perfil en "Mi Perfil" para saber que tipo de inversiones van mejor contigo. ${perfil !== 'general' ? `Tu ya lo hiciste y eres ${perfil}, lo cual me ayuda a darte mejores recomendaciones.` : ''}

**Paso 3: Empieza simple**
Para principiantes en Colombia, recomiendo:
1. **CDTs** - Empezar a entender como funciona invertir, sin riesgo
2. **Fondos de inversion** - A traves de apps como Tyba o tu banco
3. **ETFs** - Una vez te sientas comodo, para mayor crecimiento

**Lo mas importante:** No necesitas mucho dinero para empezar. Con $500,000 COP ya puedes abrir un CDT o empezar en algunos fondos.

Que te parece? Quieres que profundicemos en alguno de estos pasos?`
}

function getHowMuchResponse(perfil) {
  return `Excelente pregunta! La cantidad para invertir depende de tu situacion personal, pero te doy algunas guias practicas:

**Montos minimos en Colombia:**
- **CDTs:** Desde $500,000 en la mayoria de bancos
- **Fondos de inversion:** Desde $100,000 en apps como Tyba
- **ETFs internacionales:** Desde $50 USD aprox. en brokers

**La regla del 20%**
Idealmente, destina el 20% de tus ingresos al ahorro e inversion. Pero si estas empezando, incluso el 5-10% hace diferencia con el tiempo.

**Mi recomendacion:**
1. Primero, ten 3-6 meses de gastos en emergencias
2. Luego, invierte lo que puedas de forma CONSTANTE cada mes
3. Aumenta gradualmente conforme mejoren tus ingresos

El monto exacto importa menos que la constancia. $500,000 mensuales durante 10 anos al 12% se convierten en mas de $115 millones!

Quieres que te ayude a calcular una proyeccion especifica? Puedes usar el simulador en el Dashboard o decirme tus numeros aqui.`
}

function getCDTResponse(perfil) {
  return `${randomPick(PERSONALITY.greetings)} Los CDT son una de mis recomendaciones favoritas para empezar a invertir en Colombia, especialmente si buscas seguridad.

**Que es un CDT?**
Es como un "prestamo" que tu le haces al banco. A cambio, te pagan intereses. Tu dinero esta protegido por Fogafin hasta $50 millones.

**Las tasas actuales estan muy atractivas:**
- Bancolombia: ~11-12% EA
- Davivienda: ~11.5% EA
- Pibank/Lulo Bank: hasta 13% EA (bancos digitales)
- Banco de Bogota: ~11% EA

**Un tip importante:**
Considera la estrategia de "escalonamiento": divide tu dinero en CDTs con diferentes plazos (3, 6, 9, 12 meses). Asi tendras liquidez periodica y buenas tasas.

${perfil === 'Conservador' ? 'Para tu perfil Conservador, los CDTs son perfectos. Te dan tranquilidad y rendimientos por encima de la inflacion.' : 
  perfil === 'Moderado' ? 'Con tu perfil Moderado, te sugiero que los CDTs sean parte de tu portafolio (40-50%), combinados con otras inversiones de mayor crecimiento.' :
  perfil === 'Agresivo' ? 'Aunque tu perfil es Agresivo, tener un 15-20% en CDTs como reserva de liquidez es inteligente.' : ''}

Te gustaria que te explique como funcionan otras opciones o que profundice en los CDTs?`
}

function getETFResponse(perfil) {
  return `${randomPick(PERSONALITY.greetings)} Los ETFs son una de las formas mas inteligentes de invertir, especialmente para acceder a mercados internacionales desde Colombia.

**Que son los ETFs?**
Imagina que quieres invertir en las 500 empresas mas grandes de Estados Unidos. En lugar de comprar acciones de cada una (imposible!), compras UN ETF que las incluye todas. Es diversificacion instantanea.

**Los ETFs que mas recomiendo:**

Para empezar (bajo costo, alta diversificacion):
- **VOO o SPY** - Las 500 empresas mas grandes de EE.UU.
- **VTI** - TODO el mercado estadounidense (4,000+ empresas)
- **ACWI** - Mercado global (incluye emergentes)

Si quieres mas crecimiento:
- **QQQ** - Las 100 mayores tecnologicas
- **VGT** - Sector tecnologia

**Como invertir desde Colombia:**
1. Abrir cuenta en Interactive Brokers (el mas popular)
2. Apps locales como Tyba ofrecen algunos ETFs
3. Fondos colombianos que invierten en ETFs internacionales

${perfil === 'Moderado' ? 'Para tu perfil Moderado, una combinacion de VOO (40%) con renta fija local (60%) seria ideal.' :
  perfil === 'Agresivo' ? 'Con tu perfil Agresivo, puedes tener mas exposicion a ETFs de crecimiento como QQQ, pero siempre diversificando.' :
  perfil === 'Conservador' ? 'Aunque eres Conservador, un pequeño porcentaje (10-20%) en ETFs globales puede mejorar tu rendimiento a largo plazo.' : ''}

Quieres que te explique como abrir una cuenta o profundizar en alguno de estos ETFs?`
}

function getStockResponse(perfil) {
  return `${randomPick(PERSONALITY.greetings)} Invertir en acciones es emocionante, pero hay que hacerlo con estrategia. Te cuento las opciones desde Colombia:

**Acciones Colombianas (BVC)**
Puedes invertir en empresas como Ecopetrol, Bancolombia, ISA, Grupo Sura. La ventaja es que no hay riesgo cambiario y las comisiones son bajas.

Sin embargo, siendo honesto: el mercado colombiano es pequeno y menos liquido que el internacional.

**Acciones Internacionales**
La mejor forma es a traves de un broker internacional como Interactive Brokers. Asi puedes comprar Apple, Amazon, Tesla, o cualquier empresa que te interese.

**Mi recomendacion honesta:**
Para la mayoria de personas, es mejor invertir en ETFs que en acciones individuales. Por que?
- Menor riesgo (estas diversificado)
- Menos tiempo de investigacion
- Historicamente, pocos inversionistas logran ganarle al mercado

${perfil === 'Agresivo' ? 'Tu perfil Agresivo te permite tener mas acciones individuales, pero te sugiero que sea maximo el 30% de tu portafolio, y el resto en ETFs diversificados.' :
  'Te sugiero que si quieres acciones, sea una parte pequena de tu portafolio (10-20%), y el resto en opciones mas diversificadas.'}

Te interesa que te explique como abrir una cuenta de broker o prefieres explorar otras opciones primero?`
}

function getCompoundInterestResponse() {
  return `Ah, el interes compuesto! Einstein supuestamente lo llamo "la octava maravilla del mundo". Dejame explicartelo de forma simple:

**La magia del interes compuesto**
Es cuando tus intereses generan mas intereses. Es como una bola de nieve que crece sola.

**Ejemplo practico:**
Inviertes $10 millones al 12% anual:

| Ano | Valor | Ganancia del ano |
|-----|-------|------------------|
| 0   | $10M  | - |
| 1   | $11.2M | $1.2M |
| 5   | $17.6M | $2.1M |
| 10  | $31M | $3.4M |
| 20  | $96.5M | $10.3M |

Fijate como en el ano 1 ganas $1.2M, pero en el ano 20 ganas $10.3M solo ese ano! Eso es el poder del tiempo.

**Las 3 claves:**
1. **Empezar temprano** - Cada ano cuenta muchisimo
2. **Ser constante** - Aportar regularmente multiplica el efecto
3. **No retirar** - Dejar que los intereses se acumulen

Puedes usar el simulador en el Dashboard para ver proyecciones exactas con tus numeros. Quieres que te ayude a calcular algo especifico?`
}

function getProfileResponse(perfil) {
  const current = perfil !== 'general' ? `Segun tu evaluacion, eres un inversionista **${perfil}**. ` : ''
  
  return `${current}Dejame explicarte los tres perfiles principales:

**Conservador**
- Prioriza no perder dinero sobre ganar mas
- Prefiere dormir tranquilo sabiendo que su dinero esta seguro
- Ideal: CDTs, bonos TES, fondos de renta fija
- Rendimiento tipico: 10-12% anual

**Moderado**
- Busca balance entre seguridad y crecimiento
- Acepta algunas fluctuaciones por mejores rendimientos
- Ideal: Mix de renta fija (60%) + ETFs/fondos (40%)
- Rendimiento tipico: 12-15% anual

**Agresivo**
- Busca maximizar ganancias a largo plazo
- Tolera ver su portafolio bajar temporalmente
- Ideal: ETFs de crecimiento, acciones diversificadas
- Rendimiento tipico: 14-18%+ anual

${perfil !== 'general' ? `Como eres ${perfil}, te recomiendo enfocarte en las opciones de ese perfil, pero siempre puedes ajustar segun cambien tus circunstancias.` : 'Te invito a hacer el test en "Mi Perfil" para conocer el tuyo. Solo toma 2 minutos y me ayuda a darte mejores consejos!'}

Quieres que te de recomendaciones especificas para algun perfil?`
}

function getInvestmentResponse(perfil) {
  let recomendacion = ''
  
  if (perfil === 'Conservador') {
    recomendacion = `**Para tu perfil Conservador, te sugiero:**

1. **CDTs (50-60%)** - En Bancolombia, Davivienda o bancos digitales
2. **Bonos TES (20-30%)** - Deuda del gobierno, muy segura
3. **Fondo de renta fija (10-20%)** - Para algo de diversificacion

Esta combinacion te daria ~11-12% anual con muy bajo riesgo.`
  } else if (perfil === 'Moderado') {
    recomendacion = `**Para tu perfil Moderado, te sugiero:**

1. **CDTs y bonos (40%)** - Tu base segura
2. **ETF global como ACWI o VOO (35%)** - Crecimiento internacional
3. **Fondo mixto local (25%)** - Balance administrado

Esta combinacion te daria ~12-14% anual con riesgo controlado.`
  } else if (perfil === 'Agresivo') {
    recomendacion = `**Para tu perfil Agresivo, te sugiero:**

1. **ETFs de crecimiento QQQ/VGT (45%)** - Mayor potencial
2. **ETF global VOO/VTI (30%)** - Diversificacion base
3. **CDT como reserva (15%)** - Liquidez para oportunidades
4. **Acciones individuales (10%)** - Si quieres investigar empresas

Esta combinacion te daria ~14-18% anual con volatilidad.`
  } else {
    recomendacion = `**Opciones populares en Colombia:**

- **CDTs** - Lo mas seguro, ~11-13% anual
- **Fondos de inversion** - Administrados por expertos
- **ETFs internacionales** - Acceso a mercados globales
- **Acciones BVC** - Empresas colombianas

Te recomiendo hacer el test de perfil primero para darte consejos mas personalizados. Esta en la seccion "Mi Perfil".`
  }

  return `${randomPick(PERSONALITY.greetings)} Que bueno que quieras invertir tu dinero de forma inteligente.

${recomendacion}

**Pasos concretos para empezar:**
1. Define cuanto puedes invertir mensualmente
2. Abre las cuentas necesarias (banco, broker si aplica)
3. Empieza con un monto pequeno para aprender
4. Se constante, eso es lo mas importante

Quieres que te explique alguna de estas opciones en detalle?`
}

function getSavingsResponse() {
  return `${randomPick(PERSONALITY.greetings)} El ahorro es el primer paso, y me alegra que estes pensando en ello.

**La regla 50/30/20 funciona muy bien:**
- 50% Necesidades (arriendo, servicios, comida, transporte)
- 30% Gustos (entretenimiento, restaurantes, compras)
- 20% Ahorro e inversion

**Tips que realmente funcionan:**

1. **Automatiza desde el dia de pago**
Configura una transferencia automatica. Si no lo ves, no lo gastas.

2. **Fondo de emergencia primero**
Antes de invertir, ten 3-6 meses de gastos guardados. Esto te da tranquilidad y evita que vendas inversiones en mal momento.

3. **El metodo de los 24 horas**
Antes de una compra grande, espera 24 horas. Muchas veces el impulso pasa.

4. **Sube tu ahorro con cada aumento de sueldo**
Si te suben el sueldo, aumenta tu porcentaje de ahorro antes de acostumbrarte al dinero extra.

**Donde poner tus ahorros:**
- Emergencias: Cuenta de ahorros de facil acceso
- Corto plazo (< 1 ano): CDT a 90 dias
- Mediano/largo plazo: Inversiones segun tu perfil

Cuanto estas logrando ahorrar actualmente? Quizas pueda ayudarte a optimizar.`
}

function getRiskResponse(perfil) {
  return `El riesgo es algo que todos debemos entender antes de invertir. Dejame explicartelo de forma clara:

**Que es el riesgo en inversiones?**
Es la posibilidad de que tu inversion baje de valor o no rinda lo esperado. Pero ojo: NO invertir tambien es un riesgo (la inflacion se come tu dinero).

**Los tipos de riesgo principales:**

- **Riesgo de mercado** - El mercado en general baja (como en 2008 o 2020)
- **Riesgo especifico** - Una empresa o sector en particular tiene problemas
- **Riesgo de inflacion** - Tu rendimiento no supera la inflacion
- **Riesgo cambiario** - El dolar sube o baja vs el peso

**Como manejar el riesgo:**

1. **Diversifica** - No pongas todo en una sola inversion
2. **Invierte a largo plazo** - El tiempo suaviza las caidas
3. **Ten un fondo de emergencia** - Para no vender en mal momento
4. **Conoce tu tolerancia** - Invierte segun tu perfil, no segun la moda

${perfil !== 'general' ? `Tu perfil ${perfil} indica que tu tolerancia al riesgo es ${perfil === 'Conservador' ? 'baja - y esta bien! Mejor dormir tranquilo' : perfil === 'Agresivo' ? 'alta - puedes aprovechar oportunidades que otros no pueden' : 'moderada - el balance es tu fortaleza'}.` : ''}

Algo que te genere curiosidad o preocupacion sobre el riesgo?`
}

function getInflationResponse() {
  return `La inflacion es el "enemigo silencioso" de tu dinero. Dejame explicarte por que importa tanto:

**Que es la inflacion?**
Es cuando los precios suben con el tiempo. Lo que hoy compras con $1 millon, en 10 anos te costara mas.

**En Colombia:**
- Historicamente: 4-7% anual
- 2023-2024: Estuvo alta (10-13%)
- 2025: Bajando hacia 5-6%

**Por que importa para tus inversiones:**

Si tu dinero esta en una cuenta de ahorros al 1% y la inflacion es 6%, estas PERDIENDO 5% de poder adquisitivo cada ano.

| Escenario | Rendimiento | Inflacion | Ganancia REAL |
|-----------|-------------|-----------|---------------|
| Cuenta ahorros | 1% | 6% | -5% |
| CDT | 12% | 6% | +6% |
| ETF | 15% | 6% | +9% |

**Como protegerte:**
1. Invierte en algo que rinda MAS que la inflacion
2. CDTs actuales (11-13%) estan ganandole a la inflacion
3. Acciones y ETFs historicamente superan la inflacion a largo plazo
4. Los TES UVR se ajustan automaticamente por inflacion

En el simulador del Dashboard puedes ver el "valor real" de tu inversion, que es tu dinero ajustado por inflacion. Muy util para tomar decisiones!

Quieres que calculemos algo especifico?`
}

function getDiversificationResponse(perfil) {
  return `${randomPick(PERSONALITY.greetings)} La diversificacion es probablemente el consejo mas importante en inversiones. Es la unica "comida gratis" que existe!

**Por que diversificar?**
Ninguna inversion es perfecta. Cuando una baja, otra puede subir. Al combinarlas, reduces el riesgo sin sacrificar tanto rendimiento.

**Niveles de diversificacion:**

1. **Por tipo de activo**
   - Renta fija (CDTs, bonos)
   - Renta variable (acciones, ETFs)
   - Inmuebles (si tienes capital)

2. **Por geografia**
   - Colombia
   - Estados Unidos
   - Mercados globales

3. **Por sector**
   - Tecnologia
   - Finanzas
   - Salud
   - Consumo

**Ejemplo de portafolio diversificado ${perfil !== 'general' ? `para ${perfil}` : ''}:**

${perfil === 'Conservador' ? 
  '- 60% CDTs (diferentes bancos y plazos)\n- 25% Bonos TES\n- 15% Fondo mixto o ETF conservador' :
  perfil === 'Agresivo' ?
  '- 20% CDT (liquidez)\n- 40% ETF global (VOO/VTI)\n- 25% ETF crecimiento (QQQ)\n- 15% Acciones individuales' :
  '- 40% CDTs y bonos\n- 35% ETF global (ACWI/VOO)\n- 25% Fondo mixto local'}

**Regla simple:** No mas del 10-15% en una sola inversion, ni mas del 30% en un sector.

Te ayudo a armar un portafolio diversificado para ti?`
}

function getDefaultResponse(perfil) {
  return `Gracias por tu mensaje! Como tu asesor financiero personal, puedo ayudarte con muchos temas:

**Inversiones:**
- CDTs, fondos, ETFs, acciones
- Recomendaciones segun tu perfil
- Como empezar a invertir

**Ahorro:**
- Estrategias para ahorrar mas
- Fondo de emergencia
- Metas financieras

**Conceptos:**
- Interes compuesto
- Riesgo y diversificacion
- Inflacion

${perfil !== 'general' ? `Recuerda que ya conozco tu perfil (${perfil}), asi que mis consejos estan personalizados para ti.` : 'Te recomiendo hacer el test de perfil en "Mi Perfil" para que pueda darte consejos mas personalizados.'}

**Algunas preguntas que me hacen seguido:**
- "En que puedo invertir con 5 millones?"
- "Como funciona el interes compuesto?"
- "Que es mejor, CDT o fondos?"
- "Como empiezo a invertir siendo principiante?"

Que te gustaria explorar?`
}
