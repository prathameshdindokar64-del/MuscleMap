/**
 * SpeechControls.tsx
 * Web Speech API read-aloud controller for accessibility.
 * Reads: region, muscles, risk level, warning, and exercise titles.
 * Always speaks the medical educational disclaimer last.
 * Includes play, pause, resume, stop, speed rate, and voice selector.
 */

import { useEffect, useState, useRef } from 'react'
import type { AnalyzePainResponse } from '../types'

interface SpeechControlsProps {
  assessment: AnalyzePainResponse
  language?: 'en' | 'hi'
  isDarkTheme?: boolean
}

export function SpeechControls({
  assessment,
  language = 'en',
  isDarkTheme = true,
}: SpeechControlsProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [rate, setRate] = useState<number>(1.0)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices()
        if (available && available.length > 0) {
          setVoices(available)

          // Auto-select voice matching target language
          if (language === 'hi') {
            const hiIdx = available.findIndex(
              (v) =>
                v.lang.toLowerCase().startsWith('hi') ||
                v.name.toLowerCase().includes('hindi') ||
                v.name.toLowerCase().includes('india')
            )
            if (hiIdx >= 0) setSelectedVoiceIndex(hiIdx)
          } else {
            const enIdx = available.findIndex(
              (v) => v.lang.toLowerCase().startsWith('en')
            )
            if (enIdx >= 0) setSelectedVoiceIndex(enIdx)
          }
        }
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [language])

  // When language prop switches, pick best voice for that language
  useEffect(() => {
    if (voices.length === 0) return
    if (language === 'hi') {
      const hiIdx = voices.findIndex(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('india')
      )
      if (hiIdx >= 0) setSelectedVoiceIndex(hiIdx)
    } else {
      const enIdx = voices.findIndex((v) => v.lang.toLowerCase().startsWith('en'))
      if (enIdx >= 0) setSelectedVoiceIndex(enIdx)
    }
  }, [language, voices])

  const buildSpokenText = (): string => {
    const exerciseTitles = assessment.exercises.map((e) => e.title).join(', ')
    const musclesList = assessment.muscles.join(', ')

    if (language === 'hi') {
      const severityText =
        assessment.riskLevel === 'red_flag'
          ? 'खतरे के गंभीर संकेत मिले'
          : assessment.riskLevel === 'severe'
          ? 'तीव्र दर्द स्तर'
          : assessment.riskLevel === 'moderate'
          ? 'मध्यम स्तर का दर्द'
          : 'हल्का तनाव'

      return `
        ${assessment.regionName} के दर्द का मूल्यांकन सारांश।
        संबंधित मांसपेशियां: ${musclesList}।
        दर्द की स्थिति: ${severityText}।
        महत्वपूर्ण सावधानी: ${assessment.warningText}।
        सुझाए गए स्व-देखभाल व्यायाम: ${exerciseTitles}।
        शैक्षणिक अस्वीकरण: ${assessment.disclaimerText}।
      `.trim()
    }

    return `
      Pain assessment summary for ${assessment.regionName}.
      Associated muscle groups: ${musclesList}.
      Assessed severity level is ${assessment.riskLevel.replace('_', ' ')}.
      Important caution: ${assessment.warningText}.
      Recommended self-care exercises: ${exerciseTitles}.
      Educational disclaimer: ${assessment.disclaimerText}.
    `.trim()
  }

  const handleSpeak = () => {
    if (!isSupported) return

    window.speechSynthesis.cancel()

    const text = buildSpokenText()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US'

    if (voices.length > 0 && voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex]
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handlePauseResume = () => {
    if (!isSupported) return

    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const handleStop = () => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  if (!isSupported) return null

  return (
    <div
      className="rounded-xl border p-3.5 space-y-3 transition"
      style={{
        borderColor: 'var(--glass-border)',
        background: isDarkTheme ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <span>🔊</span> {language === 'hi' ? 'ऑडियो सहायता (Audio Assistant)' : 'Audio Assistant'}
        </span>
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {language === 'hi' ? 'हिंदी स्पीच (hi-IN)' : 'Web Speech API (en-US)'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={handleSpeak}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm"
            style={{ background: 'var(--accent)', color: '#ffffff' }}
          >
            <span>▶</span> {language === 'hi' ? 'परिणाम बोलकर सुनें (Read Aloud)' : 'Read Results Aloud'}
          </button>
        ) : (
          <>
            <button
              onClick={handlePauseResume}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition"
              style={{
                borderColor: 'var(--glass-border)',
                background: isDarkTheme ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                color: 'var(--text-primary)',
              }}
            >
              {isPaused ? (language === 'hi' ? '▶ जारी रखें' : '▶ Resume') : (language === 'hi' ? '⏸ रोकें' : '⏸ Pause')}
            </button>
            <button
              onClick={handleStop}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-red-500/40 text-red-400 bg-red-950/20 hover:bg-red-950/40 transition"
            >
              ⏹ {language === 'hi' ? 'बंद करें' : 'Stop'}
            </button>
          </>
        )}

        {/* Voice selector */}
        {voices.length > 0 && (
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Voice:</span>
            <select
              value={selectedVoiceIndex}
              onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value, 10))}
              className="max-w-[130px] truncate rounded border px-1.5 py-0.5 text-xs font-medium bg-transparent"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
            >
              {voices.map((v, i) => (
                <option key={i} value={i} className="bg-slate-900 text-white">
                  {v.name.slice(0, 18)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Speed rate picker */}
        <div className="flex items-center gap-1 ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Speed:</span>
          <select
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="rounded border px-1.5 py-0.5 text-xs font-medium bg-transparent"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
          >
            <option value="0.8">0.8x</option>
            <option value="1.0">1.0x</option>
            <option value="1.2">1.2x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </div>
    </div>
  )
}
