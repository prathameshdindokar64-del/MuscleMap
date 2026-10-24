/**
 * ExerciseCard.tsx
 * Displays a recommended exercise with lazy-loaded YouTube video embeds and interactive Guided Mode.
 */

import { useState } from 'react'
import type { Exercise, ExerciseVideoResponse } from '../../types'
import { getExerciseVideo } from '../../api/painApi'

interface ExerciseCardProps {
  exercise: Exercise
  language?: 'en' | 'hi'
  onStartGuided?: (exercise: Exercise) => void
}

export function ExerciseCard({ exercise, language = 'en', onStartGuided }: ExerciseCardProps) {
  const [videoOpen, setVideoOpen] = useState(false)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [videoData, setVideoData] = useState<ExerciseVideoResponse | null>(null)

  const handleToggleVideo = async () => {
    if (videoOpen) {
      setVideoOpen(false)
      return
    }

    if (!videoData) {
      setIsLoadingVideo(true)
      try {
        const idToLookup = exercise.id || exercise.title.toLowerCase().replace(/\s+/g, '-')
        const res = await getExerciseVideo(idToLookup)
        setVideoData(res)
      } catch {
        // Fallback search URL
        const query = encodeURIComponent(`${exercise.title} how to physiotherapy beginner`)
        setVideoData({
          videoId: null,
          searchUrl: `https://www.youtube.com/results?search_query=${query}`,
        })
      } finally {
        setIsLoadingVideo(false)
      }
    }

    setVideoOpen(true)
  }

  const isHindi = language === 'hi'

  return (
    <article
      className="glass rounded-xl border-l-4 p-4 transition duration-200"
      style={{
        borderLeftColor: 'var(--accent)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-bold text-base">{exercise.title}</h4>
        {exercise.guidedModeAvailable && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-700/50">
            {isHindi ? 'कैमरा मार्गदर्शन उपलब्ध' : 'Guided Camera Ready'}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {exercise.instructions}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {exercise.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              background: 'var(--glass-bg-strong)',
              color: 'var(--text-accent)',
              border: '1px solid var(--glass-border-accent)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Embedded Video Player */}
      {videoOpen && (
        <div className="mt-4 rounded-xl overflow-hidden border border-slate-700 bg-black/90 p-2">
          {isLoadingVideo ? (
            <div className="flex items-center justify-center py-10 gap-2 text-xs text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></span>
              <span>{isHindi ? 'शैक्षणिक वीडियो खोजा जा रहा है...' : 'Finding educational video...'}</span>
            </div>
          ) : videoData?.videoId ? (
            <div className="space-y-2">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoData.videoId}?rel=0`}
                  title={exercise.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span className="truncate">{videoData.title || exercise.title}</span>
                <a
                  href={videoData.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline shrink-0 ml-2"
                >
                  {isHindi ? 'यूट्यूब पर देखें ↗' : 'Open in YouTube ↗'}
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center space-y-2">
              <p className="text-xs text-slate-300">
                {isHindi
                  ? 'सीधा वीडियो वर्तमान में उपलब्ध नहीं है। सहायता के लिए यूट्यूब पर देखें:'
                  : 'Direct embedded video currently unavailable or API quota reached.'}
              </p>
              {videoData?.searchUrl && (
                <a
                  href={videoData.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-xs font-bold transition shadow-sm"
                >
                  <span>▶</span> {isHindi ? 'यूट्यूब पर वीडियो खोजें ↗' : 'Search Video on YouTube ↗'}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/40">
        <button
          type="button"
          onClick={handleToggleVideo}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:opacity-90"
          style={{
            borderColor: 'var(--glass-border)',
            background: videoOpen ? 'var(--accent)' : 'var(--glass-bg)',
            color: videoOpen ? '#ffffff' : 'var(--text-primary)',
          }}
        >
          <span>
            {videoOpen
              ? isHindi ? '✕ वीडियो छिपाएं' : '✕ Hide Video'
              : isHindi ? '▶ प्रदर्शन वीडियो देखें' : '▶ Watch Video'}
          </span>
        </button>

        {exercise.guidedModeAvailable && onStartGuided && (
          <button
            type="button"
            onClick={() => onStartGuided(exercise)}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-sm bg-cyan-600 hover:bg-cyan-500 text-white"
            title={isHindi ? 'नए टैब में लाइव शारीरिक मुद्रा सुधार शुरू करें' : 'Open live posture correction in a new tab'}
          >
            <span>📹</span> {isHindi ? 'मार्गदर्शित व्यायाम शुरू करें ↗' : 'Open Guided Mode ↗'}
          </button>
        )}
      </div>
    </article>
  )
}
