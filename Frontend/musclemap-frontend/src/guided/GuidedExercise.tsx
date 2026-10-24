/**
 * GuidedExercise.tsx
 * Full-screen guided exercise modal using MediaPipe PoseLandmarker for real-time rep counting and posture hints.
 * 
 * Reliability & Privacy:
 * - Webcam stream attaches immediately with autoPlay and onloadedmetadata — never shows a black screen.
 * - Webcam frames are processed strictly locally in browser memory — never recorded, uploaded, or transmitted.
 * - Graceful fallback: If MediaPipe model download is slow or fails, live video and guided pacing timer remain active.
 * - Educational guidance only: no medical diagnostic or therapeutic claims. "Guidance is approximate."
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { calculateAngle, createRepCounter, type Point2D } from './poseUtils'
import { getExerciseConfigForTitle } from './exerciseConfigs'
import type { Exercise } from '../types'

interface GuidedExerciseProps {
  exercise: Exercise
  isOpen: boolean
  onClose: () => void
}

type ModeState = 'privacy_prompt' | 'initializing' | 'active' | 'summary' | 'permission_denied'

// MediaPipe Pose connections for skeleton overlay
const POSE_CONNECTIONS = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
]

export function GuidedExercise({ exercise, isOpen, onClose }: GuidedExerciseProps) {
  const [mode, setMode] = useState<ModeState>('privacy_prompt')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [repCount, setRepCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [inFrame, setInFrame] = useState(false)
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const [currentHint, setCurrentHint] = useState<{ text: string; isGood: boolean }>({
    text: 'Step back so full body is visible in the frame',
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

  const config = useMemo(() => {
    return getExerciseConfigForTitle(exercise.title, exercise.instructions)
  }, [exercise.title, exercise.instructions])
  const configRef = useRef(config)
  configRef.current = config

  // Timer effect when active and not paused
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

  // Stop everything on close or unmount
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
    if (!isOpen) {
      cleanupMedia()
      setMode('privacy_prompt')
      setRepCount(0)
      setSecondsElapsed(0)
      setIsPaused(false)
      setModelStatus('loading')
    }
    return () => {
      cleanupMedia()
    }
  }, [isOpen, cleanupMedia])

  // Real-time animation loop with anti-flicker buffering and throttled state updates
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

      if (video.videoWidth > 0 && video.videoHeight > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
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
            // MediaPipe requires strictly increasing timestamps
            const startTimeMs = nowMs > lastProcessedMs ? nowMs : lastProcessedMs + 1
            lastProcessedMs = startTimeMs

            const poseResults = landmarker.detectForVideo(video, startTimeMs)
            const currentConfig = configRef.current

            if (poseResults.landmarks && poseResults.landmarks.length > 0) {
              const landmarks = poseResults.landmarks[0]
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

                // Smooth redraw: Clear canvas ONLY right before drawing the new skeleton
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                drawSkeleton(ctx, landmarks, canvas.width, canvas.height)

                // Calculate joint angle
                const angle = calculateAngle(ptA, ptB, ptC)
                const roundedAngle = Math.round(angle)

                // Throttle angle state updates to eliminate React re-render flicker
                if (nowMs - lastAngleReportTime > 90 || Math.abs(roundedAngle - lastAngleReported) >= 2) {
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
                let targetHint = { text: 'Good posture — maintain steady breathing', isGood: true }
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
                if (currentHintText !== 'Step into frame to begin tracking') {
                  currentHintText = 'Step into frame to begin tracking'
                  setCurrentHint({ text: currentHintText, isGood: false })
                }
              }
            }
          } catch {
            // Frame detection dropped gracefully without wiping canvas
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderFrame)
    }

    animFrameIdRef.current = requestAnimationFrame(renderFrame)
  }, [])

  // Attach stream to video strictly once when active
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

  // Initialize Camera first (so video shows immediately), then MediaPipe PoseLandmarker
  const startCameraAndDetection = async () => {
    setMode('initializing')
    setErrorMessage('')

    try {
      // 1. Request Camera FIRST so user gets instant visual feedback
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })
      mediaStreamRef.current = stream

      // Initialize Rep Counter
      repCounterRef.current = createRepCounter({
        upAngle: config.upAngle,
        downAngle: config.downAngle,
        minDurationMs: 650,
      })

      // Switch to active immediately so video element mounts and displays stream
      setMode('active')

      // 2. Load PoseLandmarker in background
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

  // Draw landmarks and connector lines on canvas
  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: Point2D[],
    width: number,
    height: number
  ) => {
    ctx.lineWidth = 3
    ctx.strokeStyle = '#06b6d4' // teal/cyan accent

    // Draw connection lines
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

    // Draw landmark dots
    for (const lm of landmarks) {
      if ((lm.visibility ?? 1) > 0.35) {
        ctx.beginPath()
        ctx.arc(lm.x * width, lm.y * height, 4, 0, 2 * Math.PI)
        ctx.fillStyle = '#38bdf8'
        ctx.fill()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-white shadow-2xl flex flex-col max-h-[94vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/95">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Interactive Guided Exercise</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-semibold capitalize">
                {config.category} Mobility
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mt-0.5">
              {exercise.title}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                Live Posture Guidance
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition text-lg"
            aria-label="Close guided exercise"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">

          {/* PRIVACY PROMPT */}
          {mode === 'privacy_prompt' && (
            <div className="max-w-lg text-center space-y-5 py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Private & On-Device Tracking</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your webcam video is processed <strong>strictly in your browser memory</strong>. Video is never uploaded, recorded, or sent over the internet.
                </p>
                <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/30 p-3 text-xs text-cyan-300">
                  ⚠️ <strong>Educational guidance only:</strong> Provides approximate visual feedback to encourage gentle mobility. Never force movement through sharp pain.
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-800 bg-red-950/50 p-3 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={startCameraAndDetection}
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-sm font-bold text-slate-950 transition shadow-lg shadow-cyan-500/20"
                >
                  Allow Camera & Start
                </button>
              </div>
            </div>
          )}

          {/* PERMISSION DENIED */}
          {mode === 'permission_denied' && (
            <div className="max-w-md text-center space-y-4 py-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                ⚠️
              </div>
              <h3 className="text-xl font-bold">Camera Access Required</h3>
              <p className="text-sm text-slate-300">{errorMessage}</p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-slate-700 transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* INITIALIZING SPINNER */}
          {mode === 'initializing' && (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
              <p className="text-sm font-semibold text-slate-300">Starting webcam and preparing posture tracking...</p>
            </div>
          )}

          {/* ACTIVE TRACKING */}
          {mode === 'active' && (
            <div className="w-full flex flex-col items-center space-y-4">
              {/* Video container */}
              <div className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center">
                {/* Mirrored webcam video */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1] block bg-black"
                />

                {/* Canvas skeleton overlay (mirrored to align exactly over video) */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
                />

                {/* Centered Top Live Checking HUD */}
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

                {/* Top-Right Quick Rep Tap */}
                <div className="absolute top-4 right-4 z-20">
                  <button
                    type="button"
                    onClick={() => setRepCount((r) => r + 1)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg transition flex items-center gap-1"
                    title="Click to manually record a completed rep"
                  >
                    <span>+1 Rep</span>
                  </button>
                </div>

                {/* Centered Guide Box when Calibrating in Middle of Screen */}
                {!inFrame && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-72 sm:w-88 aspect-[3/4] max-h-[70%] rounded-3xl border-2 border-dashed border-cyan-400/60 bg-cyan-950/40 flex flex-col items-center justify-center p-6 text-center">
                      <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2 text-cyan-300 text-2xl border border-cyan-400/40">
                        👤
                      </div>
                      <p className="text-sm font-extrabold text-white">Center Body in Middle</p>
                      <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                        Step back so your body is framed to activate tracking
                      </p>
                    </div>
                  </div>
                )}

                {/* Centered Real-time Posture Guidance Banner */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-20">
                  <div className={`backdrop-blur-md rounded-2xl p-3 border shadow-2xl text-center transition-all ${
                    currentHint.isGood ? 'bg-slate-900/95 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/95 border-amber-500/60 text-amber-300'
                  }`}>
                    <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold">
                      <span>{currentHint.isGood ? '✓' : 'ℹ'}</span>
                      <span>{currentHint.text}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs sm:text-sm text-slate-300 max-w-2xl text-center leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <strong className="text-cyan-400">Movement Guide:</strong> {config.instructions}
              </div>

              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-slate-700 transition"
                >
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
                <button
                  type="button"
                  onClick={() => setRepCount(0)}
                  className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-700 transition"
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
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-sm font-bold text-slate-950 transition shadow-md shadow-cyan-500/20"
                >
                  Finish Exercise
                </button>
              </div>
            </div>
          )}

          {/* SUMMARY SCREEN */}
          {mode === 'summary' && (
            <div className="max-w-md w-full text-center space-y-6 py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Exercise Completed!</h3>
                <p className="text-sm text-slate-400">Great job practicing gentle movement for your recovery.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                <div>
                  <div className="text-2xl font-extrabold text-cyan-400">{repCount}</div>
                  <div className="text-xs text-slate-400">Completed Reps</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-cyan-400">{secondsElapsed}s</div>
                  <div className="text-xs text-slate-400">Time Spent</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed italic">
                Remember to stay hydrated and rest between sets. If you feel any sharp pain, pause immediately.
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-950 transition shadow-lg shadow-cyan-500/20"
              >
                Back to Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
