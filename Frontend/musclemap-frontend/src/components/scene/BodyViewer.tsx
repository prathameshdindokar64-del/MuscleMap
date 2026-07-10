import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import type { AnalyzePainResponse, RegionInfo } from '../../types'
import { AnatomyModel } from './AnatomyModel'
import { CameraRig } from './CameraRig'
import { ParticleField } from './ParticleField'

function Lights({ theme }: { theme: 'dark' | 'light' }) {
  if (theme === 'dark') {
    return (
      <>
        <ambientLight intensity={0.08} />
        <directionalLight position={[2.5, 5, 3.5]} intensity={1.8} castShadow />
        <pointLight position={[-3.5, 2.5, -2.5]} intensity={0.9} color="#0ea5e9" />
        <pointLight position={[3.5, 1.5, -2.5]} intensity={0.6} color="#14b8a6" />
        <pointLight position={[0, -0.5, 1.5]} intensity={0.25} />
        <pointLight position={[0, 1.2, 3]} intensity={0.3} color="#f0f4ff" />
      </>
    )
  }
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 4, 3]} intensity={1} castShadow />
      <directionalLight position={[-2, 3, 2]} intensity={0.5} color="#e8f4ff" />
      <directionalLight position={[2, 2, 2]} intensity={0.4} />
      <pointLight position={[0, -1, 2]} intensity={0.3} />
    </>
  )
}

/** Fixed full-screen 3D viewport and controls. */
export function BodyViewer({
  theme,
  onRegionClick,
  assessmentResult,
  assessmentRegionId,
  heatmapEnabled,
  regionHeatmapCounts,
}: {
  theme: 'dark' | 'light'
  onRegionClick: (info: RegionInfo) => void
  assessmentResult: AnalyzePainResponse | null
  assessmentRegionId: string | null
  heatmapEnabled: boolean
  regionHeatmapCounts: Record<string, number>
}) {
  return (
    <Canvas
      shadows
      camera={{ fov: 42, position: [0, 0.85, 2.6], near: 0.01, far: 50 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ParticleField theme={theme} />
      <Lights theme={theme} />
      <CameraRig />
      <Suspense fallback={null}>
        <AnatomyModel
          onRegionClick={onRegionClick}
          theme={theme}
          assessmentResult={assessmentResult}
          assessmentRegionId={assessmentRegionId}
          heatmapEnabled={heatmapEnabled}
          regionHeatmapCounts={regionHeatmapCounts}
        />
      </Suspense>
      <OrbitControls
        target={[0, 0.92, 0]}
        enablePan={false}
        minDistance={1}
        maxDistance={5.5}
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={0.1}
        maxPolarAngle={2.8}
      />
    </Canvas>
  )
}
