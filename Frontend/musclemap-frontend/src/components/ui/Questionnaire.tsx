/**
 * Questionnaire.tsx
 * Multi-step wizard symptom evaluation questionnaire for MuscleMap v2.
 * 
 * Steps:
 * 1. Pain Profile (Required): sensation, duration, intensity slider
 * 2. Pain Behavior: onset, radiating, aggravating factors, previous episodes
 * 3. Safety Screening: numbness/weakness, night pain, fever, bladder/bowel changes
 * 4. Lifestyle Context: daily sitting hours, sleep quality, stress level, trigger
 * 
 * Features:
 * - Speech-to-text voice input prefill with keyword parsing (never auto-submits)
 * - Users can skip steps 2–4 at any time once Step 1 is valid
 * - Clear, elderly-friendly accessible click targets and contrast
 */

import { useState, useEffect } from 'react'
import { DURATION_OPTIONS, PAIN_TYPES, STRESS_LEVELS, TRIGGERS } from '../../constants/zones'
import { WizardProgressBar } from './WizardProgressBar'
import { parseVoiceInput, VOICE_INPUT_LANG } from '../../voice/parseVoiceInput'
import type {
  AnalyzePainRequest,
  Onset,
  PreviousEpisodes,
  SleepQuality,
  AggravatingFactor,
} from '../../types'

function getIntensityDescriptor(score: number): { label: string; color: string } {
  if (score === 0) return { label: 'No Pain', color: '#10b981' }
  if (score <= 3) return { label: 'Mild Discomfort (Noticeable, manageable)', color: '#10b981' }
  if (score <= 6) return { label: 'Moderate Ache (Affects daily tasks)', color: '#f59e0b' }
  if (score <= 8) return { label: 'Severe Pain (Restricts movement)', color: '#ea580c' }
  return { label: 'Very Intense / Extreme', color: '#dc2626' }
}

const AGGRAVATING_OPTIONS: { id: AggravatingFactor; label: string }[] = [
  { id: 'bending', label: 'Bending over' },
  { id: 'twisting', label: 'Twisting torso' },
  { id: 'walking', label: 'Walking / Standing' },
  { id: 'lifting', label: 'Lifting objects' },
  { id: 'sitting', label: 'Prolonged sitting' },
  { id: 'lying_down', label: 'Lying down' },
]

