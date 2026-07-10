# Backend Modification Prompt – Antigravity / Cursor

You are modifying an existing working MuscleMap Node.js + Express + TypeScript + SQLite backend. Do NOT rebuild from scratch. Make targeted additions only. Read every section before touching any file.

---

## Summary of All Changes

1. Add Google Gemini AI layer to replace rule-based analysis
2. Add acupressure point data to responses
3. Add JWT user authentication (register + login)
4. Add PDF export endpoint
5. Update database schema with new tables
6. Update all response types to include acupressure data

---

## Change 1: Install New Dependencies

Run in the backend folder:

```bash
npm install @google/generative-ai
npm install jsonwebtoken bcryptjs
npm install @types/jsonwebtoken @types/bcryptjs -D
npm install pdfkit
npm install @types/pdfkit -D
```

Add to `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_very_long_random_secret_string_here_min_32_chars
JWT_EXPIRES_IN=7d
```

Add to `.env.example`:
```
GEMINI_API_KEY=get_from_aistudio.google.com
JWT_SECRET=replace_with_random_32_char_string
JWT_EXPIRES_IN=7d
```

Add to `src/config.ts`:
```typescript
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
```

---

## Change 2: Gemini AI Analysis Layer

### Create `src/logic/geminiAnalyzer.ts`

```typescript
/**
 * geminiAnalyzer.ts
 * Replaces the rule-based painAnalyzer with Google Gemini AI.
 * Uses Gemini 1.5 Flash (free tier) for analysis.
 * Falls back to rule-based analysis if Gemini is unavailable.
 *
 * EXTENSIBILITY: Swap GEMINI_API_KEY with any other AI provider by
 * changing only this file. The input/output contract stays identical.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_API_KEY } from '../config'
import { calculateRisk } from './riskCalculator'
import { REGION_MUSCLES } from '../constants/regions'
import { WARNING_TEXT, DISCLAIMER_TEXT } from '../constants/messages'
import { ACUPRESSURE_POINTS } from '../constants/acupressure'
import type { AnalyzeInput, AnalyzeOutput } from '../types'

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

/**
 * Builds the prompt sent to Gemini for analysis.
 * Structured to return predictable JSON output.
 */
function buildPrompt(input: AnalyzeInput, regionName: string, muscles: string[]): string {
  return `
You are a physiotherapy and sports medicine assistant. A user is reporting muscle pain and needs educational self-care guidance. You must respond with ONLY a valid JSON object — no markdown, no explanation, no preamble.

USER PAIN PROFILE:
- Body region: ${regionName}
- Muscles involved: ${muscles.join(', ')}
- Pain type: ${input.painType}
- Duration: ${input.duration.replace(/_/g, ' ')}
- Intensity: ${input.intensity}/10
- Stress level: ${input.stressLevel || 'not specified'}
- Trigger: ${input.trigger || 'not specified'}

Respond with this exact JSON structure:
{
  "exercises": [
    {
      "title": "Exercise name",
      "instructions": "Clear 3-4 sentence instructions written for a non-medical person. Be specific about reps, sets, and duration.",
      "tags": ["tag1", "tag2"]
    }
  ],
  "aiInsight": "2-3 sentence personalized insight about this specific pain profile. Be empathetic but informative. Mention the likely cause based on the trigger and duration.",
  "recoveryTips": ["Tip 1 for this specific pain", "Tip 2", "Tip 3"]
}

