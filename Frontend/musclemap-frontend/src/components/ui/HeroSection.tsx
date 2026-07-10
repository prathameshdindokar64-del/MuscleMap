/**
 * HeroSection.tsx
 * Full screen landing overlay that sits on top of the 3D canvas.
 * Fades out when the user scrolls down or clicks Start Assessment.
 * Uses glassmorphism — the 3D model is visible behind it.
 */
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { scrollToModelSection } from '../../utils/scrollNav'

/**
 * Landing hero overlay with CTAs and scroll hint.
 */
export function HeroSection() {
  const { theme } = useTheme()
  const [showHero, setShowHero] = useState(true)
  const [exiting, setExiting] = useState(false)

  const dismiss = useCallback(() => {
    setExiting(true)
    window.setTimeout(() => setShowHero(false), 500)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (!showHero || exiting) return
      if (window.scrollY > window.innerHeight * 0.1) {
        dismiss()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [showHero, exiting, dismiss])

  const startAssessment = () => {
    scrollToModelSection()
    dismiss()
  }

  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  const restoreHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setShowHero(true)
    setExiting(false)
  }

  return (
    <>
      {showHero && (
        <div
          className={`pointer-events-auto fixed inset-0 z-20 flex items-center justify-center px-4 transition-all duration-500 ease-out ${
            exiting ? 'translate-y-[-20px] opacity-0' : 'translate-y-0 opacity-100'
          }`}
          style={{ background: 'rgba(0,0,0,0)' }}
        >
          <div
            className="glass max-w-lg rounded-3xl p-10 text-center md:max-w-xl md:p-12"
            style={{
              color: 'var(--text-primary)',
            }}
          >
            <p
              className="mb-4 inline-block rounded-full px-4 py-1 text-xs font-semibold tracking-wide"
              style={{
                background: 'var(--glass-bg-strong)',
                border: '1px solid var(--glass-border-accent)',
                color: 'var(--text-accent)',
              }}
            >
              AI-Powered · Acupressure · Anatomy
            </p>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Understand Your
              <br />
              Muscles.
              <br />
              Heal Smarter.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed md:text-base" style={{ color: 'var(--text-secondary)' }}>
              Click any region on the 3D anatomy model to identify affected muscles, get AI-guided exercises, and discover acupressure points for
              natural pain relief.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startAssessment}
                className="glass-accent w-full rounded-full px-8 py-3 text-sm font-semibold sm:w-auto"
                style={{ color: theme === 'dark' ? '#f8fafc' : 'var(--text-primary)' }}
              >
                Start Assessment →
              </button>
              <a
                href="#about"
                onClick={scrollToAbout}
                className="glass w-full rounded-full px-8 py-3 text-center text-sm font-semibold sm:w-auto"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }}
              >
                Learn More
              </a>
            </div>
          </div>
          <div
            className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="animate-bounce text-lg">↓</span>
            <span>Scroll to explore</span>
          </div>
        </div>
      )}
      {!showHero && (
        <button
          type="button"
          onClick={restoreHero}
          className="glass fixed bottom-24 left-4 z-20 rounded-full px-4 py-2 text-xs font-medium shadow-lg"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--glass-border-accent)' }}
        >
          ← Back to top
        </button>
      )}
    </>
  )
}
