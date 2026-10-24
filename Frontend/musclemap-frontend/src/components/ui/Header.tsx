import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { scrollToModelSection } from '../../utils/scrollNav'
import { ThemeToggle } from './ThemeToggle'
import { AuthModal } from './AuthModal'

interface HeaderProps {
  onNavigateHistory?: () => void
  onNavigateMap?: () => void
}

/** Top app header with logo, nav, and CTA controls. */
export function Header({ onNavigateHistory, onNavigateMap }: HeaderProps = {}) {
  const { theme } = useTheme()
  const { user, logout, isLoggedIn } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const scrollAbout = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onNavigateMap) onNavigateMap()
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleAuthSuccess(name: string) {
    setToast(`Welcome, ${name}!`)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-4"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
        }}
      >
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={onNavigateMap}
        >
          {/* Clean SVG logo instead of emoji */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-lg font-bold tracking-tight">MuscleMap</span>
        </div>
        <nav className="hidden gap-3 md:flex">
          <button
            type="button"
            onClick={() => {
              if (onNavigateMap) onNavigateMap()
              scrollToModelSection()
            }}
            className="glass rounded-full px-5 py-2 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Assessment
          </button>
          {onNavigateHistory && (
            <button
              type="button"
              onClick={onNavigateHistory}
              className="glass rounded-full px-5 py-2 text-sm font-semibold"
              style={{ color: 'var(--text-accent)' }}
            >
              History & Reports
            </button>
          )}
          <a href="#about" onClick={scrollAbout} className="glass rounded-full px-5 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            About
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="glass rounded-full px-5 py-2 text-sm"
                style={{ border: '1px solid var(--glass-border-accent)', color: 'var(--text-primary)' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="glass rounded-full px-5 py-2 text-sm font-medium"
              style={{ border: '1px solid var(--glass-border-accent)', color: 'var(--text-primary)' }}
            >
              Sign In
            </button>
          )}
          <button
            type="button"
            onClick={scrollToModelSection}
            className="glass-accent rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5"
            style={{ color: theme === 'dark' ? '#f8fafc' : 'var(--text-primary)' }}
          >
            Start Assessment
          </button>
        </div>
      </header>

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Welcome toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border-accent)',
            backdropFilter: 'blur(16px)',
            padding: '12px 24px',
            borderRadius: '999px',
            color: 'var(--text-accent)',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
        >
          {toast}
        </div>
      )}
    </>
  )
}
