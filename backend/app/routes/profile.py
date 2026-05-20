import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import AssessmentInput, AssessmentResponse, RecommendationsResponse
from app.services import process_assessment, get_recommendations, get_profile_info

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Profile"])


@router.post(
    "/predict-profile",
    response_model=AssessmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Predice el perfil financiero del usuario",
)
async def predict_profile_endpoint(
    data: AssessmentInput,
    db: AsyncSession = Depends(get_db),
) -> AssessmentResponse:
    try:
        result = await process_assessment(data, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Error en predict-profile: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor")


@router.get(
    "/recommendations",
    response_model=RecommendationsResponse,
    summary="Obtiene recomendaciones para un perfil",
)
async def get_recommendations_endpoint(perfil: str) -> RecommendationsResponse:
    valid_profiles = ["Conservador", "Moderado", "Agresivo"]
    if perfil not in valid_profiles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Perfil inválido. Opciones: {', '.join(valid_profiles)}",
        )

    recs = get_recommendations(perfil)
    info = get_profile_info(perfil)

    return RecommendationsResponse(
        perfil=perfil,
        recomendaciones=recs,  # type: ignore[arg-type]
        nota=info.get("descripcion", ""),
    )
