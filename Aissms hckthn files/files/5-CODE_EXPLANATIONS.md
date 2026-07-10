# Code Explanations Document - MuscleMap

## Table of Contents
1. [Backend Architecture Explanation](#backend-architecture)
2. [Frontend Architecture Explanation](#frontend-architecture)
3. [Key Components & Modules](#key-components)
4. [Database Design](#database-design)
5. [API Endpoints Detailed](#api-endpoints)
6. [Authentication Flow](#authentication-flow)

---

## Backend Architecture

### Express.js Application Setup (`src/app.ts`)

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
```

**Explanation:**
- `express`: Core web framework for building REST APIs
- `helmet`: Adds security headers (prevents XSS, clickjacking, etc.)
- `cors`: Allows requests from frontend origin with validation

### Middleware Stack

```typescript
app.use(helmet());  // Security headers first
app.use(cors({
  origin: config.allowedOrigin,  // Only specific origin allowed
  methods: ['GET', 'POST'],       // Only GET and POST allowed
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,  // No cookie-based auth
}));
app.use(express.json());  // Parse JSON bodies
app.use(requestLogger);   // Log all requests (Morgan)
```

**Why this order matters:**
1. **Helmet first**: Security headers applied to all responses
2. **CORS next**: Early rejection of invalid origins
3. **Body parser**: Must be before routes to have parsed body
4. **Custom middleware**: Request logger for debugging
5. **Routes**: Process the actual request
6. **Error handler**: Catch any uncaught errors

### Route Organization

```typescript
app.use('/api', healthRoutes);      // Health checks
app.use('/api', regionRoutes);      // Anatomy regions
app.use('/api', painRoutes);        // Main pain assessment
app.use('/api', historyRoutes);     // Assessment history
app.use('/api', exerciseRoutes);    // Exercise library
app.use('/api', authRoutes);        // User authentication
app.use('/api', pdfRoutes);         // Report generation
app.use(errorHandler);              // Catch-all error handler
```

**Why organize by domain:**
- **Separation of concerns**: Each route file handles one domain
- **Scalability**: Easy to add new route groups
- **Maintainability**: Find related endpoints in one file
- **Team collaboration**: Different developers can work on different routes

---

## Database Layer (`src/db/database.ts`)

### SQLite Connection Pooling

```typescript
import Database from 'better-sqlite3';

// Single instance (singleton pattern)
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database('musclemap.sqlite');
    dbInstance.pragma('journal_mode = WAL');  // Write-Ahead Logging
  }
  return dbInstance;
}
```

**Explanation:**
- **Singleton Pattern**: Only one database connection at a time
- **WAL Mode**: Allows concurrent reads while writes happen
- **better-sqlite3**: Synchronous API (easier than async callbacks)

### Schema Initialization

```typescript
export function runSchema(db: Database.Database): void {
  db.exec(CREATE_REGIONS_TABLE);
  db.exec(CREATE_EXERCISES_TABLE);
  db.exec(CREATE_PAIN_ENTRIES_TABLE);
  // ... other tables
  
  // Safe migration (won't crash if column exists)
  try {
    db.exec(`ALTER TABLE pain_entries ADD COLUMN user_id TEXT...`);
  } catch {
    // Column already exists
  }
}
```

**Why this approach:**
- **Idempotent**: Safe to run on every server start
- **No external migrations**: Schema defined in code
- **Version control**: Schema changes tracked in Git
- **Rollback friendly**: Can revert schema to previous version

---

## Business Logic Layer

### Risk Calculation (`src/logic/riskCalculator.ts`)

```typescript
export function calculateRisk(input: RiskInput): RiskLevel {
  // Rule 1: Red flag — check first, highest priority
  if (
    RED_FLAG_PAIN_TYPES.includes(input.painType) ||
    input.intensity >= RED_FLAG_INTENSITY ||
    (RED_FLAG_SHARP_REGIONS.includes(input.region) && input.painType === 'sharp')
  ) {
    return 'red_flag';
  }

  // Rule 2: Severe
  if (input.intensity >= SEVERE_INTENSITY || ...) {
    return 'severe';
  }

  // Rule 3: Moderate
  if (input.intensity >= MODERATE_INTENSITY || ...) {
    return 'moderate';
  }

  // Rule 4: Mild — default
  return 'mild';
}
```

**Algorithm Explanation:**
- **Priority Order**: Red flag → Severe → Moderate → Mild
- **Multiple Conditions**: Any condition matching triggers that level
- **Safety First**: Errs on side of caution (higher risk when uncertain)
- **Extensible**: Easy to add new rules without changing structure

### Exercise Selection (`src/logic/exerciseSelector.ts`)

```typescript
export function selectExercises(
  regionId: string,
  painType: string,
  db: Database.Database
): ExerciseResponse[] {
  // Step 1: Exact match (region + pain type)
  const exactMatches = db.prepare(`
    SELECT * FROM exercises 
    WHERE region_id = ? AND pain_types LIKE ?
    LIMIT 3
  `).all(regionId, `%"${painType}"%`);

  let results = [...exactMatches];

  // Step 2: Fallback (region only, if not enough)
  if (results.length < 2) {
    const needed = 3 - results.length;
    const fallback = db.prepare(`
      SELECT * FROM exercises 
      WHERE region_id = ? AND id NOT IN (...)
      LIMIT ?
    `).all(regionId, needed);
    
    results = results.concat(fallback);
  }

  return results.slice(0, 3).map(e => ({
    title: e.title,
    instructions: e.instructions,
    tags: JSON.parse(e.tags)
  }));
}
```

**Algorithm Explanation:**
- **Two-tier matching**: First try specific pain type, then general region
- **Dynamic fallback**: Ensures always 2-3 exercises recommended
- **Prepared statements**: Prevent SQL injection
- **JSON parsing**: Tags stored as JSON strings in SQLite

### Gemini AI Integration (`src/logic/geminiAnalyzer.ts`)

```typescript
async function analyzeWithGemini(
  input: AnalyzeInput,
  regionName: string,
  db: Database.Database
): Promise<AnalyzeOutput> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  const prompt = buildPrompt(input, regionName, REGION_MUSCLES[input.region]);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    
    return {
      exercises: parsed.exercises,
      aiInsight: parsed.aiInsight,
      recoveryTips: parsed.recoveryTips,
      riskLevel: calculateRisk(input),  // Risk calculated separately
      // ... other fields
      generatedBy: 'gemini'
    };
  } catch (error) {
    // Fallback to rule-based if Gemini fails
    console.warn('Gemini failed, using fallback:', error);
    return analyzePain(input, db);  // Rule-based fallback
  }
}
```

**Why this design:**
- **Try-Catch Pattern**: Graceful degradation if API fails
- **Fallback Ready**: Rule-based analyzer always available
- **Separation**: Risk calculation independent of AI choice
- **Extensible**: Easy to swap Gemini with another AI

**Prompt Engineering:**
```typescript
function buildPrompt(input, regionName, muscles): string {
  return `
You are a physiotherapy assistant. Patient has ${input.painType} pain 
in ${regionName} lasting ${input.duration} at intensity ${input.intensity}/10.
Muscles involved: ${muscles.join(', ')}.

Respond with ONLY valid JSON:
{
  "exercises": [3 exercises with title, instructions, tags],
  "aiInsight": "2-3 sentence personalized insight",
  "recoveryTips": ["Tip 1", "Tip 2", "Tip 3"]
}
`;
}
```

**Prompt Design Principles:**
- **Structured output**: Asks for JSON specifically
- **Role definition**: "You are a physiotherapy assistant"
- **Context**: Provides all relevant pain details
- **Safety**: Includes implicit medical safety guidelines
- **Deterministic**: Always asks for same JSON structure

---

## API Endpoints Explained

### Pain Assessment Endpoint

```typescript
// POST /api/analyze-pain
export const analyzePainHandler = async (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const input = req.body;  // { region, painType, intensity, ... }

  // 1. Validate region exists
  const regionRow = db.prepare(
    'SELECT id FROM regions WHERE id = ? OR name = ?'
  ).get(input.region, input.region);
  
  if (!regionRow) {
    return res.status(404).json({ error: 'Region not found' });
  }
  
  input.region = regionRow.id;  // Normalize to region ID

  // 2. Call AI analyzer (Gemini + fallback)
  const output = await analyzeWithGemini(input, regionName, db);

  // 3. Save to database
  const id = uuidv4();  // Generate unique ID
  db.prepare(`INSERT INTO pain_entries (...) VALUES (...)`).run(
    id,
    input.deviceId,
    input.region,
    // ... all other fields
  );

  // 4. Return analysis to frontend
  return res.json(output);
};
```

**Request/Response Flow:**
```
Request: {
  deviceId: "uuid",
  region: "neck",
  painType: "sharp",
  intensity: 7,
  duration: "1_3_weeks"
}

Response: {
  regionName: "Neck",
  muscles: ["Sternocleidomastoid", ...],
  exercises: [
    { title: "Neck Stretch", instructions: "...", tags: [...] }
  ],
  aiInsight: "Your neck pain from prolonged...",
  recoveryTips: ["Rest affected area", ...],
  riskLevel: "moderate",
  warningText: "Consider seeing a doctor if...",
  acupressurePoints: [...]
}
```

### History Endpoint

```typescript
// GET /api/history?deviceId=<uuid>&limit=10
export const getHistoryHandler = (req: Request, res: Response) => {
  const { deviceId, limit = 10 } = req.query;

  const entries = db.prepare(`
    SELECT id, created_at, region, intensity, risk_level, result
    FROM pain_entries
    WHERE device_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(deviceId, limit);

  const formatted = entries.map(e => ({
    id: e.id,
    timestamp: e.created_at,
    region: e.region,
    intensity: e.intensity,
    riskLevel: e.risk_level,
    result: JSON.parse(e.result)  // Parse stored JSON
  }));

  return res.json(formatted);
};
```

**Why this design:**
- **Device-based lookup**: No auth required for basic tracking
- **Limit parameter**: Prevents downloading entire history
- **Ordered by date**: Newest first (most useful first)
- **Result stored as JSON**: Easy to retrieve complete analysis

---

## Frontend Architecture

### Main App Component (`src/App.tsx`)

```typescript
function App() {
  const { theme } = useTheme();  // Get dark/light mode
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AnalyzePainResponse | null>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [regionHeatmapCounts, setRegionHeatmapCounts] = useState<Record<string, number>>({});

  // Fetch and count history entries
  const refreshRegionCounts = useCallback(() => {
    getHistory(deviceId)
      .then((entries) => {
        const counts: Record<string, number> = {};
        for (const e of entries) {
          counts[e.region] = (counts[e.region] ?? 0) + 1;
        }
        setRegionHeatmapCounts(counts);  // Update 3D heatmap
      });
  }, [deviceId]);

  // Fetch history on mount
  useEffect(() => {
    refreshRegionCounts();
  }, [refreshRegionCounts]);

  return (
    <div>
      <BodyViewer
        theme={theme}
        onRegionClick={setSelectedRegion}  // User clicks region
        assessmentResult={assessmentResult}
        heatmapEnabled={heatmapEnabled}
        regionHeatmapCounts={regionHeatmapCounts}
      />
      <AssessmentPanel
        selectedRegion={selectedRegion}
        onSubmit={(result) => {
          setAssessmentResult(result);  // Show results
          refreshRegionCounts();         // Refresh heatmap
        }}
      />
    </div>
  );
}
```

**State Management:**
- **selectedRegion**: Which body part user clicked
- **assessmentResult**: Full pain analysis result
- **heatmapEnabled**: Toggle to show pain frequency
- **regionHeatmapCounts**: History-based region colors

### 3D Body Viewer Component (`src/components/scene/BodyViewer.tsx`)

```typescript
export function BodyViewer({
  theme,
  onRegionClick,
  assessmentResult,
  heatmapEnabled,
  regionHeatmapCounts
}) {
  return (
    <Canvas
      shadows
      camera={{ fov: 42, position: [0, 0.85, 2.6] }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      {/* Lighting for realistic rendering */}
      <Lights theme={theme} />
      
      {/* Camera control */}
      <CameraRig />
      
      {/* 3D body model with 19 regions */}
      <Suspense fallback={null}>
        <AnatomyModel
          onRegionClick={onRegionClick}
          assessmentResult={assessmentResult}
          heatmapEnabled={heatmapEnabled}
          regionHeatmapCounts={regionHeatmapCounts}
        />
      </Suspense>

      {/* Mouse/touch controls for rotation */}
      <OrbitControls
        target={[0, 0.92, 0]}  // Center on body
        enablePan={false}      // No panning
        minDistance={1}        // Zoom limits
        maxDistance={5.5}
      />
    </Canvas>
  );
}
```

**Three.js Concepts:**
- **Canvas**: WebGL rendering context
- **Camera**: View frustum (what user sees)
- **Lights**: Ambient + directional for realism
- **Suspense**: Loading state while model loads
- **OrbitControls**: Rotate/zoom without translation

### Anatomy Model (`src/components/scene/AnatomyModel.tsx`)

```typescript
export function AnatomyModel({ onRegionClick, heatmapEnabled, regionHeatmapCounts }) {
  return (
    <group>
      {/* 19 regions, each clickable */}
      {REGIONS.map((region) => (
        <mesh
          key={region.id}
          // Heatmap coloring based on history
          material-color={getHeatmapColor(
            regionHeatmapCounts[region.id] || 0
          )}
          onClick={() => onRegionClick(region)}  // Handle click
        >
          <geometry args={region.geometry} />
        </mesh>
      ))}
    </group>
  );
}

function getHeatmapColor(count: number): string {
  if (count === 0) return '#888888';      // Gray (no history)
  if (count <= 2) return '#ffff00';       // Yellow (low)
  if (count <= 5) return '#ff8800';       // Orange (medium)
  return '#ff0000';                       // Red (high)
}
```

**Why this approach:**
- **Map over regions**: Each region is a separate mesh
- **Click handler**: Trigger assessment panel
- **Color mapping**: Intensity based on history count
- **Smooth transitions**: Three.js handles material transitions

### Assessment Panel Component (`src/components/ui/AssessmentPanel.tsx`)

```typescript
export function AssessmentPanel({ selectedRegion, onSubmit }) {
  const [painType, setPainType] = useState<PainType>('dull');
  const [intensity, setIntensity] = useState<number>(5);
  const [duration, setDuration] = useState<Duration>('under_24h');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRegion) {
      alert('Please select a body region first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await analyzePain({
        deviceId: getOrCreateDeviceId(),
        region: selectedRegion.id,
        painType,
        intensity,
        duration,
        // optional: stressLevel, trigger
      });
      
      onSubmit(result);  // Pass to parent
    } catch (error) {
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assessment-panel">
      <h2>{selectedRegion?.name}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Pain type radio buttons */}
        <fieldset>
          <legend>Pain Type</legend>
          {PAIN_TYPES.map((type) => (
            <label key={type}>
              <input
                type="radio"
                checked={painType === type}
                onChange={(e) => setPainType(e.target.value as PainType)}
              />
              {type}
            </label>
          ))}
        </fieldset>

        {/* Intensity slider */}
        <fieldset>
          <legend>Intensity: {intensity}/10</legend>
          <input
            type="range"
            min="0"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
        </fieldset>

        {/* Duration dropdown */}
        <fieldset>
          <legend>Duration</legend>
          <select value={duration} onChange={(e) => setDuration(e.target.value as Duration)}>
            <option value="under_24h">Less than 24 hours</option>
            <option value="1_3_days">1-3 days</option>
            <option value="4_7_days">4-7 days</option>
            {/* ... more options */}
          </select>
        </fieldset>

        <button type="submit" disabled={isSubmitting || !selectedRegion}>
          {isSubmitting ? 'Analyzing...' : 'Get Analysis'}
        </button>
      </form>
    </div>
  );
}
```

**Form Design:**
- **Radio buttons**: Mutually exclusive pain types
- **Slider**: Intuitive intensity input
- **Dropdown**: Duration with readable labels
- **Validation**: Only enable submit if region selected
- **Loading state**: Disable during API call

### Results Display Component

```typescript
export function Results({ assessmentResult }) {
  if (!assessmentResult) return null;

  return (
    <div className={`risk-${assessmentResult.riskLevel}`}>
      {/* Risk badge */}
      <div className="risk-badge">
        {assessmentResult.riskLevel.toUpperCase()}
      </div>

      {/* Warning */}
      {assessmentResult.warningText && (
        <div className="warning-box">
          ⚠️ {assessmentResult.warningText}
        </div>
      )}

      {/* Affected muscles */}
      <h3>Affected Muscles:</h3>
      <ul>
        {assessmentResult.muscles.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      {/* Recommended exercises */}
      <h3>Recommended Exercises:</h3>
      {assessmentResult.exercises.map((exercise) => (
        <div key={exercise.title} className="exercise-card">
          <h4>{exercise.title}</h4>
          <p>{exercise.instructions}</p>
          <div className="tags">
            {exercise.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      ))}

      {/* AI insight */}
      <div className="ai-insight">
        <strong>AI Insight:</strong>
        <p>{assessmentResult.aiInsight}</p>
      </div>

      {/* Recovery tips */}
      <div className="recovery-tips">
        <strong>Recovery Tips:</strong>
        <ul>
          {assessmentResult.recoveryTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* PDF download */}
      <button onClick={() => downloadPDF(assessmentResult.id)}>
        📄 Download Report
      </button>

      {/* Disclaimer */}
      <small className="disclaimer">
        {assessmentResult.disclaimerText}
      </small>
    </div>
  );
}
```

**Color coding by risk level:**
```css
.risk-mild     { border: 2px solid #10b981; }   /* Green */
.risk-moderate { border: 2px solid #f59e0b; }   /* Orange */
.risk-severe   { border: 2px solid #ef4444; }   /* Red */
.risk-red_flag { border: 2px solid #dc2626; }   /* Dark Red */
```

---

## Authentication Flow

### Backend JWT Implementation

```typescript
// routes/authRoutes.ts
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Find user
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 2. Verify password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 3. Create JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },  // Payload
    process.env.JWT_SECRET,                  // Secret key
    { expiresIn: '24h' }                      // Expiration
  );

  // 4. Return token
  return res.json({ token, user: { id: user.id, email, name: user.name } });
});
```

**JWT Structure:**
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { userId: "...", email: "...", iat: 123, exp: 456 }
Signature: HMACSHA256(Header + Payload, SECRET_KEY)
```

### Protected Routes Middleware

```typescript
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);  // Remove "Bearer " prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;  // Attach to request object
    next();  // Continue to next middleware/handler
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

**Usage:**
```typescript
router.get('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  // req.userId is now available
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  res.json(user);
});
```

### Frontend Token Management

```typescript
// context/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')  // Persist across sessions
  );

  // Login
  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password
    });
    
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);  // Store for next session
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // Auto-login on app load
  useEffect(() => {
    if (token) {
      // Verify token is still valid
      axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUser(res.data))
        .catch(() => logout());  // Token expired or invalid
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Why this approach:**
- **localStorage**: Persists token across page reloads
- **Context API**: Share auth state across entire app
- **Auto-login**: Restore user session on app load
- **Token validation**: Verify token before making requests

---

## Data Validation with Zod

### Backend Schema

```typescript
// validation/painSchema.ts
import { z } from 'zod';

export const AnalyzePainSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
  region: z.enum([
    'neck', 'left_shoulder', 'right_shoulder', 'chest', 
    'upper_back', 'lower_back', 'abdomen', 
    'left_hip', 'right_hip', 'left_thigh', 'right_thigh',
    'left_knee', 'right_knee', 'left_calf', 'right_calf',
    'left_ankle', 'right_ankle', 'left_wrist', 'right_wrist'
  ]),
  painType: z.enum(['dull', 'sharp', 'stiffness', 'burning', 'numbness']),
  duration: z.enum(['under_24h', '1_3_days', '4_7_days', '1_3_weeks', 'over_3_weeks']),
  intensity: z.number().int().min(0).max(10),
  stressLevel: z.enum(['low', 'moderate', 'high']).optional(),
  trigger: z.enum(['gym', 'long_sitting', 'injury', 'unknown']).optional(),
});

export type AnalyzePainInput = z.infer<typeof AnalyzePainSchema>;
```

### Using Validation in Route

```typescript
router.post('/analyze-pain', (req: Request, res: Response) => {
  // Validate request
  const validation = AnalyzePainSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: validation.error.flatten()
    });
  }

  const input = validation.data;  // Type is guaranteed to be valid
  // ... process input
});
```

**Benefits:**
- **Type safety**: TypeScript knows exact shape after validation
- **Human errors caught**: Invalid enums, missing fields
- **API contract**: Frontend knows exactly what's required
- **Auto-documentation**: Schema is the spec

---

## Error Handling Pattern

### Global Error Handler

```typescript
// middleware/errorHandler.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error (includes stack trace)
  console.error('[ERROR]', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  // Return generic message (don't leak internals)
  return res.status(500).json({
    error: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
}

// Use as last middleware
app.use(errorHandler);
```

**Why generic errors:**
- **Security**: Don't expose database structure or API internals
- **User experience**: "Something went wrong" is clearer than stack trace
- **Logging**: Full error info in logs, minimal to user

### Specific Error Handling

```typescript
try {
  const analysis = await analyzeWithGemini(input, regionName, db);
  
  if (!analysis) {
    // Validation error (caught earlier with Zod)
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  return res.json(analysis);
  
} catch (error) {
  // Log specific error types
  if (error instanceof RateLimitError) {
    return res.status(429).json({ error: 'Too many requests' });
  } else if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  } else {
    // Fall through to global error handler
    throw error;
  }
}
```

---

## Performance Optimization Examples

### Memoization in React

```typescript
// Expensive computation: count history by region
const regionCounts = useMemo(() => {
  const counts: Record<string, number> = {};
  for (const entry of history) {
    counts[entry.region] = (counts[entry.region] ?? 0) + 1;
  }
  return counts;
}, [history]);  // Only recalculate when history changes

// Avoid recreating function on each render
const handleRegionClick = useCallback((region: RegionInfo) => {
  setSelectedRegion(region);
}, []);  // Dependencies: none, function is stable
```

### Prepared Statements in SQLite

```typescript
// Prepared statement (compiled once, executed multiple times)
const stmt = db.prepare('SELECT * FROM exercises WHERE region_id = ? LIMIT ?');

// Fast execution with parameter binding
const exercises1 = stmt.all('neck', 5);
const exercises2 = stmt.all('lower_back', 3);  // Reuses compiled query
```

**vs.**

```typescript
// NOT recommended: creates new query each time
db.prepare(`SELECT * FROM exercises WHERE region_id = '${regionId}' LIMIT ${limit}`);
```

### Query Optimization with Indexes

```sql
-- Without index: O(n) table scan
SELECT * FROM pain_entries WHERE device_id = 'abc123';
-- Must check every row

-- With index: O(log n) B-tree lookup
CREATE INDEX idx_pain_entries_device_id ON pain_entries(device_id);
-- Much faster for large tables
```

---

## Key Takeaways

### Architecture Principles
1. **Separation of Concerns**: Routes, Controllers, Logic, Data layers
2. **Type Safety**: TypeScript catches errors early
3. **Validation**: Zod ensures data integrity
4. **Error Handling**: Graceful fallbacks and generic error messages
5. **Performance**: Indexing, memoization, prepared statements

### Security First
1. **Input Validation**: Zod schemas on all inputs
2. **Password Security**: bcryptjs hashing
3. **Token Management**: JWT with expiration
4. **Error Messages**: Never expose internals
5. **CORS**: Restrict to known origins

### Scalability Considerations
1. **Stateless**: No server-side sessions
2. **Horizontal Scaling**: Can add more servers
3. **Database**: SQLite → PostgreSQL migration path
4. **Caching**: Browser + in-memory caching
5. **Monitoring**: Logging infrastructure in place

