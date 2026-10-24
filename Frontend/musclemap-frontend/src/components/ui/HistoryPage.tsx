/**
 * HistoryPage.tsx
 * Paginated assessment history page with delete confirmation, risk badges, and session reopening.
 */

import { useEffect, useState } from 'react'
import { getSessions, deleteSession } from '../../api/painApi'
import { RiskBadge } from './RiskBadge'
import type { HistoryEntry } from '../../types'

interface HistoryPageProps {
  deviceId: string
  isDarkTheme: boolean
  onOpenSession: (sessionId: string) => void
  onBackToMap: () => void
}

const PAGE_SIZE = 10

export function HistoryPage({
  deviceId,
  isDarkTheme: _isDarkTheme,
  onOpenSession,
  onBackToMap,
}: HistoryPageProps) {
  const [sessions, setSessions] = useState<HistoryEntry[]>([])
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const fetchPage = async (pageNumber: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const offset = (pageNumber - 1) * PAGE_SIZE
      const data = await getSessions(deviceId, PAGE_SIZE, offset)
      setSessions(data.items)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load session history')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(page)
  }, [page, deviceId])

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteSession(id, deviceId)
      setSessionToDelete(null)
      // Refresh current page
      await fetchPage(page)
    } catch (err: any) {
      alert(err.message || 'Failed to delete session')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
        <div>
          <button
            onClick={onBackToMap}
            className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 mb-1"
          >
            ← Back to 3D Body Map
          </button>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Assessment History & Reports
          </h2>
          <p className="text-xs text-slate-400">
            Total of {total} past {total === 1 ? 'session' : 'sessions'} recorded on this device.
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4 text-center">
            <div className="text-3xl">⚠️</div>
            <h3 className="text-lg font-bold text-white">Delete Session Record?</h3>
            <p className="text-xs text-slate-300">
              This action cannot be undone. All recorded answers and guidance for this session will be permanently deleted.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(sessionToDelete)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition shadow-md shadow-red-600/30"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent" />
          <span className="text-xs text-slate-400">Loading session history...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-xs text-red-300 text-center">
          {error}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="text-4xl">📋</div>
          <h3 className="text-lg font-bold text-white">No Assessment History Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't completed any pain assessments on this device yet. Select a muscle area on the 3D model to start.
          </p>
          <button
            onClick={onBackToMap}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/20"
          >
            Start First Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((entry) => (
            <div
              key={entry.id}
              className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border transition hover:border-cyan-500/40"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {entry.regionName || entry.region}
                  </span>
                  <RiskBadge risk={entry.riskLevel} />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>📅 {new Date(entry.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>Intensity: <strong className="text-cyan-400">{entry.intensity}/10</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => onOpenSession(entry.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
                >
                  View Details & 3D Model ↗
                </button>
                <button
                  type="button"
                  onClick={() => setSessionToDelete(entry.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/30 transition border border-red-500/30"
                  title="Delete this session"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300 font-semibold"
              >
                ← Previous
              </button>
              <span className="text-slate-400 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
