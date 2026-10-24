# MuscleMap v2 — Upgrade Prompt for Antigravity

> **How to use:** Open the parent `musclemap/` folder (containing `frontend/` and `backend/`) in Antigravity. Paste everything below the line into the agent. Run the manual steps in the checklist at the bottom first.

---

You are upgrading an existing, working web app called **MuscleMap**, a muscle pain self-assessment and *educational* guidance tool. The workspace has two folders:

- `frontend/`: React + TypeScript + Vite + Tailwind + React Three Fiber (3D body model) + Axios. Runs on port 5173.
- `backend/`: Node.js + Express + TypeScript + SQLite (`better-sqlite3`, raw SQL, no ORM) + zod. Runs on port 4000.

**Do not rebuild from scratch.** Read the existing code first, then extend it. Keep all existing endpoints, response fields, and UI working (backward compatible). Work in the phases below, in order. After each phase, run the app, confirm it works, and summarize what changed before continuing.

This is an educational tool, not a medical device. Never present output as a diagnosis. Every result and report must carry the disclaimer: *"This information is for educational and self-care guidance only. It is not a medical diagnosis or prescription. If you are unsure about your symptoms, consult a qualified healthcare professional."*

---

## Phase 1: Backend: extended questionnaire + richer results

### 1.1 New optional request fields on `POST /api/analyze-pain`
Add these to the zod schema and TypeScript types. All are **optional**, so old clients keep working:

| Field | Type |
|---|---|
| `onset` | `"sudden" \| "gradual"` |
| `radiating` | `boolean` (pain spreads to another area) |
| `numbnessOrWeakness` | `boolean` |
| `nightPain` | `boolean` (wakes you at night) |
| `fever` | `boolean` |
| `bladderBowelChanges` | `boolean` |
| `previousEpisodes` | `"none" \| "once" \| "recurring"` |
| `aggravatedBy` | array of `"bending" \| "twisting" \| "walking" \| "lifting" \| "sitting" \| "lying_down"` |
| `dailySittingHours` | integer 0–16 |
| `sleepQuality` | `"good" \| "fair" \| "poor"` |

Existing fields (`deviceId, region, painType, duration, intensity, stressLevel?, trigger?`) are unchanged.

### 1.2 Rule engine updates (`logic/painAnalyzer.ts`)
Keep the structured-map style (no long if/else chains). Add these red-flag rules to the existing priority list: `bladderBowelChanges`, `numbnessOrWeakness`, `fever` combined with back/neck pain, or `nightPain` with `intensity >= 6`, each forces `red_flag`. Return a new array `redFlagReasons: string[]` (plain-language reasons) so the UI can explain *why*. Moderate-risk boosters: `radiating`, `previousEpisodes = "recurring"`, `dailySittingHours >= 8` with a back/neck/hip region.

### 1.3 Persistence
Migrate safely (use `ALTER TABLE ... ADD COLUMN` guarded by a column-exists check, or a small migrations helper). Do not drop data. Add to `pain_entries`: columns for every new input field (store `aggravatedBy` as a JSON string), plus `red_flag_reasons` (JSON), `risk_source` (TEXT), `ml_confidence` (REAL, nullable).

### 1.4 Response additions (additive only)
`POST /api/analyze-pain` now also returns:

```json
{
  "sessionId": "uuid",
  "createdAt": "ISO string",
  "redFlagReasons": ["string"],
  "riskSource": "rules | ml | rules_override",
  "mlConfidence": 0.0,
  "acupressurePoints": [{ "name": "string", "location": "string", "howTo": "string" }],
  "exercises": [{
    "id": "string",
    "title": "string",
    "instructions": "string",
    "tags": ["string"],
    "videoSearchQuery": "string",
    "guidedModeAvailable": true
  }]
}
```

### 1.5 Acupressure
Create an `acupressure_points` table (`id, region_id, name, location, how_to`) and seed 2–3 beginner-safe points for each seeded region (for example Jianjing GB21 for neck/shoulder, Weizhong BL40 for lower back, Zusanli ST36 for knee). Write plain-language, short "press gently for 30–60 seconds" instructions. Add `GET /api/regions/:id/acupressure`. The seed script must remain safe to re-run.

