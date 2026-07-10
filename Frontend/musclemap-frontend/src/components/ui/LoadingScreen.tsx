import { useProgress } from '@react-three/drei'

/** Fullscreen loading overlay while 3D assets initialize. */
export function LoadingScreen() {
  const { progress } = useProgress()
  const hidden = progress >= 100

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 transition-opacity duration-500 ${
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'var(--bg-page)',
        color: 'var(--text-muted)',
      }}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      <p>{Math.round(progress)}%</p>
      <p className="text-xs">Loading anatomy model by Diego Lujan Garcia...</p>
    </div>
  )
}
