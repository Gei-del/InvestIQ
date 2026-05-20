# 🧠 InvestIQ Colombia — Sistema Inteligente de Perfil Financiero

Sistema full-stack de clasificación de perfil financiero y recomendación de estrategias de inversión para Colombia, usando Machine Learning con FastAPI + React.

---

## 📐 Arquitectura

```
financial-ml-project/
│
├── backend/                        # FastAPI + Python 3.12
│   ├── app/
│   │   ├── main.py                 # Entry point, CORS, lifespan
│   │   ├── config.py               # Settings con pydantic-settings
│   │   ├── routes/
│   │   │   ├── profile.py          # POST /api/predict-profile, GET /api/recommendations
│   │   │   ├── simulation.py       # POST /api/simulate
│   │   │   └── health.py           # GET /health
│   │   ├── services/
│   │   │   ├── profile_service.py  # Orquesta ML + recomendaciones + DB
│   │   │   ├── simulation_service.py # Interés compuesto + inflación
│   │   │   └── financial_data_service.py # Instrumentos financieros Colombia
│   │   ├── ml/
│   │   │   └── ml_model.py         # DecisionTreeClassifier (joblib singleton)
│   │   ├── database/
│   │   │   └── connection.py       # SQLAlchemy async + init_db
│   │   ├── schemas/
│   │   │   └── schemas.py          # Pydantic v2 models
│   │   └── models/
│   │       └── db_models.py        # SQLAlchemy ORM (users, assessments, etc.)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                       # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── App.jsx                 # Router raíz
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing con perfiles y features
│   │   │   ├── AssessmentPage.jsx  # Formulario multi-paso (6 preguntas)
│   │   │   ├── ResultPage.jsx      # Resultado ML + recomendaciones
│   │   │   └── DashboardPage.jsx   # Simulador + gráficas + tabla anual
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   ├── ProfileBadge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorAlert.jsx
│   │   ├── charts/
│   │   │   ├── SimulationChart.jsx # AreaChart — proyección nominal vs real
│   │   │   ├── ProfileChart.jsx    # BarChart — probabilidades por perfil
│   │   │   └── ComparisonChart.jsx # RadarChart — comparación de perfiles
│   │   ├── hooks/
│   │   │   ├── useAssessment.js
│   │   │   └── useSimulation.js
│   │   ├── services/
│   │   │   └── api.js              # Axios con interceptors
│   │   └── utils/
│   │       └── format.js           # formatCOP, formatPct, profileColor
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── Dockerfile
│
├── docker-compose.yml              # Stack completo local
└── README.md
```

---

## 🚀 Inicio rápido (local sin Docker)

### 1. Backend

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL si usas PostgreSQL real
# Para probar sin DB: el sistema funciona en modo sin persistencia automáticamente

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor (el modelo ML se entrena automáticamente al arrancar)
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend

# Copiar variables de entorno
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Instalar dependencias
npm install

# Iniciar dev server
npm run dev
# → http://localhost:5173
```

---

## 🐳 Docker Compose (stack completo)

```bash
# Desde la raíz del proyecto
docker-compose up --build

