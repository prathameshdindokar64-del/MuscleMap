import { useState } from 'react'
import { DURATION_OPTIONS, PAIN_TYPES, STRESS_LEVELS, TRIGGERS } from '../../constants/zones'
import type { AnalyzePainRequest } from '../../types'

/** Pain questionnaire form shown before analysis. */
export function Questionnaire({
  region,
  regionLabel,
  deviceId,
  isDarkTheme,
  onSubmit,
}: {
  region: string
  regionLabel: string
  deviceId: string
  isDarkTheme: boolean
  onSubmit: (payload: AnalyzePainRequest) => void
}) {
  const [painType, setPainType] = useState<AnalyzePainRequest['painType'] | ''>('')
  const [duration, setDuration] = useState<AnalyzePainRequest['duration'] | ''>('')
  const [intensity, setIntensity] = useState(5)
  const [stressLevel, setStressLevel] = useState<AnalyzePainRequest['stressLevel']>()
  const [trigger, setTrigger] = useState<AnalyzePainRequest['trigger']>()

  const canSubmit = Boolean(painType && duration && intensity >= 0)

  const chipActive = 'border-[var(--glass-border-accent)] bg-[var(--accent-glow)]'
  const chipIdle = isDarkTheme
    ? 'border-[var(--glass-border)] bg-[var(--input-bg)]'
    : 'border-[var(--glass-border)] bg-[var(--input-bg)]'

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold" style={{ color: 'var(--text-accent)' }}>
        {regionLabel}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {PAIN_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPainType(item.id)}
            className={`rounded-md border p-2 text-sm transition ${painType === item.id ? chipActive : chipIdle}`}
            style={{ color: 'var(--text-primary)' }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {DURATION_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setDuration(item.id)}
            className={`rounded-md border p-2 text-xs transition ${duration === item.id ? chipActive : chipIdle}`}
            style={{ color: 'var(--text-primary)' }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>
        <div className="text-3xl font-bold" style={{ color: 'var(--text-accent)' }}>
          {intensity}
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={intensity}
          onChange={(event) => setIntensity(Number(event.target.value))}
          className="w-full"
          style={{ accentColor: 'var(--accent)' }}
        />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
        Stress Level
      </p>
      <div className="flex flex-wrap gap-2">
        {STRESS_LEVELS.map((value) => (
          <button
            key={value}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
              stressLevel === value ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : chipIdle
            }`}
            style={{ color: stressLevel === value ? '#fff' : 'var(--text-primary)' }}
            onClick={() => setStressLevel(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
        Trigger
      </p>
      <div className="flex flex-wrap gap-2">
        {TRIGGERS.map((value) => (
          <button
            key={value}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
              trigger === value ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : chipIdle
            }`}
            style={{ color: trigger === value ? '#fff' : 'var(--text-primary)' }}
            onClick={() => setTrigger(value)}
          >
            {value.replace('_', ' ')}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!canSubmit}
        className="glass-accent w-full rounded-md p-3 font-semibold disabled:opacity-50"
        style={{ color: isDarkTheme ? '#f8fafc' : 'var(--text-primary)' }}
        onClick={() => painType && duration && onSubmit({ deviceId, region, painType, duration, intensity, stressLevel, trigger })}
      >
        Analyze My Pain →
      </button>
    </div>
  )
}
