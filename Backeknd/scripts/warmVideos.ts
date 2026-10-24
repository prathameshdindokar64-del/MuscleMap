/**
 * warmVideos.ts
 * Script to pre-warm the YouTube video cache for all seeded exercises.
 * Usage: npm run warm-videos
 */

import { initializeDatabase } from '../src/db/database';
import { runSchema } from '../src/db/schema';
import { YOUTUBE_API_KEY } from '../src/config';
import { ExerciseRow } from '../src/types';

const VIDEO_QUERY_SUFFIX = 'how to physiotherapy beginner';

async function warmVideos() {
  console.log('--- Pre-warming YouTube video cache ---');
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.trim() === '') {
    console.log('No YOUTUBE_API_KEY configured in .env. Skipping YouTube calls.');
    process.exit(0);
  }

  const db = initializeDatabase();
  runSchema(db);

  const exercises = db.prepare('SELECT id, title FROM exercises').all() as { id: string; title: string }[];
  console.log(`Found ${exercises.length} exercises to check.`);

  for (const ex of exercises) {
    const cached = db.prepare('SELECT video_id FROM video_cache WHERE exercise_id = ?').get(ex.id) as { video_id: string } | undefined;
    if (cached && cached.video_id) {
      console.log(`[CACHED] ${ex.title} -> ${cached.video_id}`);
      continue;
    }

    const query = `${ex.title} ${VIDEO_QUERY_SUFFIX}`;
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&safeSearch=strict&maxResults=1&videoDuration=short&q=${encodeURIComponent(query)}&key=${encodeURIComponent(YOUTUBE_API_KEY)}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        console.warn(`[WARN] API error fetching video for ${ex.title}: status ${res.status}`);
        continue;
      }
      const data = await res.json() as any;
      const firstItem = data?.items?.[0];
      if (firstItem && firstItem.id?.videoId) {
        const videoId = firstItem.id.videoId;
        const title = firstItem.snippet?.title || ex.title;
        const channel = firstItem.snippet?.channelTitle || '';

        db.prepare(`
          INSERT INTO video_cache (exercise_id, video_id, video_title, channel, fetched_at)
          VALUES (?, ?, ?, ?, datetime('now'))
          ON CONFLICT(exercise_id) DO UPDATE SET
            video_id = excluded.video_id,
            video_title = excluded.video_title,
            channel = excluded.channel,
            fetched_at = excluded.fetched_at
        `).run(ex.id, videoId, title, channel);

        console.log(`[SAVED] ${ex.title} -> ${videoId}`);
      } else {
        console.log(`[NOT FOUND] No video found for ${ex.title}`);
      }
    } catch (err: any) {
      console.error(`[ERROR] Failed to fetch for ${ex.title}:`, err.message);
    }
  }

  console.log('--- Pre-warming complete ---');
}

warmVideos().catch(console.error);
