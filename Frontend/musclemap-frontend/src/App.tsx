import { useCallback, useEffect, useState } from 'react'
import { getHistory } from './api/painApi'
import { AssessmentPanel } from './components/ui/AssessmentPanel'
import { AboutSection } from './components/ui/AboutSection'
import { BodyViewer } from './components/scene/BodyViewer'
import type { ViewPreset } from './components/scene/CameraPresetController'
import { Footer } from './components/ui/Footer'
import { Header } from './components/ui/Header'
import { HeatmapLegend } from './components/ui/HeatmapLegend'
import { HeroSection } from './components/ui/HeroSection'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { ViewControls } from './components/ui/ViewControls'
import { HistoryPage } from './components/ui/HistoryPage'
import { SessionPage } from './components/ui/SessionPage'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { COMMON_ERGONOMIC_HOTSPOTS, REGION_NAMES } from './constants/regions'
import { SECTION_LABELS } from './constants/zones'
import type { AnalyzePainResponse, RegionInfo } from './types'
import { getOrCreateDeviceId } from './utils/deviceId'

import { GuidedPage } from './guided/GuidedPage'

interface AppRoute {
  view: 'map' | 'history' | 'session' | 'guided'
  sessionId?: string
}

function parseCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') return { view: 'map' }
  const path = window.location.pathname
  if (path === '/history') {
    return { view: 'history' }
  }
  if (path.startsWith('/session/')) {
    const id = path.slice('/session/'.length).replace(/\/$/, '')
    return { view: 'session', sessionId: id }
  }
  if (path === '/guided' || path.startsWith('/guided')) {
    return { view: 'guided' }
  }
  return { view: 'map' }
}

/** Root app shell composing 3D scene and assessment UI layers. */
function App() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [route, setRoute] = useState<AppRoute>(parseCurrentRoute)
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo | null>(null)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [assessmentResult, setAssessmentResult] = useState<AnalyzePainResponse | null>(null)
  const [heatmapEnabled, setHeatmapEnabled] = useState(false)
  const [heatmapMode, setHeatmapMode] = useState<'history' | 'common'>('common')
  const [regionHeatmapCounts, setRegionHeatmapCounts] = useState<Record<string, number>>({})
  const [viewPreset, setViewPreset] = useState<ViewPreset | null>(null)
  const isDarkTheme = theme === 'dark'
  const deviceId = getOrCreateDeviceId()

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path)
    setRoute(parseCurrentRoute())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      setRoute(parseCurrentRoute())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const refreshRegionCounts = useCallback(() => {
    getHistory(deviceId)
      .then((entries) => {
        const counts: Record<string, number> = {}
        for (const e of entries) {
          counts[e.region] = (counts[e.region] ?? 0) + 1
        }
        setRegionHeatmapCounts(counts)
        if (Object.keys(counts).length > 0) {
          setHeatmapMode('history')
        }
      })
      .catch(() => setRegionHeatmapCounts({}))
  }, [deviceId])

  useEffect(() => {
    refreshRegionCounts()
  }, [refreshRegionCounts, user])

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

  // Supply active counts: user history or baseline ergonomic hotspots
  const activeHeatmapCounts =
    heatmapMode === 'history' && Object.keys(regionHeatmapCounts).length > 0
      ? regionHeatmapCounts
      : COMMON_ERGONOMIC_HOTSPOTS

  if (route.view === 'guided') {
    return <GuidedPage onBack={() => navigateTo('/')} />
  }

  return (
    <div className="page-bg relative w-full overflow-x-hidden" style={{ position: 'relative' }}>
      <LoadingScreen />

      {/* 3D Body Canvas (runs behind everything; paused on full-page views if needed) */}
      <BodyViewer
        theme={theme}
        onRegionClick={handleRegionClick}
        assessmentResult={assessmentResult}
        assessmentRegionId={selectedRegion?.region ?? null}
        heatmapEnabled={heatmapEnabled}
        regionHeatmapCounts={activeHeatmapCounts}
        viewPreset={viewPreset}
        onPresetComplete={() => setViewPreset(null)}
      />

      {/* Header with Navigation */}
      <Header
        onNavigateHistory={() => navigateTo('/history')}
        onNavigateMap={() => navigateTo('/')}
      />

      {/* ROUTE: /history */}
      {route.view === 'history' && (
        <div className="relative z-20 min-h-screen pt-24 pb-16 bg-slate-950/85 backdrop-blur-md">
          <HistoryPage
            deviceId={deviceId}
            isDarkTheme={isDarkTheme}
            onOpenSession={(sessionId) => navigateTo(`/session/${sessionId}`)}
            onBackToMap={() => navigateTo('/')}
          />
        </div>
      )}

      {/* ROUTE: /session/:id */}
      {route.view === 'session' && route.sessionId && (
        <div className="relative z-20 min-h-screen pt-24 pb-16 bg-slate-950/85 backdrop-blur-md">
          <SessionPage
            sessionId={route.sessionId}
            deviceId={deviceId}
            isDarkTheme={isDarkTheme}
            onRegionLoaded={(region) => {
              const name = REGION_NAMES[region] || region
              setSelectedRegion({ region, name })
            }}
            onBack={() => navigateTo('/history')}
          />
        </div>
      )}

      {/* ROUTE: / (Main Interactive 3D Assessment) */}
      {route.view === 'map' && (
        <>
          {/* Smooth scroll track linking GSAP 3D camera timeline to page scroll */}
          <div id="scroll-track" className="relative z-[1] h-[250vh] pointer-events-none" />

          <HeroSection />

          {/* Floating Section Indicators */}
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

          {/* Slide-out Assessment Drawer */}
          <AssessmentPanel
            key={selectedRegion ? selectedRegion.region : 'panel-idle'}
            regionId={selectedRegion?.region ?? null}
            regionName={selectedRegion?.name ?? null}
            isOpen={Boolean(selectedRegion)}
            isDarkTheme={isDarkTheme}
            onClose={handleClosePanel}
            onAssessmentComplete={refreshRegionCounts}
            onResultChange={handleResultReady}
            onSelectRegion={(regId) => {
              const name = REGION_NAMES[regId] || regId
              setSelectedRegion({ region: regId, name })
            }}
          />

          {/* Senior-Friendly 3D View Angle Controls */}
          <ViewControls
            currentPreset={viewPreset}
            onSelectPreset={(preset) => setViewPreset(preset)}
            hasSelectedRegion={Boolean(selectedRegion)}
          />

          {/* Medical-Grade Heatmap Legend & Control HUD */}
          <HeatmapLegend
            isOpen={heatmapEnabled}
            onToggle={() => setHeatmapEnabled((v) => !v)}
            viewMode={heatmapMode}
            onChangeViewMode={(mode) => setHeatmapMode(mode)}
            historyCount={Object.keys(regionHeatmapCounts).length}
          />

          <AboutSection />
        </>
      )}

      <Footer />
    </div>
  )
}

export default App