---

## Phase 2: Backend: session history & reports

Replace the thin history with real sessions:

- `GET /api/history?deviceId=&limit=20&offset=0`: summaries, newest first: `{ id, timestamp, region, regionName, intensity, riskLevel }`. Return a header or field with the total count for pagination.
- `GET /api/sessions/:id?deviceId=`: the **full** session: `{ id, timestamp, region, regionName, inputs: { ...every questionnaire answer }, result: { ...full analyze-pain response } }`. Return 404 if the session doesn't exist or doesn't belong to that `deviceId` (never leak other devices' sessions).
- `DELETE /api/sessions/:id?deviceId=`: lets users delete their own session.

Keep the old `result` field on history items working, or update the frontend in Phase 5 so nothing breaks.

---

## Phase 3: Backend: dynamic YouTube exercise videos

Videos are found **dynamically** via the YouTube Data API v3. The API key must **never** reach the frontend.

1. Add `YOUTUBE_API_KEY` to `.env` and `.env.example`.
2. Build `videoQuery` for each exercise in `logic/`: `"<exercise title> how to physiotherapy beginner"`. Return it as `videoSearchQuery` in the exercise object.
3. Add `GET /api/exercises/:id/video`. Behavior:
   - Check a new SQLite cache table `video_cache(exercise_id TEXT PRIMARY KEY, video_id TEXT, video_title TEXT, channel TEXT, fetched_at TEXT)`. If a cached row is less than 30 days old, return it.
   - Otherwise call `https://www.googleapis.com/youtube/v3/search` with `part=snippet&type=video&videoEmbeddable=true&safeSearch=strict&maxResults=1&videoDuration=short`, then store the result.
   - **Quota is about 100 searches/day, so caching is mandatory.** Optionally pre-warm the cache with a script (`npm run warm-videos`) that fetches videos for all seeded exercises.
   - Response: `{ videoId: string | null, title?, channel?, searchUrl }` where `searchUrl` is always a plain `https://www.youtube.com/results?search_query=...` link.
   - If the key is missing, quota is exceeded, or the call fails: return `videoId: null` with the `searchUrl` fallback, status 200. **Never crash and never return 500 because of YouTube.**
4. Use Node's built-in `fetch` on the backend (the "no fetch" rule only applies to the frontend, which uses Axios).

---

## Phase 4: ML service (Python) + backend integration

### 4.1 `ml-service/` (new folder at the workspace root)
Python 3.9+, Flask, scikit-learn, pandas, joblib. Files:

- `requirements.txt`
- `generate_data.py`: generates a **synthetic** training set of at least 5,000 rows. Sample random questionnaire answers across all fields, label them using the same logic as the rule engine, then add about 8% label noise and some borderline combinations so the model is not just memorizing the rules.
- `train.py`: loads the data, one-hot encodes categoricals, trains a `RandomForestClassifier`, prints accuracy, a classification report and feature importances, and saves `model.joblib` plus `feature_columns.json`.
- `app.py`: Flask on port **5001**.
  - `GET /health` returns `{ "status": "ok", "modelLoaded": true }`.
  - `POST /predict` takes the questionnaire answers as JSON (missing optional fields get sensible defaults) and returns `{ "riskLevel": "...", "confidence": 0.0-1.0, "probabilities": { "mild": .., "moderate": .., "severe": .., "red_flag": .. } }`.
- `README.md` with setup: `python -m venv venv`, activate, `pip install -r requirements.txt`, `python generate_data.py`, `python train.py`, `python app.py`.

Be honest in the README and code comments: the training data is **synthetic and rule-derived**, a proof of concept to be replaced with real clinician-labelled data.

### 4.2 Backend integration
In the Express backend add `ML_SERVICE_URL=http://localhost:5001` to `.env`/`.env.example`. In `analyze-pain`:

1. Compute the risk level with the rules first.
2. Call `POST /predict` with a **2-second timeout**.
3. **Safety rule: the ML result can only raise risk, never lower it below the rules result.**
   - `riskSource = "rules"` if ML is unavailable or ties with the rules.
   - `riskSource = "ml"` if ML raises the risk.
   - `riskSource = "rules_override"` if ML suggested a lower level but the rules won.
4. If the ML service is down or errors, silently fall back to rules only. The app must work with the ML service switched off.

---

## Phase 5: Frontend: UI/UX overhaul, extended questionnaire, history reopen

Work inside the existing `frontend/` project and keep the stack (React, TS, Tailwind, R3F, Axios only for HTTP).

1. **Types and API:** update `src/types/index.ts` and `src/api/painApi.ts` for the new fields and endpoints (`getSessions`, `getSession`, `deleteSession`, `getExerciseVideo`, `getAcupressure`). Keep constants in `src/constants.ts`.
2. **Questionnaire:** convert it to a short multi-step wizard with a progress bar: *Step 1* pain type, duration, intensity. *Step 2* onset, radiating, aggravating movements, previous episodes. *Step 3* a "Safety check" step with Yes/No toggles for numbness or weakness, night pain, fever, and bladder/bowel changes. *Step 4* lifestyle: stress, trigger, daily sitting hours, sleep quality. Only the Step 1 fields are required, and the user can skip Steps 2–4.
3. **Results:** show `redFlagReasons` prominently in the red-flag state. Add an "Acupressure points" section, and a small "Assessment method" note ("Based on rules" or "Rules + ML check, confidence X%").
4. **Exercise cards:** each card gets a "Watch video" button (lazy-loads `GET /api/exercises/:id/video`, then renders an embedded `youtube-nocookie.com` iframe, or a "Search on YouTube" link if `videoId` is null) and, when `guidedModeAvailable`, a "Start guided mode" button (Phase 6).
5. **History page `/history`:** paginated list with region, date, risk badge and intensity, plus a delete button with confirmation.
6. **Session reopen `/session/:id`:** fetch the full session, **re-select the region on the 3D model so it highlights and the camera turns toward it**, and show the saved questionnaire answers and full results. Add a **"Print / Save report"** button (use `window.print()` with a print stylesheet: hide the 3D canvas and nav, keep answers, results and the disclaimer). Handle a 404 with a friendly message.
7. **UI/UX polish:** a refined design system (consistent spacing, teal/slate palette, accessible contrast, focus rings, skeleton loaders, empty and error states, responsive layouts, `prefers-reduced-motion` support).
8. **GSAP:** install `gsap`. Add smooth entrance animations for the side panel states and result cards, an animated progress bar and risk badge, and ScrollTrigger reveals on the About and History pages. Respect `prefers-reduced-motion` by disabling the animations.

---

## Phase 6: Frontend: guided exercise mode (webcam + MediaPipe, simplified)

Install `@mediapipe/tasks-vision`. Build a full-screen modal/page `GuidedExercise` opened from an exercise card.

**What it does:**
1. Shows a privacy notice before asking for the webcam: *"Video is processed on your device and is never uploaded or stored."* Request `getUserMedia` only after the user taps "Allow camera". Handle denial gracefully with a message and a way back.
2. Runs `PoseLandmarker` (the lite model, `runningMode: "VIDEO"`, GPU delegate with CPU fallback) on the video via `requestAnimationFrame`, targeting about 24–30 fps.
3. Draws the **skeleton overlay** (landmarks and connecting lines) on a canvas over the mirrored video.
4. Shows a "Step into frame" message until enough key landmarks are visible (visibility above 0.5).
5. **Counts reps** from joint angles using a small state machine (up/down phases with hysteresis and a minimum time between reps, so jitter does not double-count).
6. Shows basic hints, "Good position" (green) or "Adjust your posture: <specific hint>" (amber), based on simple angle thresholds. **No real-time form correction claims, and no medical statements.** Add a note: "Guidance is approximate."
7. Has Start, Pause and Finish buttons and a target-rep counter. A summary screen shows reps done and time spent.
8. Cleans up properly on close: stop every media track, cancel the animation frame and dispose of the landmarker.

**Config-driven design:** create `src/guided/exerciseConfigs.ts` with one entry per supported exercise: tracked joints (three landmark indices to compute an angle), `downAngle` and `upAngle` thresholds, hint rules and target reps. Implement configs for 4–6 exercises that suit the camera: for example a standing hamstring or knee-extension movement, a squat, shoulder circles or arm raises, and a standing side bend. Anything that needs lying down (for example Cat-Cow) is **not supported**. Set `guidedModeAvailable = false` for those in the backend seed or response, and hide the button.

**Performance with Three.js:** only one heavy GPU workload at a time. While guided mode is open, pause the 3D canvas (`frameloop="never"` on the R3F `Canvas`) and resume it when the modal closes.

Put the pose math in pure, unit-testable functions (`calculateAngle`, `repCounter`) and add a few unit tests for them.

---

## Phase 7: Frontend: audio assistant (read aloud + voice input)

Use the **Web Speech API** only (no paid service, no key).

**Read aloud (`speechSynthesis`):**
- A "Read results aloud" button on the results screen that reads: the region, muscles, risk level, warning, and the exercise titles. Always speak the disclaimer last.
- Pause/resume/stop controls, a speed control, and a voice picker. Cancel speech on route change and on unmount.

**Voice input (`SpeechRecognition` / `webkitSpeechRecognition`):**
- A microphone button on the questionnaire. The user can say, for example, *"sharp pain in my lower back, started yesterday, intensity seven."*
- Write a pure function `parseVoiceInput(transcript)` in `src/voice/parseVoiceInput.ts` that extracts region (match against region names and common synonyms), pain type, duration, intensity (digits or number words 0–10) and optionally stress and trigger. Use keyword and synonym maps, not an LLM.
- **Never auto-submit.** Pre-fill the form, highlight the filled fields, show "Here's what I understood, please check", and let the user correct everything before pressing Analyze. If a region was heard, select it on the 3D model.
- Feature-detect: if the browser has no `SpeechRecognition` (Firefox, for example), hide the mic button and show a small note. Handle the permission-denied, no-speech and network errors with friendly messages. Use `lang = "en-US"` (make it a constant).
- Add unit tests for `parseVoiceInput` with at least 10 sample sentences.

---

## Phase 8: Integration checks, docs, tests

1. **Backend:** add tests (Vitest or Jest + supertest) for: the red-flag rules, the ML-can-only-raise-risk rule, the history/session ownership check (a wrong `deviceId` gives 404), and the video endpoint fallback when no API key is set.
2. **CORS:** make sure `GET, POST, DELETE` are allowed with `Content-Type`, still from the explicit frontend origin (no `*`).
3. **Root scripts:** create a root `package.json` (or script) with a `dev` command that starts backend, frontend and ML service together (`concurrently`). If the ML service cannot start, the others must still work.
4. **Docs:** update `INTEGRATION.md`: the three services and their ports (5173, 4000, 5001), `.env` variables for each, how to train the model, how to warm the video cache, and a troubleshooting checklist (webcam permissions need `localhost` or HTTPS, speech recognition works in Chrome/Edge, YouTube quota).
5. Finish with a manual QA checklist that I can follow: one test for each phase.

## Constraints (apply to everything)
- Don't change existing endpoint URLs or break existing response fields; additions only.
- No secrets in the frontend. No `*` CORS origin.
- Frontend HTTP calls use Axios only.
- Every new file starts with a comment explaining its purpose. Use named constants, with no magic numbers or strings.
- Handle loading, error and empty states for every new feature.
- Wording stays educational; never diagnose.

---

## Manual checklist (do these yourself before or during the run)

1. **Python:** confirm `python --version` is 3.9 or higher. Create a venv inside `ml-service/` when the agent asks.
2. **YouTube API key:** go to Google Cloud Console → create a project → enable **YouTube Data API v3** → Credentials → Create API key → restrict it to that API → paste it into `backend/.env` as `YOUTUBE_API_KEY=...`. Free quota is 10,000 units/day, and one search costs 100 units, so about 100 uncached searches per day. That is why the cache exists.
3. **Browser:** use Chrome or Edge for voice input. The webcam and microphone need `http://localhost` or HTTPS.
4. **Before the demo:** run `npm run warm-videos` so all videos are cached and the demo does not depend on the live quota.
5. **For judges:** be ready to say that the ML model is trained on synthetic, rule-derived data (a proof of concept) and that it can only raise the risk level, never lower it. Say also that the webcam video never leaves the device.
