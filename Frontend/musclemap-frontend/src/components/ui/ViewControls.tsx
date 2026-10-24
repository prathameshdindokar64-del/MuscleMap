/**
 * ViewControls.tsx
 * Large, accessible camera angle switcher and gentle guidance banner
 * designed specifically for seniors and users who prefer simple controls.
 */
import { useTheme } from '../../context/ThemeContext'
import type { ViewPreset } from '../scene/CameraPresetController'

interface ViewControlsProps {
  currentPreset: ViewPreset | null
  onSelectPreset: (preset: ViewPreset) => void
  hasSelectedRegion: boolean
}

export function ViewControls({
  currentPreset,
  onSelectPreset,
  hasSelectedRegion,
}: ViewControlsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 px-4">
      {/* Friendly Guide Banner */}
      {!hasSelectedRegion && (
        <div
          className="pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold shadow-lg backdrop-blur-md md:text-sm"
          style={{
            background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
            border: '1px solid var(--glass-border-accent)',
            color: 'var(--text-primary)',
          }}
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ background: 'var(--accent)', color: '#ffffff' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <span>Click any muscle on the model to begin a checkup</span>
        </div>
      )}

      {/* Accessible Camera Angle Controls */}
      <div
        className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full p-1.5 shadow-2xl backdrop-blur-md md:gap-2 md:p-2"
        style={{
          background: isDark ? 'rgba(11, 19, 36, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          border: '1.5px solid var(--glass-border-accent)',
        }}
        role="group"
        aria-label="3D Model View Controls"
      >
        <button
          type="button"
          onClick={() => onSelectPreset('front')}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition md:px-4 md:text-sm ${
            currentPreset === 'front' ? 'shadow-md' : 'hover:bg-slate-500/10'
          }`}
          style={{
            background: currentPreset === 'front' ? 'var(--accent)' : 'transparent',
            color: currentPreset === 'front' ? '#ffffff' : 'var(--text-primary)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span>Front</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset('back')}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition md:px-4 md:text-sm ${
            currentPreset === 'back' ? 'shadow-md' : 'hover:bg-slate-500/10'
          }`}
          style={{
            background: currentPreset === 'back' ? 'var(--accent)' : 'transparent',
            color: currentPreset === 'back' ? '#ffffff' : 'var(--text-primary)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset('upper')}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition md:px-4 md:text-sm ${
            currentPreset === 'upper' ? 'shadow-md' : 'hover:bg-slate-500/10'
          }`}
          style={{
            background: currentPreset === 'upper' ? 'var(--accent)' : 'transparent',
            color: currentPreset === 'upper' ? '#ffffff' : 'var(--text-primary)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span>Upper Body</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset('lower')}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition md:px-4 md:text-sm ${
            currentPreset === 'lower' ? 'shadow-md' : 'hover:bg-slate-500/10'
          }`}
          style={{
            background: currentPreset === 'lower' ? 'var(--accent)' : 'transparent',
            color: currentPreset === 'lower' ? '#ffffff' : 'var(--text-primary)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>Lower Body</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset('reset')}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition hover:bg-slate-500/10 md:px-4 md:text-sm"
          style={{ color: 'var(--text-muted)' }}
          title="Reset Camera"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
