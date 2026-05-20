import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AssessmentPage from './pages/AssessmentPage'
import ResultPage from './pages/ResultPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-8xl font-bold gradient-text mb-4">404</p>
                  <p className="text-white/50 mb-6">Página no encontrada</p>
                  <a href="/" className="btn-primary">Ir al inicio</a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
