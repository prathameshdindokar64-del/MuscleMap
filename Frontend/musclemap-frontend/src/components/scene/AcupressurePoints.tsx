/**
 * AcupressurePoints.tsx
 * Glowing amber markers and glass-styled HTML labels on the 3D anatomy model.
 */
import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AcupressurePoint } from '../../types'

const AMBER = '#f59e0b'

function PulseMarker({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const mat = meshRef.current?.material as THREE.MeshStandardMaterial | undefined
    if (!mat) return
    const pulse = 2 + Math.sin((clock.elapsedTime * Math.PI * 2) / 0.8) * 0.5
    mat.emissiveIntensity = pulse
  })
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.014, 16, 16]} />
      <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={2} />
    </mesh>
  )
}

function TechniqueLabel({
  point,
  theme,
  delayMs,
}: {
  point: AcupressurePoint & { position: [number, number, number] }
  theme: 'dark' | 'light'
  delayMs: number
}) {
  const [open, setOpen] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), delayMs)
    return () => window.clearTimeout(t)
  }, [delayMs])

  const offset: [number, number, number] = [point.position[0] + 0.12, point.position[1] + 0.14, point.position[2] + 0.05]

  if (!show) return null

  return (
    <Html position={offset} style={{ pointerEvents: 'auto' }} zIndexRange={[40, 0]}>
      <div
        className="glass max-w-[220px] rounded-xl p-3 text-left transition-opacity duration-300"
        style={{
          borderColor: 'rgba(245, 158, 11, 0.5)',
          opacity: show ? 1 : 0,
          color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-primary)',
        }}
      >
        <p className="text-xs font-bold" style={{ color: AMBER }}>
          <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: AMBER }} />
          {point.name}
        </p>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {point.description}
        </p>
        <button
          type="button"
          className="mt-2 w-full rounded-lg py-1 text-left text-[11px] font-semibold"
          style={{ color: AMBER }}
          onClick={() => setOpen((o) => !o)}
        >
          👆 Technique {open ? '▲' : '▼'}
        </button>
        {open && <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{point.technique}</p>}
      </div>
    </Html>
  )
}

/**
 * Renders acupressure markers for the current assessment region.
 */
export function AcupressurePoints({ points, theme }: { points: AcupressurePoint[]; theme: 'dark' | 'light' }) {
  const withPos = points.filter((p): p is AcupressurePoint & { position: [number, number, number] } => p.position != null)
  if (withPos.length === 0) return null

  return (
    <>
      {withPos.map((point, index) => (
        <group key={`${point.name}-${index}`}>
          <PulseMarker position={point.position} />
          <Line
            points={[point.position, [point.position[0] + 0.06, point.position[1] + 0.08, point.position[2] + 0.03]]}
            color={AMBER}
            lineWidth={1}
            transparent
            opacity={0.85}
          />
          <TechniqueLabel point={point} theme={theme} delayMs={index * 200} />
        </group>
      ))}
    </>
  )
}
