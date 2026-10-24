/**
 * SessionPage.tsx
 * Full session viewer displaying saved answers, clinical analysis results,
 * with print-friendly stylesheet and 3D region highlighting trigger.
 */

import { useEffect, useState } from 'react'
import { getSession } from '../../api/painApi'
import { Results } from './Results'
import { RiskBadge } from './RiskBadge'
import type { SessionResponse } from '../../types'

interface SessionPageProps {
  sessionId: string
  deviceId: string
  isDarkTheme: boolean
  onRegionLoaded?: (region: string) => void
  onBack: () => void
}

export function SessionPage({
  sessionId,
  deviceId,
  isDarkTheme,
  onRegionLoaded,
  onBack,
}: SessionPageProps) {
  const [session, setSession] = useState<SessionResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchSession = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getSession(sessionId, deviceId)
        if (isMounted) {
          setSession(data)
          if (onRegionLoaded && data.region) {
            onRegionLoaded(data.region)
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Session not found or belongs to another device.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchSession()
    return () => {
      isMounted = false
    }
  }, [sessionId, deviceId])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent" />
        <span className="text-xs text-slate-400">Loading session report...</span>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <div className="text-4xl">🔍</div>
        <h3 className="text-xl font-bold text-white">Session Not Found</h3>
        <p className="text-xs text-slate-400">
          {error || 'This assessment report does not exist or was deleted.'}
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold hover:bg-slate-700 transition"
        >
          ← Return to Dashboard
        </button>
      </div>
    )
  }

  const { inputs, result } = session

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Print stylesheet */}
      <style>{`
        @media print {
          nav, header, button, .no-print, canvas {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-section {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 no-print" style={{ borderColor: 'var(--glass-border)' }}>
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 mb-1"
          >
            ← Back to Assessment
          </button>
          <h2 className="text-2xl font-extrabold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span>Assessment: {session.regionName}</span>
            <RiskBadge risk={result.riskLevel} />
          </h2>
          <p className="text-xs text-slate-400">
            Recorded on {new Date(session.timestamp).toLocaleString()} • Session ID: {session.id.slice(0, 8)}...
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
        >
          <span>🖨️</span> Print / Save PDF Report
        </button>
      </div>

      {/* Questionnaire Summary Card */}
      <div className="rounded-2xl border p-5 space-y-3 print-section" style={{ borderColor: 'var(--glass-border)', background: isDarkTheme ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.7)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
          Saved Questionnaire Responses
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
          <div>
            <span className="text-slate-400 block">Sensation:</span>
            <strong className="text-slate-200 capitalize">{inputs.painType}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Duration:</span>
            <strong className="text-slate-200">{inputs.duration.replace(/_/g, ' ')}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Intensity:</span>
            <strong className="text-cyan-400">{inputs.intensity} / 10</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Onset:</span>
            <strong className="text-slate-200 capitalize">{inputs.onset || 'Gradual'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Radiating:</span>
            <strong className="text-slate-200">{inputs.radiating ? 'Yes' : 'No'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Sitting Hours:</span>
            <strong className="text-slate-200">{inputs.dailySittingHours ?? 'N/A'} hrs/day</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Sleep Quality:</span>
            <strong className="text-slate-200 capitalize">{inputs.sleepQuality || 'N/A'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Numbness/Weakness:</span>
            <strong className={inputs.numbnessOrWeakness ? 'text-red-400 font-bold' : 'text-slate-200'}>
              {inputs.numbnessOrWeakness ? 'Yes' : 'No'}
            </strong>
          </div>
        </div>

        {inputs.aggravatedBy && inputs.aggravatedBy.length > 0 && (
          <div className="text-xs pt-2 border-t border-slate-700/50">
            <span className="text-slate-400">Aggravated by: </span>
            <span className="text-slate-200 font-semibold">{inputs.aggravatedBy.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Full Results Display */}
      <div className="print-section">
        <Results
          result={result}
          regionId={session.region}
          isDarkTheme={isDarkTheme}
          onReset={onBack}
        />
      </div>
    </div>
  )
}
