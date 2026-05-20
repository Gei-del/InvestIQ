export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="card p-5 border-red-500/30 bg-red-500/5">
      <div className="flex items-start gap-3">
        <span className="text-red-400 text-xl shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="text-red-400 font-semibold text-sm mb-1">Error</p>
          <p className="text-white/60 text-sm">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 btn-secondary text-sm py-2">
          Reintentar
        </button>
      )}
    </div>
  )
}
