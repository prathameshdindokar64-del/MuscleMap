import type { ReactNode } from 'react'
import type { RiskLevel } from '../../types'

interface RiskConfig {
  label: string
  sublabel: string
  color: string
  borderColor: string
  bg: string
  renderIcon: () => ReactNode
}

const RISK_CONFIGS: Record<RiskLevel, RiskConfig> = {
  mild: {
    label: 'Low Concern',
    sublabel: 'Suitable for gentle mobility & home stretching',
    color: '#15803d',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    bg: 'rgba(34, 197, 94, 0.1)',
    renderIcon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  moderate: {
    label: 'Moderate Discomfort',
    sublabel: 'Follow recommended exercises and rest as needed',
    color: '#d97706',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    bg: 'rgba(245, 158, 11, 0.12)',
    renderIcon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  severe: {
    label: 'Elevated Pain Level',
    sublabel: 'Consult a healthcare provider if pain persists beyond 48 hours',
    color: '#dc2626',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    bg: 'rgba(239, 68, 68, 0.12)',
    renderIcon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  red_flag: {
    label: 'Immediate Medical Attention Advised',
    sublabel: 'Symptoms warrant direct evaluation by an emergency doctor',
    color: '#ffffff',
    borderColor: '#ef4444',
    bg: 'rgba(220, 38, 38, 0.92)',
    renderIcon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
}

const HINDI_RISK_CONFIGS: Record<RiskLevel, { label: string; sublabel: string }> = {
  mild: {
    label: 'हल्का तनाव',
    sublabel: 'कोमल गतिशीलता और घरेलू खिंचाव के लिए उपयुक्त',
  },
  moderate: {
    label: 'मध्यम दर्द',
    sublabel: 'सुझाए गए व्यायाम करें और आवश्यकतानुसार विश्राम दें',
  },
  severe: {
    label: 'तीव्र दर्द स्तर',
    sublabel: 'यदि 48 घंटों से अधिक दर्द बना रहे तो चिकित्सक से परामर्श लें',
  },
  red_flag: {
    label: 'तत्काल चिकित्सीय जांच आवश्यक',
    sublabel: 'इन लक्षणों की आपातकालीन चिकित्सक द्वारा प्रत्यक्ष जांच आवश्यक है',
  },
}

export function RiskBadge({
  risk,
  language = 'en',
}: {
  risk: RiskLevel
  language?: 'en' | 'hi'
}) {
  const item = RISK_CONFIGS[risk] ?? RISK_CONFIGS.moderate
  const isHindi = language === 'hi'
  const hiItem = HINDI_RISK_CONFIGS[risk] ?? HINDI_RISK_CONFIGS.moderate

  const label = isHindi ? hiItem.label : item.label
  const sublabel = isHindi ? hiItem.sublabel : item.sublabel

  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-4 text-left shadow-sm"
      style={{
        color: item.color,
        background: item.bg,
        border: `1.5px solid ${item.borderColor}`,
      }}
    >
      <span className="mt-0.5 shrink-0">{item.renderIcon()}</span>
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider">{label}</h4>
        <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{sublabel}</p>
      </div>
    </div>
  )
}
