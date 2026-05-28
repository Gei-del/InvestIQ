"""
main.py — Entry point FastAPI
Sistema de Perfil Financiero y Recomendación de Inversiones para Colombia
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import profile_router, simulation_router, health_router, chat_router
from app.ml.ml_model import get_model

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Iniciando Financial ML API…")
    try:
        get_model()
        logger.info("✅ Modelo ML cargado correctamente")
    except Exception as e:
        logger.error(f"❌ Error cargando modelo ML: {e}")

    # Intentar inicializar DB (no falla si no está disponible)
    try:
        from app.database import init_db
        await init_db()
        logger.info("✅ Base de datos inicializada")
    except Exception as e:
        logger.warning(f"⚠️  DB no disponible — operando sin persistencia: {e}")

    yield

    # Shutdown
    logger.info("🛑 Cerrando Financial ML API…")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Financial ML API",
    description="Sistema inteligente de perfil financiero y recomendación de inversiones para Colombia",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health_router)
app.include_router(profile_router)
app.include_router(simulation_router)
app.include_router(chat_router)


# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Error interno del servidor", "detail": str(exc), "code": 500},
    )


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Financial ML API v1.0.0",
        "docs": "/docs",
        "health": "/health",
        "status": "running",
    }
