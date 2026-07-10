/**
 * PainChart.tsx
 * Line chart of pain intensity over time per body region (from assessment history).
 */
import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HistoryEntry } from '../../types'
import { REGION_DISPLAY_NAMES } from '../../constants/regions'

const REGION_LINE_COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#0f766e', '#115e59', '#134e4a']

/**
 * Builds a wide-format dataset for Recharts from history entries.
 */
function buildChartData(entries: HistoryEntry[]) {
  const sorted = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  const byDay = new Map<string, Record<string, string | number>>()

  for (const e of sorted) {
    const d = new Date(e.timestamp)
    const dayKey = d.toDateString()
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const row = byDay.get(dayKey) ?? { date: label }
    row[e.region] = e.intensity
    byDay.set(dayKey, row)
  }

  return Array.from(byDay.values())
}

/**
 * Pain intensity line chart in a glass card.
 */
export function PainChart({ history, isDarkTheme }: { history: HistoryEntry[]; isDarkTheme: boolean }) {
  const data = useMemo(() => buildChartData(history), [history])

  const regionKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const e of history) keys.add(e.region)
    return Array.from(keys)
  }, [history])

  const gridColor = isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const axisColor = isDarkTheme ? 'var(--text-muted)' : 'var(--text-muted)'

  if (history.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Complete an assessment to see your pain history chart.
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-4">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 11 }} />
          <YAxis domain={[0, 10]} tick={{ fill: axisColor, fontSize: 11 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div
                  className="glass rounded-lg p-3 text-xs shadow-lg"
                  style={{
                    borderColor: 'var(--glass-border-accent)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <p className="font-semibold">{label}</p>
                  {payload.map((pl) => {
                    const regionId = String(pl.dataKey ?? '')
                    const name = REGION_DISPLAY_NAMES[regionId] ?? regionId
                    return (
                      <p key={regionId} className="mt-1" style={{ color: pl.color }}>
                        {name}: {pl.value}/10
                      </p>
                    )
                  })}
                </div>
              )
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} formatter={(value) => REGION_DISPLAY_NAMES[value] ?? value} />
          {regionKeys.map((regionId, index) => (
            <Line
              key={regionId}
              type="monotone"
              dataKey={regionId}
              stroke={REGION_LINE_COLORS[index % REGION_LINE_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