# Servicios disponibles:
# Frontend  → http://localhost:3000
# Backend   → http://localhost:8000
# PostgreSQL→ localhost:5432
```

---

## 🔌 Endpoints API

| Método | Ruta                      | Descripción                                      |
|--------|---------------------------|--------------------------------------------------|
| GET    | `/health`                 | Estado del servicio + modelo ML                  |
| POST   | `/api/predict-profile`    | Clasifica perfil financiero con ML               |
| GET    | `/api/recommendations`    | Recomendaciones por perfil (`?perfil=Moderado`)  |
| POST   | `/api/simulate`           | Simulación de interés compuesto + inflación      |
| GET    | `/docs`                   | Swagger UI (interactivo)                         |
| GET    | `/redoc`                  | ReDoc UI                                         |

### POST `/api/predict-profile`

**Body:**
```json
{
  "edad": 35,
  "riesgo": 4,
  "horizonte": 4,
  "liquidez": 3,
  "objetivo": 4,
  "experiencia": 3
}
```

**Response:**
```json
{
  "id": "uuid",
  "perfil": "Moderado",
  "score": 87.5,
  "probabilidades": { "Conservador": 5.0, "Moderado": 87.5, "Agresivo": 7.5 },
  "descripcion": "Tu perfil es Moderado...",
  "caracteristicas": ["Prioridad: Balance riesgo-retorno", ...],
  "recomendaciones": [
    {
      "nombre": "ETF iShares MSCI ACWI",
      "tipo": "ETF Global",
      "riesgo_nivel": "Moderado",
      "rentabilidad_estimada": 9.5,
      "explicacion": "...",
      "datos_extra": { "ticker": "ACWI", "bolsa": "NASDAQ" }
    }
  ],
  "created_at": "2025-01-01T00:00:00"
}
```

### POST `/api/simulate`

**Body:**
```json
{
  "capital_inicial": 10000000,
  "tasa_anual": 12,
  "anios": 10,
  "inflacion": 6
}
```

**Response:**
```json
{
  "capital_inicial": 10000000,
  "valor_futuro": 31058482.08,
  "valor_real": 17342894.17,
  "crecimiento_porcentual": 210.58,
  "crecimiento_real_porcentual": 73.43,
  "ganancia_total": 21058482.08,
  "datos_anuales": [
    { "anio": 1, "valor_nominal": 11200000, "valor_real": 10566037.74, ... }
  ]
}
```

---

## 🤖 Machine Learning

- **Algoritmo:** `DecisionTreeClassifier` (scikit-learn)
- **Variables de entrada:** edad, riesgo (1–5), horizonte (1–5), liquidez (1–5), objetivo (1–5), experiencia (1–5)
- **Salida:** Conservador / Moderado / Agresivo
- **Dataset:** 360 registros sintéticos balanceados (120 por clase)
- **Preprocesamiento:** `StandardScaler`
- **Persistencia:** `joblib` (modelo se entrena una sola vez y se carga del disco)
- **Accuracy típica:** > 95% en test set

---

## 🌐 Despliegue en Producción

### Backend → Render.com

1. Conectar repositorio en [render.com](https://render.com)
2. Tipo: **Web Service**
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Variables de entorno:
   ```
   DATABASE_URL=postgresql+asyncpg://...  (Neon PostgreSQL)
   ENVIRONMENT=production
   ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   ```

### Frontend → Vercel

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Framework: **Vite**
3. Root Directory: `frontend`
4. Variables de entorno:
   ```
   VITE_API_URL=https://tu-backend.onrender.com
   ```

### Base de datos → Neon PostgreSQL

1. Crear proyecto en [neon.tech](https://neon.tech)
2. Copiar connection string
3. Usarlo como `DATABASE_URL` en Render
4. Las tablas se crean automáticamente al iniciar el backend (`init_db()`)

---

## ⚙️ Variables de Entorno

### Backend (`.env`)

| Variable           | Descripción                          | Ejemplo                                        |
|--------------------|--------------------------------------|------------------------------------------------|
| `DATABASE_URL`     | URL async PostgreSQL                 | `postgresql+asyncpg://user:pass@host/db`       |
| `SYNC_DATABASE_URL`| URL sync PostgreSQL (Alembic)        | `postgresql://user:pass@host/db`               |
| `ENVIRONMENT`      | `development` o `production`         | `production`                                   |
| `ALLOWED_ORIGINS`  | CORS origins separados por coma      | `https://investiq.vercel.app`                  |
| `SECRET_KEY`       | Clave secreta (para futuro JWT)      | `cambiar-en-produccion`                        |

### Frontend (`.env`)

| Variable        | Descripción            | Ejemplo                              |
|-----------------|------------------------|--------------------------------------|
| `VITE_API_URL`  | URL del backend        | `https://tu-backend.onrender.com`    |

---

## 📊 Instrumentos Financieros Incluidos

| Perfil       | Instrumento                   | Rentabilidad Est. |
|--------------|-------------------------------|-------------------|
| Conservador  | CDT Bancolombia               | 11.5%             |
| Conservador  | Bonos TES Colombia            | 12.8%             |
| Conservador  | Fondo FIC Conservador         | 10.2%             |
| Moderado     | ETF iShares MSCI ACWI         | 9.5%              |
| Moderado     | Fondo Mixto Porvenir          | 10.8%             |
| Moderado     | Acciones BVC Blue Chips       | 13.5%             |
| Agresivo     | ETF QQQ Nasdaq 100            | 17.2%             |
| Agresivo     | Acciones S&P 500              | 14.8%             |
| Agresivo     | Criptomonedas (simulación)    | 25.0%             |

---

## 🛠️ Stack Tecnológico

| Capa        | Tecnología                                        |
|-------------|---------------------------------------------------|
| Frontend    | React 18 + Vite + TailwindCSS + Recharts + Axios  |
| Backend     | FastAPI + Python 3.12 + Pydantic v2               |
| ML          | scikit-learn + pandas + numpy + joblib            |
| Base de datos | PostgreSQL + SQLAlchemy (async) + asyncpg       |
| Despliegue  | Vercel (FE) + Render (BE) + Neon (DB)            |
| Contenedores| Docker + Docker Compose + Nginx                   |

---

## 📁 Estructura de Base de Datos

```
users          → session_id, timestamps
assessments    → edad, riesgo, horizonte, liquidez, objetivo, experiencia, perfil, score
recommendations→ nombre, tipo, riesgo_nivel, rentabilidad_estimada, explicacion, datos_extra
simulations    → capital_inicial, tasa_anual, anios, inflacion, valor_futuro, datos_anuales
```

---

## 🔒 Características de Seguridad

- Validación de inputs con Pydantic v2 (rangos, tipos, constraints)
- CORS configurado por origen exacto
- Variables sensibles en `.env` (nunca en código)
- Manejo global de excepciones con logs
- Sin datos personales identificables (sesiones anónimas por UUID)

---

## 📌 Notas de Desarrollo

- El sistema **funciona sin PostgreSQL** (degrada graciosamente a modo sin persistencia)
- El modelo ML se **entrena automáticamente** si no existe `model.joblib`
- Los datos financieros son **mock educativos** — no constituyen asesoría financiera
- La criptomoneda está marcada explícitamente como **solo simulación**

---

> ⚠️ **Disclaimer:** Este sistema es educativo. Las rentabilidades mostradas son estimaciones históricas. Consulta un asesor financiero certificado antes de invertir.
