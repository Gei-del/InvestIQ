"""
financial_data_service.py
Provee datos financieros para Colombia.
Actualmente usa datos mock; la estructura permite integrar scraping / APIs reales.
"""
from typing import Any

INSTRUMENTS: dict[str, list[dict[str, Any]]] = {
    "Conservador": [
        {
            "nombre": "CDT Bancolombia",
            "tipo": "CDT",
            "riesgo_nivel": "Muy Bajo",
            "rentabilidad_estimada": 11.5,
            "explicacion": (
                "Los Certificados de Depósito a Término (CDT) son instrumentos de ahorro "
                "emitidos por bancos colombianos. Ofrecen rendimiento fijo garantizado por "
                "el Fondo de Garantías de Instituciones Financieras (Fogafín) hasta $50M. "
                "Ideal para quienes priorizan la seguridad sobre el rendimiento."
            ),
            "datos_extra": {
                "plazo_minimo_dias": 90,
                "garantia_fogafin": True,
                "liquidez": "Baja",
                "mercado": "Colombia",
                "regulador": "Superintendencia Financiera",
                "tasa_referencia": "DTF + spread",
            },
        },
        {
            "nombre": "Bonos TES Colombia",
            "tipo": "Bonos Gobierno",
            "riesgo_nivel": "Bajo",
            "rentabilidad_estimada": 12.8,
            "explicacion": (
                "Los Títulos de Tesorería (TES) son bonos emitidos por el Gobierno colombiano. "
                "Representan la deuda más segura del país. La tasa está ligada al índice "
                "IPC + spread. Perfectos para inversores que buscan estabilidad a mediano plazo."
            ),
            "datos_extra": {
                "emisor": "Ministerio de Hacienda",
                "plazo_anios": "1-30",
                "liquidez": "Media (mercado secundario)",
                "mercado": "Bolsa de Valores de Colombia",
                "tipo_tasa": "Fija o UVR",
            },
        },
        {
            "nombre": "Fondo de Inversión Colectiva Conservador",
            "tipo": "Fondo Conservador",
            "riesgo_nivel": "Bajo",
            "rentabilidad_estimada": 10.2,
            "explicacion": (
                "Fondos administrados por sociedades fiduciarias que invierten principalmente "
                "en CDTs, TES y deuda corporativa de alta calidad. Permiten diversificación "
                "desde montos pequeños con gestión profesional. Regulados por la Superfinanciera."
            ),
            "datos_extra": {
                "administradores": ["Fiduciaria Bancolombia", "Skandia", "Protección"],
                "liquidez": "Alta (rescate T+0 o T+1)",
                "monto_minimo_cop": 100000,
                "regulador": "Superintendencia Financiera",
            },
        },
    ],
    "Moderado": [
        {
            "nombre": "ETF iShares MSCI ACWI (ACWI)",
            "tipo": "ETF Global",
            "riesgo_nivel": "Moderado",
            "rentabilidad_estimada": 9.5,
            "explicacion": (
                "ETF que replica el índice MSCI All Country World, dando exposición a más de "
                "2,900 empresas de 50 países. Ofrece diversificación global real con una sola "
                "inversión. Accesible desde Colombia a través de brokers internacionales."
            ),
            "datos_extra": {
                "ticker": "ACWI",
                "bolsa": "NASDAQ",
                "ter_anual": "0.32%",
                "activos_miles_millones_usd": 18,
                "divisa": "USD",
            },
        },
        {
            "nombre": "Fondo Mixto Moderado - Porvenir",
            "tipo": "Fondo Mixto",
            "riesgo_nivel": "Moderado",
            "rentabilidad_estimada": 10.8,
            "explicacion": (
                "Fondo de inversión colectiva que combina renta fija (60%) y renta variable (40%). "
                "Gestión activa por parte de Porvenir, uno de los fondos de pensiones más grandes "
                "de Colombia. Equilibrio entre rentabilidad y protección del capital."
            ),
            "datos_extra": {
                "composicion": "60% Renta Fija / 40% Renta Variable",
                "administrador": "Porvenir",
                "liquidez": "T+3",
                "monto_minimo_cop": 500000,
            },
        },
        {
            "nombre": "Acciones BVC - Blue Chips",
            "tipo": "Acciones Locales",
            "riesgo_nivel": "Moderado-Alto",
            "rentabilidad_estimada": 13.5,
            "explicacion": (
                "Acciones de empresas líderes colombianas listadas en la Bolsa de Valores de "
                "Colombia (BVC): Ecopetrol, Bancolombia, Grupo Sura, Nutresa. Ofrecen potencial "
                "de valorización y dividendos, con liquidez del mercado local."
            ),
            "datos_extra": {
                "ejemplos": ["ECOPETROL", "PFBCOLOM", "GRUPOSURA", "NUTRESA"],
                "bolsa": "BVC",
                "divisa": "COP",
                "horas_mercado": "9:30 - 16:00 COT",
            },
        },
    ],
    "Agresivo": [
        {
            "nombre": "ETF QQQ - Nasdaq 100",
            "tipo": "ETF Tecnológico",
            "riesgo_nivel": "Alto",
            "rentabilidad_estimada": 17.2,
            "explicacion": (
                "El QQQ replica el índice Nasdaq-100, concentrado en las 100 mayores empresas "
                "tecnológicas: Apple, Microsoft, NVIDIA, Amazon, Meta. Históricamente ha "
                "superado al S&P 500 en bull markets. Alta volatilidad requiere horizonte largo."
            ),
            "datos_extra": {
                "ticker": "QQQ",
                "bolsa": "NASDAQ",
                "ter_anual": "0.20%",
                "activos_miles_millones_usd": 250,
                "divisa": "USD",
                "top_holdings": ["MSFT", "AAPL", "NVDA", "AMZN", "META"],
            },
        },
        {
            "nombre": "Acciones Internacionales - S&P 500",
            "tipo": "Acciones Internacionales",
            "riesgo_nivel": "Alto",
            "rentabilidad_estimada": 14.8,
            "explicacion": (
                "Exposición directa a las 500 empresas más grandes de EE.UU. vía ETFs como VOO "
                "o SPY. Rentabilidad histórica promedio del 10-15% anual en USD. Accesible "
                "desde Colombia a través de brokers como Interactive Brokers o Charles Schwab."
            ),
            "datos_extra": {
                "tickers_referencia": ["VOO", "SPY", "IVV"],
                "divisa": "USD",
                "rentabilidad_historica_promedio": "10-15% anual",
                "horizonte_recomendado_anios": "5+",
            },
        },
        {
            "nombre": "Criptomonedas - BTC/ETH (Simulación)",
            "tipo": "Cripto",
            "riesgo_nivel": "Muy Alto",
            "rentabilidad_estimada": 25.0,
            "explicacion": (
                "⚠️ SOLO SIMULACIÓN. Bitcoin y Ethereum son activos digitales de muy alta "
                "volatilidad. Han generado rendimientos extraordinarios pero también caídas "
                "de -80%. Nunca invertir más del 5-10% del portafolio. Posición especulativa "
                "para perfiles con tolerancia máxima al riesgo y horizonte largo."
            ),
            "datos_extra": {
                "aviso": "Alto riesgo especulativo. Solo para información.",
                "volatilidad": "Extrema",
                "regulacion_colombia": "Vigilado por DIAN para efectos tributarios",
                "exchanges": ["Binance", "Bitso", "Ripio"],
                "porcentaje_portafolio_max": "5-10%",
            },
        },
    ],
}

