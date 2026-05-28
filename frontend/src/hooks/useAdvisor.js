import { useState, useCallback, useEffect, useRef } from 'react'
import { chatWithAdvisor } from '../services/api'

// ============================================================================
// SISTEMA DE MEMORIA CONVERSACIONAL
// ============================================================================
class ConversationMemory {
  constructor() {
    this.topics = []
    this.userProfile = null
    this.riskProfile = null
    this.investmentHorizon = null
    this.budget = null
    this.goals = []
    this.mentionedInstruments = []
    this.conversationContext = []
    this.lastIntent = null
  }

  addTopic(topic) {
    if (!this.topics.includes(topic)) {
      this.topics.push(topic)
    }
  }

  addMentionedInstrument(instrument) {
    if (!this.mentionedInstruments.includes(instrument)) {
      this.mentionedInstruments.push(instrument)
    }
  }

  setRiskProfile(profile) {
    this.riskProfile = profile
  }

  setInvestmentHorizon(horizon) {
    this.investmentHorizon = horizon
  }

  setBudget(amount) {
    this.budget = amount
  }

  addGoal(goal) {
    if (!this.goals.includes(goal)) {
      this.goals.push(goal)
    }
  }

  addToContext(message, role) {
    this.conversationContext.push({ message, role, timestamp: Date.now() })
    // Keep last 10 exchanges for context
    if (this.conversationContext.length > 20) {
      this.conversationContext = this.conversationContext.slice(-20)
    }
  }

  getFullContext() {
    return {
      riskProfile: this.riskProfile,
      investmentHorizon: this.investmentHorizon,
      budget: this.budget,
      goals: this.goals,
      topics: this.topics,
      mentionedInstruments: this.mentionedInstruments,
      recentContext: this.conversationContext.slice(-6)
    }
  }

  reset() {
    this.topics = []
    this.mentionedInstruments = []
    this.conversationContext = []
    this.lastIntent = null
  }
}

