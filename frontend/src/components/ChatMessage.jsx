import { useState } from 'react'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState(null)
  
  const handleFeedback = (type) => {
    setFeedback(type)
    // Save feedback to localStorage for future ML training
    try {
      const feedbackData = JSON.parse(localStorage.getItem('investiq_feedback') || '[]')
      feedbackData.push({
        message: message.content,
        feedback: type,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('investiq_feedback', JSON.stringify(feedbackData.slice(-100)))
    } catch {
      // Ignore
    }
  }
  
  return (
    <div className={`flex items-start gap-3 animate-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
        isUser 
          ? 'bg-gradient-to-br from-white/20 to-white/5 border border-white/10' 
          : 'bg-gradient-to-br from-brand-500 to-blue-600 shadow-brand-500/20'
      }`}>
        {isUser ? (
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </div>

      {/* Message Bubble */}
      <div 
        className={`max-w-[85%] group ${isUser ? 'text-right' : ''}`}
        onMouseEnter={() => !isUser && setShowFeedback(true)}
        onMouseLeave={() => setShowFeedback(false)}
      >
        <div className={`inline-block rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-sm shadow-lg shadow-brand-500/20' 
            : 'bg-surface-card border border-surface-border rounded-tl-sm'
        }`}>
          <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-white/85'}`}>
            <FormattedContent content={message.content} isUser={isUser} />
          </div>
        </div>
        
        {/* Feedback buttons for assistant messages */}
        {!isUser && (
          <div className={`flex items-center gap-2 mt-1.5 transition-opacity duration-200 ${showFeedback || feedback ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-white/30 text-xs">Fue util?</span>
            <button
              onClick={() => handleFeedback('helpful')}
              className={`p-1 rounded transition-colors ${
                feedback === 'helpful' 
                  ? 'text-brand-400' 
                  : 'text-white/30 hover:text-brand-400'
              }`}
              title="Si, fue util"
            >
              <svg className="w-4 h-4" fill={feedback === 'helpful' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button
              onClick={() => handleFeedback('not_helpful')}
              className={`p-1 rounded transition-colors ${
                feedback === 'not_helpful' 
                  ? 'text-red-400' 
                  : 'text-white/30 hover:text-red-400'
              }`}
              title="No fue util"
            >
              <svg className="w-4 h-4" fill={feedback === 'not_helpful' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Timestamp */}
        {!showFeedback && !feedback && (
          <p className={`text-white/25 text-xs mt-1 ${isUser ? 'text-right' : ''}`}>
            {message.timestamp ? formatTime(message.timestamp) : ''}
          </p>
        )}
      </div>
    </div>
  )
}

// Component to format markdown-like content
function FormattedContent({ content, isUser }) {
  if (isUser) {
    return <span>{content}</span>
  }
  
  // Parse content for formatting
  const lines = content.split('\n')
  
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        // Empty line
        if (!line.trim()) {
          return <div key={idx} className="h-2" />
        }
        
        // Headers (bold with **)
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <h4 key={idx} className="font-semibold text-white mt-3 first:mt-0">
              {line.replace(/\*\*/g, '')}
            </h4>
          )
        }
        
        // Headers with content after colon
        if (line.match(/^\*\*[^*]+\*\*:/)) {
          const [header, ...rest] = line.split(':')
          return (
            <p key={idx}>
              <span className="font-semibold text-white">{header.replace(/\*\*/g, '')}:</span>
              <span className="text-white/80">{rest.join(':')}</span>
            </p>
          )
        }
        
        // List items with bold
        if (line.match(/^[-•]\s*\*\*/)) {
          const match = line.match(/^[-•]\s*\*\*([^*]+)\*\*(.*)/)
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1">
                <span className="text-brand-400 mt-0.5">•</span>
                <span>
                  <span className="font-medium text-white">{match[1]}</span>
                  <span className="text-white/70">{match[2]}</span>
                </span>
              </div>
            )
          }
        }
        
        // Regular list items
        if (line.match(/^[-•]\s/)) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className="text-brand-400 mt-0.5">•</span>
              <span className="text-white/80">{formatInlineText(line.replace(/^[-•]\s*/, ''))}</span>
            </div>
          )
        }
        
        // Numbered lists
        if (line.match(/^\d+\.\s/)) {
          const num = line.match(/^(\d+)\./)[1]
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className="text-brand-400 font-mono text-xs w-5 text-right shrink-0 mt-0.5">{num}.</span>
              <span className="text-white/80">{formatInlineText(line.replace(/^\d+\.\s*/, ''))}</span>
            </div>
          )
        }
        
        // Table-like content
        if (line.includes('|') && line.trim().startsWith('|')) {
          const cells = line.split('|').filter(c => c.trim())
          if (cells.length > 0 && !line.includes('---')) {
            return (
              <div key={idx} className="flex gap-4 text-xs font-mono py-1 border-b border-surface-border/30">
                {cells.map((cell, i) => (
                  <span key={i} className={`${i === 0 ? 'w-24 text-white/50' : 'flex-1 text-white/80'}`}>
                    {cell.trim()}
                  </span>
                ))}
              </div>
            )
          }
          return null
        }
        
        // Regular paragraph
        return (
          <p key={idx} className="text-white/80">
            {formatInlineText(line)}
          </p>
        )
      })}
    </div>
  )
}

// Format inline text (bold, etc)
function formatInlineText(text) {
  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={idx} className="font-semibold text-white">{part.slice(2, -2)}</span>
    }
    return <span key={idx}>{part}</span>
  })
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
