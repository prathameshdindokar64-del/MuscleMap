import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { resolveAcupressurePointsForRegion } from '../../constants/acupressure'
import type { AnalyzePainResponse, RegionInfo } from '../../types'
import { detectRegionFromPoint } from '../../utils/regionDetection'
import { buildMeshZoneMap } from '../../utils/meshGrouping'
import { AcupressurePoints } from './AcupressurePoints'
import { useBodyHeatmap } from './BodyHeatmap'
import { HologramLabels } from './HologramLabels'
import { RegionPin } from './RegionPin'
import { RippleEffect } from './RippleEffect'

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

  useBodyHeatmap(rootRef, heatmapEnabled, regionHeatmapCounts, theme)

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
        const detectedRegion = detectRegionFromPoint(event.point)
        if (!detectedRegion) return
        setSelectedRegion(detectedRegion.region)
        setHitPoint(event.point.clone())
        onRegionClick(detectedRegion)
      }}
    >
      <primitive object={normalizedScene} />
      <RegionPin point={hitPoint} />
      <RippleEffect point={hitPoint} />
      <HologramLabels selectedRegion={selectedRegion} onRegionSelect={onRegionClick} />
      {assessmentResult && assessmentRegionId && (
        <AcupressurePoints points={acupressureForScene} theme={theme} />
      )}
    </group>
  )
}

useGLTF.preload('/models/body.glb')
