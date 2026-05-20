import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      'Error de conexión con el servidor'
    return Promise.reject(new Error(message))
  },
)

// ── Endpoints ──────────────────────────────────────────────────────────────

/**
 * POST /api/predict-profile
 * @param {Object} data - { edad, riesgo, horizonte, liquidez, objetivo, experiencia }
 */
export const predictProfile = async (data) => {
  const response = await api.post('/api/predict-profile', data)
  return response.data
}

/**
 * POST /api/simulate
 * @param {Object} data - { capital_inicial, tasa_anual, anios, inflacion }
 */
export const runSimulation = async (data) => {
  const response = await api.post('/api/simulate', data)
  return response.data
}

/**
 * GET /api/recommendations?perfil=Moderado
 * @param {string} perfil
 */
export const getRecommendations = async (perfil) => {
  const response = await api.get('/api/recommendations', { params: { perfil } })
  return response.data
}

/**
 * GET /health
 */
export const getHealth = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
