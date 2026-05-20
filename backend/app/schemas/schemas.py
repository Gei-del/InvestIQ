from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
import uuid
from datetime import datetime


# ─── Assessment / Profile ───────────────────────────────────────────────────

class AssessmentInput(BaseModel):
    edad: int = Field(..., ge=18, le=100, description="Edad del usuario")
    riesgo: int = Field(..., ge=1, le=5, description="Tolerancia al riesgo (1=muy bajo, 5=muy alto)")
    horizonte: int = Field(..., ge=1, le=5, description="Horizonte de inversión (1=<1 año, 5=>10 años)")
    liquidez: int = Field(..., ge=1, le=5, description="Necesidad de liquidez (1=muy alta, 5=muy baja)")
    objetivo: int = Field(..., ge=1, le=5, description="Objetivo financiero (1=preservar, 5=máximo crecimiento)")
    experiencia: int = Field(..., ge=1, le=5, description="Experiencia invirtiendo (1=ninguna, 5=experto)")
    session_id: Optional[str] = None

    @field_validator("edad")
    @classmethod
    def validate_edad(cls, v: int) -> int:
        if not (18 <= v <= 100):
            raise ValueError("La edad debe estar entre 18 y 100 años")
        return v


class ProfileResult(BaseModel):
    perfil: str
    score: float
    probabilidades: dict[str, float]
    descripcion: str
    caracteristicas: List[str]


class AssessmentResponse(BaseModel):
    id: str
    perfil: str
    score: float
    probabilidades: dict[str, float]
    descripcion: str
    caracteristicas: List[str]
    recomendaciones: List["RecommendationOut"]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Recommendations ────────────────────────────────────────────────────────

class RecommendationOut(BaseModel):
    id: Optional[str] = None
    nombre: str
    tipo: str
    riesgo_nivel: str
    rentabilidad_estimada: float
    explicacion: str
    datos_extra: dict[str, Any] = {}

    class Config:
        from_attributes = True


class RecommendationsResponse(BaseModel):
    perfil: str
    recomendaciones: List[RecommendationOut]
    nota: str


# ─── Simulation ─────────────────────────────────────────────────────────────

class SimulationInput(BaseModel):
    capital_inicial: float = Field(..., gt=0, description="Capital inicial en COP")
    tasa_anual: float = Field(..., ge=0, le=100, description="Tasa anual en porcentaje")
    anios: int = Field(..., ge=1, le=50, description="Número de años")
    inflacion: float = Field(default=6.0, ge=0, le=50, description="Inflación anual en porcentaje")
    session_id: Optional[str] = None


class YearData(BaseModel):
    anio: int
    valor_nominal: float
    valor_real: float
    ganancia_acumulada: float
    inflacion_acumulada: float


class SimulationResponse(BaseModel):
    capital_inicial: float
    tasa_anual: float
    anios: int
    inflacion: float
    valor_futuro: float
    valor_real: float
    crecimiento_porcentual: float
    crecimiento_real_porcentual: float
    ganancia_total: float
    datos_anuales: List[YearData]


# ─── Health ──────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    environment: str
    version: str
    ml_model_loaded: bool


# ─── Error ───────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: int


AssessmentResponse.model_rebuild()
