import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { resolveAcupressurePointsForRegion } from '../../constants/acupressure'
import { REGION_COORDINATES } from '../../constants/regions'
import type { AnalyzePainResponse, RegionInfo } from '../../types'
import { detectRegionFromPoint } from '../../utils/regionDetection'
import { buildMeshZoneMap } from '../../utils/meshGrouping'
import { AcupressurePoints } from './AcupressurePoints'
import { BodyHeatmap } from './BodyHeatmap'
import { HologramLabels } from './HologramLabels'
import { RegionPin } from './RegionPin'
import { RippleEffect } from './RippleEffect'

/**
 * ─── RAYCASTING FIX NOTES ────────────────────────────────────────────────
 *
 * Two critical bugs were fixed in this component:
 *
 * 1. WORLD → LOCAL TRANSFORM (fixes spatial offset / wrong-region detection):
 *    React Three Fiber's event.point is in WORLD space, but this <group>
 *    oscillates via useFrame (rotation.y, position.y). The old code passed
 *    event.point directly to detectRegionFromPoint(), meaning the Y-range
 *    and X-range thresholds were evaluated against drifting world coords.
 *    This caused clicks on the bicep to register as ankle, etc.
 *
 *    FIX: We use rootRef.current.worldToLocal(event.point.clone()) to
 *    convert the hit point back into the group's local coordinate frame.
 *    The normalizedScene's own transform is stable within the group, so
 *    local-space coordinates match the expected Y-ranges in regionDetection.
 *
 * 2. LEFT/RIGHT INVERSION (fixed in regionDetection.ts):
 *    The model faces the camera (+Z). In anatomical standard view:
 *      Patient's LEFT  = Viewer's RIGHT = +X world space
 *      Patient's RIGHT = Viewer's LEFT  = -X world space
 *    The old code had point.x < 0 → left_*, which is BACKWARDS.
 *    Now: point.x ≥ 0 → left_*, point.x < 0 → right_*.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Loads the anatomy GLB and handles hover/click region interactions. */
export function AnatomyModel({
  onRegionClick,
  theme,
  assessmentResult,
  assessmentRegionId,
  heatmapEnabled,
  regionHeatmapCounts,
}: {
  onRegionClick: (info: RegionInfo) => void
  theme: 'dark' | 'light'
  assessmentResult: AnalyzePainResponse | null
  assessmentRegionId: string | null
  heatmapEnabled: boolean
  regionHeatmapCounts: Record<string, number>
}) {
  const { scene } = useGLTF('/models/body.glb')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [hitPoint, setHitPoint] = useState<THREE.Vector3 | null>(null)
  const rootRef = useRef<THREE.Group>(null)
  useMemo(() => buildMeshZoneMap(scene), [scene])

  const normalizedScene = useMemo(() => {
    const clone = scene.clone()
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const ratio = 1.78 / size.y
    clone.scale.setScalar(ratio)
    clone.position.x = -center.x * ratio
    clone.position.y = -box.min.y * ratio
    clone.position.z = -center.z * ratio
    return clone
  }, [scene])

  const highlightColor = theme === 'dark' ? '#0d2020' : '#003322'

  useFrame(({ clock }) => {
    if (!rootRef.current) return
    rootRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.035
    rootRef.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.01
  })

  const acupressureForScene =
    assessmentResult && assessmentRegionId
      ? resolveAcupressurePointsForRegion(assessmentRegionId, assessmentResult.acupressurePoints)
      : []

  return (
    <group
      ref={rootRef}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        document.body.style.cursor = 'crosshair'
        const mesh = event.object as THREE.Mesh
        if (mesh.material && 'emissive' in mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial
          material.emissive = new THREE.Color(highlightColor)
          material.emissiveIntensity = theme === 'dark' ? 0.4 : 0.2
        }
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()

        // ── KEY FIX: Convert world-space hit point → group-local space ──
        // This eliminates the spatial offset caused by the oscillating
        // group rotation/position animation in useFrame above.
        let localPoint: THREE.Vector3
        if (rootRef.current) {
          localPoint = rootRef.current.worldToLocal(event.point.clone())
        } else {
          // Fallback: use raw world point (should never happen)
          localPoint = event.point.clone()
        }

        // ── Debug: Log both world and local coords for diagnosis ──
        console.log(
          `[AnatomyModel] Click — World: (${event.point.x.toFixed(3)}, ${event.point.y.toFixed(3)}, ${event.point.z.toFixed(3)})` +
          ` → Local: (${localPoint.x.toFixed(3)}, ${localPoint.y.toFixed(3)}, ${localPoint.z.toFixed(3)})` +
          ` | Mesh: "${event.object.name || '(unnamed)'}"`
        )

        const detectedRegion = detectRegionFromPoint(localPoint)
        if (!detectedRegion) {
          console.warn('[AnatomyModel] No region detected for local point:', localPoint)
          return
        }

        console.log(`[AnatomyModel] ✓ Detected region: "${detectedRegion.region}" (${detectedRegion.name})`)

        setSelectedRegion(detectedRegion.region)
        setHitPoint(localPoint)
        onRegionClick(detectedRegion)
      }}
    >
      <primitive object={normalizedScene} />
      <RegionPin point={hitPoint} />
      <RippleEffect point={hitPoint} />
      <BodyHeatmap
        enabled={heatmapEnabled}
        counts={regionHeatmapCounts}
        theme={theme}
        onSelectRegion={(info) => {
          setSelectedRegion(info.region)
          if (REGION_COORDINATES[info.region]) {
            setHitPoint(new THREE.Vector3(...REGION_COORDINATES[info.region]))
          }
          onRegionClick(info)
        }}
      />
      <HologramLabels
        selectedRegion={selectedRegion}
        onRegionSelect={onRegionClick}
        onClose={() => {
          setSelectedRegion(null)
          setHitPoint(null)
        }}
      />
      {assessmentResult && assessmentRegionId && (
        <AcupressurePoints points={acupressureForScene} theme={theme} />
      )}
    </group>
  )
}

useGLTF.preload('/models/body.glb')