// ============================================================================
// SISTEMA DE DETECCION DE INTENCION
// ============================================================================
const IntentDetector = {
  patterns: {
    // Preguntas sobre instrumentos especificos
    etf: {
      keywords: ['etf', 'etfs', 'fondo cotizado', 'fondos cotizados', 'ishares', 'vanguard', 'spy', 'qqq'],
      intent: 'explain_etf'
    },
    cdt: {
      keywords: ['cdt', 'cdts', 'certificado', 'deposito a termino', 'termino fijo'],
      intent: 'explain_cdt'
    },
    acciones: {
      keywords: ['acciones', 'accion', 'bolsa', 'bvc', 'ecopetrol', 'bancolombia', 'nutresa', 'stocks'],
      intent: 'explain_stocks'
    },
    tes: {
      keywords: ['tes', 'bonos', 'deuda publica', 'titulos', 'gobierno'],
      intent: 'explain_tes'
    },
    fiducuenta: {
      keywords: ['fiducuenta', 'fiduciaria', 'fondo de inversion', 'fic'],
      intent: 'explain_fiducuenta'
    },
    crypto: {
      keywords: ['crypto', 'bitcoin', 'ethereum', 'criptomoneda', 'criptomonedas', 'btc', 'eth'],
      intent: 'explain_crypto'
    },
    // Conceptos financieros
    interes_compuesto: {
      keywords: ['interes compuesto', 'capitalizar', 'capitalizacion', 'reinvertir', 'compuesto'],
      intent: 'explain_compound_interest'
    },
    diversificacion: {
      keywords: ['diversificar', 'diversificacion', 'no poner todos los huevos', 'repartir'],
      intent: 'explain_diversification'
    },
    inflacion: {
      keywords: ['inflacion', 'devaluacion', 'poder adquisitivo', 'ipc'],
      intent: 'explain_inflation'
    },
    riesgo: {
      keywords: ['riesgo', 'volatilidad', 'perdida', 'seguro', 'arriesgar'],
      intent: 'explain_risk'
    },
    rentabilidad: {
      keywords: ['rentabilidad', 'rendimiento', 'retorno', 'ganancia', 'roi', 'interes'],
      intent: 'explain_returns'
    },
    // Acciones del usuario
    invertir: {
      keywords: ['invertir', 'inversion', 'donde invertir', 'como invertir', 'empezar a invertir', 'comenzar'],
      intent: 'how_to_invest'
    },
    ahorrar: {
      keywords: ['ahorrar', 'ahorro', 'guardar dinero', 'reserva'],
      intent: 'how_to_save'
    },
    recomendar: {
      keywords: ['recomienda', 'recomendacion', 'que me sugieres', 'que opinas', 'mejor opcion', 'cual es mejor'],
      intent: 'get_recommendation'
    },
    simular: {
      keywords: ['simular', 'simulacion', 'proyectar', 'calcular', 'cuanto tendria', 'cuanto ganaria'],
      intent: 'simulate'
    },
    comparar: {
      keywords: ['comparar', 'comparacion', 'diferencia entre', 'vs', 'versus', 'cual es mejor'],
      intent: 'compare'
    },
    // Perfil
    perfil: {
      keywords: ['mi perfil', 'que perfil', 'tipo de inversionista', 'conservador', 'moderado', 'agresivo'],
      intent: 'profile_query'
    },
    // Saludos y otros
    saludo: {
      keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal'],
      intent: 'greeting'
    },
    despedida: {
      keywords: ['adios', 'chao', 'hasta luego', 'gracias', 'bye'],
      intent: 'farewell'
    }
  },

  detectIntent(message) {
    const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    
    // Check each pattern
    for (const [category, config] of Object.entries(this.patterns)) {
      for (const keyword of config.keywords) {
        const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (lowerMessage.includes(normalizedKeyword)) {
          return {
            intent: config.intent,
            category,
            confidence: 0.9,
            extractedKeyword: keyword
          }
        }
      }
    }

    // Fallback: detect question type
    if (lowerMessage.includes('que es') || lowerMessage.includes('que son') || lowerMessage.includes('como funciona')) {
      return { intent: 'definition_question', category: 'question', confidence: 0.7 }
    }
    if (lowerMessage.includes('como puedo') || lowerMessage.includes('donde puedo')) {
      return { intent: 'how_to_question', category: 'question', confidence: 0.7 }
    }
    if (lowerMessage.includes('cuanto') || lowerMessage.includes('cuantos')) {
      return { intent: 'quantity_question', category: 'question', confidence: 0.7 }
    }
    if (lowerMessage.includes('?')) {
      return { intent: 'general_question', category: 'question', confidence: 0.5 }
    }

    return { intent: 'general', category: 'unknown', confidence: 0.3 }
  },

  extractEntities(message) {
    const entities = {
      amounts: [],
      timeframes: [],
      instruments: [],
      profiles: []
    }

    // Extract amounts (COP)
    const amountRegex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)\s*(millones?|millon|mill?|pesos|cop)?/gi
    let match
    while ((match = amountRegex.exec(message)) !== null) {
      let value = parseFloat(match[1].replace(/[.,]/g, ''))
      if (match[2] && match[2].toLowerCase().includes('millon')) {
        value *= 1000000
      }
      entities.amounts.push(value)
    }

    // Extract timeframes
    const timeRegex = /(\d+)\s*(anos?|meses?|semanas?|dias?)/gi
    while ((match = timeRegex.exec(message)) !== null) {
      entities.timeframes.push({ value: parseInt(match[1]), unit: match[2] })
    }

    // Detect risk profiles mentioned
    if (message.toLowerCase().includes('conservador')) entities.profiles.push('conservador')
    if (message.toLowerCase().includes('moderado')) entities.profiles.push('moderado')
    if (message.toLowerCase().includes('agresivo')) entities.profiles.push('agresivo')

    return entities
  }
}

