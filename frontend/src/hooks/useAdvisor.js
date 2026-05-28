import { useState, useCallback, useEffect, useRef } from 'react'
import { chatWithAdvisor } from '../services/api'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hola! Soy tu asesor financiero personal en InvestIQ. Estoy aqui para ayudarte a tomar mejores decisiones con tu dinero. Puedo ayudarte con:\n\n- Explicarte instrumentos de inversion (CDTs, ETFs, acciones)\n- Recomendaciones segun tu perfil de riesgo\n- Calculos y proyecciones financieras\n- Estrategias de ahorro\n\nCuentame, en que puedo ayudarte hoy?',
  timestamp: new Date()
}

// Conversation memory for context
const ConversationMemory = {
  topics: [],
  userProfile: null,
  preferences: {},
  lastIntent: null,
  
  addTopic(topic) {
    if (!this.topics.includes(topic)) {
      this.topics.push(topic)
    }
  },
  
  setProfile(profile) {
    this.userProfile = profile
  },
  
  getContext() {
    return {
      topics: this.topics,
      profile: this.userProfile,
      preferences: this.preferences
    }
  },
  
  reset() {
    this.topics = []
    this.preferences = {}
    this.lastIntent = null
  }
}

export function useAdvisor() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)
  const conversationRef = useRef(ConversationMemory)

  // Load profile and chat history
  useEffect(() => {
    try {
      const profile = localStorage.getItem('investiq_profile')
      if (profile) {
        conversationRef.current.setProfile(JSON.parse(profile))
      }
      
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
      console.error('Error loading data:', e)
    }
  }, [])

  // Save chat history
  useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem('investiq_chat_history', JSON.stringify(messages))
      } catch (e) {
        console.error('Error saving chat:', e)
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

    // Typing delay (variable for natural feel)
    const baseDelay = 600
    const contentLength = content.length
    const typingDelay = Math.min(baseDelay + contentLength * 10, 2000)

    try {
      // Try backend API first
      const userProfile = conversationRef.current.userProfile
      const response = await chatWithAdvisor(content, userProfile)
      
      await new Promise(resolve => setTimeout(resolve, typingDelay))
      
      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      // Fallback to intelligent local response
      await new Promise(resolve => setTimeout(resolve, typingDelay))
      
      const context = conversationRef.current.getContext()
      const response = generateContextualResponse(content, context, messages)
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE])
    conversationRef.current.reset()
    localStorage.removeItem('investiq_chat_history')
  }, [])

  return { messages, isTyping, sendMessage, clearChat }
}

