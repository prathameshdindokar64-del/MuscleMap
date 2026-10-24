/**
 * HologramLabels.tsx
 * Floating anatomical HUD inspector card for the selected region.
 * Consolidates all muscles into a single coordinated, non-overlapping card
 * with interactive muscle selection and precision 3D leader lines.
 */
import { Html, Line } from '@react-three/drei'
import { useState, useEffect } from 'react'
import { REGION_DISPLAY_NAMES, REGION_LABELS } from '../../constants/regions'
import type { RegionInfo } from '../../types'

export function HologramLabels({
  selectedRegion,
  onRegionSelect,
  onClose,
}: {
  selectedRegion: string | null
  onRegionSelect: (info: RegionInfo) => void
  onClose?: () => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Reset active muscle index when region changes
  useEffect(() => {
    setActiveIndex(0)
  }, [selectedRegion])

  if (!selectedRegion) return null
  const labels = REGION_LABELS[selectedRegion] || []
  if (labels.length === 0) return null

  const activeLabel = labels[activeIndex] ?? labels[0]

  // Safe left flank position — strictly outside the body silhouette
  const FLANK_X = -0.68
  const baseY = activeLabel.offset[1]
  const cardY = Math.max(0.42, Math.min(1.58, baseY))
  const cardZ = 0

  return (
    <group>
      {/* Precision 3D Leader Lines connecting body anchors to the card connection node */}
      {labels.map((label, index) => {
        const [anchorX, anchorY, anchorZ] = label.offset
        const isActive = index === activeIndex

        // Elbow waypoint outside body silhouette
        const elbowX = -0.42
        const elbowY = anchorY
        const elbowZ = anchorZ * 0.4

        return (
          <group key={`${label.muscle}-leader`}>
            {/* Connecting line */}
            <Line
              points={[
                [anchorX, anchorY, anchorZ],
                [elbowX, elbowY, elbowZ],
                [FLANK_X, cardY, cardZ],
              ]}
              color={isActive ? '#14b8a6' : '#0d9488'}
              lineWidth={isActive ? 2.2 : 1.0}
              transparent
              opacity={isActive ? 0.95 : 0.4}
            />

            {/* Anchor dot on the anatomical mesh */}
            <mesh position={[anchorX, anchorY, anchorZ]}>
              <sphereGeometry args={[isActive ? 0.016 : 0.009, 16, 16]} />
              <meshBasicMaterial color={isActive ? '#2dd4bf' : '#0f766e'} />
            </mesh>

            {/* Glowing pulsing aura for active anchor */}
            {isActive && (
              <mesh position={[anchorX, anchorY, anchorZ]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial
                  color="#14b8a6"
                  transparent
                  opacity={0.4}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Terminal anchor dot at the card connection point */}
      <mesh position={[FLANK_X, cardY, cardZ]}>
        <sphereGeometry args={[0.01, 12, 12]} />
        <meshBasicMaterial color="#14b8a6" />
      </mesh>

      {/*
        Single coordinated HTML card:
        All muscle details are managed inside this ONE container via CSS layout.
        This guarantees ZERO overlap between muscle details, regardless of screen or zoom.
      */}
      <Html
        position={[FLANK_X, cardY, cardZ]}
        style={{
          pointerEvents: 'auto',
          transform: 'translate(calc(-100% - 14px), -50%)',
          userSelect: 'none',
        }}
        zIndexRange={[60, 0]}
      >
        <div
          className="w-64 max-w-[85vw] max-h-[75vh] overflow-y-auto rounded-2xl p-4 shadow-2xl md:w-72"
          style={{
            background: 'rgba(11, 19, 36, 0.96)',
            border: '1.5px solid rgba(20, 184, 166, 0.65)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55), 0 0 20px rgba(13, 148, 136, 0.25)',
            color: '#f8fafc',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-2.5" style={{ borderColor: 'rgba(51, 65, 85, 0.7)' }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Anatomy Details
              </span>
              <h4 className="text-base font-extrabold text-white leading-tight">
                {REGION_DISPLAY_NAMES[selectedRegion] ?? selectedRegion}
              </h4>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-teal-950/90 px-2 py-0.5 text-[11px] font-semibold text-teal-300 border border-teal-700/60">
                {labels.length} {labels.length === 1 ? 'muscle' : 'muscles'}
              </span>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  title="Close details"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Muscle Selector Tabs (when multiple muscles exist) */}
          {labels.length > 1 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-slate-300 mb-1.5">
                Select muscle to pinpoint on 3D body:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l, idx) => {
                  const isCurrent = idx === activeIndex
                  return (
                    <button
                      key={l.muscle}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        isCurrent
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {l.muscle}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active Muscle Focus Card */}
          <div className="mt-3 rounded-xl p-3 border" style={{ background: 'rgba(15, 23, 42, 0.75)', borderColor: 'rgba(20, 184, 166, 0.35)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300">
                {activeLabel.muscle}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-teal-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                Target
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
              {activeLabel.desc}
            </p>
          </div>

          {/* All Muscles Overview (if multiple) */}
          {labels.length > 1 && (
            <div className="mt-3 space-y-1.5 border-t pt-2.5" style={{ borderColor: 'rgba(51, 65, 85, 0.6)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                All Muscles in This Region
              </p>
              <div className="space-y-1">
                {labels.map((l, idx) => (
                  <button
                    key={`${l.muscle}-item`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition ${
                      idx === activeIndex
                        ? 'bg-teal-950/70 text-teal-200 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{l.muscle}</span>
                    <span className="text-[10px] text-slate-400">
                      {idx === activeIndex ? 'Viewing' : 'Inspect'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={() =>
              onRegionSelect({
                region: selectedRegion,
                name: REGION_DISPLAY_NAMES[selectedRegion] ?? selectedRegion,
              })
            }
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-lg transition active:scale-[0.98] hover:opacity-95"
            style={{ background: 'var(--accent)' }}
          >
            <span>Start Checkup for {REGION_DISPLAY_NAMES[selectedRegion] ?? selectedRegion}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </Html>
    </group>
  )
}
