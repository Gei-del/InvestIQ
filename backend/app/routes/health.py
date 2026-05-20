from fastapi import APIRouter
from app.schemas import HealthResponse
from app.ml.ml_model import get_model
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Estado del servicio")
async def health_check() -> HealthResponse:
    try:
        get_model()
        ml_loaded = True
    except Exception:
        ml_loaded = False

    return HealthResponse(
        status="ok",
        environment=settings.ENVIRONMENT,
        version="1.0.0",
        ml_model_loaded=ml_loaded,
    )
