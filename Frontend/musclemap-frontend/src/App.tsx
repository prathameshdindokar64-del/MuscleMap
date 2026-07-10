import { useCallback, useEffect, useState } from 'react'
import { getHistory } from './api/painApi'
import { AssessmentPanel } from './components/ui/AssessmentPanel'
import { AboutSection } from './components/ui/AboutSection'
import { BodyViewer } from './components/scene/BodyViewer'
import { Footer } from './components/ui/Footer'
import { Header } from './components/ui/Header'
import { HeroSection } from './components/ui/HeroSection'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { useTheme } from './context/ThemeContext'
import { SECTION_LABELS } from './constants/zones'
import type { AnalyzePainResponse, RegionInfo } from './types'
import { getOrCreateDeviceId } from './utils/deviceId'

/** Root app shell composing 3D scene and assessment UI layers. */
function App() {
  const { theme } = useTheme()
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo | null>(null)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [assessmentResult, setAssessmentResult] = useState<AnalyzePainResponse | null>(null)
  const [heatmapEnabled, setHeatmapEnabled] = useState(false)
  const [regionHeatmapCounts, setRegionHeatmapCounts] = useState<Record<string, number>>({})
  const isDarkTheme = theme === 'dark'
  const deviceId = getOrCreateDeviceId()

  const refreshRegionCounts = useCallback(() => {
    getHistory(deviceId)
      .then((entries) => {
        const counts: Record<string, number> = {}
        for (const e of entries) {
          counts[e.region] = (counts[e.region] ?? 0) + 1
        }
        setRegionHeatmapCounts(counts)
      })
      .catch(() => setRegionHeatmapCounts({}))
  }, [deviceId])

  useEffect(() => {
    refreshRegionCounts()
  }, [refreshRegionCounts])

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const nextPercent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0
      setScrollPercent(nextPercent)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleRegionClick = (info: RegionInfo) => {
    setSelectedRegion(info)
    setAssessmentResult(null)
  }

  const handleClosePanel = () => {
    setSelectedRegion(null)
    setAssessmentResult(null)
  }

  const handleResultReady = (result: AnalyzePainResponse | null) => {
    setAssessmentResult(result)
  }

  return (
    <div className="page-bg relative w-full overflow-x-hidden" style={{ position: 'relative' }}>
      <LoadingScreen />
      <BodyViewer
        theme={theme}
        onRegionClick={handleRegionClick}
        assessmentResult={assessmentResult}
        assessmentRegionId={selectedRegion?.region ?? null}
        heatmapEnabled={heatmapEnabled}
        regionHeatmapCounts={regionHeatmapCounts}
      />
      <div className="relative z-[1] h-[600vh] pointer-events-none" />
      <HeroSection />
      <Header />
      <div className="pointer-events-none fixed left-1/2 top-24 z-10 -translate-x-1/2">
        {SECTION_LABELS.map((item) => (
          <div
            key={item.label}
            className={`section-label ${scrollPercent >= item.start && scrollPercent < item.end ? 'opacity-100' : 'opacity-0'}`}
            style={{ color: isDarkTheme ? 'var(--text-accent)' : 'var(--text-primary)' }}
          >
            {item.label}
          </div>
        ))}
      </div>
      <AssessmentPanel
        key={selectedRegion ? selectedRegion.region : 'panel-idle'}
        regionId={selectedRegion?.region ?? null}
        regionName={selectedRegion?.name ?? null}
        isOpen={Boolean(selectedRegion)}
        isDarkTheme={isDarkTheme}
        onClose={handleClosePanel}
        onAssessmentComplete={refreshRegionCounts}
        onResultChange={handleResultReady}
      />
      <button
        type="button"
        onClick={() => setHeatmapEnabled((v) => !v)}
        className="glass fixed bottom-6 left-4 z-20 rounded-full px-4 py-2 text-xs font-semibold shadow-lg"
        style={{
          borderColor: heatmapEnabled ? 'var(--glass-border-accent)' : 'var(--glass-border)',
          boxShadow: heatmapEnabled ? '0 0 18px var(--accent-glow)' : undefined,
          color: 'var(--text-primary)',
        }}
      >
        🌡 Heatmap
      </button>
      <AboutSection />
      <Footer />
    </div>
  )
}

export default App
