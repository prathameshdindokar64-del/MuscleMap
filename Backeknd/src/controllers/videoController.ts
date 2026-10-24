/**
 * videoController.ts
 * Handles GET /api/exercises/:id/video
 * Fetches educational exercise video metadata via YouTube Data API v3 with a 30-day SQLite cache.
 * Always falls back to status 200 with videoId: null and searchUrl if the key is missing or quota exceeded.
 */

import { Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { YOUTUBE_API_KEY } from '../config';
import { VideoCacheRow } from '../types';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const VIDEO_QUERY_SUFFIX = 'how to physiotherapy beginner';

export const getExerciseVideo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  // Find exercise title
  let exerciseTitle = 'Physiotherapy exercise';
  const exerciseRow = db.prepare('SELECT title FROM exercises WHERE id = ?').get(id) as { title: string } | undefined;
  if (exerciseRow && exerciseRow.title) {
    exerciseTitle = exerciseRow.title;
  }

  const query = `${exerciseTitle} ${VIDEO_QUERY_SUFFIX}`;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  // 1. Check video_cache
  try {
    const cached = db.prepare('SELECT * FROM video_cache WHERE exercise_id = ?').get(id) as VideoCacheRow | undefined;
    if (cached && cached.fetched_at) {
      const fetchedTime = new Date(cached.fetched_at).getTime();
      const ageMs = Date.now() - fetchedTime;
      if (ageMs < THIRTY_DAYS_MS) {
        return res.json({
          videoId: cached.video_id || null,
          title: cached.video_title || undefined,
          channel: cached.channel || undefined,
          searchUrl,
        });
      }
    }
  } catch {
    // If cache table read fails, continue to live lookup
  }

  // 2. If no API key configured, gracefully return null videoId with searchUrl fallback
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.trim() === '') {
    return res.json({
      videoId: null,
      searchUrl,
    });
  }

  // 3. Query YouTube Data API v3
  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&safeSearch=strict&maxResults=1&videoDuration=short&q=${encodeURIComponent(query)}&key=${encodeURIComponent(YOUTUBE_API_KEY)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const apiRes = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      return res.json({
        videoId: null,
        searchUrl,
      });
    }

    const data = await apiRes.json() as any;
    const firstItem = data?.items?.[0];

    if (firstItem && firstItem.id?.videoId) {
      const videoId = firstItem.id.videoId;
      const title = firstItem.snippet?.title || exerciseTitle;
      const channel = firstItem.snippet?.channelTitle || '';

      // Save to cache
      try {
        db.prepare(`
          INSERT INTO video_cache (exercise_id, video_id, video_title, channel, fetched_at)
          VALUES (?, ?, ?, ?, datetime('now'))
          ON CONFLICT(exercise_id) DO UPDATE SET
            video_id = excluded.video_id,
            video_title = excluded.video_title,
            channel = excluded.channel,
            fetched_at = excluded.fetched_at
        `).run(id, videoId, title, channel);
      } catch {
        // Cache write failed silently
      }

      return res.json({
        videoId,
        title,
        channel,
        searchUrl,
      });
    }

    return res.json({
      videoId: null,
      searchUrl,
    });
  } catch {
    // Never crash or return 500 on YouTube errors
    return res.json({
      videoId: null,
      searchUrl,
    });
  }
};
