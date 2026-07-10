import { Html, Line } from '@react-three/drei'
import { REGION_DISPLAY_NAMES, REGION_LABELS } from '../../constants/regions'
import type { RegionInfo } from '../../types'

/** Floating label HUD around selected region in 3D. */
export function HologramLabels({
  selectedRegion,
  onRegionSelect,
}: {
  selectedRegion: string | null
  onRegionSelect: (info: RegionInfo) => void
}) {
  if (!selectedRegion) return null
  const labels = REGION_LABELS[selectedRegion] || []
  return (
    <>
      {labels.map((label, index) => (
        <group key={`${label.muscle}-${index}`}>
          <Line
            points={[
              label.offset,
              [label.offset[0] * 0.7, label.offset[1] * 0.9, label.offset[2] * 0.2],
            ]}
            color="#0d9488"
            lineWidth={1.5}
          />
          <mesh position={[label.offset[0] * 0.7, label.offset[1] * 0.9, label.offset[2] * 0.2]}>
            <sphereGeometry args={[0.008, 12, 12]} />
            <meshStandardMaterial emissive="#0d9488" emissiveIntensity={1.5} color="#0d9488" />
          </mesh>
          <Html
            position={[
              label.offset[0] + index * 0.06,
              label.offset[1] - index * 0.12,
              label.offset[2] + index * 0.02,
            ]}
          >
            <button
              type="button"
              onClick={() =>
                onRegionSelect({
                  region: selectedRegion,
                  name: REGION_DISPLAY_NAMES[selectedRegion] ?? selectedRegion,
                })
              }
              className="glass min-w-[160px] rounded-xl border p-3 text-left transition hover:scale-[1.03]"
              style={{
                borderColor: 'var(--glass-border-accent)',
                color: 'var(--text-primary)',
                zIndex: 40 - index,
              }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--text-accent)' }}>
                ● {label.muscle}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {label.desc}
              </p>
              <p className="mt-1 text-right text-[10px]" style={{ color: 'var(--text-accent)' }}>
                &gt; Select
              </p>
            </button>
          </Html>
        </group>
      ))}
    </>
  )
}