// Intent detection - CRITICAL for correct responses
function detectIntent(question) {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Exact intent mapping with priority
  const intents = [
    { pattern: /qu[eé]\s+(es|son|significa)\s+(un|los|el|la)?\s*etf/i, intent: 'explain_etf' },
    { pattern: /etf.*internacional|internacional.*etf/i, intent: 'explain_etf_international' },
    { pattern: /qu[eé]\s+(es|son|significa)\s+(un|los|el|la)?\s*cdt/i, intent: 'explain_cdt' },
    { pattern: /qu[eé]\s+(es|son|significa)\s+(un|los|el|la)?\s*acci[oó]n/i, intent: 'explain_stocks' },
    { pattern: /qu[eé]\s+(es|son|significa).*inter[eé]s\s*compuesto/i, intent: 'explain_compound' },
    { pattern: /qu[eé]\s+(es|son|significa).*inflaci[oó]n/i, intent: 'explain_inflation' },
    { pattern: /qu[eé]\s+(es|son|significa).*diversific/i, intent: 'explain_diversification' },
    { pattern: /qu[eé]\s+(es|son|significa).*riesgo/i, intent: 'explain_risk' },
    { pattern: /qu[eé]\s+(es|son|significa).*perfil/i, intent: 'explain_profile' },
    { pattern: /qu[eé]\s+(es|son|significa).*tes|bonos?\s*tes/i, intent: 'explain_tes' },
    { pattern: /qu[eé]\s+(es|son|significa).*fondo/i, intent: 'explain_funds' },
    
    { pattern: /c[oó]mo\s+(funciona|trabaja|opera)/i, intent: 'how_works' },
    { pattern: /c[oó]mo\s+(empez|inici|comienz)/i, intent: 'how_start' },
    { pattern: /c[oó]mo\s+(invert|ahorr)/i, intent: 'how_invest' },
    { pattern: /c[oó]mo\s+abr(ir|o)\s*(una)?\s*cuenta/i, intent: 'how_open_account' },
    
    { pattern: /d[oó]nde\s+(invert|poner|meter)/i, intent: 'where_invest' },
    { pattern: /cu[aá]l(es)?\s+(es|son).*mejor/i, intent: 'best_options' },
    { pattern: /recomien(da|das|de)|sugie(re|res)/i, intent: 'recommendation' },
    
    { pattern: /cu[aá]nto\s+(dinero|plata|necesito|debo)/i, intent: 'how_much' },
    { pattern: /cu[aá]nto\s+(gano|rend|retorno)/i, intent: 'returns' },
    
    { pattern: /mi\s*perfil|soy\s*(conservador|moderado|agresivo)/i, intent: 'about_profile' },
    { pattern: /gracias|genial|excelente|perfecto/i, intent: 'thanks' },
    { pattern: /hola|buenos?\s*(d[ií]as|tardes|noches)|hey|saludos/i, intent: 'greeting' },
    { pattern: /adi[oó]s|hasta\s*luego|chao|bye/i, intent: 'goodbye' },
    
    // Topic-specific without "que es"
    { pattern: /\betf\b/i, intent: 'about_etf' },
    { pattern: /\bcdt\b/i, intent: 'about_cdt' },
    { pattern: /\bacci[oó]n|\bacciones\b|\bbolsa\b/i, intent: 'about_stocks' },
    { pattern: /\binteres\s*compuesto\b/i, intent: 'about_compound' },
    { pattern: /\bahorro|ahorrar\b/i, intent: 'about_savings' },
    { pattern: /\briesgo\b/i, intent: 'about_risk' },
  ]
  
  for (const { pattern, intent } of intents) {
    if (pattern.test(q)) {
      return intent
    }
  }
  
  return 'general'
}

