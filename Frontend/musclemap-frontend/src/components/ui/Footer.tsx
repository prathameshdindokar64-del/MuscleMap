/**
 * Footer.tsx
 * Compact glass footer for attribution and polish.
 */
export function Footer() {
  return (
    <footer
      className="glass relative z-[2] border-t px-4 py-3 text-center text-xs"
      style={{
        borderColor: 'var(--glass-border)',
        color: 'var(--text-muted)',
        pointerEvents: 'auto',
      }}
    >
      3D Model by Diego Lujan Garcia (CC BY) · MuscleMap
    </footer>
  )
}
