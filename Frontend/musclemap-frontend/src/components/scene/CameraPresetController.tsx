/**
 * CameraPresetController.tsx
 * Smoothly animates the camera between view presets (Front, Back, Upper Body, Lower Body, Reset)
 * to provide an effortless, accessible 3D navigation experience for seniors.
 */
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import gsap from 'gsap'

export type ViewPreset = 'front' | 'back' | 'upper' | 'lower' | 'reset'

const PRESET_CONFIGS: Record<ViewPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [0, 0.95, 2.5], target: [0, 0.92, 0] },
  back: { pos: [0, 0.95, -2.5], target: [0, 0.92, 0] },
  upper: { pos: [0, 1.35, 1.5], target: [0, 1.32, 0] },
  lower: { pos: [0, 0.45, 1.5], target: [0, 0.42, 0] },
  reset: { pos: [0, 0.85, 2.6], target: [0, 0.92, 0] },
}

export function CameraPresetController({
  preset,
  onComplete,
}: {
  preset: ViewPreset | null
  onComplete?: () => void
}) {
  const { camera } = useThree()

  useEffect(() => {
    if (!preset) return
    const cfg = PRESET_CONFIGS[preset]
    if (!cfg) return

    gsap.to(camera.position, {
      x: cfg.pos[0],
      y: cfg.pos[1],
      z: cfg.pos[2],
      duration: 1.1,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(cfg.target[0], cfg.target[1], cfg.target[2])
      },
      onComplete: () => {
        camera.lookAt(cfg.target[0], cfg.target[1], cfg.target[2])
        onComplete?.()
      },
    })
  }, [preset, camera, onComplete])

  return null
}