// Generate contextual response based on intent
function generateContextualResponse(question, context, previousMessages) {
  const intent = detectIntent(question)
  const profile = context.profile?.perfil || null
  const q = question.toLowerCase()
  
  // Update conversation memory
  ConversationMemory.lastIntent = intent
  
  const responses = {
    // EXPLANATIONS - Direct answers to "que es" questions
    explain_etf: () => `Los ETFs (Exchange-Traded Funds) son fondos de inversion que se negocian en bolsa como si fueran acciones. Funcionan como una "canasta" que agrupa multiples activos.

**Caracteristicas principales:**
- Se compran y venden en tiempo real durante el horario de bolsa
- Tienen costos muy bajos (entre 0.03% y 0.5% anual)
- Ofrecen diversificacion instantanea
- Son transparentes - puedes ver exactamente que contienen

**ETFs populares para colombianos:**
- **VOO/SPY** - Las 500 empresas mas grandes de EE.UU.
- **VTI** - Todo el mercado estadounidense
- **QQQ** - Las 100 mayores tecnologicas

${profile ? `Para tu perfil ${profile}, ${profile === 'Conservador' ? 'recomiendo una exposicion moderada (10-20%) en ETFs globales como complemento a tu portafolio de renta fija.' : profile === 'Moderado' ? 'una buena combinacion seria 40-50% en ETFs diversificados como VOO o ACWI.' : 'puedes tener mayor exposicion (60-70%) incluyendo ETFs de crecimiento como QQQ.'}` : ''}

Quieres que te explique como comprar ETFs desde Colombia?`,

    explain_etf_international: () => `Los ETFs internacionales son fondos que te permiten invertir en empresas de todo el mundo desde Colombia, sin necesidad de comprar acciones individuales en cada pais.

**Como funcionan:**
Imagina que quieres invertir en Apple, Amazon, Microsoft y otras 497 empresas de Estados Unidos. En lugar de comprar cada accion (imposible!), compras UN solo ETF que las incluye todas. Es diversificacion instantanea.

**Los mas recomendados:**
- **VOO** - Las 500 empresas mas grandes de EE.UU. (S&P 500)
- **ACWI** - 2,900 empresas de 50 paises (mercado global)
- **VEA** - Mercados desarrollados fuera de EE.UU.
- **VWO** - Mercados emergentes

**Ventajas:**
- Diversificacion geografica (reduces riesgo pais)
- Acceso a empresas que no cotizan en Colombia
- Liquidez alta - puedes vender cuando quieras
- Costos bajos vs fondos tradicionales

**Como invertir desde Colombia:**
1. Abrir cuenta en Interactive Brokers (el mas usado)
2. Apps como Tyba o Global66 ofrecen algunos ETFs
3. A traves de fondos colombianos que invierten en ETFs

Te gustaria que te explique el proceso de abrir cuenta o te recomiende ETFs segun tu perfil?`,

    explain_cdt: () => `Un CDT (Certificado de Deposito a Termino) es uno de los instrumentos mas seguros para invertir en Colombia. Basicamente, le "prestas" tu dinero al banco por un tiempo fijo y a cambio te pagan intereses.

**Como funciona:**
1. Depositas una cantidad minima (desde $500,000 en la mayoria)
2. Eliges el plazo (30, 60, 90, 180, 360 dias)
3. El banco te paga una tasa fija durante ese tiempo
4. Al vencer, recibes tu capital + intereses

**Tasas actuales en Colombia (2024):**
- Bancolombia: 11-12% EA
- Davivienda: 11.5% EA
- Pibank/Lulo Bank: hasta 13% EA
- Nu Bank: hasta 13% EA

**Ventajas:**
- Garantia Fogafin hasta $50 millones
- Rendimiento conocido desde el inicio
- Cero riesgo de perder el capital
- Ideal para metas de corto/mediano plazo

**Consideraciones:**
- Tu dinero queda "bloqueado" durante el plazo
- Si retiras antes, pierdes parte de los intereses
- La inflacion puede reducir tu ganancia real

${profile === 'Conservador' ? 'Para tu perfil Conservador, los CDTs son perfectos como base de tu portafolio (50-70%).' : ''}

Quieres que te ayude a calcular cuanto ganarias con un CDT especifico?`,

    explain_compound: () => `El interes compuesto es cuando tus ganancias generan mas ganancias. Es el concepto mas poderoso en finanzas personales.

**La diferencia con interes simple:**
- **Simple:** Ganas intereses solo sobre tu capital inicial
- **Compuesto:** Ganas intereses sobre el capital + los intereses anteriores

**Ejemplo practico con $10 millones al 12% anual:**

| Ano | Interes Simple | Interes Compuesto |
|-----|----------------|-------------------|
| 1   | $11.2M         | $11.2M            |
| 5   | $16M           | $17.6M            |
| 10  | $22M           | $31M              |
| 20  | $34M           | $96.5M            |

En 20 anos, la diferencia es de $62.5 millones!

**Las 3 claves del interes compuesto:**
1. **Tiempo** - Entre mas temprano empieces, mejor
2. **Consistencia** - Aportar regularmente multiplica el efecto
3. **Reinversion** - No retirar las ganancias

Puedes usar el Simulador en el Dashboard para ver proyecciones exactas con tus numeros. Quieres que te explique alguna estrategia especifica?`,

    explain_stocks: () => `Las acciones representan una pequena parte de la propiedad de una empresa. Cuando compras una accion, te conviertes en "dueno" de una fraccion de esa compania.

**Como funcionan:**
- El precio sube/baja segun oferta, demanda y resultados de la empresa
- Algunas pagan dividendos (parte de las ganancias)
- Puedes ganar por apreciacion (vender mas caro) o dividendos

**Opciones desde Colombia:**

**Acciones Colombianas (BVC):**
- Ecopetrol, Bancolombia, ISA, Grupo Sura, Nutresa
- Ventaja: Sin riesgo cambiario, facil acceso
- Desventaja: Mercado pequeno y menos liquido

**Acciones Internacionales:**
- Apple, Amazon, Tesla, Google, Microsoft
- Acceso via brokers como Interactive Brokers
- Mayor liquidez y opciones

**Mi recomendacion honesta:**
Para la mayoria de personas, es mejor invertir en ETFs que en acciones individuales porque:
- Menor riesgo (estas diversificado)
- Menos tiempo investigando
- Historicamente, pocos le ganan al mercado

${profile === 'Agresivo' ? 'Con tu perfil Agresivo, puedes destinar hasta 30% a acciones individuales, pero diversifica en al menos 10-15 empresas diferentes.' : 'Te sugiero que las acciones individuales sean maximo 10-20% de tu portafolio.'}

Te interesa que profundice en alguna opcion?`,

    explain_inflation: () => `La inflacion es el aumento generalizado de precios en la economia. En terminos simples: tu dinero compra menos cosas con el tiempo.

**Impacto real:**
Si la inflacion es del 6% anual, $1 millon hoy equivale a $940,000 en poder de compra el proximo ano.

**Inflacion en Colombia:**
- 2022: 13.12% (muy alta)
- 2023: 9.28%
- 2024: ~6-7% (bajando)
- Meta del Banco de la Republica: 3%

**Por que importa para tus inversiones:**
Tu rendimiento REAL = Rendimiento nominal - Inflacion

Ejemplo:
- CDT al 12% con inflacion del 6% = 6% de ganancia real
- Cuenta de ahorros al 1% con inflacion del 6% = -5% real (pierdes!)

**Como protegerte:**
1. Invertir en activos que superen la inflacion
2. Considerar TES indexados a inflacion (UVR)
3. Diversificar en dolares (ETFs internacionales)
4. Invertir en activos reales (inmuebles, acciones)

Quieres que te ayude a calcular el impacto de la inflacion en tus inversiones?`,

    explain_risk: () => `El riesgo en inversiones es la posibilidad de que no obtengas el rendimiento esperado, o incluso que pierdas parte de tu dinero.

**Tipos de riesgo:**

- **Riesgo de mercado:** Todo el mercado baja (crisis, recesiones)
- **Riesgo especifico:** Una empresa o sector tiene problemas
- **Riesgo de liquidez:** No poder vender cuando necesitas
- **Riesgo cambiario:** Variaciones del dolar vs peso
- **Riesgo de inflacion:** Tus ganancias no superan la inflacion

**La relacion riesgo-retorno:**
Mayor riesgo = Mayor potencial de ganancia (y de perdida)

| Instrumento | Riesgo | Retorno esperado |
|-------------|--------|------------------|
| CDT         | Muy bajo | 10-13% |
| Bonos TES   | Bajo   | 11-14% |
| ETF Global  | Medio  | 8-12% |
| Acciones    | Alto   | 10-20%+ |

**Como manejar el riesgo:**
1. Diversifica - No pongas todo en una sola opcion
2. Invierte a largo plazo - El tiempo suaviza la volatilidad
3. Ten fondo de emergencia - Para no vender en mal momento
4. Conoce tu tolerancia - Invierte segun tu perfil

${profile ? `Tu perfil ${profile} indica una tolerancia al riesgo ${profile === 'Conservador' ? 'baja, lo cual esta bien - la tranquilidad tiene valor' : profile === 'Agresivo' ? 'alta, lo que te permite aprovechar oportunidades' : 'moderada, buscando balance entre seguridad y crecimiento'}.` : ''}

Hay algo especifico sobre riesgo que te preocupe?`,

    explain_tes: () => `Los TES (Titulos de Tesoreria) son bonos emitidos por el Gobierno de Colombia. Son considerados la inversion mas segura del pais porque el Estado respalda el pago.

**Como funcionan:**
- El gobierno necesita dinero, tu se lo prestas
- A cambio, te paga intereses periodicos
- Al vencer, recuperas tu capital completo

**Tipos de TES:**
- **Tasa fija:** Sabes exactamente cuanto recibiras
- **TES UVR:** Indexados a inflacion, protegen tu poder adquisitivo
- **TES corto plazo:** Menor riesgo de tasa de interes

**Rendimientos actuales:** 11-14% EA dependiendo del plazo

**Ventajas:**
- Maxima seguridad (respaldo del Estado)
- Liquidez - Puedes venderlos antes del vencimiento
- Exentos de algunos impuestos

**Como invertir:**
1. Directamente en subastas del Banco de la Republica (montos altos)
2. A traves de fondos de inversion de renta fija
3. Algunos bancos ofrecen acceso a TES

${profile === 'Conservador' ? 'Para tu perfil Conservador, los TES son excelentes para diversificar junto con CDTs.' : ''}

Te gustaria saber mas sobre como acceder a TES?`,

    explain_funds: () => `Los fondos de inversion son vehiculos que reunen el dinero de muchos inversionistas para invertirlo de forma diversificada, administrado por profesionales.

**Tipos principales en Colombia:**

**Fondos de Renta Fija:**
- Invierten en CDTs, bonos, TES
- Bajo riesgo, rendimientos estables
- Ideal para perfiles conservadores

**Fondos Mixtos/Balanceados:**
- Combinan renta fija + variable
- Riesgo moderado
- Para perfiles moderados

**Fondos de Renta Variable:**
- Invierten en acciones
- Mayor riesgo y potencial de retorno
- Para perfiles agresivos

**Fondos Internacionales:**
- Acceso a mercados globales
- Diversificacion geografica

**Donde encontrarlos:**
- Apps: Tyba, Mesfix, Tribeca
- Bancos: Bancolombia, Davivienda
- Comisionistas: Skandia, Old Mutual

**Ventajas:**
- Diversificacion con poco capital
- Administracion profesional
- Facil acceso

**Consideraciones:**
- Cobran comision de administracion (0.5-2% anual)
- No todos rinden igual - investiga el historico

${profile ? `Para tu perfil ${profile}, te recomendaria fondos ${profile === 'Conservador' ? 'de renta fija con bajo costo' : profile === 'Moderado' ? 'mixtos o balanceados' : 'de renta variable o con exposicion internacional'}.` : ''}

Quieres que te recomiende fondos especificos?`,

    // HOW TO questions
    how_start: () => `Excelente decision querer empezar a invertir! Te doy una guia paso a paso:

**Paso 1: Construye tu base financiera**
Antes de invertir, asegurate de:
- Tener un fondo de emergencia (3-6 meses de gastos)
- No tener deudas de alto interes (tarjetas de credito)
- Conocer tus ingresos y gastos mensuales

**Paso 2: Define tu perfil de riesgo**
Haz el test en "Mi Perfil" para saber que tipo de inversiones van contigo. ${profile ? `Ya lo hiciste y eres ${profile}!` : 'Solo toma 2 minutos.'}

**Paso 3: Empieza simple**
Para principiantes recomiendo:
1. **CDT** - Para entender como funciona invertir, sin riesgo
2. **Fondo de inversion** - En apps como Tyba (desde $100,000)
3. **Luego ETFs** - Para mayor crecimiento a largo plazo

**Paso 4: Se constante**
Lo mas importante no es el monto, sino la constancia. Invierte un porcentaje fijo cada mes.

**Montos minimos:**
- CDT: Desde $500,000
- Fondos: Desde $100,000 en algunas apps
- ETFs: Desde $50 USD aprox.

Con cual paso te gustaria empezar?`,

    how_invest: () => `Hay varias formas de invertir tu dinero en Colombia. Te explico las principales opciones:

**Opciones de bajo riesgo:**
- CDTs en bancos tradicionales o digitales
- Fondos de renta fija
- Bonos TES

**Opciones de riesgo moderado:**
- ETFs globales (via brokers internacionales)
- Fondos mixtos/balanceados
- FICs inmobiliarios

**Opciones de mayor riesgo:**
- Acciones colombianas (BVC)
- Acciones internacionales
- Criptomonedas (muy volatil)

${profile ? `\n**Recomendacion para tu perfil ${profile}:**\n${
  profile === 'Conservador' ? '- 60-70% CDTs y bonos\n- 20-30% Fondos renta fija\n- 10% ETFs globales conservadores' :
  profile === 'Moderado' ? '- 40% CDTs y bonos\n- 35% ETFs globales (VOO, ACWI)\n- 25% Fondos mixtos' :
  '- 20% CDTs (liquidez)\n- 50% ETFs de crecimiento\n- 30% Acciones diversificadas'
}` : 'Te recomiendo hacer el test de perfil para darte una recomendacion personalizada.'}

Quieres que profundice en alguna de estas opciones?`,

    how_open_account: () => `Te explico como abrir cuentas para invertir:

**Para CDTs y Fondos Locales:**
1. Si ya tienes cuenta bancaria, puedes abrir CDTs desde la app del banco
2. Apps fintech: Tyba, Nu, Lulo Bank (proceso 100% digital)

**Para ETFs Internacionales (Interactive Brokers):**
1. Ve a interactivebrokers.com
2. Crea cuenta (necesitas pasaporte o cedula)
3. Verifica identidad (foto de documento)
4. Deposita fondos via transferencia internacional
5. Proceso toma 3-5 dias habiles

**Para Acciones Colombianas (BVC):**
1. Abre cuenta en una comisionista (Skandia, Acciones y Valores, etc.)
2. O usa apps como Trii

**Documentos que necesitas:**
- Cedula o pasaporte
- Extracto bancario
- Declaracion de renta (para montos grandes)

**Costos aproximados:**
- CDTs/Fondos locales: Gratis
- Interactive Brokers: Sin costo de apertura
- Comisionistas BVC: Varia segun la firma

Por cual opcion te gustaria empezar?`,

    // RECOMMENDATIONS
    recommendation: () => {
      if (profile === 'Conservador') {
        return `Para tu perfil Conservador, mi recomendacion es:

**Portafolio sugerido:**
- **CDTs (50-60%)** - Bancolombia, Davivienda, o digitales como Pibank
- **Bonos TES (20-25%)** - A traves de fondos de renta fija
- **Fondo conservador (15-20%)** - Como reserva liquida
- **ETF global (5-10%)** - Una pequena exposicion para largo plazo

**Rendimiento esperado:** 10-12% anual
**Riesgo:** Muy bajo

**Pasos concretos:**
1. Abre un CDT a 6 meses con el 50% de tu capital
2. Invierte 30% en un fondo de renta fija (Tyba tiene buenos)
3. El resto dejalo liquido mientras investigas ETFs

Esta estrategia te dara tranquilidad y rendimientos por encima de la inflacion. Quieres que profundice en alguna parte?`
      } else if (profile === 'Moderado') {
        return `Para tu perfil Moderado, mi recomendacion es:

**Portafolio sugerido:**
- **CDTs/Bonos (35-40%)** - Tu base segura
- **ETF global VOO o ACWI (30-35%)** - Crecimiento internacional
- **Fondo mixto (20-25%)** - Balance administrado
- **Reserva liquida (5-10%)** - Para oportunidades

**Rendimiento esperado:** 12-14% anual
**Riesgo:** Moderado (pueden haber fluctuaciones temporales)

**Pasos concretos:**
1. Abre cuenta en Interactive Brokers para ETFs
2. Pon 40% en CDTs mientras aprendes
3. Invierte mensualmente en VOO o VTI
4. Complementa con un fondo mixto local

El balance es clave - tendras crecimiento sin volatilidad extrema. Quieres que te ayude con algo especifico?`
      } else if (profile === 'Agresivo') {
        return `Para tu perfil Agresivo, mi recomendacion es:

**Portafolio sugerido:**
- **ETF tecnologico QQQ (35-40%)** - Alto crecimiento
- **ETF global VOO/VTI (25-30%)** - Diversificacion base
- **CDT como reserva (15%)** - Liquidez para oportunidades
- **Acciones individuales (15-20%)** - Si quieres investigar empresas

**Rendimiento esperado:** 14-18%+ anual
**Riesgo:** Alto (prepara para volatilidad del 20-30%)

**Pasos concretos:**
1. Abre Interactive Brokers si no lo tienes
2. Empieza con 60% en QQQ + VOO
3. Manten 15% en CDT local para emergencias
4. Acciones solo de empresas que entiendas bien

Importante: Este portafolio puede bajar 20-30% en un mal ano. Si eso te quitaria el sueno, considera ajustar. Quieres discutir alguna parte?`
      }
      
      return `Para darte una recomendacion personalizada, necesito conocer tu perfil de riesgo.

**Puedes:**
1. Hacer el test en "Mi Perfil" (2 minutos)
2. Decirme si te consideras conservador, moderado o agresivo

En general, una buena estrategia para empezar es:
- 50% en instrumentos seguros (CDTs, bonos)
- 30% en ETFs globales diversificados
- 20% liquido mientras aprendes

Cual opcion prefieres?`
    },

    where_invest: () => {
      const rec = responses.recommendation()
      return rec
    },

    best_options: () => {
      const rec = responses.recommendation()
      return rec
    },

    // AMOUNTS
    how_much: () => `La cantidad ideal para invertir depende de tu situacion, pero te doy guias practicas:

**Regla del 20%**
Idealmente, ahorra e invierte el 20% de tus ingresos. Pero si estas empezando, incluso el 5-10% hace diferencia.

**Montos minimos en Colombia:**
- CDTs: Desde $500,000
- Fondos (Tyba): Desde $100,000
- ETFs internacionales: Desde $50 USD
- Acciones BVC: Depende del precio

**La constancia importa mas que el monto:**
$500,000/mes durante 10 anos al 12% = $115+ millones
$200,000/mes durante 20 anos al 12% = $200+ millones

**Mi recomendacion:**
1. Primero, ten 3-6 meses de gastos en emergencias
2. Luego, invierte lo que puedas de forma CONSTANTE
3. Aumenta gradualmente con tus ingresos

Puedes usar el Simulador para calcular proyecciones con tus numeros exactos. Cuanto podrias invertir mensualmente?`,

    returns: () => `Los rendimientos varian segun el instrumento y el riesgo:

**Rendimientos tipicos en Colombia:**

| Instrumento | Rendimiento anual | Riesgo |
|-------------|-------------------|--------|
| Cuenta ahorros | 0-1% | Nulo |
| CDT | 10-13% | Muy bajo |
| Bonos TES | 11-14% | Bajo |
| Fondos renta fija | 9-12% | Bajo |
| ETF global (historico) | 8-12% | Medio |
| Acciones (historico) | 10-20%+ | Alto |

**Importante:**
- Rendimientos pasados NO garantizan rendimientos futuros
- La inflacion reduce tu ganancia real
- Mayor riesgo = Mayor potencial pero NO garantizado

**Calculo real:**
Si inviertes $10M al 12% con inflacion del 6%:
- Ganancia nominal: 12% = $1.2M
- Ganancia real: 6% = $600K en poder de compra

Quieres que te ayude a calcular una proyeccion especifica?`,

    // PROFILE
    about_profile: () => {
      if (profile) {
        return `Tu perfil actual es **${profile}**. Esto significa que:

${profile === 'Conservador' ? `**Caracteristicas:**
- Priorizas la seguridad sobre el crecimiento
- Prefieres dormir tranquilo sabiendo que tu dinero esta seguro
- No te gusta ver tu portafolio en rojo

**Instrumentos ideales:**
- CDTs (50-60%)
- Bonos TES (20-30%)
- Fondos de renta fija (15-20%)

**Rendimiento esperado:** 10-12% anual con muy bajo riesgo` :
profile === 'Moderado' ? `**Caracteristicas:**
- Buscas balance entre seguridad y crecimiento
- Aceptas algunas fluctuaciones por mejores rendimientos
- Tienes horizonte de mediano-largo plazo

**Instrumentos ideales:**
- CDTs y bonos (40%)
- ETFs globales (35%)
- Fondos mixtos (25%)

**Rendimiento esperado:** 12-14% anual` :
`**Caracteristicas:**
- Buscas maximizar ganancias a largo plazo
- Toleras ver tu portafolio bajar temporalmente
- Tienes horizonte de largo plazo (5+ anos)

**Instrumentos ideales:**
- ETFs de crecimiento (45%)
- ETFs globales (30%)
- Acciones diversificadas (25%)

**Rendimiento esperado:** 14-18%+ anual con volatilidad`}

Quieres que te de recomendaciones mas especificas?`
      }
      
      return `Aun no conozco tu perfil de riesgo. Te invito a hacer el test en "Mi Perfil" para poder darte recomendaciones personalizadas.

Los tres perfiles principales son:

**Conservador:** Prioriza seguridad, rendimiento 10-12%
**Moderado:** Balance seguridad/crecimiento, rendimiento 12-14%
**Agresivo:** Maximiza crecimiento, rendimiento 14-18%+

El test solo toma 2 minutos y me ayuda a asesorarte mejor. Quieres que te explique mas sobre algun perfil?`
    },

    // GREETINGS & SOCIAL
    greeting: () => {
      const hour = new Date().getHours()
      const saludo = hour < 12 ? 'Buenos dias' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
      
      return `${saludo}! ${profile ? `Que bueno verte de nuevo. Recuerdo que tienes un perfil ${profile}.` : 'Que gusto saludarte.'}

Soy tu asesor financiero en InvestIQ. Puedo ayudarte con:
- Explicarte instrumentos de inversion
- Recomendaciones personalizadas
- Calculos y proyecciones
- Resolver dudas sobre finanzas

En que te puedo ayudar hoy?`
    },

    thanks: () => `Me alegra haberte ayudado! Recuerda que estoy aqui para cualquier duda adicional.

Algunas cosas que podrias hacer ahora:
- Usar el Simulador para ver proyecciones con tus numeros
- Hacer el test de perfil si aun no lo has hecho
- Preguntarme sobre algun instrumento especifico

Mucho exito con tus inversiones!`,

    goodbye: () => `Hasta luego! Fue un gusto ayudarte. Cuando tengas mas preguntas sobre inversiones, aqui estare.

Tip final: La constancia es mas importante que el monto. Empieza con lo que puedas y se consistente.

Exitos!`,

    // TOPIC DISCUSSIONS (when user mentions topic without asking "que es")
    about_etf: () => responses.explain_etf(),
    about_cdt: () => responses.explain_cdt(),
    about_stocks: () => responses.explain_stocks(),
    about_compound: () => responses.explain_compound(),
    about_savings: () => `El ahorro es el primer paso hacia la independencia financiera.

**Estrategia 50/30/20:**
- 50% Necesidades (arriendo, servicios, comida)
- 30% Gustos (entretenimiento, salidas)
- 20% Ahorro e inversion

**Tips practicos:**
1. **Automatiza** - Transfiere a ahorro el dia de pago
2. **Fondo de emergencia primero** - 3-6 meses de gastos
3. **Regla de 24 horas** - Espera antes de compras grandes
4. **Aumenta con cada aumento** - Si te suben el sueldo, sube tu ahorro

**Donde guardar:**
- Emergencias: Cuenta de facil acceso
- Corto plazo: CDT a 90 dias
- Largo plazo: Inversiones segun tu perfil

Cuanto logras ahorrar actualmente? Quizas pueda ayudarte a optimizar.`,

    about_risk: () => responses.explain_risk(),

    // DEFAULT - General financial assistance
    general: () => {
      // Check if question contains any financial keywords
      const q = question.toLowerCase()
      
      if (q.includes('etf') || q.includes('fondo')) {
        return responses.about_etf()
      }
      if (q.includes('cdt') || q.includes('certificado')) {
        return responses.about_cdt()
      }
      if (q.includes('accion') || q.includes('bolsa')) {
        return responses.about_stocks()
      }
      
      return `Entiendo tu pregunta. Dejame ayudarte con informacion relevante.

Como tu asesor financiero, puedo orientarte sobre:
- **Instrumentos de inversion:** CDTs, ETFs, acciones, fondos, bonos
- **Estrategias:** Segun tu perfil de riesgo y objetivos
- **Calculos:** Proyecciones, interes compuesto, metas financieras
- **Conceptos:** Riesgo, diversificacion, inflacion

${profile ? `Teniendo en cuenta que tu perfil es ${profile}, puedo darte recomendaciones personalizadas.` : 'Te sugiero hacer el test de perfil para recomendaciones mas personalizadas.'}

Podrias reformular tu pregunta o decirme especificamente que tema te interesa?`
    },

    // Handle "how works" intent by looking at context
    how_works: () => {
      const q = question.toLowerCase()
      if (q.includes('etf')) return responses.explain_etf()
      if (q.includes('cdt')) return responses.explain_cdt()
      if (q.includes('interes compuesto') || q.includes('compuesto')) return responses.explain_compound()
      if (q.includes('accion') || q.includes('bolsa')) return responses.explain_stocks()
      if (q.includes('tes') || q.includes('bono')) return responses.explain_tes()
      if (q.includes('fondo')) return responses.explain_funds()
      
      return `Claro! Para explicarte como funciona, necesito saber de que tema especifico:

- CDTs (certificados de deposito)
- ETFs (fondos cotizados)
- Acciones (bolsa de valores)
- Interes compuesto
- Fondos de inversion
- Bonos TES

Cual te interesa?`
    }
  }
  
  // Get response for detected intent
  const responseFunc = responses[intent] || responses.general
  return responseFunc()
}

export default useAdvisor
