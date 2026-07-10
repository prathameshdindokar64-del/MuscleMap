import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

/** Scroll-driven camera animation rig with section labels. */
export function CameraRig() {
  const { camera } = useThree()
  const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0.9, 0), [])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const animation = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-track',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => setProgress(self.progress * 100),
      },
    })
    animation
      .to(camera.position, { x: 0.3, y: 1.3, z: 1.8, duration: 1, ease: 'power2.inOut' })
      .to(lookAtTarget, { x: 0, y: 1.25, z: 0, duration: 1, ease: 'power2.inOut' }, '<')
      .to(camera.position, { x: -0.2, y: 0.95, z: 1.6, duration: 1, ease: 'power2.inOut' })
      .to(lookAtTarget, { x: 0, y: 0.9, z: 0, duration: 1, ease: 'power2.inOut' }, '<')
      .to(camera.position, { x: 0, y: 0.55, z: 1.9, duration: 1, ease: 'power2.inOut' })
      .to(camera.position, { x: 0.2, y: 0.25, z: 1.7, duration: 1, ease: 'power2.inOut' })
      .to(camera.position, { x: 0, y: 0.85, z: 3.2, duration: 1, ease: 'power2.inOut' })
    return () => {
      animation.kill()
    }
  }, [camera.position, lookAtTarget])

  useEffect(() => {
    camera.lookAt(lookAtTarget)
  }, [camera, lookAtTarget, progress])

  return null
}
