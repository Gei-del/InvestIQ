"""
chat.py — Router para el Asesor IA conversacional
Incluye respuestas inteligentes contextualizadas al perfil del usuario
"""
import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Any

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Chat"])


class ChatInput(BaseModel):
    message: str
    context: Optional[dict[str, Any]] = None


class ChatResponse(BaseModel):
    message: str
    suggestions: list[str] = []


# Knowledge base for financial advice in Colombia
KNOWLEDGE_BASE = {
    "cdt": {
        "keywords": ["cdt", "certificado", "deposito", "termino"],
        "response": """Los CDT (Certificados de Deposito a Termino) son una de las opciones mas seguras de inversion en Colombia.

**Ventajas:**
- Rentabilidad fija conocida desde el inicio
- Protegidos por Fogafin hasta $50 millones por entidad
- Sin riesgo de mercado

**Tasas actuales aproximadas (2024):**
- Bancos tradicionales: 10-12% EA
- Bancos digitales (Pibank, Lulo Bank): 12-14% EA

**Recomendacion:** Para maximizar liquidez, considera escalonar CDTs a diferentes plazos (90, 180, 360 dias)."""
    },
    "etf": {
        "keywords": ["etf", "fondo cotizado", "indice"],
        "response": """Los ETFs son fondos que replican indices y se negocian como acciones. Son ideales para diversificar.

**ETFs recomendados para colombianos:**
- **VOO/SPY:** Replica S&P 500, rendimiento historico ~10-14% anual en USD
- **QQQ:** Nasdaq 100, mayor exposicion a tecnologia
- **VTI:** Mercado total de EE.UU.
- **ACWI:** Mercado global (desarrollados + emergentes)

**Como invertir desde Colombia:**
1. Brokers internacionales: Interactive Brokers, TD Ameritrade
2. Apps locales: Tyba, ualet (acceso limitado)
3. Fondos colombianos que invierten en ETFs"""
    },
    "perfil": {
        "keywords": ["perfil", "tipo", "inversor", "inversionista", "conservador", "moderado", "agresivo"],
        "response": """Existen tres perfiles principales de inversor:

**Conservador:** Prioriza seguridad sobre rentabilidad
- Ideal: CDTs, bonos TES, fondos de renta fija
- Rentabilidad esperada: 8-12% anual

**Moderado:** Balance entre seguridad y crecimiento
- Ideal: 60% renta fija + 40% renta variable
- Rentabilidad esperada: 10-15% anual

**Agresivo:** Busca maximizar rendimientos
- Ideal: ETFs de crecimiento, acciones
- Rentabilidad esperada: 12-20%+ anual

Te invito a hacer nuestro test de perfil en "Mi Perfil" para conocer el tuyo."""
    },
    "interes_compuesto": {
        "keywords": ["interes compuesto", "compuesto", "reinversion"],
        "response": """El interes compuesto es cuando ganas intereses sobre tus intereses. Es la clave para construir riqueza.

**Ejemplo con $10.000.000 al 12% anual:**
- Ano 5: $17.6 millones
- Ano 10: $31 millones
- Ano 20: $96 millones

**Reglas de oro:**
1. Empieza lo antes posible
2. Reinvierte las ganancias
3. Se constante con aportes regulares
4. Ten paciencia - los mejores resultados vienen despues del ano 10

Usa nuestro simulador para ver proyecciones con tu capital."""
    },
    "inflacion": {
        "keywords": ["inflacion", "poder adquisitivo", "valor real"],
        "response": """La inflacion reduce el poder adquisitivo de tu dinero. En Colombia ha oscilado entre 4-13% en anos recientes.

**Por que importa:**
- Si tu inversion rinde 10% y la inflacion es 7%, tu ganancia REAL es solo 3%
- El dinero en cuenta de ahorros al 1% PIERDE valor

**Como protegerte:**
1. Invierte en activos con rendimiento > inflacion
2. Considera bonos TES UVR (ajustan con inflacion)
3. Diversifica internacionalmente (cobertura en USD)
4. Bienes raices como proteccion de largo plazo"""
    },
    "diversificacion": {
        "keywords": ["diversificar", "diversificacion", "portafolio", "riesgo"],
        "response": """La diversificacion es la unica "comida gratis" en inversiones. Reduce el riesgo sin sacrificar tanto rendimiento.

**Niveles de diversificacion:**
1. **Por activo:** CDTs, bonos, acciones, fondos
2. **Por sector:** Tecnologia, finanzas, salud, energia
3. **Por geografia:** Colombia, EE.UU., Europa
4. **Por plazo:** Corto, mediano, largo plazo

**Regla practica:**
- No mas del 10-15% en una sola inversion
- No mas del 30% en un solo sector

**Portafolio ejemplo moderado:**
- 40% Renta fija (CDTs, bonos)
- 40% ETFs globales
- 20% Acciones o fondos activos"""
    },
    "acciones": {
        "keywords": ["acciones", "bolsa", "bvc", "accion"],
        "response": """Invertir en acciones desde Colombia es posible de varias formas:

**Acciones Colombianas (BVC):**
- Ecopetrol, Bancolombia, Grupo Sura, ISA, Nutresa
- Menor liquidez que mercados internacionales
- Sin conversion de moneda

**Acciones Internacionales:**
- Brokers: Interactive Brokers, TD Ameritrade, eToro
- Apps locales: Tyba, ualet

**Consideraciones:**
- Declarar ingresos del exterior
- Riesgo cambiario USD/COP
- Mayor volatilidad que renta fija"""
    },
    "ahorro": {
        "keywords": ["ahorro", "ahorrar", "guardar", "dinero"],
        "response": """El ahorro es el primer paso hacia la inversion.

**Estrategia 50/30/20:**
- 50% Necesidades (arriendo, servicios, comida)
- 30% Deseos (entretenimiento)
- 20% Ahorro e inversion

**Pasos recomendados:**
1. Crea un fondo de emergencia (3-6 meses de gastos)
2. Paga deudas de alta tasa (tarjetas de credito)
3. Automatiza transferencias el dia de pago
4. Invierte lo que no necesitas a corto plazo

El ahorro sin inversion pierde valor por inflacion."""
    }
}


