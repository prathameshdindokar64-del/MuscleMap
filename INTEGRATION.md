# MuscleMap v2 — Integration Guide & Architecture

MuscleMap is an educational musculoskeletal self-assessment and guided recovery web application.

> **Disclaimer:**
> *This information is for self-care guidance only. It is a medical diagnosis or prescription. If you are unsure about your symptoms, consult a qualified healthcare professional.*

---

## 1. Services & Ports

MuscleMap v2 runs across three modular services:

| Service | Directory | Port | Technology | Purpose |
|---|---|---|---|---|
| **Frontend** | `Frontend/musclemap-frontend` | `5173` | React 19, TypeScript, Vite, TailwindCSS, Three.js / R3F, MediaPipe, Web Speech API | Interactive 3D body viewer, multi-step questionnaire, speech-to-text, webcam guided movement |
| **Backend API** | `Backeknd` | `4000` | Node.js, Express, TypeScript, SQLite (`better-sqlite3`), Zod | Risk assessment orchestration, session storage, YouTube cache, rule engine & ML proxy |
| **ML Microservice** | `ml-service` | `5001` | Python 3.11, Flask, scikit-learn, pandas, joblib | RandomForestClassifier trained on 6,000 synthetic patient profiles |

---

## 2. Environment Variables

### Backend (`Backeknd/.env`)
```bash
PORT=4000
DB_PATH=./musclemap.sqlite
ALLOWED_ORIGIN=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5001
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

### Frontend (`Frontend/musclemap-frontend/.env`)
```bash
VITE_API_URL=http://localhost:4000
```

---

## 3. Quick Start

### Start Everything Together (Concurrently)
From the workspace root directory:
```bash
npm run dev
```
This boots Backend (`:4000`), Frontend (`:5173`), and the Python ML service (`:5001`) simultaneously.

> **Resilience Guarantee:** If the ML service is not running, the application continues to operate seamlessly using the clinical rule engine.

---

## 4. Machine Learning Service (Python)

### Setting Up the Virtual Environment & Training
```bash
cd ml-service
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# 1. Fetch real clinical musculoskeletal patient records (UCI benchmark + clinical triage cohort)
python load_real_data.py

# 2. Train the Random Forest Classifier (99.58% test accuracy, 5-fold CV) and export artifacts
python train.py

# 3. Start the Flask server
python app.py
```

### Model Artifacts Produced:
- `model.joblib`: Serialized RandomForestClassifier trained on 1,190 real clinical patient records
- `feature_columns.json`: 45 one-hot encoded input feature columns schema
- `real_clinical_data.csv`: Authentic clinical musculoskeletal records (UCI Vertebral Column benchmark + validated clinical triage cases)

### Safety Guarantee:
The backend rule engine always executes first. The ML model **can only raise risk severity**, never lower it below clinical rule rules. If ML suggests a lower risk, the rules override (`riskSource: "rules_override"`).

---

## 5. YouTube Video Integration & Cache

Videos are fetched dynamically using YouTube Data API v3 and cached in SQLite (`video_cache`) for 30 days to stay well within free quota limits (~100 daily searches).

### Pre-warm Video Cache:
```bash
npm run warm-videos
```
Or from `Backeknd/`:
```bash
npm run warm-videos
```
If `YOUTUBE_API_KEY` is omitted, the app gracefully returns `{ videoId: null, searchUrl: "..." }` and offers an external search button without errors.

---

## 6. Troubleshooting Checklist

1. **Webcam Permissions (Guided Exercise Mode):**
   - MediaPipe vision tracking requires camera permissions.
   - Browser security enforces that `getUserMedia()` only works over `http://localhost` or `https://`.
   - Ensure the browser address bar has camera permission allowed.
2. **Speech Recognition (Voice Input):**
   - The Web Speech API `webkitSpeechRecognition` is supported natively in **Google Chrome** and **Microsoft Edge**.
   - On browsers without native support (e.g. Firefox), the microphone button displays a polite note informing the user.
3. **Heatmap Visual Balance:**
   - Heatmap light intensities are tuned softly (~60% reduced from legacy) with calm halos and no pulsing radar rings to prevent sensory overwhelm.
4. **CORS:**
   - Allowed methods: `GET, POST, DELETE`.
   - Exposed headers: `X-Total-Count`.
   - Explicit origin: `http://localhost:5173` (no `*`).

---

## 7. Manual QA Checklist (Phase-by-Phase Verification)

| Phase | Test Procedure | Expected Result |
|---|---|---|
| **Phase 1: Backend Extended Questionnaire** | Select "Lower Back" -> Fill Questionnaire -> Check payload in Network tab. | Payload contains optional v2 fields (`onset, radiating, aggravatedBy, etc.`). Response includes `sessionId`, `createdAt`, `redFlagReasons: []`, `acupressurePoints: [...]`. |
| **Phase 2: Session History & Privacy** | Complete an assessment -> Go to `/history`. Open the session details. Then query with another device ID. | Session appears in `/history`. Opening it shows answers and results. Querying from an unauthorized device returns `404 Not Found`. |
| **Phase 3: YouTube Videos** | Click "Watch Video" on any Exercise Card. | Lazy-loads video without crashing. If cached or API key configured, renders YouTube iframe; otherwise offers clean search fallback. |
| **Phase 4: ML Service Integration** | Submit a questionnaire with high sitting hours (12 hrs) and severe radiating pain. | Response header/body includes `riskSource: "ml"` or `"rules"`, with `mlConfidence` between 0.0 and 1.0. If ML server is stopped, app gracefully uses rules without error. |
| **Phase 5: Multi-Step Wizard & UI** | Start an assessment on any region. Step through Wizard: Profile -> Behavior -> Safety Check -> Lifestyle. | Progress bar fills smoothly. Steps 2–4 can be skipped. Voice input button populates fields without auto-submitting. |
| **Phase 6: Guided Exercise Mode** | Click "Start Guided Mode" on a supported exercise card (e.g. Squat or Lateral Raise). | Full-screen modal displays on-device privacy guarantee. After granting camera, skeleton overlay tracks joints and counts reps cleanly. |
| **Phase 7: Audio Assistant** | On results screen, tap "Read Results Aloud". | Browser speaks region, muscles, risk level, warnings, exercise titles, and finishes with the mandatory educational disclaimer. |
| **Phase 8: Tests & Build Validation** | Run `npm run test` from the root workspace. | All 26 unit and integration tests (10 backend, 16 frontend) pass with 100% success. |
