export default function LoadingSpinner({ message = 'Analizando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-surface-border animate-spin border-t-brand-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-brand-400 text-xl">⚡</span>
        </div>
      </div>
      <p className="text-white/50 font-mono text-sm animate-pulse">{message}</p>
    </div>
  )
}
