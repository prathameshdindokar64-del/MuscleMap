/**
 * BodyHeatmap.tsx
 * Applies warm emissive tints to meshes based on how often each region appears in assessment history.
 */
import { useLayoutEffect, type RefObject } from 'react'
import * as THREE from 'three'
import { detectRegionFromPoint } from '../../utils/regionDetection'

function heatStyleForCount(count: number): { color: string; intensity: number } | null {
  if (count <= 0) return null
  if (count === 1) return { color: '#1a0500', intensity: 0.15 }
  if (count <= 3) return { color: '#2a0800', intensity: 0.25 }
  if (count <= 5) return { color: '#3a1000', intensity: 0.35 }
  return { color: '#4a1500', intensity: 0.5 }
}

/**
 * Traverses the anatomy group and applies or clears heatmap emissive overlays.
 */
export function useBodyHeatmap(
  groupRef: RefObject<THREE.Group | null>,
  enabled: boolean,
  regionCounts: Record<string, number>,
  theme: 'dark' | 'light',
) {
  useLayoutEffect(() => {
    let cancelled = false

    const apply = () => {
      if (cancelled) return
      const root = groupRef.current
      if (!root) {
        requestAnimationFrame(apply)
        return
      }

    const meshes: THREE.Mesh[] = []
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) meshes.push(child)
    })

    for (const mesh of meshes) {
      const mat = mesh.material
      if (!mat || !('emissive' in mat)) continue
      const standard = mat as THREE.MeshStandardMaterial

      if (!mesh.userData._heatmapBackup) {
        mesh.userData._heatmapBackup = {
          emissive: standard.emissive.clone(),
          emissiveIntensity: standard.emissiveIntensity,
        }
      }

      const box = new THREE.Box3().setFromObject(mesh)
      const center = new THREE.Vector3()
      box.getCenter(center)
      const regionInfo = detectRegionFromPoint(center)
      const regionId = regionInfo?.region
      const count = regionId ? regionCounts[regionId] ?? 0 : 0
      const heat = enabled ? heatStyleForCount(count) : null
      const backup = mesh.userData._heatmapBackup as { emissive: THREE.Color; emissiveIntensity: number }

      if (heat) {
        const heatColor = new THREE.Color(heat.color)
        standard.emissive.copy(heatColor)
        standard.emissiveIntensity = heat.intensity * (theme === 'light' ? 0.85 : 1)
      } else {
        standard.emissive.copy(backup.emissive)
        standard.emissiveIntensity = backup.emissiveIntensity
      }
    }
    }

    apply()
    return () => {
      cancelled = true
    }
  }, [groupRef, enabled, regionCounts, theme])
}