Rules:
- Provide exactly 3 exercises tailored to the pain type "${input.painType}" and region "${regionName}"
- Exercises must be safe for home use with no equipment (except optional items like a foam roller or tennis ball)
- If intensity >= 7 or pain type is "numbness", include at least one gentle rest-based exercise
- Tags should be from: Stretch, Strengthening, Self-massage, Trigger point, Breathing, Mobility, Beginner, Intermediate
- aiInsight must mention the specific region and pain type
- recoveryTips must be practical and specific to this pain profile
- NEVER mention medications, diagnoses, or claim to replace a doctor
- Response must be valid JSON only — absolutely no text outside the JSON object
`
}

/**
 * Analyzes pain input using Google Gemini AI.
 * Falls back to rule-based analysis if AI call fails.
 */
export async function analyzeWithGemini(
  input: AnalyzeInput,
  regionName: string,
  db: any
): Promise<AnalyzeOutput> {
  const muscles = REGION_MUSCLES[input.region] ?? ['Consult a professional for assessment']
  const riskLevel = calculateRisk(input)
  const warningText = WARNING_TEXT[riskLevel]
  const acupressurePoints = ACUPRESSURE_POINTS[input.region] ?? []

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = buildPrompt(input, regionName, muscles)

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    // Strip any accidental markdown code fences
    const cleanJson = responseText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleanJson)

    return {
      regionName,
      muscles,
      exercises: parsed.exercises || [],
      aiInsight: parsed.aiInsight || '',
      recoveryTips: parsed.recoveryTips || [],
      riskLevel,
      warningText,
      disclaimerText: DISCLAIMER_TEXT,
      acupressurePoints,
      generatedBy: 'gemini-1.5-flash',
    }
  } catch (error) {
    // Fallback to database exercises if Gemini fails
    console.error('Gemini analysis failed, falling back to rule-based:', error)
    return fallbackAnalysis(input, regionName, muscles, riskLevel, acupressurePoints, db)
  }
}

/**
 * Rule-based fallback when Gemini is unavailable.
 * Queries the exercises table in SQLite.
 */
function fallbackAnalysis(
  input: AnalyzeInput,
  regionName: string,
  muscles: string[],
  riskLevel: any,
  acupressurePoints: any[],
  db: any
): AnalyzeOutput {
  // Query exercises from database for this region
  const exercises = db.prepare(`
    SELECT title, instructions, tags FROM exercises
    WHERE region_id = ?
    ORDER BY RANDOM()
    LIMIT 3
  `).all(input.region).map((e: any) => ({
    ...e,
    tags: JSON.parse(e.tags || '[]'),
  }))

  return {
    regionName,
    muscles,
    exercises,
    aiInsight: `Based on your ${input.painType} pain in the ${regionName} region lasting ${input.duration.replace(/_/g, ' ')}, we recommend the following self-care exercises.`,
    recoveryTips: [
      'Apply ice for 15 minutes if the area feels inflamed',
      'Avoid movements that worsen the pain',
      'Rest the affected area between exercise sessions',
    ],
    riskLevel,
    warningText: WARNING_TEXT[riskLevel],
    disclaimerText: DISCLAIMER_TEXT,
    acupressurePoints,
    generatedBy: 'rule-based-fallback',
  }
}
```

### Create `src/constants/acupressure.ts`

