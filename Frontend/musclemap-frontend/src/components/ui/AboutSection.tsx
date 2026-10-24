/**
 * AboutSection.tsx
 * Comprehensive educational overview below the 3D canvas.
 * Clean, clinical aesthetics with zero emojis and humanized medical guidance.
 */
import { useTheme } from '../../context/ThemeContext'

export function AboutSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const sectionTint = isDark ? 'rgba(2, 6, 23, 0.96)' : 'rgba(248, 250, 252, 0.98)'

  return (
    <section
      id="about"
      className="relative z-[2] px-6 py-24 md:px-12"
      style={{
        background: sectionTint,
        pointerEvents: 'auto',
        color: 'var(--text-primary)',
      }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border-accent)',
              color: 'var(--text-accent)',
            }}
          >
            Clinical Self-Care Resource
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">
            Thoughtful Muscle Health & Mobility Guidance
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            MuscleMap bridges full 3D human anatomy, structured symptom evaluation, and traditional acupressure points to help you understand tension patterns and safely support your mobility.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <article className="glass rounded-2xl p-7 text-left">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-glow)', color: 'var(--text-accent)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.77.78L12 21.01l7.65-7.65.77-.78a5.4 5.4 0 0 0 0-7.65z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold">Interactive Anatomy</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Explore deep and superficial muscle groups. Tap any region to inspect involved anatomical structures and pinpoint where strain originates.
            </p>
          </article>

          <article className="glass rounded-2xl p-7 text-left">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-glow)', color: 'var(--text-accent)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                <line x1="9" y1="21" x2="15" y2="21" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold">Structured Guidance</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Answer straightforward questions about pain type and intensity to receive gentle mobility routines, posture suggestions, and acupressure points.
            </p>
          </article>

          <article className="glass rounded-2xl p-7 text-left">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-glow)', color: 'var(--text-accent)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold">Progress Tracking</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Log checkups over time. Review visual pain logs and generate clean summary reports you can easily share with your physical therapist or physician.
            </p>
          </article>
        </div>

        {/* Step-by-Step Walkthrough */}
        <h3 className="mt-20 text-center text-2xl font-bold md:text-3xl">How It Works</h3>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: '1',
              title: 'Locate Your Discomfort',
              desc: 'Select the area where you feel stiffness or soreness on the 3D model.',
            },
            {
              n: '2',
              title: 'Answer Key Questions',
              desc: 'Select pain intensity, duration, and whether physical strain or stress contributed.',
            },
            {
              n: '3',
              title: 'Review Self-Care Steps',
              desc: 'Get targeted gentle stretches, posture adjustments, and acupressure instructions.',
            },
            {
              n: '4',
              title: 'Monitor Recovery',
              desc: 'Track changes over time with visual history logs and optional PDF export.',
            },
          ].map((step) => (
            <div key={step.n} className="glass rounded-2xl p-6 text-left">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
                style={{
                  background: 'var(--accent)',
                  color: '#ffffff',
                }}
              >
                {step.n}
              </span>
              <h4 className="mt-4 text-base font-bold">{step.title}</h4>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Medical Disclaimer */}
        <div
          className="mt-16 rounded-2xl p-7 border"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.9)',
            borderColor: 'var(--glass-border-accent)',
          }}
        >
          <div className="flex items-start gap-3.5">
            <span className="mt-0.5 shrink-0 text-amber-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <div className="space-y-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Important Health & Safety Notice
              </h4>
              <p>
                MuscleMap is an educational resource intended to support personal wellness, anatomical learning, and self-care routines. It does not provide medical diagnoses or replace clinical examination by a licensed medical practitioner.
              </p>
              <p>
                If your discomfort is severe, sudden, radiates to your chest or jaw, causes shortness of breath, or is accompanied by numbness or weakness, please seek emergency medical attention right away.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