export function Questionnaire({
  region,
  regionLabel,
  deviceId,
  isDarkTheme,
  onSubmit,
  onRegionChange,
}: {
  region: string
  regionLabel: string
  deviceId: string
  isDarkTheme: boolean
  onSubmit: (payload: AnalyzePainRequest) => void
  onRegionChange?: (newRegion: string) => void
}) {
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Step 1: Core fields
  const [painType, setPainType] = useState<AnalyzePainRequest['painType'] | ''>('')
  const [duration, setDuration] = useState<AnalyzePainRequest['duration'] | ''>('')
  const [intensity, setIntensity] = useState(4)

  // Step 2: Behavior
  const [onset, setOnset] = useState<Onset>('gradual')
  const [radiating, setRadiating] = useState<boolean>(false)
  const [aggravatedBy, setAggravatedBy] = useState<AggravatingFactor[]>([])
  const [previousEpisodes, setPreviousEpisodes] = useState<PreviousEpisodes>('none')

  // Step 3: Safety check
  const [numbnessOrWeakness, setNumbnessOrWeakness] = useState<boolean>(false)
  const [nightPain, setNightPain] = useState<boolean>(false)
  const [fever, setFever] = useState<boolean>(false)
  const [bladderBowelChanges, setBladderBowelChanges] = useState<boolean>(false)

  // Step 4: Lifestyle
  const [dailySittingHours, setDailySittingHours] = useState<number>(6)
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('fair')
  const [stressLevel, setStressLevel] = useState<AnalyzePainRequest['stressLevel']>()
  const [trigger, setTrigger] = useState<AnalyzePainRequest['trigger']>()

  // Voice input state
  const [isListening, setIsListening] = useState<boolean>(false)
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true)

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceSupported(false)
    }
  }, [])

  const canProceedStep1 = Boolean(painType && duration)
  const descriptor = getIntensityDescriptor(intensity)

  const activeBtnStyle = {
    background: 'var(--accent)',
    color: '#ffffff',
    borderColor: 'var(--accent)',
    boxShadow: '0 4px 12px var(--accent-glow)',
  }

  const idleBtnStyle = {
    background: isDarkTheme ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.9)',
    color: 'var(--text-primary)',
    borderColor: 'var(--glass-border)',
  }

  const toggleAggravating = (factor: AggravatingFactor) => {
    setAggravatedBy((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    )
  }

  // Voice recording handler
  const handleStartVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = VOICE_INPUT_LANG
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      setIsListening(true)
      setVoiceNotice('Listening... Describe your symptoms naturally.')

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        const parsed = parseVoiceInput(transcript)

        // Pre-fill form fields
        if (parsed.painType) setPainType(parsed.painType)
        if (parsed.duration) setDuration(parsed.duration)
        if (parsed.intensity !== undefined) setIntensity(parsed.intensity)
        if (parsed.onset) setOnset(parsed.onset)
        if (parsed.radiating !== undefined) setRadiating(parsed.radiating)
        if (parsed.numbnessOrWeakness !== undefined) setNumbnessOrWeakness(parsed.numbnessOrWeakness)
        if (parsed.nightPain !== undefined) setNightPain(parsed.nightPain)
        if (parsed.fever !== undefined) setFever(parsed.fever)
        if (parsed.bladderBowelChanges !== undefined) setBladderBowelChanges(parsed.bladderBowelChanges)
        if (parsed.dailySittingHours !== undefined) setDailySittingHours(parsed.dailySittingHours)
        if (parsed.stressLevel) setStressLevel(parsed.stressLevel)
        if (parsed.trigger) setTrigger(parsed.trigger)

        if (parsed.region && onRegionChange) {
          onRegionChange(parsed.region)
        }

        setVoiceNotice(
          `Understood: "${transcript}". Please review the pre-filled fields before proceeding.`
        )
        setIsListening(false)
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone access denied. Please grant permission in your browser address bar.')
        } else if (event.error === 'no-speech') {
          setVoiceNotice('No speech detected. Try speaking closer to your microphone.')
        } else {
          setVoiceNotice(`Voice recognition error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err: any) {
      setIsListening(false)
      setVoiceNotice('Unable to start speech recognition.')
    }
  }

  const handleFinalSubmit = () => {
    if (!canProceedStep1) return

    const payload: AnalyzePainRequest = {
      deviceId,
      region,
      painType: painType as AnalyzePainRequest['painType'],
      duration: duration as AnalyzePainRequest['duration'],
      intensity,
      onset,
      radiating,
      aggravatedBy: aggravatedBy.length > 0 ? aggravatedBy : undefined,
      previousEpisodes,
      numbnessOrWeakness,
      nightPain,
      fever,
      bladderBowelChanges,
      dailySittingHours,
      sleepQuality,
      stressLevel,
      trigger,
    }

    onSubmit(payload)
  }

  return (
    <div className="space-y-5">
      {/* Selected Region Heading + Voice Input Button */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--glass-border)' }}>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Selected Area
          </span>
          <h3 className="mt-0.5 text-2xl font-extrabold" style={{ color: 'var(--text-accent)' }}>
            {regionLabel}
          </h3>
        </div>

        {voiceSupported ? (
          <button
            type="button"
            onClick={handleStartVoice}
            disabled={isListening}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
              isListening ? 'animate-pulse bg-red-600 text-white border-red-500' : 'hover:scale-[1.02]'
            }`}
            style={!isListening ? idleBtnStyle : undefined}
            title="Speak your symptoms naturally"
          >
            <span>{isListening ? '🔴' : '🎙️'}</span>
            <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
          </button>
        ) : (
          <span className="text-[10px] text-slate-400 italic">Voice input needs Chrome/Edge</span>
        )}
      </div>

      {/* Voice notice / confirmation */}
      {voiceNotice && (
        <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/40 p-3 text-xs text-cyan-300 flex items-start justify-between gap-2">
          <span>{voiceNotice}</span>
          <button onClick={() => setVoiceNotice(null)} className="text-cyan-400 hover:text-cyan-200">✕</button>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <WizardProgressBar
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step === 1 || canProceedStep1) {
            setCurrentStep(step)
          }
        }}
        canNavigateToStep={(step) => step === 1 || canProceedStep1}
      />

      {/* ── STEP 1: PAIN PROFILE (REQUIRED) ────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-5 pt-1">
          {/* Pain Sensation */}
          <div className="space-y-2">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              1. What kind of sensation are you feeling? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PAIN_TYPES.map((item) => {
                const isSelected = painType === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPainType(item.id)}
                    className="flex items-center justify-between rounded-xl border p-3.5 text-sm font-semibold transition hover:scale-[1.01]"
                    style={isSelected ? activeBtnStyle : idleBtnStyle}
                  >
                    <span>{item.label}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              2. How long have you experienced this? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {DURATION_OPTIONS.map((item) => {
                const isSelected = duration === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDuration(item.id)}
                    className="flex items-center justify-between rounded-xl border p-3 text-sm font-semibold transition hover:scale-[1.01]"
                    style={isSelected ? activeBtnStyle : idleBtnStyle}
                  >
                    <span>{item.label}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-2 rounded-2xl border p-4 transition" style={{ borderColor: 'var(--glass-border)', background: isDarkTheme ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.7)' }}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                3. Pain Severity: <span className="font-extrabold text-base" style={{ color: descriptor.color }}>{intensity} / 10</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${descriptor.color}20`, color: descriptor.color }}>
                {descriptor.label}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* ── STEP 2: PAIN BEHAVIOR ──────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-5 pt-1">
          {/* Onset */}
          <div className="space-y-2">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              How did the pain start?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'gradual', label: 'Slowly / Gradual buildup' },
                { id: 'sudden', label: 'Suddenly / Acute onset' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOnset(opt.id as Onset)}
                  className="rounded-xl border p-3 text-sm font-semibold transition"
                  style={onset === opt.id ? activeBtnStyle : idleBtnStyle}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radiating */}
          <div className="flex items-center justify-between rounded-xl border p-3.5" style={{ borderColor: 'var(--glass-border)', background: isDarkTheme ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.7)' }}>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Does the pain radiate or spread?</div>
              <div className="text-xs text-slate-400">Travels down arms, legs, or neighboring areas</div>
            </div>
            <button
              type="button"
              onClick={() => setRadiating(!radiating)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                radiating ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {radiating ? 'YES' : 'NO'}
            </button>
          </div>

          {/* Aggravating factors */}
          <div className="space-y-2">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              What movements aggravate or worsen it?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AGGRAVATING_OPTIONS.map((opt) => {
                const isSelected = aggravatedBy.includes(opt.id)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleAggravating(opt.id)}
                    className="flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition"
                    style={isSelected ? activeBtnStyle : idleBtnStyle}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Previous Episodes */}
          <div className="space-y-2">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Previous episodes of this pain?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'First time' },
                { id: 'once', label: 'Once before' },
                { id: 'recurring', label: 'Recurring' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreviousEpisodes(opt.id as PreviousEpisodes)}
                  className="rounded-xl border p-2.5 text-xs font-semibold transition"
                  style={previousEpisodes === opt.id ? activeBtnStyle : idleBtnStyle}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: SAFETY SCREENING ───────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-4 pt-1">
          <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-300 leading-relaxed">
            🛡️ <strong>Safety screening:</strong> These questions help identify symptoms that require direct clinical attention. Please answer honestly.
          </div>

          {[
            {
              id: 'numbness',
              title: 'Numbness or muscle weakness',
              desc: 'Pins, needles, or loss of strength in arms or legs',
              val: numbnessOrWeakness,
              setter: setNumbnessOrWeakness,
            },
            {
              id: 'nightPain',
              title: 'Constant pain waking you at night',
              desc: 'Severe pain interrupting sleep regardless of posture',
              val: nightPain,
              setter: setNightPain,
            },
            {
              id: 'fever',
              title: 'Fever or chills with pain',
              desc: 'Elevated body temperature alongside spinal/joint pain',
              val: fever,
              setter: setFever,
            },
            {
              id: 'bowel',
              title: 'Bladder or bowel control changes',
              desc: 'Difficulty holding or passing urine or sudden incontinence',
              val: bladderBowelChanges,
              setter: setBladderBowelChanges,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border p-3.5 transition"
              style={{
                borderColor: item.val ? 'rgba(239, 68, 68, 0.5)' : 'var(--glass-border)',
                background: item.val ? 'rgba(127, 29, 29, 0.2)' : isDarkTheme ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.7)',
              }}
            >
              <div className="pr-3">
                <div className="text-sm font-bold" style={{ color: item.val ? '#fca5a5' : 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => item.setter(!item.val)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  item.val ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {item.val ? 'YES' : 'NO'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── STEP 4: LIFESTYLE & CONTEXT ────────────────────────────── */}
      {currentStep === 4 && (
        <div className="space-y-4 pt-1">
          {/* Sitting hours */}
          <div className="space-y-2 rounded-xl border p-3.5" style={{ borderColor: 'var(--glass-border)', background: isDarkTheme ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.7)' }}>
            <div className="flex justify-between items-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              <span>Daily sitting hours:</span>
              <span className="text-cyan-400 font-extrabold">{dailySittingHours} hrs/day</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              value={dailySittingHours}
              onChange={(e) => setDailySittingHours(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Sleep quality */}
          <div className="space-y-2">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Recent sleep quality:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'good', label: 'Good / Restful' },
                { id: 'fair', label: 'Fair' },
                { id: 'poor', label: 'Poor / Broken' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSleepQuality(opt.id as SleepQuality)}
                  className="rounded-xl border p-2.5 text-xs font-semibold transition"
                  style={sleepQuality === opt.id ? activeBtnStyle : idleBtnStyle}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stress Level */}
          <div className="space-y-2">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Current stress level:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STRESS_LEVELS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStressLevel(item)}
                  className="rounded-xl border p-2.5 text-xs font-semibold capitalize transition"
                  style={stressLevel === item ? activeBtnStyle : idleBtnStyle}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger */}
          <div className="space-y-2">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Suspected activity or trigger:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTrigger(item)}
                  className="rounded-xl border p-2.5 text-xs font-semibold capitalize transition"
                  style={trigger === item ? activeBtnStyle : idleBtnStyle}
                >
                  {item.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP NAVIGATION BAR ─────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition hover:bg-slate-800"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}
            >
              ← Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Skip option on steps 2-3 */}
          {currentStep > 1 && currentStep < 4 && (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition underline"
            >
              Skip to Analysis
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              disabled={currentStep === 1 && !canProceedStep1}
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                (currentStep === 1 && !canProceedStep1)
                  ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              disabled={!canProceedStep1}
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25"
            >
              Analyze Pain Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