```typescript
/**
 * acupressure.ts
 * Acupressure point data for each body region.
 * Based on Traditional Chinese Medicine meridian points.
 * All coordinates match the 3D model world space positions.
 */

export interface AcupressurePoint {
  name: string
  position: [number, number, number]
  description: string
  technique: string
}

export const ACUPRESSURE_POINTS: Record<string, AcupressurePoint[]> = {
  neck: [
    {
      name: 'GB21 — Shoulder Well',
      position: [-0.18, 1.48, -0.05],
      description: 'Relieves neck tension and headaches',
      technique: 'Apply firm downward pressure with thumb for 30 seconds. Breathe deeply.',
    },
    {
      name: 'BL10 — Heavenly Pillar',
      position: [0.06, 1.58, -0.08],
      description: 'Reduces stiff neck and occipital pain',
      technique: 'Press inward and slightly upward with both thumbs simultaneously for 60 seconds.',
    },
  ],
  lower_back: [
    {
      name: 'BL23 — Kidney Shu',
      position: [0.06, 0.92, -0.12],
      description: 'Primary point for lower back pain relief',
      technique: 'Apply firm pressure with both thumbs on either side of the spine for 60 seconds.',
    },
    {
      name: 'BL40 — Commanding Middle',
      position: [-0.08, 0.28, -0.1],
      description: 'Relieves acute lower back spasm',
      technique: 'Press firmly into the center of the back of the knee for 30 seconds per side.',
    },
  ],
  chest: [
    {
      name: 'CV17 — Sea of Tranquility',
      position: [0.0, 1.18, 0.13],
      description: 'Relieves chest tightness and breathing difficulty',
      technique: 'Press gently on the sternum at heart level for 60 seconds while breathing slowly.',
    },
  ],
  left_shoulder: [
    {
      name: 'LI15 — Shoulder Bone',
      position: [-0.42, 1.42, 0.04],
      description: 'Relieves shoulder pain and restricted movement',
      technique: 'Press firmly into the front of the shoulder joint for 30 seconds with thumb.',
    },
    {
      name: 'GB21 — Shoulder Well',
      position: [-0.28, 1.46, -0.04],
      description: 'Releases trapezius and shoulder tension',
      technique: 'Apply downward pressure on the highest point of the shoulder for 30 seconds.',
    },
  ],
  right_shoulder: [
    {
      name: 'LI15 — Shoulder Bone',
      position: [0.42, 1.42, 0.04],
      description: 'Relieves shoulder pain and restricted movement',
      technique: 'Press firmly into the front of the shoulder joint for 30 seconds with thumb.',
    },
    {
      name: 'GB21 — Shoulder Well',
      position: [0.28, 1.46, -0.04],
      description: 'Releases trapezius and shoulder tension',
      technique: 'Apply downward pressure on the highest point of the shoulder for 30 seconds.',
    },
  ],
  upper_back: [
    {
      name: 'BL13 — Lung Shu',
      position: [0.07, 1.28, -0.12],
      description: 'Relieves upper back and respiratory tension',
      technique: 'Apply pressure on both sides of the spine at shoulder blade level for 60 seconds.',
    },
  ],
  abdomen: [
    {
      name: 'CV6 — Sea of Energy',
      position: [0.0, 0.96, 0.13],
      description: 'Strengthens core and relieves abdominal tension',
      technique: 'Press 2 finger-widths below the navel with moderate pressure for 60 seconds.',
    },
  ],
  left_hip: [
    {
      name: 'GB30 — Jumping Round',
      position: [-0.28, 0.72, -0.1],
      description: 'Primary point for hip, glute, and sciatic pain',
      technique: 'Apply deep firm pressure into the center of the gluteal muscle for 60 seconds.',
    },
  ],
  right_hip: [
    {
      name: 'GB30 — Jumping Round',
      position: [0.28, 0.72, -0.1],
      description: 'Primary point for hip, glute, and sciatic pain',
      technique: 'Apply deep firm pressure into the center of the gluteal muscle for 60 seconds.',
    },
  ],
  left_knee: [
    {
      name: 'ST35 — Calf Nose',
      position: [-0.12, 0.33, 0.1],
      description: 'Relieves knee pain and stiffness',
      technique: 'Press into the depression on either side of the kneecap for 30 seconds per side.',
    },
  ],
  right_knee: [
    {
      name: 'ST35 — Calf Nose',
      position: [0.12, 0.33, 0.1],
      description: 'Relieves knee pain and stiffness',
      technique: 'Press into the depression on either side of the kneecap for 30 seconds per side.',
    },
  ],
  left_ankle: [
    {
      name: 'KD3 — Great Ravine',
      position: [-0.1, 0.1, -0.06],
      description: 'Primary ankle and Achilles pain point',
      technique: 'Press into the depression between the inner ankle bone and Achilles tendon for 60 seconds.',
    },
  ],
  right_ankle: [
    {
      name: 'KD3 — Great Ravine',
      position: [0.1, 0.1, -0.06],
      description: 'Primary ankle and Achilles pain point',
      technique: 'Press into the depression between the inner ankle bone and Achilles tendon for 60 seconds.',
    },
  ],
  left_thigh: [
    {
      name: 'ST34 — Beam Mound',
      position: [-0.14, 0.42, 0.08],
      description: 'Relieves acute thigh and quadricep pain',
      technique: 'Press firmly 3 finger-widths above the kneecap on the outer quad for 30 seconds.',
    },
  ],
  right_thigh: [
    {
      name: 'ST34 — Beam Mound',
      position: [0.14, 0.42, 0.08],
      description: 'Relieves acute thigh and quadricep pain',
      technique: 'Press firmly 3 finger-widths above the kneecap on the outer quad for 30 seconds.',
    },
  ],
  left_calf: [
    {
      name: 'BL57 — Support Mountain',
      position: [-0.1, 0.18, -0.1],
      description: 'Relieves calf cramps and Achilles tension',
      technique: 'Press firmly into the center of the calf muscle belly for 30-60 seconds.',
    },
  ],
  right_calf: [
    {
      name: 'BL57 — Support Mountain',
      position: [0.1, 0.18, -0.1],
      description: 'Relieves calf cramps and Achilles tension',
      technique: 'Press firmly into the center of the calf muscle belly for 30-60 seconds.',
    },
  ],
}
```

