/**
 * HeatmapLegend.tsx
 * Floating, elegant control and legend HUD for the 3D Body Heatmap.
 * Designed with large readable typography and high contrast for seniors.
 */
import { useTheme } from '../../context/ThemeContext'

interface HeatmapLegendProps {
  isOpen: boolean
  onToggle: () => void
  viewMode: 'history' | 'common'
  onChangeViewMode: (mode: 'history' | 'common') => void
  historyCount: number
}

export function HeatmapLegend({
  isOpen,
  onToggle,
  viewMode,
  onChangeViewMode,
  historyCount,
}: HeatmapLegendProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="fixed bottom-6 left-6 z-30 max-w-sm">
      {/* Trigger Button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold shadow-xl transition hover:scale-105"
          style={{
            background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid var(--glass-border-accent)',
            color: 'var(--text-primary)',
            boxShadow: '0 8px 30px rgba(13, 148, 136, 0.25)',
          }}
          aria-label="Open Tension Heatmap"
        >
          {/* Medical Thermal Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-accent)' }}>
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
          </svg>
          <span>Body Heatmap</span>
          {historyCount > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: 'var(--accent)' }}
            >
              {historyCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded HUD Card */}
      {isOpen && (
        <div
          className="rounded-2xl p-5 shadow-2xl transition-all"
          style={{
            background: isDark ? 'rgba(11, 19, 36, 0.95)' : 'rgba(255, 255, 255, 0.97)',
            border: '1.5px solid var(--glass-border-accent)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: 'var(--accent-glow)', color: 'var(--text-accent)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                </svg>
              </span>
              <div>
                <h4 className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  Tension Heatmap
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Visualizing muscle load on the body
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition hover:bg-slate-500/20"
              style={{ color: 'var(--text-secondary)' }}
              title="Close Heatmap"
            >
              ×
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="mt-3.5 flex gap-1.5 rounded-xl p-1" style={{ background: isDark ? 'rgba(2, 6, 23, 0.6)' : 'rgba(241, 245, 249, 0.9)' }}>
            <button
              type="button"
              onClick={() => onChangeViewMode('common')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                viewMode === 'common' ? 'shadow' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                background: viewMode === 'common' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'common' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              Common Hotspots
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('history')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                viewMode === 'history' ? 'shadow' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                background: viewMode === 'history' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'history' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              Your History ({historyCount})
            </button>
          </div>

          {/* Context Note */}
          <p className="mt-2.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {viewMode === 'history' && historyCount > 0 && (
              <>Showing tension areas from your previous checkups. Tap any glowing area on the body to assess it.</>
            )}
            {viewMode === 'history' && historyCount === 0 && (
              <>You haven&apos;t logged any checkups yet. Switch to <strong>Common Hotspots</strong> or tap any muscle on the model to begin.</>
            )}
            {viewMode === 'common' && (
              <>Displaying common ergonomic tension patterns (neck, lower back, shoulders). Tap any glowing hotspot to inspect.</>
            )}
          </p>

          {/* Legend Scales */}
          <div className="mt-3.5 space-y-2 rounded-xl p-3" style={{ background: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)' }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Tension Severity Guide
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>Mild Tension</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span>Moderate Strain</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span>High Strain</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
