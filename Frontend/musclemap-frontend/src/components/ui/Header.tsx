import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { scrollToModelSection } from '../../utils/scrollNav'
import { ThemeToggle } from './ThemeToggle'
import { AuthModal } from './AuthModal'

/** Top app header with logo, nav, and CTA controls. */
export function Header() {
  const { theme } = useTheme()
  const { user, logout, isLoggedIn } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const scrollAbout = (e: React.MouseEvent) => {
    e.preventDefault()
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
        <div className="flex items-center gap-2">
          <span className="text-xl" style={{ color: 'var(--text-accent)' }}>
            🫀
          </span>
          <span className="font-bold">MuscleMap</span>
        </div>
        <nav className="hidden gap-3 md:flex">
          <button
            type="button"
            onClick={scrollToModelSection}
            className="glass rounded-full px-4 py-2 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Assessment
          </button>
          <a href="#about" onClick={scrollAbout} className="glass rounded-full px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            About
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="glass rounded-full px-4 py-2 text-sm"
                style={{ border: '1px solid var(--glass-border-accent)', color: 'var(--text-primary)' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="glass rounded-full px-4 py-2 text-sm font-medium"
              style={{ border: '1px solid var(--glass-border-accent)', color: 'var(--text-primary)' }}
            >
              Sign In
            </button>
          )}
          <button
            type="button"
            onClick={scrollToModelSection}
            className="glass-accent rounded-full px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm"
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
