import { useEffect, useState } from 'react'
import { getHistory } from '../../api/painApi'
import type { HistoryEntry } from '../../types'
import { RiskBadge } from './RiskBadge'

/** Collapsible or flat history list for recent assessments. */
export function HistoryAccordion({
  deviceId,
  entries: controlledEntries,
  embedded,
}: {
  deviceId: string
  isDarkTheme?: boolean
  /** When set (e.g. from parent refresh), skips internal fetch. */
  entries?: HistoryEntry[]
  /** When true, shows an open list suitable for the History tab. */
  embedded?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [fetchedItems, setFetchedItems] = useState<HistoryEntry[]>([])

  useEffect(() => {
    if (controlledEntries != null) return
    getHistory(deviceId).then(setFetchedItems).catch(() => setFetchedItems([]))
  }, [deviceId, controlledEntries])

  const historyItems = controlledEntries ?? fetchedItems

  const list = (
    <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
      {historyItems.map((entry) => (
        <div key={entry.id} className="glass rounded-lg p-2" style={{ color: 'var(--text-primary)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date(entry.timestamp).toLocaleString()}
          </p>
          <p className="text-sm font-medium">
            {entry.regionName} - Intensity {entry.intensity}
          </p>
          <RiskBadge risk={entry.riskLevel} />
        </div>
      ))}
      {historyItems.length === 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No history found.</p>}
    </div>
  )

  if (embedded) {
    return (
      <section>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Past entries
        </p>
        {list}
      </section>
    )
  }

  return (
    <section className="glass mt-6 rounded-lg p-3">
      <button type="button" className="flex w-full items-center justify-between text-sm font-semibold" onClick={() => setOpen((s) => !s)}>
        Recent Assessments <span>{open ? '⌃' : '⌄'}</span>
      </button>
      {open && list}
    </section>
  )
}
