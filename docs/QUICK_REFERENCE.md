# InvestIQ - Guia Rapida de Referencia

## Inicio Rapido

### Levantar Frontend
```bash
cd frontend
npm install
npm run dev
# Abre http://localhost:5173
```

### Levantar Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API en http://localhost:8000
# Docs en http://localhost:8000/docs
```

---

## Endpoints API

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor |
| POST | `/api/predict-profile` | Predice perfil de inversor |
| POST | `/api/simulate` | Simula inversion |
| POST | `/api/chat` | Chat con asesor IA |
| GET | `/api/recommendations?perfil=Moderado` | Obtiene recomendaciones |

### Ejemplo: Predecir Perfil
```bash
curl -X POST http://localhost:8000/api/predict-profile \
  -H "Content-Type: application/json" \
  -d '{
    "edad": 35,
    "riesgo": 3,
    "horizonte": 4,
    "liquidez": 2,
    "objetivo": 3,
    "experiencia": 3
  }'
```

**Respuesta:**
```json
{
  "perfil": "Moderado",
  "score": 78.5,
  "probabilidades": {
    "Conservador": 12.3,
    "Moderado": 78.5,
    "Agresivo": 9.2
  },
  "recomendaciones": [...]
}
```

### Ejemplo: Simular Inversion
```bash
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "capital_inicial": 10000000,
    "tasa_anual": 12,
    "anios": 10,
    "inflacion": 6
  }'
```

---

## Estructura de Componentes React

```
App.jsx
├── Navbar.jsx (navegacion)
├── HomePage.jsx (landing)
├── AssessmentPage.jsx (cuestionario)
│   └── useAssessment.js (hook)
├── ResultPage.jsx (resultados)
│   ├── ProfileBadge.jsx
│   ├── ProfileChart.jsx
│   └── RecommendationCard.jsx
├── DashboardPage.jsx (simulador)
│   ├── useSimulation.js (hook)
│   └── SimulationChart.jsx
└── AdvisorPage.jsx (chat IA)
    ├── useAdvisor.js (hook)
    ├── ChatMessage.jsx
    ├── ChatInput.jsx
    └── QuickActions.jsx
```

---

## Hooks Principales

### useAssessment
```javascript
const { loading, error, result, submitAssessment, reset } = useAssessment()

// Enviar evaluacion
await submitAssessment({
  edad: 35,
  riesgo: 3,
  horizonte: 4,
  liquidez: 2,
  objetivo: 3,
  experiencia: 3
})
```

### useSimulation
```javascript
const { loading, error, result, simulate, reset } = useSimulation()

// Simular inversion
await simulate({
  capital_inicial: 10000000,
  tasa_anual: 12,
  anios: 10,
  inflacion: 6
})
```

### useAdvisor
```javascript
const { messages, isLoading, sendMessage, clearHistory } = useAdvisor()

// Enviar mensaje
await sendMessage("Que es un CDT?")
```

---

## Modelo ML - Perfiles

| Perfil | Score | Caracteristicas |
|--------|-------|-----------------|
| Conservador | 0-35 | Riesgo bajo, preservar capital |
| Moderado | 35-65 | Balance riesgo-retorno |
| Agresivo | 65-100 | Alto riesgo, maximizar retornos |

### Variables de Entrada
| Variable | Descripcion | Peso |
|----------|-------------|------|
| riesgo | Tolerancia al riesgo (1-5) | 30% |
| horizonte | Anos de inversion (1-5) | 25% |
| objetivo | Meta financiera (1-5) | 20% |
| experiencia | Experiencia inversora (1-5) | 15% |
| liquidez | Necesidad liquidez (1-5) | 10% |

---

## Estilos TailwindCSS

### Clases Personalizadas
```css
.card          /* Tarjeta con borde y fondo */
.btn-primary   /* Boton verde principal */
.btn-secondary /* Boton con borde */
.input-field   /* Campo de texto */
.badge-green   /* Badge verde */
.badge-blue    /* Badge azul */
.badge-amber   /* Badge amarillo */
.gradient-text /* Texto con gradiente */
.animate-in    /* Animacion de entrada */
```

### Colores del Tema
```javascript
colors: {
  brand: { 500: '#22c55e' },  // Verde principal
  surface: '#0f1117',          // Fondo oscuro
  'surface-card': '#1a1d27',   // Fondo tarjetas
  'surface-border': '#2a2d3a', // Bordes
}
```

---

## Formulas Financieras

### Interes Compuesto
```
Valor_Futuro = Capital × (1 + Tasa)^Años
```

### Valor Real (ajustado por inflacion)
```
Valor_Real = Valor_Nominal / (1 + Inflacion)^Años
```

### Ejemplo
```
Capital: $10,000,000
Tasa: 12%
Inflacion: 6%
Años: 10

Valor Nominal = 10M × (1.12)^10 = $31,058,482
Valor Real = 31M / (1.06)^10 = $17,342,894
```

---

## Troubleshooting

### Frontend no conecta al backend
1. Verificar que el backend este corriendo
2. Revisar variable `VITE_API_URL`
3. La app tiene fallback local, funcionara sin backend

### Error de CORS
1. Agregar origen al backend en `config.py`
2. Verificar `ALLOWED_ORIGINS`

### Modelo ML no carga
1. El modelo se entrena automaticamente si no existe
2. Verificar permisos de escritura en `backend/app/ml/`

---

## Comandos Utiles

```bash
# Formatear codigo
npm run lint

# Build de produccion
npm run build

# Previsualizar build
npm run preview

# Tests backend
pytest

# Ver logs del modelo
python -c "from app.ml.ml_model import get_model; print(get_model())"
```