def find_best_response(message: str, context: Optional[dict] = None) -> tuple[str, list[str]]:
    """Find the most relevant response based on keywords in the message."""
    msg_lower = message.lower()
    
    # Check each knowledge topic
    best_match = None
    best_score = 0
    
    for topic, data in KNOWLEDGE_BASE.items():
        score = sum(1 for kw in data["keywords"] if kw in msg_lower)
        if score > best_score:
            best_score = score
            best_match = topic
    
    if best_match:
        response = KNOWLEDGE_BASE[best_match]["response"]
        
        # Personalize based on profile if available
        if context and context.get("perfil"):
            perfil = context["perfil"]
            response += f"\n\n**Nota para tu perfil {perfil}:** "
            if perfil == "Conservador":
                response += "Como inversor conservador, prioriza opciones de bajo riesgo como CDTs y bonos."
            elif perfil == "Moderado":
                response += "Tu perfil moderado te permite balancear entre seguridad y crecimiento."
            elif perfil == "Agresivo":
                response += "Con tu perfil agresivo, puedes considerar mayor exposicion a renta variable."
        
        suggestions = get_related_suggestions(best_match)
        return response, suggestions
    
    # Default response
    return get_default_response(context), get_default_suggestions()


def get_related_suggestions(topic: str) -> list[str]:
    """Get follow-up question suggestions based on topic."""
    suggestions_map = {
        "cdt": ["Como funcionan los fondos de inversion?", "Que son los ETFs?", "Como diversificar mi portafolio?"],
        "etf": ["Como abrir cuenta en broker internacional?", "Cual es mi perfil de inversor?", "Como funciona el interes compuesto?"],
        "perfil": ["Que es el interes compuesto?", "Donde puedo invertir?", "Como protegerme de la inflacion?"],
        "interes_compuesto": ["Donde invertir mi dinero?", "Que son los CDTs?", "Como diversificar?"],
        "inflacion": ["Donde invertir para ganarle a la inflacion?", "Que son los ETFs?", "Que son los CDTs?"],
        "diversificacion": ["Que son los ETFs?", "Cual es mi perfil de inversor?", "Como empezar a invertir?"],
        "acciones": ["Que son los ETFs?", "Como diversificar?", "Cual es mi perfil?"],
        "ahorro": ["Donde invertir mis ahorros?", "Que es el interes compuesto?", "Como crear un fondo de emergencia?"],
    }
    return suggestions_map.get(topic, get_default_suggestions())


def get_default_response(context: Optional[dict] = None) -> str:
    perfil_text = ""
    if context and context.get("perfil"):
        perfil_text = f" Veo que tu perfil es {context['perfil']}, puedo darte consejos personalizados."
    
    return f"""Gracias por tu pregunta.{perfil_text}

Como asesor financiero de InvestIQ, puedo ayudarte con:

- **Tipos de inversiones:** CDTs, fondos, ETFs, acciones
- **Perfiles de inversor:** Cual se ajusta a tu situacion
- **Conceptos financieros:** Interes compuesto, inflacion, diversificacion
- **Estrategias de ahorro:** Como empezar y mantener el habito

Algunas preguntas que puedes hacerme:
- "En que puedo invertir con 5 millones?"
- "Como funciona el interes compuesto?"
- "Cual es la diferencia entre CDT y fondos?"

Tambien te invito a explorar nuestro simulador y el test de perfil."""


def get_default_suggestions() -> list[str]:
    return [
        "Donde puedo invertir en Colombia?",
        "Como funciona el interes compuesto?",
        "Cual es mi perfil de inversor?"
    ]


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat con el asesor financiero IA",
)
async def chat_endpoint(data: ChatInput) -> ChatResponse:
    try:
        message, suggestions = find_best_response(data.message, data.context)
        return ChatResponse(message=message, suggestions=suggestions)
    except Exception as e:
        logger.error(f"Error en chat: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error procesando tu mensaje"
        )


class FeedbackInput(BaseModel):
    message_id: Optional[str] = None
    rating: int  # 1-5
    user_message: str
    bot_response: str
    profile: Optional[str] = None
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Registrar feedback sobre respuestas del asesor",
)
async def feedback_endpoint(data: FeedbackInput) -> FeedbackResponse:
    """
    Recibe feedback del usuario sobre las respuestas.
    Este feedback se puede usar para mejorar el modelo ML en el futuro.
    Por ahora se registra en logs para analisis posterior.
    """
    try:
        logger.info(f"Feedback recibido: rating={data.rating}, profile={data.profile}")
        logger.info(f"User message: {data.user_message[:100]}...")
        logger.info(f"Bot response: {data.bot_response[:100]}...")
        if data.comment:
            logger.info(f"Comment: {data.comment}")
        
        # En el futuro, esto se guardaria en base de datos para reentrenamiento
        return FeedbackResponse(
            success=True,
            message="Gracias por tu feedback. Nos ayuda a mejorar."
        )
    except Exception as e:
        logger.error(f"Error guardando feedback: {e}", exc_info=True)
        return FeedbackResponse(
            success=False,
            message="No pudimos guardar tu feedback, pero gracias por intentarlo."
        )
