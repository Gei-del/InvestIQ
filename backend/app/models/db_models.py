import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assessments: Mapped[list["Assessment"]] = relationship("Assessment", back_populates="user", lazy="selectin")
    simulations: Mapped[list["Simulation"]] = relationship("Simulation", back_populates="user", lazy="selectin")


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    edad: Mapped[int] = mapped_column(Integer)
    riesgo: Mapped[int] = mapped_column(Integer)
    horizonte: Mapped[int] = mapped_column(Integer)
    liquidez: Mapped[int] = mapped_column(Integer)
    objetivo: Mapped[int] = mapped_column(Integer)
    experiencia: Mapped[int] = mapped_column(Integer)
    perfil: Mapped[str] = mapped_column(String(50))
    score: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="assessments")
    recommendations: Mapped[list["Recommendation"]] = relationship("Recommendation", back_populates="assessment", lazy="selectin")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"))
    nombre: Mapped[str] = mapped_column(String(100))
    tipo: Mapped[str] = mapped_column(String(50))
    riesgo_nivel: Mapped[str] = mapped_column(String(50))
    rentabilidad_estimada: Mapped[float] = mapped_column(Float)
    explicacion: Mapped[str] = mapped_column(Text)
    datos_extra: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="recommendations")


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    capital_inicial: Mapped[float] = mapped_column(Float)
    tasa_anual: Mapped[float] = mapped_column(Float)
    anios: Mapped[int] = mapped_column(Integer)
    inflacion: Mapped[float] = mapped_column(Float, default=0.06)
    valor_futuro: Mapped[float] = mapped_column(Float)
    valor_real: Mapped[float] = mapped_column(Float)
    crecimiento_porcentual: Mapped[float] = mapped_column(Float)
    datos_anuales: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="simulations")
