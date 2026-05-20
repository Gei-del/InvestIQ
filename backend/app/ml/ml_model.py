"""
ML Service: DecisionTreeClassifier para clasificación de perfil financiero.
Se entrena automáticamente al iniciar si no existe modelo guardado.
"""
import os
import logging
import joblib
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from pathlib import Path

logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).parent / "model.joblib"
SCALER_PATH = Path(__file__).parent / "scaler.joblib"

PROFILES = ["Conservador", "Moderado", "Agresivo"]
PROFILE_MAP = {0: "Conservador", 1: "Moderado", 2: "Agresivo"}


def _generate_training_data() -> pd.DataFrame:
    """Genera dataset sintético balanceado y representativo."""
    np.random.seed(42)
    records = []

    # ── Conservador ──────────────────────────────────────────────
    for _ in range(120):
        records.append({
            "edad": np.random.randint(50, 80),
            "riesgo": np.random.randint(1, 3),
            "horizonte": np.random.randint(1, 3),
            "liquidez": np.random.randint(1, 3),
            "objetivo": np.random.randint(1, 2),
            "experiencia": np.random.randint(1, 2),
            "perfil": 0,
        })

    # ── Moderado ─────────────────────────────────────────────────
    for _ in range(120):
        records.append({
            "edad": np.random.randint(35, 60),
            "riesgo": np.random.randint(2, 4),
            "horizonte": np.random.randint(2, 4),
            "liquidez": np.random.randint(2, 4),
            "objetivo": np.random.randint(2, 4),
            "experiencia": np.random.randint(2, 4),
            "perfil": 1,
        })

    # ── Agresivo ─────────────────────────────────────────────────
    for _ in range(120):
        records.append({
            "edad": np.random.randint(20, 40),
            "riesgo": np.random.randint(4, 6),
            "horizonte": np.random.randint(3, 6),
            "liquidez": np.random.randint(3, 6),
            "objetivo": np.random.randint(4, 6),
            "experiencia": np.random.randint(3, 6),
            "perfil": 2,
        })

    return pd.DataFrame(records)


def train_model() -> tuple[DecisionTreeClassifier, StandardScaler, float]:
    """Entrena el modelo y retorna modelo, scaler y accuracy."""
    df = _generate_training_data()
    features = ["edad", "riesgo", "horizonte", "liquidez", "objetivo", "experiencia"]

    X = df[features].values
    y = df["perfil"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = DecisionTreeClassifier(
        max_depth=6,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    logger.info(f"Modelo entrenado — Accuracy: {accuracy:.2%}")

    return model, scaler, accuracy


def save_model(model: DecisionTreeClassifier, scaler: StandardScaler) -> None:
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    logger.info(f"Modelo guardado en {MODEL_PATH}")


def load_model() -> tuple[DecisionTreeClassifier, StandardScaler]:
    if not MODEL_PATH.exists() or not SCALER_PATH.exists():
        logger.info("Modelo no encontrado — entrenando nuevo modelo…")
        model, scaler, _ = train_model()
        save_model(model, scaler)
        return model, scaler
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    logger.info("Modelo cargado desde disco.")
    return model, scaler


# ── Singleton ─────────────────────────────────────────────────────────────────
_model: DecisionTreeClassifier | None = None
_scaler: StandardScaler | None = None


def get_model() -> tuple[DecisionTreeClassifier, StandardScaler]:
    global _model, _scaler
    if _model is None or _scaler is None:
        _model, _scaler = load_model()
    return _model, _scaler


def predict_profile(
    edad: int,
    riesgo: int,
    horizonte: int,
    liquidez: int,
    objetivo: int,
    experiencia: int,
) -> dict:
    """Retorna perfil, score y probabilidades por clase."""
    model, scaler = get_model()
    X = np.array([[edad, riesgo, horizonte, liquidez, objetivo, experiencia]], dtype=float)
    X_scaled = scaler.transform(X)

    pred = int(model.predict(X_scaled)[0])
    proba = model.predict_proba(X_scaled)[0]

    # Score 0-100 basado en la probabilidad del perfil predicho
    score = float(proba[pred]) * 100

    probabilidades = {PROFILE_MAP[i]: round(float(p) * 100, 1) for i, p in enumerate(proba)}

    return {
        "perfil": PROFILE_MAP[pred],
        "score": round(score, 1),
        "probabilidades": probabilidades,
    }
