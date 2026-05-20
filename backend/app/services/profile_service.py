"""
profile_service.py
Orquesta predicción ML + enriquecimiento con datos financieros.
"""
import logging
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.ml.ml_model import predict_profile
from app.services.financial_data_service import get_recommendations, get_profile_info
from app.models.db_models import User, Assessment, Recommendation
from app.schemas.schemas import AssessmentInput, AssessmentResponse, RecommendationOut

logger = logging.getLogger(__name__)


async def _get_or_create_user(db: AsyncSession, session_id: str) -> User:
    result = await db.execute(select(User).where(User.session_id == session_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(session_id=session_id)
        db.add(user)
        await db.flush()
    return user


async def process_assessment(data: AssessmentInput, db: AsyncSession) -> AssessmentResponse:
    # 1. Predicción ML
    ml_result = predict_profile(
        edad=data.edad,
        riesgo=data.riesgo,
        horizonte=data.horizonte,
        liquidez=data.liquidez,
        objetivo=data.objetivo,
        experiencia=data.experiencia,
    )

    perfil = ml_result["perfil"]
    score = ml_result["score"]
    probabilidades = ml_result["probabilidades"]

    # 2. Info descriptiva del perfil
    profile_info = get_profile_info(perfil)

    # 3. Recomendaciones financieras
    raw_recs = get_recommendations(perfil)

    # 4. Persistencia (si hay DB disponible)
    assessment_id = str(uuid.uuid4())
    try:
        session_id = data.session_id or str(uuid.uuid4())
        user = await _get_or_create_user(db, session_id)

        assessment = Assessment(
            id=uuid.UUID(assessment_id),
            user_id=user.id,
            edad=data.edad,
            riesgo=data.riesgo,
            horizonte=data.horizonte,
            liquidez=data.liquidez,
            objetivo=data.objetivo,
            experiencia=data.experiencia,
            perfil=perfil,
            score=score,
        )
        db.add(assessment)
        await db.flush()

        for rec in raw_recs:
            db_rec = Recommendation(
                assessment_id=assessment.id,
                nombre=rec["nombre"],
                tipo=rec["tipo"],
                riesgo_nivel=rec["riesgo_nivel"],
                rentabilidad_estimada=rec["rentabilidad_estimada"],
                explicacion=rec["explicacion"],
                datos_extra=rec.get("datos_extra", {}),
            )
            db.add(db_rec)

        await db.commit()
        logger.info(f"Assessment guardado: {assessment_id} — Perfil: {perfil}")
    except Exception as e:
        logger.warning(f"DB no disponible, operando sin persistencia: {e}")
        await db.rollback()

    recomendaciones = [
        RecommendationOut(
            nombre=r["nombre"],
            tipo=r["tipo"],
            riesgo_nivel=r["riesgo_nivel"],
            rentabilidad_estimada=r["rentabilidad_estimada"],
            explicacion=r["explicacion"],
            datos_extra=r.get("datos_extra", {}),
        )
        for r in raw_recs
    ]

    return AssessmentResponse(
        id=assessment_id,
        perfil=perfil,
        score=score,
        probabilidades=probabilidades,
        descripcion=profile_info.get("descripcion", ""),
        caracteristicas=profile_info.get("caracteristicas", []),
        recomendaciones=recomendaciones,
        created_at=datetime.utcnow(),
    )