### Update `src/controllers/painController.ts`

Replace the call to `analyzePain()` (rule-based) with `analyzeWithGemini()`:

```typescript
// Replace this:
const result = analyzePain(input, db)

// With this:
const result = await analyzeWithGemini(input, regionName, db)
```

Make the route handler async if not already.

### Update `src/types/index.ts` (backend)

Add new fields to `AnalyzeOutput`:

```typescript
export interface AnalyzeOutput {
  regionName: string
  muscles: string[]
  exercises: Exercise[]
  aiInsight: string           // NEW — AI-generated personalized insight
  recoveryTips: string[]      // NEW — AI-generated recovery tips
  riskLevel: RiskLevel
  warningText: string
  disclaimerText: string
  acupressurePoints: AcupressurePoint[]  // NEW
  generatedBy: string         // NEW — 'gemini-1.5-flash' or 'rule-based-fallback'
}
```

---

## Change 3: JWT Authentication

### Update database schema — add `users` table in `src/db/schema.ts`

```sql
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,          -- bcrypt hashed, never plain text
  name         TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  last_login   TEXT
);
```

Also update `pain_entries` table — add optional user_id column:
```sql
ALTER TABLE pain_entries ADD COLUMN user_id TEXT REFERENCES users(id);
```
Wrap this in a try/catch — it will fail silently if column already exists, which is fine.

### Create `src/middleware/auth.ts`

```typescript
/**
 * auth.ts
 * JWT authentication middleware.
 * Attach to any route that requires authentication.
 * Routes without this middleware are public.
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
}

/**
 * Verifies JWT token from Authorization header.
 * Adds userId and userEmail to request object if valid.
 * Returns 401 if token is missing or invalid.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    req.userId = decoded.userId
    req.userEmail = decoded.email
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Optional auth — attaches user info if token present but doesn't block if missing.
 * Use on routes that work for both logged-in and guest users.
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
      req.userId = decoded.userId
      req.userEmail = decoded.email
    } catch {
      // Token invalid — continue as guest
    }
  }
  next()
}
```

### Create `src/routes/authRoutes.ts`

```typescript
import { Router } from 'express'
import { register, login, getProfile } from '../controllers/authController'
import { requireAuth } from '../middleware/auth'
import { validateRequest } from '../middleware/validateRequest'
import { registerSchema, loginSchema } from '../validation/authSchema'

const router = Router()

// POST /api/auth/register
router.post('/auth/register', validateRequest(registerSchema), register)

// POST /api/auth/login
router.post('/auth/login', validateRequest(loginSchema), login)

// GET /api/auth/profile (protected)
router.get('/auth/profile', requireAuth, getProfile)

export default router
```

