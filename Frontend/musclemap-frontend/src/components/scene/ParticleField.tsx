import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Subtle moving depth particles behind the model. */
export function ParticleField({ theme }: { theme: 'dark' | 'light' }) {
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const array = new Float32Array(800 * 3)
    for (let index = 0; index < 800; index += 1) {
      array[index * 3] = (Math.random() - 0.5) * 12
      array[index * 3 + 1] = Math.random() * 6 - 2
      array[index * 3 + 2] = -2 - Math.random() * 6
    }
    return array
  }, [])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.07) * 0.08
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={theme === 'dark' ? '#1e3a5f' : '#bde0f0'} size={0.03} transparent opacity={theme === 'dark' ? 0.2 : 0.35} />
    </points>
  )
}
