import { useState } from 'react'

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta sobre inversiones..."
            disabled={disabled}
            rows={1}
            className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-3 pr-12
                       text-white placeholder-white/30 focus:outline-none focus:border-brand-500/60
                       focus:ring-1 focus:ring-brand-500/30 transition-all duration-200
                       resize-none min-h-[48px] max-h-32 disabled:opacity-50"
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="w-12 h-12 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:bg-surface-card
                     disabled:cursor-not-allowed flex items-center justify-center transition-all
                     duration-200 hover:shadow-lg hover:shadow-brand-500/25 active:scale-95
                     disabled:opacity-50 shrink-0"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  )
}
