import { a, useSpring } from '@react-spring/three'
import * as THREE from 'three'

/** Expanding ring pulse at user click hitpoint. */
export function RippleEffect({ point }: { point: THREE.Vector3 | null }) {
  const spring = useSpring({
    from: { scale: 1, opacity: 1 },
    to: { scale: 8, opacity: 0 },
    reset: true,
    config: { duration: 700 },
  })

  if (!point) return null
  return (
    <a.mesh position={point} rotation={[-Math.PI / 2, 0, 0]} scale={spring.scale}>
      <ringGeometry args={[0.01, 0.03, 32]} />
      <a.meshBasicMaterial color="#0d9488" transparent opacity={spring.opacity} />
    </a.mesh>
  )
}
