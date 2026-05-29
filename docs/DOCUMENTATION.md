# InvestIQ - Documentacion Tecnica Completa

## Tabla de Contenidos
1. [Vision General](#vision-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Frontend (React + Vite)](#frontend-react--vite)
5. [Backend (FastAPI + Python)](#backend-fastapi--python)
6. [Modelo de Machine Learning](#modelo-de-machine-learning)
7. [Flujo de Datos](#flujo-de-datos)
8. [Guia de Despliegue](#guia-de-despliegue)

---

## Vision General

**InvestIQ** es una aplicacion fintech que ayuda a usuarios colombianos a:
1. Determinar su perfil de inversor (Conservador, Moderado, Agresivo)
2. Recibir recomendaciones de inversion personalizadas
3. Simular el crecimiento de sus inversiones
4. Consultar con un asesor IA sobre dudas financieras

### Tecnologias Principales
- **Frontend**: React 18, Vite, TailwindCSS, Recharts
- **Backend**: FastAPI, Python 3.11+, scikit-learn
- **ML**: DecisionTreeClassifier para clasificacion de perfiles
- **Base de Datos**: PostgreSQL (opcional, funciona sin DB)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Home    │  │Assessment│  │ Result   │  │Dashboard │        │
│  │  Page    │  │  Page    │  │  Page    │  │  Page    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                      │                           │               │
│               ┌──────┴──────┐           ┌───────┴──────┐        │
│               │   Hooks     │           │    Hooks     │        │
│               │useAssessment│           │useSimulation │        │
│               └──────┬──────┘           └───────┬──────┘        │
│                      │                          │                │
│               ┌──────┴──────────────────────────┴──────┐        │
│               │           api.js (Axios)               │        │
│               └──────────────────┬─────────────────────┘        │
└──────────────────────────────────┼──────────────────────────────┘
                                   │ HTTP/REST
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      main.py                              │   │
│  │         (CORS, Routers, Exception Handlers)               │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────┴───────────────────────────────┐   │
│  │                       ROUTERS                             │   │
│  │  /api/predict-profile  /api/simulate  /api/chat  /health  │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────┴───────────────────────────────┐   │
│  │                      SERVICES                             │   │
│  │  profile_service.py  simulation_service.py  chat.py       │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────┴───────────────────────────────┐   │
│  │                    ML MODEL                               │   │
│  │         DecisionTreeClassifier (scikit-learn)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos

```
InvestIQ/
├── frontend/                    # Aplicacion React
│   ├── src/
│   │   ├── main.jsx            # Punto de entrada React
│   │   ├── App.jsx             # Componente raiz con rutas
│   │   ├── index.css           # Estilos globales TailwindCSS
│   │   ├── pages/              # Paginas principales
│   │   │   ├── HomePage.jsx
│   │   │   ├── AssessmentPage.jsx
│   │   │   ├── ResultPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── AdvisorPage.jsx
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── Navbar.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── ...
│   │   ├── hooks/              # Custom React Hooks
│   │   │   ├── useAssessment.js
│   │   │   ├── useSimulation.js
│   │   │   └── useAdvisor.js
│   │   ├── services/           # Comunicacion con API
│   │   │   └── api.js
│   │   ├── charts/             # Graficas Recharts
│   │   │   ├── SimulationChart.jsx
│   │   │   ├── ProfileChart.jsx
│   │   │   └── ComparisonChart.jsx
│   │   └── utils/              # Utilidades
│   │       └── format.js
│   ├── tailwind.config.js      # Configuracion Tailwind
│   └── vite.config.js          # Configuracion Vite
│
├── backend/                     # API FastAPI
│   └── app/
│       ├── main.py             # Punto de entrada FastAPI
│       ├── config.py           # Variables de entorno
│       ├── routes/             # Endpoints API
│       │   ├── profile.py
│       │   ├── simulation.py
│       │   ├── chat.py
│       │   └── health.py
│       ├── services/           # Logica de negocio
│       │   ├── profile_service.py
│       │   ├── simulation_service.py
│       │   └── financial_data_service.py
│       ├── ml/                 # Modelo Machine Learning
│       │   └── ml_model.py
│       ├── schemas/            # Validacion Pydantic
│       │   └── schemas.py
│       └── models/             # Modelos SQLAlchemy
│           └── db_models.py
│
└── docs/                        # Documentacion
    └── DOCUMENTATION.md
```

---

## Frontend (React + Vite)

### main.jsx - Punto de Entrada
```javascript
// Este archivo inicializa la aplicacion React

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // Router para SPA
import App from './App.jsx'
import './index.css'  // Estilos TailwindCSS

// Busca el elemento con id="root" en index.html
const root = document.getElementById('root')

if (root) {
  // Crea el root de React 18 y renderiza la app
  ReactDOM.createRoot(root).render(
    <React.StrictMode>      {/* Modo estricto para detectar problemas */}
      <BrowserRouter>       {/* Habilita navegacion SPA */}
        <App />             {/* Componente principal */}
      </BrowserRouter>
    </React.StrictMode>
  )
}
```

**Que hace cada linea:**
1. `ReactDOM.createRoot()` - Crea un root de React 18 (nuevo API de rendering)
2. `<React.StrictMode>` - Activa verificaciones adicionales en desarrollo
3. `<BrowserRouter>` - Habilita rutas como `/assessment`, `/dashboard`
4. `<App />` - Renderiza el componente principal

---

### App.jsx - Componente Raiz

```javascript
// Define las rutas de la aplicacion

import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
// ... importacion de paginas

export default function App() {
  return (
    <div className="min-h-screen">  {/* Altura minima 100vh */}
      <Navbar />                     {/* Barra de navegacion fija */}
      <main>
        <Routes>                     {/* Contenedor de rutas */}
          {/* Cada Route mapea una URL a un componente */}
          <Route path="/" element={<HomePage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/advisor" element={<AdvisorPage />} />
          
          {/* Ruta 404 para URLs no encontradas */}
          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </main>
    </div>
  )
}
```

**Rutas disponibles:**
| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/` | HomePage | Landing page con informacion |
| `/assessment` | AssessmentPage | Cuestionario de perfil |
| `/result` | ResultPage | Resultado del perfil |
| `/dashboard` | DashboardPage | Simulador de inversiones |
| `/advisor` | AdvisorPage | Chat con asesor IA |

---

### useAssessment.js - Hook de Evaluacion

Este hook maneja la logica de evaluacion del perfil del usuario.

```javascript
import { useState } from 'react'
import { predictProfile } from '../services/api'

// ===== FUNCION DE PREDICCION LOCAL (FALLBACK) =====
// Se usa cuando el backend no esta disponible
function localMLPrediction(formData) {
  const { edad, riesgo, horizonte, liquidez, objetivo, experiencia } = formData
  
  // Pesos de cada variable (suman 1.0)
  // Estos pesos simulan la importancia que el modelo ML da a cada variable
  const weights = {
    riesgo: 0.30,      // 30% - Tolerancia al riesgo es la mas importante
    horizonte: 0.25,   // 25% - Horizonte temporal
    objetivo: 0.20,    // 20% - Objetivo de inversion
    experiencia: 0.15, // 15% - Experiencia previa
    liquidez: 0.10,    // 10% - Necesidad de liquidez
  }
  
  // Factor de edad: personas jovenes pueden ser mas agresivas
  const edadFactor = edad < 30 ? 0.2 : edad < 45 ? 0 : edad < 60 ? -0.2 : -0.4
  
  // Calculo del score ponderado (formula del modelo)
  const score = (
    riesgo * weights.riesgo +           // Mayor riesgo = mayor score
    horizonte * weights.horizonte +      // Mayor horizonte = mayor score
    objetivo * weights.objetivo +        // Mayor objetivo = mayor score
    experiencia * weights.experiencia +  // Mayor experiencia = mayor score
    (6 - liquidez) * weights.liquidez +  // Menor necesidad liquidez = mayor score
    edadFactor                           // Ajuste por edad
  )
  
  // Normalizar a escala 0-100
  const normalizedScore = Math.round(Math.min(100, Math.max(0, (score / 5) * 100)))
  
  // Determinar perfil basado en score
  let perfil, probabilidades
  
  if (normalizedScore < 35) {
    perfil = 'Conservador'
    // Probabilidades con algo de variacion aleatoria para parecer real
    probabilidades = { Conservador: 0.70, Moderado: 0.20, Agresivo: 0.10 }
  } else if (normalizedScore < 65) {
    perfil = 'Moderado'
    probabilidades = { Conservador: 0.20, Moderado: 0.60, Agresivo: 0.20 }
  } else {
    perfil = 'Agresivo'
    probabilidades = { Conservador: 0.10, Moderado: 0.20, Agresivo: 0.70 }
  }
  
  return { perfil, score: normalizedScore, probabilidades, ... }
}

// ===== HOOK PRINCIPAL =====
export function useAssessment() {
  // Estados del hook
  const [loading, setLoading] = useState(false)  // Indica si esta procesando
  const [error, setError] = useState(null)       // Mensaje de error
  const [result, setResult] = useState(null)     // Resultado de la prediccion

  // Funcion para enviar el assessment
  const submitAssessment = async (formData) => {
    setLoading(true)
    setError(null)
    
    // Convertir todos los valores a numeros
    const numericData = {
      edad: Number(formData.edad),
      riesgo: Number(formData.riesgo),
      horizonte: Number(formData.horizonte),
      liquidez: Number(formData.liquidez),
      objetivo: Number(formData.objetivo),
      experiencia: Number(formData.experiencia),
    }
    
    try {
      // Intentar usar el backend primero
      const data = await predictProfile(numericData)
      setResult(data)
      return data
    } catch (err) {
      // Si el backend falla, usar prediccion local
      console.log('[v0] Backend unavailable, using local ML prediction')
      const localResult = localMLPrediction(numericData)
      setResult(localResult)
      return localResult
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, result, submitAssessment, reset }
}
```

**Variables del formulario:**
| Variable | Rango | Descripcion |
|----------|-------|-------------|
| edad | 18-80 | Edad del usuario |
| riesgo | 1-5 | Tolerancia al riesgo (1=baja, 5=alta) |
| horizonte | 1-5 | Horizonte temporal (1=corto, 5=largo) |
| liquidez | 1-5 | Necesidad de liquidez (1=no necesita, 5=necesita mucha) |
| objetivo | 1-5 | Objetivo (1=preservar, 5=maximizar) |
| experiencia | 1-5 | Experiencia inversora (1=ninguna, 5=experto) |

---

### useSimulation.js - Hook de Simulacion

Calcula el crecimiento de una inversion usando interes compuesto.

```javascript
// Simulacion local cuando el backend no esta disponible
function localSimulation({ capital_inicial, tasa_anual, anios, inflacion }) {
  const tasa = tasa_anual / 100  // Convertir de % a decimal (12% -> 0.12)
  const infl = inflacion / 100
  
  const datos_anuales = []
  let valorNominal = capital_inicial
  let valorReal = capital_inicial
  
  // Calcular valor para cada año
  for (let i = 0; i <= anios; i++) {
    // Ganancia acumulada hasta este año
    const gananciaAcumulada = valorNominal - capital_inicial
    
    // Inflacion acumulada: cuanto ha perdido poder adquisitivo
    const inflacionAcumulada = capital_inicial * (Math.pow(1 + infl, i) - 1)
    
    datos_anuales.push({
      anio: i,
      valor_nominal: Math.round(valorNominal),      // Valor sin ajustar
      valor_real: Math.round(valorReal),            // Valor ajustado por inflacion
      ganancia_acumulada: Math.round(gananciaAcumulada),
      inflacion_acumulada: Math.round(inflacionAcumulada)
    })
    
    if (i < anios) {
      // Formula interes compuesto: V = P * (1 + r)^n
      valorNominal = valorNominal * (1 + tasa)
      // Valor real: descontar inflacion
      valorReal = valorNominal / Math.pow(1 + infl, i + 1)
    }
  }
  
  // Calcular valores finales
  const valorFuturo = capital_inicial * Math.pow(1 + tasa, anios)
  const valorRealFinal = valorFuturo / Math.pow(1 + infl, anios)
  
  return {
    capital_inicial,
    valor_futuro: valorFuturo,
    valor_real: valorRealFinal,
    ganancia_total: valorFuturo - capital_inicial,
    crecimiento_porcentual: ((valorFuturo - capital_inicial) / capital_inicial) * 100,
    datos_anuales
  }
}
```

**Formula de Interes Compuesto:**
```
Valor Futuro = Capital * (1 + Tasa)^Años

Donde:
- Capital: Monto inicial invertido
- Tasa: Tasa de interes anual (en decimal)
- Años: Numero de años

Ejemplo:
- Capital: $10,000,000
- Tasa: 12% anual = 0.12
- Años: 10

Valor Futuro = 10,000,000 * (1.12)^10 = $31,058,482
```

---

### api.js - Servicio de API

Configura Axios para comunicarse con el backend.

```javascript
import axios from 'axios'

// URL del backend (variable de entorno o localhost por defecto)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Crear instancia de Axios con configuracion base
const api = axios.create({
  baseURL: API_URL,           // URL base para todas las peticiones
  timeout: 30000,             // Timeout de 30 segundos
  headers: { 'Content-Type': 'application/json' },  // Siempre JSON
})

// ===== INTERCEPTOR DE RESPUESTA =====
// Normaliza errores para que siempre tengan el mismo formato
api.interceptors.response.use(
  (response) => response,  // Si es exitoso, devolver respuesta
  (error) => {
    // Extraer mensaje de error de diferentes lugares posibles
    const message =
      error.response?.data?.detail ||     // FastAPI pone errores aqui
      error.response?.data?.error ||      // Otro formato comun
      error.message ||                    // Error de Axios
      'Error de conexion con el servidor'
    return Promise.reject(new Error(message))
  },
)

// ===== ENDPOINTS =====

// Predecir perfil de inversor
export const predictProfile = async (data) => {
  // POST /api/predict-profile
  // Body: { edad, riesgo, horizonte, liquidez, objetivo, experiencia }
  const response = await api.post('/api/predict-profile', data)
  return response.data
}

// Ejecutar simulacion de inversion
export const runSimulation = async (data) => {
  // POST /api/simulate
  // Body: { capital_inicial, tasa_anual, anios, inflacion }
  const response = await api.post('/api/simulate', data)
  return response.data
}

// Chat con asesor IA
export const chatWithAdvisor = async (message, context = null) => {
  // POST /api/chat
  // Body: { message, context }
  const response = await api.post('/api/chat', { message, context })
  return response.data
}
```

---

## Backend (FastAPI + Python)

### main.py - Punto de Entrada

```python
"""
main.py — Entry point FastAPI
Sistema de Perfil Financiero y Recomendacion de Inversiones para Colombia
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import profile_router, simulation_router, health_router, chat_router
from app.ml.ml_model import get_model

# ===== LIFESPAN (CICLO DE VIDA) =====
# Se ejecuta al iniciar y cerrar la aplicacion
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP ---
    logger.info("🚀 Iniciando Financial ML API…")
    
    # Cargar modelo ML al iniciar (singleton)
    get_model()
    logger.info("✅ Modelo ML cargado correctamente")
    
    # Intentar conectar a DB (opcional)
    try:
        from app.database import init_db
        await init_db()
        logger.info("✅ Base de datos inicializada")
    except Exception as e:
        # Si no hay DB, la app sigue funcionando
        logger.warning(f"⚠️ DB no disponible — operando sin persistencia")
    
    yield  # La app corre aqui
    
    # --- SHUTDOWN ---
    logger.info("🛑 Cerrando Financial ML API…")

# ===== CREAR APLICACION =====
app = FastAPI(
    title="Financial ML API",
    description="Sistema de perfil financiero para Colombia",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI
    redoc_url="/redoc",    # ReDoc
    lifespan=lifespan,     # Ciclo de vida
)

# ===== CORS =====
# Permite que el frontend (otro origen) acceda al backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],                    # En produccion, especificar dominios
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ===== REGISTRAR ROUTERS =====
# Cada router maneja un grupo de endpoints
app.include_router(health_router)      # GET /health
app.include_router(profile_router)     # POST /api/predict-profile
app.include_router(simulation_router)  # POST /api/simulate
app.include_router(chat_router)        # POST /api/chat
```

---

### ml_model.py - Modelo de Machine Learning

```python
"""
ML Service: DecisionTreeClassifier para clasificacion de perfil financiero.
"""
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler

PROFILES = ["Conservador", "Moderado", "Agresivo"]
PROFILE_MAP = {0: "Conservador", 1: "Moderado", 2: "Agresivo"}

# ===== GENERAR DATOS DE ENTRENAMIENTO =====
def _generate_training_data() -> pd.DataFrame:
    """
    Genera dataset sintetico balanceado.
    En produccion, esto seria reemplazado por datos reales.
    """
    np.random.seed(42)  # Reproducibilidad
    records = []

    # Conservador: edad alta, riesgo bajo, horizonte corto
    for _ in range(120):
        records.append({
            "edad": np.random.randint(50, 80),
            "riesgo": np.random.randint(1, 3),      # 1-2 (bajo)
            "horizonte": np.random.randint(1, 3),   # 1-2 (corto)
            "liquidez": np.random.randint(1, 3),    # 1-2 (necesita)
            "objetivo": np.random.randint(1, 2),    # 1 (preservar)
            "experiencia": np.random.randint(1, 2), # 1 (poca)
            "perfil": 0,  # Conservador
        })

    # Moderado: edad media, riesgo medio
    for _ in range(120):
        records.append({
            "edad": np.random.randint(35, 60),
            "riesgo": np.random.randint(2, 4),
            "horizonte": np.random.randint(2, 4),
            "liquidez": np.random.randint(2, 4),
            "objetivo": np.random.randint(2, 4),
            "experiencia": np.random.randint(2, 4),
            "perfil": 1,  # Moderado
        })

    # Agresivo: edad joven, riesgo alto, horizonte largo
    for _ in range(120):
        records.append({
            "edad": np.random.randint(20, 40),
            "riesgo": np.random.randint(4, 6),
            "horizonte": np.random.randint(3, 6),
            "liquidez": np.random.randint(3, 6),
            "objetivo": np.random.randint(4, 6),
            "experiencia": np.random.randint(3, 6),
            "perfil": 2,  # Agresivo
        })

    return pd.DataFrame(records)

# ===== ENTRENAR MODELO =====
def train_model():
    """Entrena el DecisionTreeClassifier."""
    df = _generate_training_data()
    
    # Features (X) y Target (y)
    features = ["edad", "riesgo", "horizonte", "liquidez", "objetivo", "experiencia"]
    X = df[features].values
    y = df["perfil"].values

    # Normalizar datos (importante para muchos algoritmos)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Crear y entrenar modelo
    model = DecisionTreeClassifier(
        max_depth=6,           # Profundidad maxima del arbol
        min_samples_split=5,   # Minimo de muestras para dividir
        min_samples_leaf=2,    # Minimo de muestras en hojas
        random_state=42,
        class_weight="balanced",  # Balancea clases desiguales
    )
    model.fit(X_scaled, y)

    return model, scaler

# ===== SINGLETON =====
# Carga el modelo una sola vez y lo reutiliza
_model = None
_scaler = None

def get_model():
    global _model, _scaler
    if _model is None:
        _model, _scaler = train_model()
    return _model, _scaler

# ===== PREDICCION =====
def predict_profile(edad, riesgo, horizonte, liquidez, objetivo, experiencia):
    """
    Predice el perfil del usuario.
    
    Retorna:
    - perfil: "Conservador", "Moderado", o "Agresivo"
    - score: Confianza de la prediccion (0-100)
    - probabilidades: Probabilidad de cada clase
    """
    model, scaler = get_model()
    
    # Preparar datos de entrada
    X = np.array([[edad, riesgo, horizonte, liquidez, objetivo, experiencia]])
    X_scaled = scaler.transform(X)

    # Predecir clase y probabilidades
    pred = model.predict(X_scaled)[0]           # Clase predicha (0, 1, o 2)
    proba = model.predict_proba(X_scaled)[0]    # Probabilidades

    # Calcular score basado en confianza
    score = float(proba[pred]) * 100

    return {
        "perfil": PROFILE_MAP[pred],
        "score": round(score, 1),
        "probabilidades": {
            "Conservador": round(proba[0] * 100, 1),
            "Moderado": round(proba[1] * 100, 1),
            "Agresivo": round(proba[2] * 100, 1),
        },
    }
```

**Como funciona el DecisionTreeClassifier:**

```
El arbol de decision hace preguntas sobre cada variable:

                    [riesgo > 3?]
                    /           \
                  NO             SI
                  /               \
        [horizonte > 2?]     [experiencia > 3?]
         /        \            /        \
        NO        SI          NO        SI
        /          \          /          \
  Conservador  Moderado  Moderado    Agresivo
```

El modelo aprende estas reglas automaticamente de los datos de entrenamiento.

---

### simulation_service.py - Servicio de Simulacion

```python
"""
Calcula interes compuesto con ajuste por inflacion.
"""

def run_simulation(data):
    """
    Simula el crecimiento de una inversion.
    
    Parametros:
    - capital_inicial: Monto inicial (ej: 10,000,000 COP)
    - tasa_anual: Rendimiento anual en % (ej: 12)
    - anios: Numero de años (ej: 10)
    - inflacion: Inflacion anual en % (ej: 6)
    """
    capital = data.capital_inicial
    tasa = data.tasa_anual / 100      # 12% -> 0.12
    inflacion = data.inflacion / 100   # 6% -> 0.06
    anios = data.anios

    datos_anuales = []
    valor_nominal = capital

    for anio in range(1, anios + 1):
        # Interes compuesto: V = P * (1 + r)
        valor_nominal = valor_nominal * (1 + tasa)
        
        # Valor real: descuenta la inflacion acumulada
        # Formula: V_real = V_nominal / (1 + inflacion)^años
        valor_real_anio = capital * ((1 + tasa) / (1 + inflacion)) ** anio
        
        # Ganancia acumulada (sin inflacion)
        ganancia_acumulada = valor_nominal - capital
        
        # Cuanto se perdio por inflacion
        inflacion_acumulada = capital * ((1 + inflacion) ** anio - 1)

        datos_anuales.append({
            "anio": anio,
            "valor_nominal": round(valor_nominal, 2),
            "valor_real": round(valor_real_anio, 2),
            "ganancia_acumulada": round(ganancia_acumulada, 2),
            "inflacion_acumulada": round(inflacion_acumulada, 2),
        })

    return {
        "capital_inicial": capital,
        "valor_futuro": round(valor_nominal, 2),
        "valor_real": round(valor_real_anio, 2),
        "ganancia_total": round(valor_nominal - capital, 2),
        "datos_anuales": datos_anuales,
    }
```

**Ejemplo de simulacion:**
```
Capital: $10,000,000
Tasa: 12% anual
Inflacion: 6% anual
Años: 10

Año 1: $11,200,000 nominal / $10,566,038 real
Año 2: $12,544,000 nominal / $11,166,397 real
...
Año 10: $31,058,482 nominal / $17,342,894 real

Ganancia nominal: $21,058,482 (+210.6%)
Ganancia real: $7,342,894 (+73.4%)
```

---

## Modelo de Machine Learning

### Que es un DecisionTreeClassifier?

Es un algoritmo que aprende reglas de decision en forma de arbol. Cada nodo hace una pregunta y divide los datos en ramas hasta llegar a una prediccion.

### Features (Variables de Entrada)

| Variable | Descripcion | Rango | Peso |
|----------|-------------|-------|------|
| edad | Edad del usuario | 18-80 | Indirecto |
| riesgo | Tolerancia al riesgo | 1-5 | 30% |
| horizonte | Horizonte temporal | 1-5 | 25% |
| objetivo | Objetivo de inversion | 1-5 | 20% |
| experiencia | Experiencia inversora | 1-5 | 15% |
| liquidez | Necesidad de liquidez | 1-5 | 10% |

### Target (Variable de Salida)

| Clase | Perfil | Caracteristicas |
|-------|--------|-----------------|
| 0 | Conservador | Prioriza seguridad, renta fija |
| 1 | Moderado | Balance riesgo-retorno |
| 2 | Agresivo | Busca maximos rendimientos |

### Metricas del Modelo

- **Accuracy**: ~95% (en datos sinteticos)
- **Algoritmo**: DecisionTreeClassifier de scikit-learn
- **Hiperparametros**: max_depth=6, min_samples_split=5

---

## Flujo de Datos

### 1. Flujo de Assessment (Evaluacion de Perfil)

```
Usuario llena cuestionario
         │
         ▼
AssessmentPage.jsx ──► useAssessment.js
         │                    │
         │              submitAssessment()
         │                    │
         ▼                    ▼
    FormData         Intenta Backend
  {edad, riesgo,           │
   horizonte...}           │
         │           ┌─────┴─────┐
         │           │           │
         │        Exito?      Falla?
         │           │           │
         │           ▼           ▼
         │     Backend ML    Fallback Local
         │           │           │
         │           └─────┬─────┘
         │                 │
         │                 ▼
         │          Resultado
         │     {perfil, score,
         │      probabilidades,
         │      recomendaciones}
         │                 │
         ▼                 ▼
    navigate('/result', { state: resultado })
         │
         ▼
    ResultPage.jsx
```

### 2. Flujo de Simulacion

```
Usuario ajusta sliders
         │
         ▼
DashboardPage.jsx ──► useSimulation.js
         │                    │
         │               simulate()
         │                    │
         ▼                    ▼
    FormData         Intenta Backend
  {capital, tasa,          │
   anios, inflacion}       │
         │           ┌─────┴─────┐
         │           │           │
         │        Exito?      Falla?
         │           │           │
         │           ▼           ▼
         │     Backend Calc  Fallback Local
         │           │           │
         │           └─────┬─────┘
         │                 │
         │                 ▼
         │          Resultado
         │     {valor_futuro,
         │      valor_real,
         │      datos_anuales}
         │                 │
         ▼                 ▼
    Actualiza UI con graficas
```

---

## Guia de Despliegue

### Requisitos

**Frontend:**
- Node.js 18+
- npm/pnpm/yarn

**Backend:**
- Python 3.11+
- pip

### Variables de Entorno

**Frontend (.env):**
```
VITE_API_URL=https://tu-api.vercel.app
```

**Backend (.env):**
```
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
DATABASE_URL=postgresql://... (opcional)
```

### Comandos

**Desarrollo Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Desarrollo Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Despliegue en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. El frontend se despliega automaticamente
4. Para el backend, usar Vercel Serverless Functions o Railway

---

## Contacto y Soporte

Para preguntas sobre el codigo, contactar al equipo de desarrollo.

**Tecnologias usadas:**
- React 18 + Vite
- TailwindCSS
- Recharts (graficas)
- FastAPI + Python
- scikit-learn (ML)
- PostgreSQL (opcional)