PROFILE_INFO: dict[str, dict] = {
    "Conservador": {
        "descripcion": (
            "Tu perfil es Conservador. Priorizas la seguridad de tu capital y prefieres "
            "rendimientos predecibles aunque sean más bajos. Buscas estabilidad y no toleras "
            "bien las fluctuaciones del mercado. Ideal para metas de corto/mediano plazo."
        ),
        "caracteristicas": [
            "Prioridad: Preservación del capital",
            "Tolerancia al riesgo: Baja",
            "Horizonte típico: 1-3 años",
            "Instrumentos preferidos: CDT, Bonos, Fondos conservadores",
            "Volatilidad aceptable: < 5% anual",
        ],
        "color": "#10b981",
        "icon": "shield",
    },
    "Moderado": {
        "descripcion": (
            "Tu perfil es Moderado. Buscas un equilibrio entre seguridad y crecimiento. "
            "Aceptas cierta volatilidad a cambio de mejores rendimientos a mediano/largo plazo. "
            "Diversificas entre renta fija y variable para optimizar riesgo-retorno."
        ),
        "caracteristicas": [
            "Prioridad: Balance riesgo-retorno",
            "Tolerancia al riesgo: Media",
            "Horizonte típico: 3-7 años",
            "Instrumentos preferidos: ETFs, Fondos mixtos, Acciones BVC",
            "Volatilidad aceptable: 5-15% anual",
        ],
        "color": "#3b82f6",
        "icon": "trending-up",
    },
    "Agresivo": {
        "descripcion": (
            "Tu perfil es Agresivo. Buscas maximizar el crecimiento de tu patrimonio a largo "
            "plazo. Aceptas alta volatilidad y posibles pérdidas temporales significativas "
            "a cambio de rentabilidades superiores. Horizonte de inversión largo (7+ años)."
        ),
        "caracteristicas": [
            "Prioridad: Máximo crecimiento",
            "Tolerancia al riesgo: Alta",
            "Horizonte típico: 7-20+ años",
            "Instrumentos preferidos: Acciones, ETFs tecnológicos, Cripto",
            "Volatilidad aceptable: > 15% anual",
        ],
        "color": "#f59e0b",
        "icon": "zap",
    },
}


def get_recommendations(perfil: str) -> list[dict]:
    """Retorna lista de recomendaciones para el perfil dado."""
    return INSTRUMENTS.get(perfil, [])


def get_profile_info(perfil: str) -> dict:
    """Retorna información descriptiva del perfil."""
    return PROFILE_INFO.get(perfil, {})


def get_all_instruments() -> dict:
    """Retorna todos los instrumentos (para comparativas)."""
    return INSTRUMENTS