### Create `src/controllers/authController.ts`

```typescript
/**
 * authController.ts
 * Handles user registration, login, and profile retrieval.
 * Passwords are hashed with bcrypt (10 rounds). Never stored plain.
 * JWT tokens expire in 7 days by default.
 */

import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../db/database'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config'
import type { AuthRequest } from '../middleware/auth'

/** Register a new user with email and password */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body
    const db = getDb()

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    // Insert user
    db.prepare(`
      INSERT INTO users (id, email, password, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email.toLowerCase().trim(), hashedPassword, name.trim())

    // Generate token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: userId, email, name },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ error: 'Registration failed' })
  }
}

/** Login with email and password */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    const db = getDb()

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Update last login
    db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(user.id)

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Login failed' })
  }
}

/** Get current user profile */
export function getProfile(req: AuthRequest, res: Response) {
  try {
    const db = getDb()
    const user = db.prepare('SELECT id, email, name, created_at, last_login FROM users WHERE id = ?').get(req.userId) as any
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({ user })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' })
  }
}
```

### Create `src/validation/authSchema.ts`

```typescript
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
```

### Register auth routes in `src/app.ts`

```typescript
import authRoutes from './routes/authRoutes'
// Add with other routes:
app.use('/api', authRoutes)
```

### Update history endpoint to support both device ID and user ID

In `src/controllers/historyController.ts`, update the query:

```typescript
// If user is authenticated, return their history by userId
// Otherwise fall back to deviceId
const entries = req.userId
  ? db.prepare(`SELECT * FROM pain_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`).all(req.userId)
  : db.prepare(`SELECT * FROM pain_entries WHERE device_id = ? ORDER BY created_at DESC LIMIT 10`).all(deviceId)
```

Apply `optionalAuth` middleware to the history route so it works for both guests and logged-in users.

---

## Change 4: PDF Export Endpoint

### Create `src/routes/pdfRoutes.ts`

```typescript
import { Router } from 'express'
import { exportPdf } from '../controllers/pdfController'
const router = Router()
router.post('/export/pdf', exportPdf)
export default router
```

### Create `src/controllers/pdfController.ts`

```typescript
/**
 * pdfController.ts
 * Generates a full PDF assessment report using PDFKit.
 * The PDF includes: patient info, assessment details, AI insight,
 * exercises, acupressure points, recovery tips, and disclaimer.
 */

import { Request, Response } from 'express'
import PDFDocument from 'pdfkit'