// ============================================================================
// GENERADOR DE RESPUESTAS CONTEXTUALES
// ============================================================================
const ResponseGenerator = {
  responses: {
    // ETFs
    explain_etf: (context) => {
      const baseResponse = `Los ETFs (Exchange-Traded Funds) son fondos de inversion que cotizan en bolsa como si fueran acciones. Funcionan como una "canasta" que agrupa multiples activos.

**Caracteristicas principales:**
- **Diversificacion instantanea**: Un solo ETF puede contener cientos de acciones
- **Costos bajos**: Comisiones menores que fondos tradicionales (0.03% - 0.5% anual)
- **Liquidez**: Puedes comprar y vender en cualquier momento del dia
- **Transparencia**: Sabes exactamente que activos contiene

**ETFs populares para colombianos:**
- **SPY/VOO**: Replican el S&P 500 (500 empresas de EE.UU.)
- **QQQ**: Empresas tecnologicas del Nasdaq
- **VT**: Mercado global (todo el mundo)
- **EEM**: Mercados emergentes

**Como invertir desde Colombia:**
Puedes acceder a ETFs internacionales a traves de brokers como Trii, Hapi, o Interactive Brokers.`

      if (context.riskProfile === 'conservador') {
        return baseResponse + `\n\n*Nota para tu perfil conservador: Te recomendaria ETFs de bonos (BND, AGG) o mixtos que tengan menor volatilidad.*`
      } else if (context.riskProfile === 'agresivo') {
        return baseResponse + `\n\n*Para tu perfil agresivo: Podrias considerar ETFs sectoriales de tecnologia (QQQ, VGT) o mercados emergentes (EEM) para mayor potencial de crecimiento.*`
      }
      return baseResponse
    },

    explain_cdt: (context) => {
      return `Los CDTs (Certificados de Deposito a Termino) son inversiones de renta fija ofrecidas por bancos colombianos. Son una de las opciones mas seguras del mercado.

**Como funcionan:**
1. Depositas un monto minimo (generalmente desde $1 millon)
2. Eliges un plazo (30, 60, 90, 180, 360 dias o mas)
3. El banco te garantiza una tasa fija de interes
4. Al vencimiento recibes tu capital + intereses

**Tasas actuales en Colombia (2024):**
- **Corto plazo (90 dias)**: 10% - 11% EA
- **Mediano plazo (180 dias)**: 11% - 12% EA
- **Largo plazo (360+ dias)**: 11.5% - 13% EA

**Ventajas:**
- Garantia de Fogafin hasta $50 millones por banco
- Rentabilidad conocida desde el inicio
- Cero riesgo de mercado
- Ideal para metas de corto plazo

**Desventajas:**
- Liquidez limitada (penalizacion por retiro anticipado)
- Rentabilidad puede no superar la inflacion
- No aprovechas subidas del mercado

*Consejo: Compara tasas entre bancos digitales (Nequi, Nu) y tradicionales. Los digitales suelen ofrecer mejores tasas.*`
    },

    explain_stocks: (context) => {
      return `Las acciones representan una participacion en la propiedad de una empresa. Cuando compras acciones, te conviertes en socio proporcional de esa compania.

**Como funcionan:**
- El precio varia segun oferta/demanda y resultados de la empresa
- Puedes ganar por: valorizacion del precio y dividendos
- Mayor riesgo = mayor potencial de rentabilidad

**Bolsa de Colombia (BVC):**
Las acciones mas liquidas en Colombia incluyen:
- **Ecopetrol**: Petrolera estatal, alta volatilidad
- **Bancolombia**: Sector financiero, dividendos estables
- **Grupo Sura**: Holding diversificado
- **ISA**: Infraestructura energetica
- **Nutresa**: Alimentos, defensiva

**Acciones internacionales:**
Puedes invertir en empresas globales (Apple, Amazon, Google) desde Colombia usando brokers como Trii o Interactive Brokers.

**Recomendaciones:**
- Invierte solo dinero que no necesitaras en 5+ anos
- Diversifica entre sectores y geografias
- No inviertas basado en "tips" o rumores
- Estudia los fundamentales de las empresas`
    },

    explain_tes: (context) => {
      return `Los TES (Titulos de Tesoreria) son bonos de deuda emitidos por el gobierno colombiano. Son considerados los instrumentos mas seguros del mercado local.

**Caracteristicas:**
- **Emisor**: Gobierno de Colombia (riesgo soberano)
- **Plazos**: Desde 1 hasta 30 anos
- **Rentabilidad**: Tasa fija o indexada a UVR/IPC

**Tipos de TES:**
- **TES Tasa Fija**: Conoces la rentabilidad desde el inicio
- **TES UVR**: Protegen contra la inflacion
- **TES Corto Plazo**: Menor volatilidad

**Como invertir:**
1. **Directo**: A traves de tu banco o comisionista de bolsa
2. **FICs**: Fondos de inversion que invierten en TES
3. **ETFs**: Fondos que replican indices de deuda colombiana

**Rentabilidad actual:**
Los TES a 10 anos rinden aproximadamente 11-12% anual.

*Ideal para: Perfiles conservadores que buscan preservar capital con rentabilidad superior a CDTs.*`
    },

    explain_compound_interest: (context) => {
      return `El interes compuesto es considerado la "octava maravilla del mundo" segun Einstein. Es el concepto mas poderoso para construir riqueza a largo plazo.

**Como funciona:**
- Ganas intereses sobre tu capital inicial
- Esos intereses se reinvierten
- Luego ganas intereses sobre capital + intereses previos
- El efecto se multiplica exponencialmente con el tiempo

**Ejemplo practico:**
Inviertes $10,000,000 al 10% anual:
- **Ano 1**: $11,000,000
- **Ano 5**: $16,105,100
- **Ano 10**: $25,937,424
- **Ano 20**: $67,275,000
- **Ano 30**: $174,494,023

Con interes simple solo tendrias $40,000,000 en 30 anos.

**Claves para aprovecharlo:**
1. **Empieza temprano**: El tiempo es tu mejor aliado
2. **Se constante**: Aportes periodicos potencian el efecto
3. **Reinvierte**: No retires los intereses
4. **Paciencia**: Los resultados se ven a largo plazo

*El secreto no es cuanto inviertes, sino cuanto tiempo dejas crecer tu dinero.*`
    },

    explain_diversification: (context) => {
      return `La diversificacion es la unica "comida gratis" en finanzas. Consiste en no concentrar todo tu dinero en un solo activo o tipo de inversion.

**Por que diversificar:**
- Reduce el riesgo sin sacrificar tanto rendimiento
- Protege contra eventos inesperados
- Suaviza la volatilidad de tu portafolio

**Niveles de diversificacion:**
1. **Por activo**: No todo en una sola accion
2. **Por sector**: Tecnologia, salud, finanzas, consumo...
3. **Por geografia**: Colombia, EE.UU., Europa, Asia
4. **Por tipo**: Renta variable, renta fija, alternativos

**Portafolio diversificado ejemplo:**
- 40% Renta fija (CDTs, TES, bonos)
- 35% Renta variable (acciones, ETFs)
- 15% Internacional (ETFs globales)
- 10% Alternativos (finca raiz, oro)

**Error comun:**
Tener 10 acciones del mismo sector NO es diversificar. Si todas son tech, se moveran igual.

*Recuerda: No se trata de maximizar ganancias, sino de optimizar la relacion riesgo/retorno.*`
    },

    explain_inflation: (context) => {
      return `La inflacion es el aumento generalizado de precios en la economia. Es el "enemigo silencioso" del ahorro porque reduce el poder adquisitivo de tu dinero.

**En Colombia:**
- Inflacion 2023: 9.28%
- Inflacion historica promedio: 5-7% anual
- Meta del Banco de la Republica: 3%

**Impacto en tu dinero:**
Si tienes $10,000,000 guardados sin invertir:
- Con 7% de inflacion anual
- En 10 anos equivaldran a ~$5,000,000 de hoy
- Perdiste la mitad del poder adquisitivo

**Como protegerte:**
1. **Invierte**: Tu dinero debe rendir mas que la inflacion
2. **TES UVR**: Indexados a la inflacion
3. **Acciones**: Historicamente superan inflacion a largo plazo
4. **Finca raiz**: Activo real que se valoriza
5. **Dolar**: Diversificacion en moneda fuerte

**Tasa real de interes:**
Si un CDT paga 11% y la inflacion es 9%, tu ganancia REAL es solo 2%.

*Por eso guardar dinero "debajo del colchon" o en cuenta de ahorros al 0% es perder dinero cada ano.*`
    },

    explain_risk: (context) => {
      return `El riesgo en inversiones es la posibilidad de que los resultados sean diferentes a lo esperado, especialmente de perder parte o todo tu capital.

**Tipos de riesgo:**
- **Riesgo de mercado**: Caidas generales del mercado
- **Riesgo especifico**: Problemas de una empresa particular
- **Riesgo de liquidez**: No poder vender cuando necesitas
- **Riesgo de tasa**: Cambios en tasas de interes
- **Riesgo cambiario**: Fluctuaciones del dolar

**Relacion riesgo-retorno:**
- Mayor riesgo = Mayor retorno potencial
- Menor riesgo = Menor retorno potencial
- No existe alta rentabilidad sin riesgo

**Escala de riesgo (menor a mayor):**
1. CDTs y cuentas de ahorro
2. TES y bonos gobierno
3. Bonos corporativos
4. Fondos de inversion conservadores
5. Acciones de empresas grandes
6. Acciones de empresas pequenas
7. Criptomonedas

**Como manejar el riesgo:**
- Diversifica tu portafolio
- Invierte segun tu horizonte de tiempo
- No inviertas dinero que necesitaras pronto
- Conoce tu tolerancia emocional a las perdidas

*El riesgo no es malo - es el precio de los retornos. Lo importante es que sea acorde a tu situacion.*`
    },

    how_to_invest: (context) => {
      let response = `Excelente decision querer empezar a invertir! Te guio paso a paso:\n\n`

      response += `**1. Prepara tu base financiera:**
- Ten un fondo de emergencia (3-6 meses de gastos)
- Paga deudas de alto interes primero
- Define cuanto puedes invertir mensualmente

**2. Define tu perfil:**
- **Conservador**: Prioriza seguridad sobre rentabilidad
- **Moderado**: Balance entre seguridad y crecimiento
- **Agresivo**: Busca maximos retornos, tolera volatilidad

**3. Opciones segun tu perfil:**`

      if (context.riskProfile === 'conservador' || !context.riskProfile) {
        response += `\n\n**Para perfil conservador:**
- CDTs en bancos solidos (10-12% anual)
- TES del gobierno colombiano
- Fondos de inversion de renta fija
- Fiducuentas`
      }
      
      if (context.riskProfile === 'moderado' || !context.riskProfile) {
        response += `\n\n**Para perfil moderado:**
- 60% renta fija (CDTs, TES)
- 40% renta variable (ETFs, acciones)
- Fondos balanceados`
      }
      
      if (context.riskProfile === 'agresivo' || !context.riskProfile) {
        response += `\n\n**Para perfil agresivo:**
- ETFs de acciones (SPY, QQQ)
- Acciones individuales BVC
- Acciones internacionales
- Pequeño % en criptomonedas`
      }

      response += `\n\n**4. Donde abrir cuenta:**
- **CDTs**: Cualquier banco (compara tasas)
- **Acciones Colombia**: Trii, Tyba, comisionistas
- **Acciones internacionales**: Hapi, Trii, Interactive Brokers

Quieres que profundicemos en alguna opcion especifica?`

      return response
    },

    get_recommendation: (context) => {
      if (context.riskProfile) {
        const recommendations = {
          conservador: `Basado en tu perfil **conservador**, te recomiendo:

**Distribucion sugerida:**
- 50% CDTs a diferentes plazos (escalera de vencimientos)
- 30% TES o fondos de renta fija
- 15% ETF conservador (BND o AGG)
- 5% Acciones de dividendos (Bancolombia, ISA)

**Por que esta distribucion:**
- Maxima proteccion del capital
- Rentabilidad predecible (10-12% anual)
- Liquidez parcial con la escalera de CDTs
- Pequena exposicion a crecimiento

**Advertencia:** Con inflacion alta, asegurate de que tu rentabilidad la supere.`,

          moderado: `Basado en tu perfil **moderado**, te recomiendo:

**Distribucion sugerida:**
- 35% Renta fija (CDTs, TES)
- 35% ETFs diversificados (VOO, VT)
- 20% Acciones Colombia (Bancolombia, Ecopetrol, ISA)
- 10% Acciones crecimiento internacional

**Por que esta distribucion:**
- Balance entre seguridad y crecimiento
- Diversificacion geografica
- Potencial de 12-15% anual a largo plazo
- Volatilidad manejable

**Estrategia:** Rebalancear cada 6 meses para mantener proporciones.`,

          agresivo: `Basado en tu perfil **agresivo**, te recomiendo:

**Distribucion sugerida:**
- 15% Renta fija (liquidez y estabilidad)
- 40% ETFs de crecimiento (QQQ, VGT, ARKK)
- 30% Acciones individuales (tech, growth)
- 10% Mercados emergentes
- 5% Criptomonedas (Bitcoin, Ethereum)

**Por que esta distribucion:**
- Maximo potencial de crecimiento (15-20%+ anual)
- Exposicion a sectores de alto crecimiento
- Diversificacion global
- Preparado para volatilidad alta

**Advertencia:** Prepárate para caidas del 20-30% ocasionalmente. Solo invierte a largo plazo (5+ anos).`
        }
        return recommendations[context.riskProfile] || recommendations.moderado
      }

      return `Para darte una recomendacion personalizada, necesito conocer mejor tu situacion:

1. **Cual es tu perfil de riesgo?**
   - Conservador: Priorizas no perder dinero
   - Moderado: Buscas balance riesgo/retorno
   - Agresivo: Buscas maximos retornos

2. **Cual es tu horizonte de inversion?**
   - Corto plazo: Menos de 2 anos
   - Mediano plazo: 2-5 anos
   - Largo plazo: Mas de 5 anos

3. **Cuanto puedes invertir?**

Cuentame estos detalles y te doy recomendaciones especificas!`
    },

    simulate: (context) => {
      return `Puedo ayudarte a proyectar tus inversiones! Para darte numeros precisos, puedes usar nuestro **Simulador de Inversion** en la pestana "Simulador".

**Que puedes simular:**
- Crecimiento con interes compuesto
- Diferentes tasas de rendimiento
- Comparar escenarios (conservador vs agresivo)
- Calcular cuanto necesitas para una meta

**Ejemplo rapido:**
Si inviertes **$10,000,000** al **10% anual** por **10 anos**:
- Valor final: **$25,937,424**
- Ganancia: **$15,937,424**
- Crecimiento: **159%**

Quieres que te explique como usar el simulador o tienes valores especificos que calcular?`
    },

    greeting: (context) => {
      const greetings = [
        `Hola! Que gusto saludarte. Soy tu asesor financiero en InvestIQ. En que puedo ayudarte hoy con tus inversiones?`,
        `Bienvenido! Estoy aqui para resolver todas tus dudas sobre inversiones y finanzas. Que te gustaria saber?`,
        `Hola! Listo para ayudarte a tomar mejores decisiones financieras. Cuentame, que tienes en mente?`
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    },

    farewell: (context) => {
      return `Fue un placer ayudarte! Recuerda que puedes volver cuando tengas mas preguntas sobre inversiones. Exitos con tus finanzas!`
    },

    general: (context, message) => {
      return `Entiendo tu pregunta. Dejame darte informacion util:

En el mundo de las inversiones, es importante considerar:
1. Tu situacion financiera actual
2. Tus objetivos a corto y largo plazo
3. Tu tolerancia al riesgo
4. El horizonte de tiempo

Podrias ser mas especifico sobre que aspecto te gustaria profundizar? Por ejemplo:
- Instrumentos de inversion (CDTs, ETFs, acciones)
- Estrategias segun tu perfil
- Como empezar a invertir
- Simulaciones de crecimiento`
    }
  },

  generate(intent, context, originalMessage) {
    const generator = this.responses[intent]
    if (generator) {
      return generator(context, originalMessage)
    }
    return this.responses.general(context, originalMessage)
  }
}

// ============================================================================
// MENSAJE INICIAL
// ============================================================================
const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `Hola! Soy tu asesor financiero en InvestIQ.

Estoy aqui para ayudarte a entender el mundo de las inversiones y tomar mejores decisiones con tu dinero.

**Puedo ayudarte con:**
- Explicarte instrumentos (CDTs, ETFs, acciones, TES)
- Recomendaciones personalizadas segun tu perfil
- Conceptos financieros (interes compuesto, diversificacion)
- Estrategias de inversion

Cuentame, en que puedo ayudarte hoy?`,
  timestamp: new Date()
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================
export function useAdvisor() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)
  const memoryRef = useRef(new ConversationMemory())

  // Load saved data
  useEffect(() => {
    try {
      const profile = localStorage.getItem('investiq_profile')
      if (profile) {
        const parsed = JSON.parse(profile)
        if (parsed.perfil) {
          const profileMap = {
            'Conservador': 'conservador',
            'Moderado': 'moderado',
            'Agresivo': 'agresivo'
          }
          memoryRef.current.setRiskProfile(profileMap[parsed.perfil] || parsed.perfil.toLowerCase())
        }
      }

      const savedChat = localStorage.getItem('investiq_chat_history')
      if (savedChat) {
        const parsed = JSON.parse(savedChat)
        if (parsed.length > 1) {
          setMessages(parsed.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })))
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }, [])

  // Save chat history
  useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem('investiq_chat_history', JSON.stringify(messages))
      } catch (e) {
        // Ignore errors
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

    // Add to memory
    memoryRef.current.addToContext(content, 'user')

    // Detect intent
    const intentResult = IntentDetector.detectIntent(content)
    const entities = IntentDetector.extractEntities(content)
    
    // Update memory with extracted info
    if (entities.profiles.length > 0) {
      memoryRef.current.setRiskProfile(entities.profiles[0])
    }
    if (entities.amounts.length > 0) {
      memoryRef.current.setBudget(entities.amounts[0])
    }
    if (entities.timeframes.length > 0) {
      memoryRef.current.setInvestmentHorizon(entities.timeframes[0])
    }
    memoryRef.current.addTopic(intentResult.category)

    // Variable typing delay for natural feel
    const typingDelay = Math.min(800 + content.length * 15, 2500)

    await new Promise(resolve => setTimeout(resolve, typingDelay))

    try {
      // Try backend API first
      const context = memoryRef.current.getFullContext()
      const response = await chatWithAdvisor(content, context)
      
      if (response && response.message) {
        const assistantMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          suggestions: response.suggestions || []
        }
        
        setMessages(prev => [...prev, assistantMessage])
        memoryRef.current.addToContext(response.message, 'assistant')
      } else {
        throw new Error('Invalid response')
      }
    } catch (error) {
      // Fallback to local response generator
      const context = memoryRef.current.getFullContext()
      const responseText = ResponseGenerator.generate(intentResult.intent, context, content)
      
      const assistantMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        suggestions: []
      }
      
      setMessages(prev => [...prev, assistantMessage])
      memoryRef.current.addToContext(responseText, 'assistant')
    } finally {
      setIsTyping(false)
    }
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([INITIAL_MESSAGE])
    memoryRef.current.reset()
    try {
      localStorage.removeItem('investiq_chat_history')
    } catch (e) {
      // Ignore
    }
  }, [])

  const sendFeedback = useCallback((messageIndex, isPositive) => {
    // Save feedback for ML learning
    try {
      const feedback = JSON.parse(localStorage.getItem('investiq_feedback') || '[]')
      const message = messages[messageIndex]
      feedback.push({
        message: message?.content,
        positive: isPositive,
        timestamp: new Date().toISOString(),
        context: memoryRef.current.getFullContext()
      })
      localStorage.setItem('investiq_feedback', JSON.stringify(feedback.slice(-100)))
    } catch (e) {
      // Ignore
    }
  }, [messages])

  return {
    messages,
    isTyping,
    sendMessage,
    clearHistory,
    sendFeedback,
    memory: memoryRef.current.getFullContext()
  }
}

export default useAdvisor
