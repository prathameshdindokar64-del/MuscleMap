import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/** Pulsing emissive sphere marking selected region. */
export function RegionPin({ point }: { point: THREE.Vector3 | null }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const material = meshRef.current.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = 2.2 + Math.sin(clock.elapsedTime * 5.7) * 0.4
  })

  if (!point) return null
  return (
    <mesh ref={meshRef} position={point}>
      <sphereGeometry args={[0.016, 16, 16]} />
      <meshStandardMaterial color="#0d9488" emissive="#0d9488" emissiveIntensity={2.2} />
    </mesh>
  )
}
