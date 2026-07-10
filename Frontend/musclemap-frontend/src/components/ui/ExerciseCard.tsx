import type { Exercise } from '../../types'

/** Displays one exercise recommendation card. */
export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <article
      className="glass rounded-lg border-l-4 p-4"
      style={{
        borderLeftColor: 'var(--accent)',
        color: 'var(--text-primary)',
      }}
    >
      <h4 className="font-semibold">{exercise.title}</h4>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {exercise.instructions}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {exercise.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full px-2 py-0.5 text-xs"
            style={{ background: 'var(--glass-bg-strong)', color: 'var(--text-accent)', border: '1px solid var(--glass-border-accent)' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
