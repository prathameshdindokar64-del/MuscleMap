/**
 * GuidedPage.tsx
 * Dedicated full-page interactive camera-guided exercise screen.
 * Opened in a new browser tab so webcam & MediaPipe have 100% dedicated WebGL resources
 * without any resource contention with the main 3D canvas.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { calculateAngle, createRepCounter, type Point2D } from './poseUtils'
import { getExerciseConfigForTitle } from './exerciseConfigs'

interface GuidedPageProps {
  onBack?: () => void
}

type ModeState = 'privacy_prompt' | 'initializing' | 'active' | 'summary' | 'permission_denied'

const POSE_CONNECTIONS = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
]

export function GuidedPage({ onBack }: GuidedPageProps) {
  // Read exercise data from query params
  const [exerciseTitle, setExerciseTitle] = useState('Guided Exercise')
  const [exerciseInstructions, setExerciseInstructions] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const title = params.get('title') || 'Shoulder Mobility & Wall Slides'
      const instructions = params.get('instructions') || 'Perform smooth, controlled repetitions maintaining upright posture and relaxed breathing.'
      setExerciseTitle(title)
      setExerciseInstructions(instructions)
    }
  }, [])

  const config = useMemo(() => {
    return getExerciseConfigForTitle(exerciseTitle, exerciseInstructions)
  }, [exerciseTitle, exerciseInstructions])
  const configRef = useRef(config)
  configRef.current = config

  const [mode, setMode] = useState<ModeState>('privacy_prompt')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [repCount, setRepCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [inFrame, setInFrame] = useState(false)
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const [currentHint, setCurrentHint] = useState<{ text: string; isGood: boolean }>({
    text: 'Step back 5–7 feet so your body is framed in the center',
    isGood: true,
  })
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [liveAngle, setLiveAngle] = useState<number | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const repCounterRef = useRef<ReturnType<typeof createRepCounter> | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)
  isPausedRef.current = isPaused

  // Timer loop
  useEffect(() => {
    if (mode === 'active' && !isPaused) {
      timerIntervalRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [mode, isPaused])

  // Cleanup media
  const cleanupMedia = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (landmarkerRef.current) {
      try {
        landmarkerRef.current.close()
      } catch {
        // ignore
      }
      landmarkerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      cleanupMedia()
    }
  }, [cleanupMedia])

  // Anti-flicker real-time animation loop
  const startPoseLoop = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }

    let lastVideoTime = -1
    let lastProcessedMs = 0
    let missedFramesCount = 0
    let lastAngleReported = -1
    let lastAngleReportTime = 0
    let currentInFrameVal = false
    let currentHintText = ''

    const renderFrame = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      const landmarker = landmarkerRef.current

      if (!video || !canvas || video.paused || video.ended) {
        animFrameIdRef.current = requestAnimationFrame(renderFrame)
        return
      }

      if (video.videoWidth > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animFrameIdRef.current = requestAnimationFrame(renderFrame)
        return
      }

      // ONLY process detection and redraw when a new camera frame has arrived
      if (video.currentTime !== lastVideoTime && !isPausedRef.current && video.readyState >= 2) {
        lastVideoTime = video.currentTime

        if (landmarker) {
          try {
            const nowMs = performance.now()
            const startTimeMs = nowMs > lastProcessedMs ? nowMs : lastProcessedMs + 1
            lastProcessedMs = startTimeMs

            const poseResults = landmarker.detectForVideo(video, startTimeMs)

            if (poseResults.landmarks && poseResults.landmarks.length > 0) {
              const landmarks = poseResults.landmarks[0]
              const currentConfig = configRef.current
              const { a, b, c } = currentConfig.landmarks
              const ptA = landmarks[a]
              const ptB = landmarks[b]
              const ptC = landmarks[c]

              const isKeyVisible = Boolean(
                ptA && ptB && ptC &&
                (ptA.visibility ?? 1) > 0.35 &&
                (ptB.visibility ?? 1) > 0.35 &&
                (ptC.visibility ?? 1) > 0.35
              )

              if (isKeyVisible) {
                missedFramesCount = 0
                if (!currentInFrameVal) {
                  currentInFrameVal = true
                  setInFrame(true)
                }

                // Smooth redraw: Clear canvas ONLY right before drawing freshly detected skeleton
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                drawSkeleton(ctx, landmarks, canvas.width, canvas.height)

                // Calculate joint angle
                const angle = calculateAngle(ptA, ptB, ptC)
                const roundedAngle = Math.round(angle)

                if (nowMs - lastAngleReportTime > 80 || Math.abs(roundedAngle - lastAngleReported) >= 2) {
                  lastAngleReported = roundedAngle
                  lastAngleReportTime = nowMs
                  setLiveAngle(roundedAngle)
                }

                // Update rep counter
                if (repCounterRef.current) {
                  const repResult = repCounterRef.current.update(angle)
                  setRepCount(repResult.count)
                }

                // Posture hints with debouncing
                let targetHint = { text: 'Good form — maintain steady breathing', isGood: true }
                for (const rule of currentConfig.hintRules) {
                  if (rule.condition(angle)) {
                    targetHint = { text: rule.hint, isGood: rule.isGood }
                    break
                  }
                }
                if (targetHint.text !== currentHintText) {
                  currentHintText = targetHint.text
                  setCurrentHint(targetHint)
                }
              } else {
                // Key joints temporarily not clear: wait 24 frames (~800ms) before toggling out-of-frame to prevent blinking
                missedFramesCount++
                if (missedFramesCount > 24) {
                  if (currentInFrameVal) {
                    currentInFrameVal = false
                    setInFrame(false)
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                  }
                  if (currentHintText !== 'Step back so full body is in frame') {
                    currentHintText = 'Step back so full body is in frame'
                    setCurrentHint({ text: currentHintText, isGood: false })
                  }
                }
              }
            } else {
              missedFramesCount++
              if (missedFramesCount > 24) {
                if (currentInFrameVal) {
                  currentInFrameVal = false
                  setInFrame(false)
                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                }
                if (currentHintText !== 'Center yourself in frame to begin tracking') {
                  currentHintText = 'Center yourself in frame to begin tracking'
                  setCurrentHint({ text: currentHintText, isGood: false })
                }
              }
            }
          } catch {
            // Drop non-critical frame gracefully
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderFrame)
    }

    animFrameIdRef.current = requestAnimationFrame(renderFrame)
  }, [])

  // Attach stream to video strictly once
  useEffect(() => {
    if (mode === 'active' && videoRef.current && mediaStreamRef.current) {
      const video = videoRef.current
      let started = false

      const tryStart = () => {
        if (started) return
        started = true
        video.play().then(() => {
          startPoseLoop()
        }).catch((err) => {
          console.warn('Video play interrupted:', err)
        })
      }

      if (video.srcObject !== mediaStreamRef.current) {
        video.srcObject = mediaStreamRef.current
      }

      if (video.readyState >= 2) {
        tryStart()
      } else {
        video.onloadedmetadata = () => {
          tryStart()
        }
      }
    }
  }, [mode, startPoseLoop])

  // Start webcam and load model
  const startCameraAndDetection = async () => {
    setMode('initializing')
    setErrorMessage('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: 'user',
        },
        audio: false,
      })
      mediaStreamRef.current = stream

      repCounterRef.current = createRepCounter({
        upAngle: config.upAngle,
        downAngle: config.downAngle,
        minDurationMs: 650,
      })

      setMode('active')

      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        let landmarker: PoseLandmarker
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          })
        } catch {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          })
        }
        landmarkerRef.current = landmarker
        setModelStatus('ready')
      } catch (modelErr: any) {
        console.warn('MediaPipe model load failed, running in manual pacing mode:', modelErr)
        setModelStatus('fallback')
      }
    } catch (err: any) {
      console.error('Camera setup failed:', err)
      cleanupMedia()
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMode('permission_denied')
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser address bar.')
      } else {
        setMode('privacy_prompt')
        setErrorMessage(err.message || 'Unable to access your webcam. Check if another app is using it.')
      }
    }
  }

  // Draw skeleton overlay
  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: Point2D[],
    width: number,
    height: number
  ) => {
    ctx.lineWidth = 3.5
    ctx.strokeStyle = '#06b6d4'

    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const p1 = landmarks[startIdx]
      const p2 = landmarks[endIdx]
      if (p1 && p2 && (p1.visibility ?? 1) > 0.35 && (p2.visibility ?? 1) > 0.35) {
        ctx.beginPath()
        ctx.moveTo(p1.x * width, p1.y * height)
        ctx.lineTo(p2.x * width, p2.y * height)
        ctx.stroke()
      }
    }

    for (const lm of landmarks) {
      if ((lm.visibility ?? 1) > 0.35) {
        ctx.beginPath()
        ctx.arc(lm.x * width, lm.y * height, 4.5, 0, 2 * Math.PI)
        ctx.fillStyle = '#38bdf8'
        ctx.fill()
      }
    }
  }

  const handleReturnToAssessment = () => {
    cleanupMedia()
    if (typeof window !== 'undefined' && window.opener) {
      window.close()
    } else if (onBack) {
      onBack()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleReturnToAssessment}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition border border-slate-700"
          >
            <span>←</span> Return to Assessment
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-extrabold">MuscleMap Live Guide</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-bold uppercase">
                {config.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{exerciseTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Private On-Device Processing</span>
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        
        {/* PRIVACY PROMPT */}
        {mode === 'privacy_prompt' && (
          <div className="max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50 text-3xl">
              📹
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold">Live Camera Posture Checking</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                Real-time joint angle tracking and automated rep counting for <strong>{exerciseTitle}</strong>. 
                Webcam frames are analyzed <strong>strictly inside your browser memory</strong> and never saved or sent online.
              </p>
              <div className="rounded-2xl border border-cyan-800/40 bg-cyan-950/30 p-3.5 text-xs text-cyan-300 text-left max-w-md mx-auto">
                ⚠️ <strong>Educational Feedback:</strong> Use this as a gentle mobility aid. Stop immediately if you experience sharp pain.
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-800 bg-red-950/60 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleReturnToAssessment}
                className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startCameraAndDetection}
                className="rounded-2xl bg-cyan-500 hover:bg-cyan-400 px-8 py-3 text-sm font-extrabold text-slate-950 transition shadow-xl shadow-cyan-500/25"
              >
                Allow Camera & Begin Checking
              </button>
            </div>
          </div>
        )}

        {/* INITIALIZING SPINNER */}
        {mode === 'initializing' && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="text-base font-bold text-slate-200">Initializing camera and AI skeleton tracking...</p>
          </div>
        )}

        {/* PERMISSION DENIED */}
        {mode === 'permission_denied' && (
          <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-2xl">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold">Camera Access Required</h2>
            <p className="text-sm text-slate-300">{errorMessage}</p>
            <button
              type="button"
              onClick={handleReturnToAssessment}
              className="mt-4 rounded-xl bg-slate-800 hover:bg-slate-700 px-6 py-2.5 text-sm font-bold transition"
            >
              Return to Assessment
            </button>
          </div>
        )}

        {/* ACTIVE CAMERA CHECKING */}
        {mode === 'active' && (
          <div className="w-full max-w-5xl flex flex-col items-center space-y-5">
            {/* Cinematic Camera View Container */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center">
              {/* Webcam Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1] block bg-black"
              />

              {/* Skeleton Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
              />

              {/* CENTER TOP LIVE CHECKING STATUS HUD */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-cyan-500/50 shadow-2xl text-center">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                    modelStatus === 'ready' && inFrame ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}></span>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                    {modelStatus === 'fallback'
                      ? 'Live Checking (Pacing Mode)'
                      : inFrame
                      ? 'Live Checking Active'
                      : 'Live Checking: Calibrating'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                  {liveAngle !== null && inFrame && (
                    <>
                      <span className="text-cyan-300 font-bold">
                        {config.jointLabel}: <span className="text-white font-extrabold">{liveAngle}°</span>
                      </span>
                      <span className="text-slate-500">•</span>
                    </>
                  )}
                  <span>Reps: <strong className="text-cyan-300">{repCount}</strong> / {config.targetReps}</span>
                  <span className="text-slate-500">•</span>
                  <span>{secondsElapsed}s</span>
                </div>
              </div>

              {/* TOP RIGHT QUICK REP ADJUSTMENT */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setRepCount((r) => r + 1)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-lg transition flex items-center gap-1.5"
                  title="Click to manually record a completed rep"
                >
                  <span>+1 Rep</span>
                </button>
              </div>

              {/* CENTER TARGET FRAME (When user needs to align) */}
              {!inFrame && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                  <div className="w-80 sm:w-96 aspect-[3/4] max-h-[70%] rounded-3xl border-2 border-dashed border-cyan-400/60 bg-cyan-950/40 flex flex-col items-center justify-center p-6 text-center">
                    <div className="h-14 w-14 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3 text-cyan-300 text-2xl border border-cyan-400/40">
                      👤
                    </div>
                    <p className="text-base font-extrabold text-white">Center Body in Middle</p>
                    <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                      Step back so your body is framed in the center to begin live checking
                    </p>
                  </div>
                </div>
              )}

              {/* CENTER BOTTOM REAL-TIME GUIDANCE BANNER */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-20">
                <div className={`backdrop-blur-md rounded-2xl p-3.5 border shadow-2xl text-center transition-all ${
                  currentHint.isGood ? 'bg-slate-900/95 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/95 border-amber-500/60 text-amber-300'
                }`}>
                  <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold">
                    <span>{currentHint.isGood ? '✓' : 'ℹ'}</span>
                    <span>{currentHint.text}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Instructions Card */}
            <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-cyan-400 font-extrabold mb-1">Movement Protocol</p>
              <p className="text-sm text-slate-200 leading-relaxed">{config.instructions}</p>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 text-sm font-bold hover:bg-slate-700 transition"
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button
                type="button"
                onClick={() => setRepCount(0)}
                className="rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-700 transition"
                title="Reset rep counter to zero"
              >
                ↺ Reset Reps
              </button>
              <button
                type="button"
                onClick={() => {
                  cleanupMedia()
                  setMode('summary')
                }}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-7 py-2.5 text-sm font-black text-slate-950 transition shadow-lg shadow-cyan-500/20"
              >
                Finish Exercise
              </button>
            </div>
          </div>
        )}

        {/* WORKOUT SUMMARY SCREEN */}
        {mode === 'summary' && (
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 text-3xl">
              ✓
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black">Exercise Completed!</h2>
              <p className="text-sm text-slate-400">Great session! Your form tracking results have been recorded.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
              <div>
                <div className="text-3xl font-black text-cyan-400">{repCount}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Completed Reps</div>
              </div>
              <div>
                <div className="text-3xl font-black text-cyan-400">{secondsElapsed}s</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Active Time</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReturnToAssessment}
              className="w-full rounded-2xl bg-cyan-500 hover:bg-cyan-400 py-3.5 text-sm font-black text-slate-950 transition shadow-xl shadow-cyan-500/20"
            >
              Return to Assessment
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
