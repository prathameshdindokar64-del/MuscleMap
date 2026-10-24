/**
 * BodyHeatmap.tsx
 * Visualizes pain and tension frequency directly onto the 3D body model.
 * Uses subtle localized point lights and soft glow halos — designed to be
 * informative without overwhelming the user.
 */
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { REGION_COORDINATES, REGION_DISPLAY_NAMES } from '../../constants/regions'
import type { RegionInfo } from '../../types'

export interface HeatSpot {
  region: string
  name: string
  count: number
  color: string
  glowColor: string
  intensity: number
  position: [number, number, number]
  levelName: 'Mild' | 'Moderate' | 'High'
}

/** Maximum light intensity for the hottest spots (keeps things subtle). */
const MAX_LIGHT_INTENSITY = 1.2

/** Determines thermal styling based on occurrence count. */
export function getThermalStyle(count: number): {
  color: string
  glowColor: string
  intensity: number
  levelName: 'Mild' | 'Moderate' | 'High'
} {
  if (count <= 1) {
    return {
      color: '#34d399',      // Soft emerald
      glowColor: '#6ee7b7',
      intensity: 0.6,
      levelName: 'Mild',
    }
  }
  if (count <= 3) {
    return {
      color: '#fbbf24',      // Muted amber
      glowColor: '#fcd34d',
      intensity: 0.9,
      levelName: 'Moderate',
    }
  }
  return {
    color: '#f87171',        // Soft red (not harsh crimson)
    glowColor: '#fca5a5',
    intensity: MAX_LIGHT_INTENSITY,
    levelName: 'High',
  }
}

/** Individual 3D thermal hotspot with gentle point lighting and a soft halo. */
function HotspotNode({
  spot,
  theme,
  onSelectRegion,
}: {
  spot: HeatSpot
  theme: 'dark' | 'light'
  onSelectRegion?: (info: RegionInfo) => void
}) {
  const haloRef = useRef<THREE.Mesh>(null)

  // Gentle, slow breathing animation — no pulsing radar ring
  useFrame(({ clock }) => {
    if (haloRef.current) {
      const t = clock.elapsedTime
      const scale = 1 + Math.sin(t * 1.2 + spot.position[1]) * 0.06
      haloRef.current.scale.set(scale, scale, scale)
    }
  })

  const [x, y, z] = spot.position
  const lightDistance = 0.4
  const lightIntensity = theme === 'dark' ? spot.intensity * 1.0 : spot.intensity * 0.7

  return (
    <group position={[x, y, z]}>
      {/* Subtle thermal point light — gentle illumination on body contours */}
      <pointLight
        color={spot.color}
        intensity={lightIntensity}
        distance={lightDistance}
        decay={2}
      />

      {/* Small core dot */}
      <mesh>
        <sphereGeometry args={[0.016, 12, 12]} />
        <meshBasicMaterial color={spot.color} />
      </mesh>

      {/* Soft, translucent halo — no additive blending for subtlety */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial
          color={spot.glowColor}
          transparent
          opacity={theme === 'dark' ? 0.18 : 0.12}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Minimal floating label — compact and translucent */}
      <Html
        position={[0, 0.065, 0]}
        center
        style={{ pointerEvents: 'auto', userSelect: 'none' }}
        zIndexRange={[30, 0]}
      >
        <button
          type="button"
          onClick={() =>
            onSelectRegion?.({
              region: spot.region,
              name: spot.name,
            })
          }
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm transition-transform hover:scale-105"
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: `1px solid ${spot.color}44`,
            color: '#e2e8f0',
            backdropFilter: 'blur(6px)',
            whiteSpace: 'nowrap',
          }}
          title={`Click to assess ${spot.name}`}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: spot.color }}
          />
          <span>{spot.name}</span>
        </button>
      </Html>
    </group>
  )
}

/** Renders all active thermal hotspots across the anatomical model. */
export function BodyHeatmap({
  enabled,
  counts,
  theme,
  onSelectRegion,
}: {
  enabled: boolean
  counts: Record<string, number>
  theme: 'dark' | 'light'
  onSelectRegion?: (info: RegionInfo) => void
}) {
  if (!enabled) return null

  const activeSpots: HeatSpot[] = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([region, count]) => {
      const position = REGION_COORDINATES[region] ?? [0, 1.0, 0]
      const name = REGION_DISPLAY_NAMES[region] ?? region
      const style = getThermalStyle(count)
      return {
        region,
        name,
        count,
        position,
        ...style,
      }
    })

  if (activeSpots.length === 0) return null

  return (
    <group>
      {activeSpots.map((spot) => (
        <HotspotNode
          key={spot.region}
          spot={spot}
          theme={theme}
          onSelectRegion={onSelectRegion}
        />
      ))}
    </group>
  )
}
