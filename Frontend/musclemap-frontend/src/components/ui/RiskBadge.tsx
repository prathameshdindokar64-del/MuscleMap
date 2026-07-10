import type { RiskLevel } from '../../types'

const RISK_STYLES: Record<RiskLevel, { icon: string; color: string; bg: string }> = {
  mild: { icon: '✓', color: 'var(--risk-mild)', bg: 'rgba(34, 197, 94, 0.12)' },
  moderate: { icon: '⚠', color: 'var(--risk-moderate)', bg: 'rgba(245, 158, 11, 0.12)' },
  severe: { icon: '⚡', color: 'var(--risk-severe)', bg: 'rgba(239, 68, 68, 0.12)' },
  red_flag: { icon: '⚠', color: '#fecaca', bg: 'var(--risk-redflag)' },
}

/** Color-coded risk badge for assessment output. */
export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const item = RISK_STYLES[risk]
  return (
    <div
      className="mx-auto flex w-full items-center justify-center gap-2 rounded-xl p-3 font-semibold"
      style={{ color: item.color, background: item.bg, border: `1px solid ${item.color}` }}
    >
      <span>{item.icon}</span>
      <span>{risk.replace('_', ' ').toUpperCase()}</span>
    </div>
  )
}