export function exportPdf(req: Request, res: Response) {
  try {
    const { assessment, userInfo } = req.body
    // assessment = AnalyzeOutput object
    // userInfo = { name, date, deviceId }

    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="musclemap-report-${Date.now()}.pdf"`)
    doc.pipe(res)

    // ── HEADER ──
    doc.fontSize(24).fillColor('#0d9488').text('MuscleMap', { align: 'center' })
    doc.fontSize(12).fillColor('#64748b').text('AI-Powered Muscle Pain Assessment Report', { align: 'center' })
    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke()
    doc.moveDown()

    // ── PATIENT INFO ──
    doc.fontSize(14).fillColor('#0f172a').text('Patient Information')
    doc.fontSize(11).fillColor('#475569')
    doc.text(`Name: ${userInfo?.name || 'Anonymous'}`)
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)
    doc.text(`Report generated by: MuscleMap AI (${assessment.generatedBy})`)
    doc.moveDown()

    // ── ASSESSMENT SUMMARY ──
    doc.fontSize(14).fillColor('#0f172a').text('Assessment Summary')
    doc.fontSize(11).fillColor('#475569')
    doc.text(`Region: ${assessment.regionName}`)
    doc.text(`Muscles Involved: ${assessment.muscles.join(', ')}`)
    doc.text(`Risk Level: ${assessment.riskLevel.toUpperCase().replace('_', ' ')}`)
    doc.moveDown()

    // ── RISK WARNING ──
    const riskColors: Record<string, string> = {
      mild: '#16a34a', moderate: '#d97706', severe: '#dc2626', red_flag: '#991b1b'
    }
    doc.fontSize(12).fillColor(riskColors[assessment.riskLevel] || '#0f172a')
    doc.text(`⚠ ${assessment.warningText}`)
    doc.moveDown()

    // ── AI INSIGHT ──
    if (assessment.aiInsight) {
      doc.fontSize(14).fillColor('#0f172a').text('AI Analysis')
      doc.fontSize(11).fillColor('#475569').text(assessment.aiInsight)
      doc.moveDown()
    }

    // ── EXERCISES ──
    doc.fontSize(14).fillColor('#0f172a').text('Recommended Exercises')
    assessment.exercises.forEach((ex: any, i: number) => {
      doc.fontSize(12).fillColor('#0d9488').text(`${i + 1}. ${ex.title}`)
      doc.fontSize(10).fillColor('#475569').text(ex.instructions, { indent: 20 })
      if (ex.tags?.length) {
        doc.fontSize(9).fillColor('#94a3b8').text(`Tags: ${ex.tags.join(', ')}`, { indent: 20 })
      }
      doc.moveDown(0.5)
    })
    doc.moveDown()

    // ── ACUPRESSURE POINTS ──
    if (assessment.acupressurePoints?.length) {
      doc.fontSize(14).fillColor('#0f172a').text('Acupressure Points')
      doc.fontSize(10).fillColor('#64748b').text('Apply gentle sustained pressure to these points for additional relief.')
      doc.moveDown(0.5)
      assessment.acupressurePoints.forEach((pt: any, i: number) => {
        doc.fontSize(12).fillColor('#f59e0b').text(`${i + 1}. ${pt.name}`)
        doc.fontSize(10).fillColor('#475569').text(pt.description, { indent: 20 })
        doc.fontSize(10).fillColor('#64748b').text(`Technique: ${pt.technique}`, { indent: 20 })
        doc.moveDown(0.5)
      })
      doc.moveDown()
    }

    // ── RECOVERY TIPS ──
    if (assessment.recoveryTips?.length) {
      doc.fontSize(14).fillColor('#0f172a').text('Recovery Tips')
      assessment.recoveryTips.forEach((tip: string) => {
        doc.fontSize(10).fillColor('#475569').text(`• ${tip}`, { indent: 10 })
      })
      doc.moveDown()
    }

    // ── DISCLAIMER ──
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke()
    doc.moveDown(0.5)
    doc.fontSize(9).fillColor('#92400e')
    doc.text('DISCLAIMER: ' + assessment.disclaimerText, {
      align: 'justify',
      indent: 0,
    })
    doc.moveDown()
    doc.fontSize(8).fillColor('#94a3b8').text('Generated by MuscleMap — 3D Model by Diego Luján García (CC BY)', { align: 'center' })

    doc.end()
  } catch (error) {
    console.error('PDF export error:', error)
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
}
```

### Register PDF route in `src/app.ts`

```typescript
import pdfRoutes from './routes/pdfRoutes'
app.use('/api', pdfRoutes)
```

---

## Summary of New Endpoints

| Method | Path | Auth Required | Description |
|--------|------|--------------|-------------|
| POST | /api/auth/register | No | Create new account |
| POST | /api/auth/login | No | Login, receive JWT token |
| GET | /api/auth/profile | Yes (Bearer token) | Get current user info |
| POST | /api/export/pdf | No | Generate PDF report |
| POST | /api/analyze-pain | No (optionalAuth) | AI pain analysis |
| GET | /api/history | No (optionalAuth) | Get history (user or device) |
| GET | /api/regions | No | Get all regions |
| GET | /api/health | No | Health check |
