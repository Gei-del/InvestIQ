from app.routes.profile import router as profile_router
from app.routes.simulation import router as simulation_router
from app.routes.health import router as health_router
from app.routes.chat import router as chat_router

__all__ = ["profile_router", "simulation_router", "health_router", "chat_router"]
