import { animated, useSpring } from '@react-spring/web'
import { useCallback, useEffect, useState } from 'react'
import { analyzePain, getHistory } from '../../api/painApi'
import { getOrCreateDeviceId } from '../../utils/deviceId'
import type { AnalyzePainRequest, AnalyzePainResponse, HistoryEntry } from '../../types'
import { HistoryAccordion } from './HistoryAccordion'
import { PainChart } from './PainChart'
import { Questionnaire } from './Questionnaire'
import { Results } from './Results'

type PanelTab = 'assessment' | 'history'

/** Right-side slide-in panel for assessment flow. */
export function AssessmentPanel({
  regionId,
  regionName,
  isOpen,
  isDarkTheme,
  onClose,
  onAssessmentComplete,
  onResultChange,
}: {
  regionId: string | null
  regionName: string | null
  isOpen: boolean
  isDarkTheme: boolean
  onClose: () => void
  onAssessmentComplete?: () => void
  onResultChange?: (result: AnalyzePainResponse | null) => void
}) {
  const [result, setResult] = useState<AnalyzePainResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<PanelTab>('assessment')
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>([])
  const deviceId = getOrCreateDeviceId()

  const refreshHistory = useCallback(() => {
    getHistory(deviceId).then(setHistoryItems).catch(() => setHistoryItems([]))
  }, [deviceId])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  useEffect(() => {
    onResultChange?.(result)
  }, [result, onResultChange])

  const springStyles = useSpring({
    transform: isOpen ? 'translateX(0%)' : 'translateX(100%)',
    config: { duration: 450 },
  })

  async function handleSubmit(payload: AnalyzePainRequest) {
    setLoading(true)
    try {
      const response = await analyzePain(payload)
      setResult(response)
      refreshHistory()
      onAssessmentComplete?.()
    } catch {
      setResult({
        regionName: regionName || regionId || 'Selected Region',
        muscles: ['Primary Stabilizers'],
        exercises: [{ title: 'Gentle Mobility', instructions: 'Perform low-range movement for 5-8 minutes.', tags: ['mobility', 'warm-up'] }],
        aiInsight: 'Unable to reach the AI analysis engine. Showing generic fallback guidance.',
        recoveryTips: ['Rest the affected area', 'Apply ice or heat as appropriate', 'Avoid painful movements'],
        riskLevel: 'moderate',
        warningText: 'Unable to reach API, fallback estimate shown.',
        disclaimerText:
          'This information is for educational purposes only and is not a medical diagnosis. If symptoms are severe or worsening, consult a qualified healthcare professional immediately.',
        acupressurePoints: [],
        generatedBy: 'fallback',
      })
    } finally {
      setLoading(false)
    }
  }

  const displayName = regionName || regionId || 'Region'

  return (
    <animated.aside
      style={springStyles}
      className="glass-strong fixed right-0 top-0 z-50 h-screen w-full overflow-y-auto p-5 md:w-[420px]"
    >
      <button
        type="button"
        onClick={onClose}
        className="mb-4 ml-auto block text-2xl"
        style={{ color: 'var(--text-primary)' }}
      >
        ×
      </button>

      <div className="mb-4 flex gap-2 rounded-full p-1" style={{ background: 'var(--glass-bg)' }}>
        <button
          type="button"
          onClick={() => setTab('assessment')}
          className="flex-1 rounded-full px-3 py-2 text-sm font-semibold transition"
          style={
            tab === 'assessment'
              ? { background: 'var(--accent)', color: '#f8fafc' }
              : { color: 'var(--text-muted)', background: 'transparent' }
          }
        >
          Assessment
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className="flex-1 rounded-full px-3 py-2 text-sm font-semibold transition"
          style={
            tab === 'history'
              ? { background: 'var(--accent)', color: '#f8fafc' }
              : { color: 'var(--text-muted)', background: 'transparent' }
          }
        >
          History
        </button>
      </div>

      {tab === 'history' && (
        <div className="space-y-4">
          <PainChart history={historyItems} isDarkTheme={isDarkTheme} />
          <HistoryAccordion deviceId={deviceId} entries={historyItems} embedded />
        </div>
      )}

      {tab === 'assessment' && (
        <>
          {loading && <div className="mb-3 h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />}
          {!result && regionId && (
            <Questionnaire region={regionId} regionLabel={displayName} deviceId={deviceId} isDarkTheme={isDarkTheme} onSubmit={handleSubmit} />
          )}
          {result && regionId && (
            <Results result={result} regionId={regionId} isDarkTheme={isDarkTheme} onReset={() => setResult(null)} />
          )}
          {!regionId && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a body region on the model to begin.</p>}
        </>
      )}
    </animated.aside>
  )
}
