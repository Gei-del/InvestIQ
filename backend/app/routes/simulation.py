import logging
from fastapi import APIRouter, HTTPException, status

from app.schemas import SimulationInput, SimulationResponse
from app.services import run_simulation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Simulation"])


@router.post(
    "/simulate",
    response_model=SimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Simula el crecimiento de una inversión con interés compuesto",
)
async def simulate_endpoint(data: SimulationInput) -> SimulationResponse:
    try:
        result = run_simulation(data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Error en simulate: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor")
