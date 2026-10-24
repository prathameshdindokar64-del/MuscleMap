import { useState } from 'react'
import { acupressurePointsForResults } from '../../constants/acupressure'
import { FALLBACK_DISCLAIMER } from '../../constants/api'
import type { AcupressurePoint, AnalyzePainResponse } from '../../types'
import { exportPdf } from '../../api/painApi'
import { useAuth } from '../../context/AuthContext'
import { ExerciseCard } from './ExerciseCard'
import { RiskBadge } from './RiskBadge'
import { SpeechControls } from '../../voice/SpeechControls'
import { getLocalizedAssessment, HINDI_UI_LABELS } from '../../utils/hindiTranslator'

function AcupressureCard({
  point,
  isDarkTheme,
  language = 'en',
}: {
  point: AcupressurePoint
  isDarkTheme: boolean
  language?: 'en' | 'hi'
}) {
  const [open, setOpen] = useState(true)
  const isHindi = language === 'hi'
  const cardStyle = isDarkTheme
    ? { background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.25)', backdropFilter: 'blur(12px)' as const }
    : { background: 'rgba(255, 251, 235, 0.85)', border: '1px solid rgba(245, 158, 11, 0.35)', backdropFilter: 'blur(12px)' as const }

  const description = point.description || point.location || ''
  const technique = point.technique || point.howTo || ''

  return (
    <article className="rounded-2xl p-5 space-y-3 transition" style={cardStyle}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-base font-bold" style={{ color: '#f59e0b' }}>
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
          {point.name}
        </p>
        <button
          type="button"
          className="text-xs font-bold text-amber-500 hover:text-amber-400 transition underline"
          onClick={() => setOpen((o) => !o)}
        >
          {open
            ? (isHindi ? HINDI_UI_LABELS.collapseGuide : 'Collapse Guide ▲')
            : (isHindi ? HINDI_UI_LABELS.expandGuide : 'Expand Guide ▼')}
        </button>
      </div>

      {description && (
        <div className="text-xs text-slate-300 leading-relaxed bg-amber-950/20 rounded-xl p-3 border border-amber-800/30">
          <strong className="text-amber-400 block mb-0.5">
            📍 {isHindi ? 'स्थान:' : 'Location:'}
          </strong>
          {description}
        </div>
      )}

      {open && (
        <div className="space-y-3 pt-1 text-xs">
          {/* Step-by-step guide */}
          <div className="space-y-1.5 text-slate-200">
            <strong className="text-amber-400 block text-xs uppercase tracking-wider">
              {isHindi ? HINDI_UI_LABELS.stepByStep : 'Step-by-Step Self-Care Guide:'}
            </strong>
            <ul className="space-y-1 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">1.</span>
                <span>
                  {isHindi ? (
                    <>
                      <strong>सही बिंदु खोजें:</strong> अपने अंगूठे या तर्जनी उंगली से ऊपर बताए गए स्थान पर एक छोटा संवेदनशील गड्ढा या मांसपेशियों की गांठ ढूंढें।
                    </>
                  ) : (
                    <>
                      <strong>Find the sweet spot:</strong> Use your thumb or index finger to locate a small tender dip or muscle knot in the area described above.
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">2.</span>
                <span>
                  {isHindi ? (
                    <>
                      <strong>दबाव डालें:</strong> {technique || 'अपने अंगूठे या पोरों से नीचे की ओर हल्का व स्थिर दबाव बनाएं।'}
                    </>
                  ) : (
                    <>
                      <strong>Apply pressure:</strong> {technique || 'Apply firm, steady downward or circular pressure with your thumb or knuckles.'}
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">3.</span>
                <span>
                  {isHindi ? (
                    <>
                      <strong>श्वास चक्र:</strong> 4 सेकंड के लिए नाक से गहरी सांस लें; मुंह से धीरे-धीरे सांस छोड़ते हुए दबाव को थोड़ा गहरा करें।
                    </>
                  ) : (
                    <>
                      <strong>Breathing rhythm:</strong> Inhale slowly through your nose for 4 seconds; as you exhale gently through your mouth, deepen the pressure slightly.
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">4.</span>
                <span>
                  {isHindi ? (
                    <>
                      <strong>अवधि व दोहराव:</strong> <strong>30–60 सेकंड</strong> तक लगातार दबाए रखें। 15 सेकंड का आराम दें, और दोनों तरफ 2–3 बार दोहराएं।
                    </>
                  ) : (
                    <>
                      <strong>Duration & Reps:</strong> Hold continuously for <strong>30–60 seconds</strong>. Rest for 15 seconds, and repeat 2–3 times per side.
                    </>
                  )}
                </span>
              </li>
            </ul>
          </div>

          {/* Sensation guide & precautions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-amber-800/30 text-[11px]">
            <div className="text-slate-300">
              <span className="text-emerald-400 font-semibold block">
                ✓ {isHindi ? HINDI_UI_LABELS.expectedSensation : 'Expected Sensation:'}
              </span>
              {isHindi ? HINDI_UI_LABELS.expectedSensationText : 'A dull, heavy, or warm spreading ache (*De Qi*) is therapeutic.'}
            </div>
            <div className="text-slate-300">
              <span className="text-red-400 font-semibold block">
                ⚠️ {isHindi ? HINDI_UI_LABELS.precautionTitle : 'Caution / Stop:'}
              </span>
              {isHindi ? HINDI_UI_LABELS.precautionText : 'Release immediately if you feel electric shooting sensations or sharp pinching. Avoid if pregnant or over bruised skin.'}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

/** Shows API analysis output after form submission. */
export function Results({
  result,
  regionId,
  isDarkTheme,
  onReset,
}: {
  result: AnalyzePainResponse
  regionId: string
  isDarkTheme: boolean
  onReset: () => void
}) {
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Language state for assessment result (saved in localStorage)
  const [language, setLanguage] = useState<'en' | 'hi'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('musclemap_result_lang')
      if (saved === 'hi' || saved === 'en') return saved
    }
    return 'en'
  })

  const handleLanguageChange = (newLang: 'en' | 'hi') => {
    setLanguage(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('musclemap_result_lang', newLang)
    }
  }

  // Active result based on user preference
  const activeResult = getLocalizedAssessment(result, language, regionId)
  const isHindi = language === 'hi'

  const acupressure = acupressurePointsForResults(regionId, activeResult.acupressurePoints)

  async function handleExport() {
    setExporting(true)
    setExportError(null)
    try {
      await exportPdf(result, { name: user?.name || 'Anonymous' })
    } catch (err: any) {
      setExportError(err.message || 'Failed to generate PDF')
    } finally {
      setExporting(false)
    }
  }

  const getAssessmentMethodLabel = () => {
    if (activeResult.riskSource === 'ml') {
      const conf = activeResult.mlConfidence ? `${Math.round(activeResult.mlConfidence * 100)}%` : 'उच्च'
      return isHindi
        ? `चिकित्सीय नियम एवं स्वचालित विश्लेषण सत्यापन (${conf} विश्वसनीयता)`
        : `Rules + ML Validation (${conf} confidence)`
    }
    if (activeResult.riskSource === 'rules_override') {
      return isHindi
        ? 'चिकित्सीय सुरक्षा प्राथमिकता (सख्त नियम प्रभावी)'
        : 'Rules Safety Override (ML evaluated lower, clinical rules preserved)'
    }
    return isHindi ? 'प्रमाणित चिकित्सीय नियम प्रणाली' : 'Clinical Rules Engine'
  }

  return (
    <div className="space-y-5">
      {/* ── BILINGUAL LANGUAGE SELECTOR FOR ASSESSMENT RESULTS ── */}
      <div
        className="flex items-center justify-between p-2.5 rounded-xl border transition shadow-sm"
        style={{
          borderColor: 'var(--glass-border)',
          background: isDarkTheme ? 'rgba(15, 23, 42, 0.65)' : 'rgba(241, 245, 249, 0.85)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <span className="text-base">🌐</span>
          <span>{isHindi ? 'परिणाम की भाषा:' : 'Result Language:'}</span>
        </div>
        <div
          className="flex rounded-lg p-0.5 border"
          style={{ borderColor: 'var(--glass-border)', background: isDarkTheme ? '#0b1120' : '#ffffff' }}
        >
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition ${
              language === 'en'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('hi')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition ${
              language === 'hi'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Red Flag Warning Alert Box */}
      {activeResult.riskLevel === 'red_flag' && (
        <div className="rounded-xl border border-red-500 bg-red-950/40 p-4 text-red-200 space-y-2">
          <div className="flex items-center gap-2 font-extrabold text-base text-red-400">
            <span className="text-xl">🚨</span>
            <span>{isHindi ? HINDI_UI_LABELS.redFlagBanner : 'Red Flag Symptoms Detected'}</span>
          </div>
          <p className="text-xs text-red-300 leading-relaxed">
            {isHindi
              ? HINDI_UI_LABELS.redFlagSubtext
              : 'The assessment identified safety indicators that suggest consulting a healthcare professional or urgent care before attempting self-care exercises:'}
          </p>
          {activeResult.redFlagReasons && activeResult.redFlagReasons.length > 0 && (
            <ul className="list-disc list-inside text-xs space-y-1 text-red-200 pt-1 font-medium">
              {activeResult.redFlagReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Identified muscles */}
      <div className="flex flex-wrap gap-2">
        {activeResult.muscles.map((muscleName) => (
          <span
            key={muscleName}
            className="rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ background: 'var(--accent-glow)', color: 'var(--text-accent)', border: '1px solid var(--glass-border-accent)' }}
          >
            {muscleName}
          </span>
        ))}
      </div>

      {/* Assessment Method & Risk Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-slate-700/40 bg-slate-800/30 text-xs">
        <span className="text-slate-400 font-medium">
          {isHindi ? HINDI_UI_LABELS.assessmentMethod : 'Assessment Method:'}
        </span>
        <span className="font-bold text-cyan-400">
          {getAssessmentMethodLabel()}
        </span>
      </div>

      {/* Speech Audio Assistant */}
      <SpeechControls
        assessment={activeResult}
        language={language}
        isDarkTheme={isDarkTheme}
      />

      {/* AI Insight */}
      {activeResult.aiInsight && (
        <div
          className="rounded-xl p-5 space-y-2"
          style={{
            background: isDarkTheme ? 'rgba(13,148,136,0.08)' : 'rgba(13,148,136,0.06)',
            border: '1px solid rgba(13,148,136,0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-accent)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
              <line x1="9" y1="21" x2="15" y2="21" />
            </svg>
            {isHindi ? HINDI_UI_LABELS.clinicalInsight : 'Personalized Clinical Insight'}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {activeResult.aiInsight}
          </p>
          {activeResult.generatedBy && (
            <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              {isHindi ? HINDI_UI_LABELS.source : 'Source:'} {activeResult.generatedBy}
            </p>
          )}
        </div>
      )}

      {/* Exercises */}
      <div>
        <h4 className="mb-3 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isHindi ? HINDI_UI_LABELS.recommendedExercises : 'Recommended Exercises'}
        </h4>
        <div className="space-y-3">
          {activeResult.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.title}
              exercise={exercise}
              language={language}
              onStartGuided={(ex) => {
                const params = new URLSearchParams({
                  title: ex.title,
                  instructions: ex.instructions || '',
                  category: ex.tags?.[0] || '',
                })
                window.open(`/guided?${params.toString()}`, '_blank')
              }}
            />
          ))}
        </div>
      </div>

      {/* Recovery Tips */}
      {activeResult.recoveryTips && activeResult.recoveryTips.length > 0 && (
        <div
          className="rounded-xl p-5 space-y-2"
          style={{
            background: isDarkTheme ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <p className="flex items-center gap-2 text-sm font-bold" style={{ color: '#818cf8' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            {isHindi ? HINDI_UI_LABELS.recoveryTips : 'Recovery Tips'}
          </p>
          <ul className="space-y-1.5">
            {activeResult.recoveryTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#818cf8' }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Acupressure */}
      {acupressure.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {isHindi ? HINDI_UI_LABELS.acupressurePoints : 'Acupressure Relief Points'}
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isHindi ? HINDI_UI_LABELS.acupressureSubtitle : 'Apply gentle circular pressure to these points for 30–60 seconds'}
          </p>
          <div className="space-y-3">
            {acupressure.map((point) => (
              <AcupressureCard
                key={point.name}
                point={point}
                isDarkTheme={isDarkTheme}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      <RiskBadge risk={activeResult.riskLevel} language={language} />

      {activeResult.warningText && (
        <div className="flex items-start gap-2 rounded-lg p-4 text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--risk-severe)' }}>
          <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {activeResult.warningText}
        </div>
      )}

      <div
        className="rounded-lg border-l-4 p-4 text-sm italic leading-relaxed"
        style={{
          borderColor: 'var(--disclaimer-border)',
          background: 'var(--disclaimer-bg)',
          color: 'var(--disclaimer-text)',
        }}
      >
        {activeResult.disclaimerText || FALLBACK_DISCLAIMER}
      </div>

      {/* PDF Export */}
      {exportError && (
        <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
          {exportError}
        </div>
      )}
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="glass-accent flex w-full items-center justify-center gap-2 rounded-lg p-3.5 text-base font-semibold"
        style={{ opacity: exporting ? 0.7 : 1, cursor: exporting ? 'not-allowed' : 'pointer' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        {exporting
          ? (isHindi ? HINDI_UI_LABELS.exportingPdf : 'Generating PDF...')
          : (isHindi ? HINDI_UI_LABELS.exportPdf : 'Export Full Report as PDF')}
      </button>

      <button
        type="button"
        onClick={onReset}
        className="glass w-full rounded-lg border p-3 text-base font-medium"
        style={{ borderColor: 'var(--glass-border-accent)', color: 'var(--text-accent)' }}
      >
        {isHindi ? HINDI_UI_LABELS.startNew : 'Start New Assessment'}
      </button>
    </div>
  )
}

