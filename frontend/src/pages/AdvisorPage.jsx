import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import QuickActions from '../components/QuickActions'
import { useAdvisor } from '../hooks/useAdvisor'

export default function AdvisorPage() {
  const { messages, isTyping, sendMessage, clearChat } = useAdvisor()
  const messagesEndRef = useRef(null)
  const [showWelcome, setShowWelcome] = useState(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (messages.length > 1) {
      setShowWelcome(false)
    }
  }, [messages])

  const handleQuickAction = (question) => {
    sendMessage(question)
    setShowWelcome(false)
  }

  const userProfile = (() => {
    try {
      const stored = localStorage.getItem('investiq_profile')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })()

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      {/* Header */}
      <div className="border-b border-surface-border bg-surface/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display font-semibold text-white text-lg">Asesor IA</h1>
              <p className="text-white/40 text-xs">
                {userProfile ? `Perfil: ${userProfile.perfil}` : 'Tu asistente financiero personal'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                className="text-white/40 hover:text-white/60 text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                Limpiar chat
              </button>
            )}
            <Link to="/dashboard" className="btn-secondary text-sm py-2 px-4">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Welcome Section */}
          {showWelcome && messages.length <= 1 && (
            <div className="text-center mb-8 animate-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">
                Hola, soy tu Asesor Financiero IA
              </h2>
              <p className="text-white/50 max-w-md mx-auto mb-6 leading-relaxed">
                Estoy aqui para ayudarte con tus dudas sobre inversiones, ahorro y finanzas personales en Colombia.
                {userProfile && (
                  <span className="block mt-2 text-brand-400">
                    Ya conozco tu perfil {userProfile.perfil}, asi que puedo darte consejos personalizados.
                  </span>
                )}
              </p>
              
              <QuickActions onSelect={handleQuickAction} userProfile={userProfile} />
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-3 animate-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="card px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-surface-border bg-surface/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput onSend={sendMessage} disabled={isTyping} />
          <p className="text-white/30 text-xs text-center mt-2">
            Las respuestas son orientativas. Consulta siempre con un profesional financiero certificado.
          </p>
        </div>
      </div>
    </div>
  )
}
