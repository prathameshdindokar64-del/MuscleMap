/**
 * AboutSection.tsx
 * Full landing-style about content below the scroll experience, using glass cards.
 */
import { useTheme } from '../../context/ThemeContext'

const FEATURES = [
  {
    icon: '🫀',
    title: '3D Anatomy Visualization',
    body: 'Explore a detailed human muscle model. Click any region to identify the exact muscles involved in your pain.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Analysis',
    body: 'Our AI analyzes your pain profile and generates personalized exercise routines and acupressure guidance.',
  },
  {
    icon: '📊',
    title: 'Pain Tracking',
    body: 'Track your pain history over time with visual charts. See patterns and monitor your recovery progress.',
  },
] as const

const STEPS = [
  {
    n: '01',
    title: 'Select Your Pain Area',
    body: 'Rotate and zoom the 3D body model. Click the exact region where you feel pain. The model highlights the affected area.',
  },
  {
    n: '02',
    title: 'Describe Your Pain',
    body: 'Answer a short questionnaire about pain type, duration, intensity, and possible triggers. Takes less than 60 seconds.',
  },
  {
    n: '03',
    title: 'Get AI Guidance',
    body: 'Receive personalized exercise recommendations, acupressure point locations, and risk assessment powered by Google Gemini AI.',
  },
  {
    n: '04',
    title: 'Track & Improve',
    body: 'Save your assessments and track pain patterns over time. Export full reports as PDF for your healthcare provider.',
  },
] as const

const AUDIENCE = [
  { title: 'Office Workers', body: 'Neck, shoulder, and lower back pain from long hours at a desk' },
  { title: 'Fitness Enthusiasts', body: 'Post-workout muscle soreness and overuse injury prevention' },
  { title: 'Anyone in Pain', body: 'Quick self-assessment before deciding whether to see a doctor' },
  { title: 'Healthcare Students', body: 'Learn muscle anatomy through interactive 3D exploration' },
] as const

/**
 * About MuscleMap sections with glassmorphism layout.
 */
export function AboutSection() {
  const { theme } = useTheme()
  const sectionTint = theme === 'dark' ? 'rgba(2,2,7,0.95)' : 'rgba(232,244,251,0.95)'

  return (
    <section
      id="about"
      className="relative z-[2] px-4 py-[120px] md:px-10"
      style={{
        background: sectionTint,
        pointerEvents: 'auto',
        color: 'var(--text-primary)',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span
            className="inline-block rounded-full px-4 py-1 text-xs font-bold"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-accent)', color: 'var(--text-accent)' }}
          >
            About MuscleMap
          </span>
          <h2 className="mt-6 text-3xl font-bold md:text-4xl">Your Personal Muscle Health Companion</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg" style={{ color: 'var(--text-secondary)' }}>
            MuscleMap combines interactive 3D anatomy, AI-powered analysis, and traditional acupressure knowledge to help you understand and manage
            muscle pain from the comfort of your home.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="glass rounded-2xl p-6 text-left">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {f.body}
              </p>
            </article>
          ))}
        </div>

        <h2 className="mt-24 text-center text-3xl font-bold">How It Works</h2>
        <div className="mt-12 space-y-10">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`flex flex-col gap-4 md:flex-row md:items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black"
                style={{
                  background: 'var(--accent-glow)',
                  color: 'var(--text-accent)',
                  border: '1px solid var(--glass-border-accent)',
                }}
              >
                {step.n}
              </div>
              <div className="glass flex-1 rounded-2xl p-6">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-24 text-center text-3xl font-bold">Who Is MuscleMap For?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {AUDIENCE.map((a) => (
            <article key={a.title} className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {a.body}
              </p>
            </article>
          ))}
        </div>

        <div
          className="glass mt-20 rounded-2xl border p-8"
          style={{
            background: 'var(--disclaimer-bg)',
            borderColor: 'var(--disclaimer-border)',
            color: 'var(--disclaimer-text)',
          }}
        >
          <h3 className="flex items-center gap-2 text-lg font-bold">⚠️ Important Medical Disclaimer</h3>
          <p className="mt-4 text-sm leading-relaxed">
            MuscleMap is an educational tool designed to provide general information about muscle anatomy and self-care techniques. It is NOT a
            substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Always consult a qualified healthcare professional for persistent, severe, or worsening pain. If you experience chest pain, numbness,
            weakness, or loss of bladder/bowel control — seek emergency medical attention immediately.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            The AI-generated recommendations are for informational purposes only and should not replace medical consultation.
          </p>
        </div>
      </div>
    </section>
  )
}
