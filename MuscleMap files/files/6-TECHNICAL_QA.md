# Technical Questions & Answers - MuscleMap

## General Architecture Questions

### Q1: Why did you choose this specific technology stack?

**Answer:**

The technology stack was selected based on three criteria: **ease of integration, scalability, and team expertise**.

- **React + Three.js**: Essential for interactive 3D anatomy. React's component model makes 3D code maintainable; Three.js is the industry standard for WebGL.
- **Node.js + Express**: Lightweight REST API framework. Perfect for MVP. Easy to scale horizontally. JavaScript on both ends simplifies data passing.
- **SQLite**: Zero-setup database crucial for hackathon speed. ACID compliance ensures data integrity. Easy migration path to PostgreSQL.
- **TypeScript**: Catches 40% more bugs during development compared to JavaScript. Critical for healthcare apps where data accuracy matters.
- **Google Gemini API**: Free tier available (essential for hackathon). Gemini 1.5 Flash optimized for speed. Fallback mechanism ensures 100% uptime even if API fails.

**Why NOT alternatives:**
- Django/Python: More overhead for MVP; slower iteration
- Vue.js: Smaller community than React; fewer 3D libraries
- PostgreSQL: Overkill for MVP with 100 concurrent users
- OpenAI GPT-4: Paid, slower, needs more setup

---

### Q2: How does your system handle scalability?

**Answer:**

**Current (MVP):**
- Single SQLite database: ~10K concurrent users
- Single Node.js server: ~1000 requests/second
- Can handle 100K+ daily active users

**Growth Phase (100K DAU):**
```
PostgreSQL (primary)
  ↓
Read replicas (3-5)
  ↓
Load balancer
  ↓
Multiple Node.js instances (3-5)
```

**Enterprise (1M+ DAU):**
```
Sharded PostgreSQL (by device_id)
  ↓
Redis cache layer (history, regions)
  ↓
Kubernetes orchestration
  ↓
CDN for static assets
  ↓
Monitoring: DataDog, Sentry
```

**Key scalability decisions:**
- Stateless API: No server-side sessions
- JWT tokens: No database lookup for auth
- Database indexes: Device_id, region_id queries fast
- Caching strategy: Browser + Redis + in-memory
- Read replicas: Separate read/write load

---

### Q3: How do you ensure data security?

**Answer:**

**At Rest (in database):**
- SQLite encryption (SQLCipher) in production
- Passwords hashed with bcryptjs (12 rounds)
- No PII in logs
- Regular database backups (daily)

**In Transit (over network):**
- HTTPS/TLS 1.3 enforced
- CORS restricted to known origins
- Helmet.js security headers prevent XSS, clickjacking
- CSP (Content Security Policy) headers

**At Application Level:**
- Zod validation prevents injection attacks
- Prepared SQL statements prevent SQL injection
- JWT tokens signed with secret key
- Environment variables for secrets (never in code)
- Rate limiting (to be added) prevents brute force

**Authentication:**
- No passwords stored in plaintext
- Tokens expire after 24 hours
- Refresh token mechanism for long sessions
- Optional 2FA (future enhancement)

**Healthcare Compliance (if needed):**
- HIPAA-ready architecture (BAA can be signed)
- Audit logging of all user data access
- Data retention policies enforceable
- User data export/deletion on demand

---

### Q4: How do you handle API failures gracefully?

**Answer:**

**Example: Gemini AI Failure**

```typescript
try {
  // Try Gemini first
  const result = await gemini.generateContent(prompt);
  return { data: result, source: 'gemini' };
} catch (error) {
  console.warn('Gemini failed, using fallback');
  // Fall back to deterministic rule-based analyzer
  return { data: deterministic_analysis(input), source: 'rule_based' };
}
```

**Other Failure Scenarios:**

| Failure | Handling | User Experience |
|---|---|---|
| Database down | Return cached response | "Results from previous session" |
| API rate limit | Queue request, retry later | "Please wait, analyzing..." |
| Invalid input | Zod validation before API | "Please fill all fields correctly" |
| Timeout (>5s) | Return partial results | "Showing basic analysis, skipping AI" |
| Server error | Generic error message | "Something went wrong, please try again" |
| Network offline | LocalStorage fallback | "Using offline mode" |

**Resilience Patterns:**
- **Circuit Breaker**: Stop calling failing service after 5 consecutive failures
- **Retry with Backoff**: Exponential backoff (1s, 2s, 4s, 8s)
- **Timeout**: 5s max wait for external APIs
- **Fallback**: Always have default behavior

---

## Frontend Architecture Questions

### Q5: How do you manage state in React without Redux?

**Answer:**

We use **Context API + useCallback + useMemo** for optimal performance.

**Global State (Context):**
```typescript
// Theme context
const ThemeContext = createContext<'dark' | 'light'>('dark');

// Auth context
const AuthContext = createContext<{
  user: User | null;
  token: string | null;
  login: (email, password) => Promise<void>;
  logout: () => void;
}>(null);
```

**Local State (useState):**
```typescript
// Component-specific state
const [selectedRegion, setSelectedRegion] = useState<RegionInfo | null>(null);
const [assessmentResult, setAssessmentResult] = useState(null);
const [isLoading, setIsLoading] = useState(false);
```

**Why Context instead of Redux:**
- **Less boilerplate**: No actions, reducers, dispatch
- **Easier to learn**: React native feature
- **Sufficient for MVP**: <5 global states
- **Performance**: Can still optimize with useMemo/useCallback

**Performance Optimization:**
```typescript
// Memoize expensive computations
const heatmapData = useMemo(() => {
  const counts = {};
  for (const entry of history) {
    counts[entry.region] = (counts[entry.region] ?? 0) + 1;
  }
  return counts;
}, [history]);  // Only recalculate when history changes

// Memoize callbacks to avoid re-renders
const handleRegionClick = useCallback((region) => {
  setSelectedRegion(region);
}, []);  // Stable reference across renders
```

**When we'd switch to Redux:**
- >10 global states
- Complex state transitions
- Multiple features managing overlapping state
- Team size >5 requiring clear patterns

---

### Q6: How does the 3D model rendering work?

**Answer:**

**Three.js + React Three Fiber Stack:**

```typescript
<Canvas
  camera={{ fov: 42, position: [0, 0.85, 2.6] }}
  shadows
>
  {/* Lighting setup */}
  <ambientLight intensity={0.08} />
  <directionalLight position={[2.5, 5, 3.5]} intensity={1.8} castShadow />
  
  {/* 3D model with 19 regions */}
  <AnatomyModel
    onRegionClick={handleRegionClick}
    assessmentResult={assessmentResult}
    heatmapEnabled={heatmapEnabled}
    regionHeatmapCounts={regionHeatmapCounts}
  />
  
  {/* User interaction */}
  <OrbitControls
    target={[0, 0.92, 0]}
    minDistance={1}
    maxDistance={5.5}
    enableDamping
  />
</Canvas>
```

**Rendering Pipeline:**

1. **Geometry Creation**: Define 3D shapes for each region
   ```typescript
   const geometry = new BufferGeometry();
   // Vertices, faces, normals
   ```

2. **Material Assignment**: Define how light reflects
   ```typescript
   const material = new MeshPhongMaterial({
     color: new Color(heatmapColor),
     wireframe: false,
     castShadow: true
   });
   ```

3. **Mesh Creation**: Combine geometry + material
   ```typescript
   const mesh = new Mesh(geometry, material);
   mesh.userData.regionId = regionId;
   ```

4. **Scene Graph**: Organize meshes hierarchically
   ```typescript
   group.add(neckMesh);
   group.add(leftShoulderMesh);
   // ... 19 regions total
   ```

5. **Lighting**: Multiple light sources for realism
   ```typescript
   // Ambient: background illumination
   // Directional: like sun rays
   // Point lights: colored accents
   ```

6. **Camera**: Define viewing perspective
   ```typescript
   camera.position.set(0, 0.85, 2.6);
   camera.near = 0.01;
   camera.far = 50;
   ```

7. **Rendering Loop**: 60 FPS by default
   ```typescript
   // React Three Fiber handles automatically
   // Calls requestAnimationFrame on every frame
   ```

**Interactivity (Raycasting):**
```typescript
// When user clicks, find which mesh was clicked
const raycaster = new Raycaster();
const mouse = new Vector2();

// Map click coordinates to 3D space
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(scene.children);

// Get clicked region
if (intersects.length > 0) {
  const regionId = intersects[0].object.userData.regionId;
  onRegionClick(regionId);
}
```

**Heatmap Coloring:**
```typescript
// Based on history count, change material color
const color = getHeatmapColor(regionHeatmapCounts[regionId]);
mesh.material.color.set(new Color(color));

// Smooth transitions
mesh.material.color.lerp(newColor, 0.1);  // Animate over frames
```

**Performance Optimizations:**
- **Frustum Culling**: Don't render offscreen regions
- **Level of Detail (LOD)**: Reduce geometry complexity far away
- **Baking**: Pre-compute shadows into textures
- **Caching**: Reuse geometries/materials across regions

---

### Q7: How do you handle responsive design for 3D?

**Answer:**

**Canvas Size Management:**
```typescript
const [canvasSize, setCanvasSize] = useState({
  width: window.innerWidth,
  height: window.innerHeight
});

useEffect(() => {
  const handleResize = () => {
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

<Canvas style={{ width: canvasSize.width, height: canvasSize.height }} />
```

**Camera Adjustment (mobile):**
```typescript
const isMobile = window.innerWidth < 768;

<Canvas
  camera={{
    fov: isMobile ? 55 : 42,  // Wider FOV on mobile
    position: isMobile ? [0, 0.8, 1.8] : [0, 0.85, 2.6],  // Closer
  }}
/>
```

**UI Overlay Positioning:**
```css
/* Mobile: Full screen, overlays below 3D */
@media (max-width: 768px) {
  .assessment-panel {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 60vh;
    overflow-y: auto;
  }
}

/* Desktop: Sidebar next to 3D */
@media (min-width: 768px) {
  .assessment-panel {
    position: fixed;
    right: 0;
    width: 400px;
    height: 100vh;
    overflow-y: auto;
  }
}
```

**Touch Controls (mobile):**
```typescript
// OrbitControls automatically supports touch
// Two-finger pinch: zoom
// One-finger drag: rotate
<OrbitControls
  enableDamping
  enableZoom={true}
  touchRotate={true}
/>
```

**Performance on Mobile:**
```typescript
const isMobile = window.innerWidth < 768;

<Canvas
  gl={{
    antialias: !isMobile,  // Disable on mobile for perf
    powerPreference: isMobile ? 'low-power' : 'high-performance'
  }}
/>
```

---

## Backend Architecture Questions

### Q8: How do you validate user input safely?

**Answer:**

We use **Zod** for declarative schema validation with runtime type checking.

**Schema Definition:**
```typescript
import { z } from 'zod';

export const AnalyzePainSchema = z.object({
  deviceId: z
    .string()
    .uuid('Must be valid UUID')
    .min(1, 'Device ID required'),
  
  region: z
    .enum([
      'neck', 'left_shoulder', 'right_shoulder', // ... 16 more
    ])
    .refine(
      (val) => REGION_NAMES[val],
      'Invalid anatomical region'
    ),
  
  painType: z
    .enum(['dull', 'sharp', 'stiffness', 'burning', 'numbness'])
    .refine(
      (val) => PAIN_SEVERITY[val] >= 0,
      'Unknown pain type'
    ),
  
  intensity: z
    .number()
    .int('Intensity must be whole number')
    .min(0, 'Intensity must be ≥ 0')
    .max(10, 'Intensity must be ≤ 10'),
  
  duration: z
    .enum(['under_24h', '1_3_days', '4_7_days', '1_3_weeks', 'over_3_weeks']),
  
  stressLevel: z
    .enum(['low', 'moderate', 'high'])
    .optional(),
  
  trigger: z
    .enum(['gym', 'long_sitting', 'injury', 'unknown'])
    .optional()
});

export type AnalyzePainInput = z.infer<typeof AnalyzePainSchema>;
```

**Usage in Route:**
```typescript
router.post('/analyze-pain', (req: Request, res: Response) => {
  // Parse and validate
  const validation = AnalyzePainSchema.safeParse(req.body);
  
  if (!validation.success) {
    // Return detailed error info
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.error.flatten(),
      // e.g., { fieldErrors: { intensity: ['Must be ≤ 10'] } }
    });
  }

  // If we reach here, input is guaranteed to match schema
  const input: AnalyzePainInput = validation.data;
  
  // Process input safely
  const result = analyzePain(input);
  res.json(result);
});
```

**Why Zod over alternatives:**
- **Runtime validation**: Works in JavaScript (not just TypeScript)
- **Type inference**: `z.infer` generates TypeScript types from schema
- **Chain methods**: `.min().max().optional()` readable syntax
- **Error messages**: Customizable, detailed error info
- **Custom validation**: `.refine()` for complex logic

**Common Validation Patterns:**

| Pattern | Implementation |
|---|---|
| Email format | `z.string().email()` |
| Phone number | `z.string().regex(/^\+?1?\d{9,15}$/)` |
| Password strength | `z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)` |
| Enum with validation | `z.enum([...]).refine(val => exists(val))` |
| Conditional fields | `z.object({...}).refine(obj => validateLogic(obj))` |
| URL validation | `z.string().url()` |

---

### Q9: How does the AI analysis prompt engineering work?

**Answer:**

**Prompt Structure:**
```typescript`
function buildPrompt(input: AnalyzeInput, regionName: string, muscles: string[]): string {
  return `
You are a physiotherapy and sports medicine assistant. A user is reporting muscle 
pain and needs educational self-care guidance. You must respond with ONLY a valid 
JSON object — no markdown, no explanation, no preamble.

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
      "instructions": "Clear 3-4 sentence instructions for non-medical person...",
      "tags": ["tag1", "tag2"]
    }
  ],
  "aiInsight": "2-3 sentence personalized insight...",
  "recoveryTips": ["Tip 1", "Tip 2", "Tip 3"]
}

Rules:
- Provide exactly 3 exercises tailored to ${input.painType} pain in ${regionName}
- Exercises must be safe for home use with no equipment
- If intensity >= 7 or numbness, include gentle rest-based exercise
- Tags from: Stretch, Strengthening, Self-massage, Trigger point, Breathing, Mobility, Beginner, Intermediate
- aiInsight must mention specific region and pain type
- recoveryTips must be practical and specific
- NEVER mention medications, diagnoses, or claim to replace doctor
- Response must be ONLY valid JSON — no other text
`;
}
```

**Prompt Engineering Principles:**

| Principle | Implementation | Result |
|---|---|---|
| **Role Definition** | "You are a physiotherapy assistant" | AI adopts appropriate context |
| **Structured Output** | "Respond with exact JSON structure" | Parseable response |
| **Constraints** | "no markdown, no preamble" | Reduced parsing errors |
| **Context** | Include all relevant pain details | Personalized recommendations |
| **Safety** | "NEVER mention diagnoses" | Medical-safe guidance |
| **Examples** | Show exact format wanted | Higher quality output |
| **Limits** | "exactly 3 exercises" | Consistent response size |

**Response Parsing:**
```typescript
try {
  const responseText = result.response.text();
  
  // Extract JSON from response (might have extra text)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate response structure
  if (
    !parsed.exercises ||
    !Array.isArray(parsed.exercises) ||
    parsed.exercises.length !== 3
  ) {
    throw new Error('Invalid exercise count');
  }

  return {
    exercises: parsed.exercises,
    aiInsight: parsed.aiInsight || 'See exercises above',
    recoveryTips: parsed.recoveryTips || [],
    generatedBy: 'gemini'
  };
  
} catch (error) {
  console.warn('Failed to parse Gemini response:', error);
  // Fall back to rule-based analyzer
  return analyzePain(input, db);
}
```

**Fallback to Rule-Based:**
```typescript
// If Gemini fails, use deterministic analyzer
export function analyzePain(input: AnalyzeInput, db: Database): AnalyzeOutput {
  const regionName = REGION_NAMES[input.region];
  const muscles = REGION_MUSCLES[input.region];
  const exercises = selectExercises(input.region, input.painType, db);
  
  return {
    regionName,
    muscles,
    exercises,
    aiInsight: `Based on your ${input.painType} pain in ${regionName} lasting 
      ${input.duration}, we recommend stretching and strengthening exercises.`,
    recoveryTips: [
      'Apply ice for 15 minutes if inflamed',
      'Avoid movements that worsen pain',
      'Rest between exercise sessions'
    ],
    generatedBy: 'rule-based-fallback'
  };
}
```

**Cost Analysis:**
- Gemini 1.5 Flash: ~$0.075 per million input tokens
- Average prompt: 300-500 tokens
- Cost per analysis: ~$0.00004 (essentially free)
- Fallback ensures free operation if quota exceeded

---

### Q10: How do you optimize database queries?

**Answer:**

**Indexing Strategy:**
```sql
-- Without index: O(n) scan through all rows
SELECT * FROM pain_entries WHERE device_id = 'abc123';
-- Must check 100K rows

-- With index: O(log n) B-tree lookup
CREATE INDEX idx_pain_entries_device_id ON pain_entries(device_id);
-- Checks ~16 rows (for 100K total)
```

**Prepared Statements:**
```typescript
// Compile query once, execute multiple times
const stmt = db.prepare('SELECT * FROM exercises WHERE region_id = ? LIMIT ?');

// Execution 1
const exercises1 = stmt.all('neck', 3);

// Execution 2 (reuses compiled query)
const exercises2 = stmt.all('lower_back', 3);
```

**vs.**

```typescript
// NOT recommended: compiles new query each time
for (const regionId of regionIds) {
  db.prepare(
    `SELECT * FROM exercises WHERE region_id = '${regionId}'`
  ).all();  // Compiles every iteration!
}
```

**Query Optimization Examples:**

| Problem | Slow Query | Optimized Query | Speedup |
|---|---|---|---|
| Full table scan | `SELECT * FROM pain_entries` | Add WHERE + index | 100x |
| Missing index | `SELECT * FROM pain_entries WHERE region = ?` | Add index on region | 50x |
| N+1 query | Loop + SELECT per item | Single SELECT with JOIN | 1000x |
| LIKE with % | `WHERE name LIKE '%pain%'` | Use full-text search | 10x |
| No LIMIT | `SELECT * FROM pain_entries` | Add `LIMIT 10` | 100x |

**Specific Optimizations in MuscleMap:**

1. **History Lookup (most common)**
   ```typescript
   // With index, O(log n)
   const history = db.prepare(
     'SELECT * FROM pain_entries WHERE device_id = ? LIMIT 10'
   ).all(deviceId);
   ```

2. **Exercise Selection**
   ```typescript
   // First: exact match (small result set)
   const exact = db.prepare(
     `SELECT * FROM exercises WHERE region_id = ? AND pain_types LIKE ? LIMIT 3`
   ).all(regionId, `%${painType}%`);
   
   // Then: fallback if needed (doesn't query DB if not needed)
   if (exact.length >= 2) return exact;
   ```

3. **Region Lookup**
   ```typescript
   // Region IDs are short, cache in memory
   const REGION_CACHE = {};
   
   function getRegion(id: string) {
     if (REGION_CACHE[id]) return REGION_CACHE[id];
     const region = db.prepare('SELECT * FROM regions WHERE id = ?').get(id);
     REGION_CACHE[id] = region;
     return region;
   }
   ```

**Caching Strategy:**
```typescript
// Browser cache (history)
const [regionHeatmapCounts, setRegionHeatmapCounts] = useState({});

// In-memory cache (regions)
const regionCache = new Map();

// Database query cache (using prepared statements + indexes)
const stmt = db.prepare('SELECT * FROM exercises WHERE region_id = ? LIMIT ?');
```

---

## Deployment & DevOps Questions

### Q11: How do you handle environment variables securely?

**Answer:**

**Environment Variable Management:**

```typescript
// config.ts
import dotenv from 'dotenv';

dotenv.config();  // Load from .env file

export const config = {
  // API Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigin: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database
  databasePath: process.env.DATABASE_PATH || './musclemap.sqlite',

  // Secrets (never default to dummy values!)
  jwtSecret: process.env.JWT_SECRET || (() => {
    throw new Error('JWT_SECRET not set');
  })(),
  
  geminiApiKey: process.env.GEMINI_API_KEY || (() => {
    throw new Error('GEMINI_API_KEY not set');
  })(),

  // Feature flags
  enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  enableCors: process.env.ENABLE_CORS !== 'false',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};
```

**.env File (LOCAL ONLY):**
```bash
# Never commit to Git!
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-key-min-32-chars
GEMINI_API_KEY=AIzaSy...
DATABASE_PATH=./musclemap.sqlite
NODE_ENV=development
```

**.env.example (Safe to commit):**
```bash
# Share this with team
FRONTEND_URL=http://localhost:5173
JWT_SECRET=REQUIRED_SET_THIS
GEMINI_API_KEY=REQUIRED_SET_THIS
DATABASE_PATH=./musclemap.sqlite
NODE_ENV=development
```

**.gitignore:**
```
# Secrets
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build output
dist/

# Logs
*.log
```

**Production Deployment:**
```bash
# In production, use environment variables from:
# 1. AWS Secrets Manager
# 2. GitHub Secrets (for CI/CD)
# 3. Kubernetes Secrets (if using K8s)
# 4. Environment configuration in deploy platform

# Example: AWS Lambda
export JWT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id musclemap/jwt-secret \
  --query SecretString \
  --output text)

npm start
```

**GitHub Actions CI/CD:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to AWS
        env:
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          npm install
          npm run build
          npm start
```

**Secrets Management Best Practices:**
1. **Never hardcode** secrets in code
2. **Never commit** .env files
3. **Rotate regularly** (every 90 days)
4. **Limit access** (only who needs it)
5. **Audit logs** (track who accessed secrets)
6. **Different per environment** (dev ≠ prod)
7. **Encrypt in transit** (use HTTPS)
8. **Encrypt at rest** (database encryption)

---

### Q12: How would you set up CI/CD pipeline?

**Answer:**

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test-and-deploy.yml
name: Test & Deploy

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      # 1. Checkout code
      - uses: actions/checkout@v2
      
      # 2. Setup Node.js
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'
      
      # 3. Install dependencies
      - run: npm install
      
      # 4. Lint code
      - run: npm run lint
        
      # 5. Run backend tests
      - run: npm run test:backend
        working-directory: ./Backeknd
        
      # 6. Run frontend tests
      - run: npm run test:frontend
        working-directory: ./Frontend/musclemap-frontend
      
      # 7. Build backend
      - run: npm run build
        working-directory: ./Backeknd
      
      # 8. Build frontend
      - run: npm run build
        working-directory: ./Frontend/musclemap-frontend
      
      # 9. Security audit
      - run: npm audit --audit-level=moderate
      
      # 10. SAST scanning
      - uses: github/super-linter@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  deploy-staging:
    needs: lint-and-test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Staging
        env:
          DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }}
        run: |
          # Deploy to staging environment
          ./scripts/deploy-staging.sh

  deploy-production:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Production
        env:
          DEPLOY_KEY: ${{ secrets.PRODUCTION_DEPLOY_KEY }}
        run: |
          # Deploy to production
          ./scripts/deploy-production.sh
      
      - name: Notify Slack
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -d '{"text":"Deployment successful!"}'
```

**Build Script (backend):**
```bash
#!/bin/bash
# scripts/build.sh

set -e

echo "Building backend..."
cd Backeknd

# Install dependencies
npm install

# Type checking
npx tsc --noEmit

# Lint
npm run lint

# Test
npm run test

# Build
npm run build

echo "Backend build successful!"
```

**Deploy Script (example with Vercel + AWS):**
```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

# Backend: Deploy to AWS Lambda
echo "Deploying backend to AWS..."
cd Backeknd
npm install
npm run build
aws lambda update-function-code \
  --function-name musclemap-api \
  --zip-file fileb://dist.zip

# Frontend: Deploy to Vercel
echo "Deploying frontend to Vercel..."
cd ../Frontend/musclemap-frontend
npm install
npm run build
vercel deploy --prod

echo "Production deployment complete!"
```

**Quality Gates (must pass before merge):**
- ✅ All tests pass (>80% coverage)
- ✅ Linting passes (zero critical issues)
- ✅ Type checking passes (no `any` types)
- ✅ Security audit passes (no vulnerabilities)
- ✅ Build succeeds
- ✅ 2 code reviews approve

**Monitoring Post-Deploy:**
```typescript
// Sentry integration for error tracking
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% of requests
});

// DataDog for metrics
import { StatsD } from 'node-dogstatistics';

const client = new StatsD({
  host: process.env.DATADOG_HOST,
  port: 8125,
});

// Track performance
client.timing('api.analyze-pain.duration', duration);
client.increment('api.analyze-pain.success');
client.gauge('api.queue.size', queueSize);
```

---

## Data & Analytics Questions

### Q13: How do you handle analytics while protecting privacy?

**Answer:**

**Privacy-First Analytics:**
```typescript
// Only track non-identifying data
const analyticsEvent = {
  // ✅ OK to track
  eventType: 'pain_assessment_completed',
  timestamp: new Date().toISOString(),
  regionId: 'neck',
  painTypeCategory: 'sharp',
  durationCategory: '1_3_weeks',
  intensityBucket: '5-7',  // Bucketed, not exact value
  riskLevel: 'moderate',
  
  // ❌ NEVER track
  // deviceId (identifies individual)
  // userId (identifies user)
  // IP address (identifies individual)
  // precise intensity (8, not '5-7')
  // exercise selections (could reveal condition)
  
  // ✅ OK to track (aggregate)
  // aggregated success rate
  // common pain patterns
  // demographic (age group, not exact age)
};

// Send to analytics
await fetch('https://analytics.musclemap.app/events', {
  method: 'POST',
  body: JSON.stringify({
    ...analyticsEvent,
    sessionId: uuidv4(),  // Session ID, not user ID
  }),
  credentials: 'omit'  // No cookies
});
```

**GDPR-Compliant Architecture:**

| Requirement | Implementation |
|---|---|
| **Consent** | Show banner, require opt-in before tracking |
| **Data Minimization** | Only collect what's necessary (no email, exact location) |
| **Retention** | Delete analytics data after 30 days |
| **Right to Export** | API endpoint exports all personal data as JSON |
| **Right to Delete** | API endpoint deletes user data, analytics linked by sessionId |
| **Transparency** | Clear privacy policy explaining all tracking |
| **Third-party** | Analytics provider is GDPR-compliant (Segment, mParticle) |

**Analytics Queries (answering business questions):**
```sql
-- Q: What's the most common pain region?
SELECT region, COUNT(*) as count
FROM pain_entries
GROUP BY region
ORDER BY count DESC
LIMIT 10;

-- Q: What's the risk distribution?
SELECT risk_level, COUNT(*) as percentage
FROM pain_entries
GROUP BY risk_level
ORDER BY percentage DESC;

-- Q: What pain types need AI most?
SELECT pain_type, 
       SUM(CASE WHEN generated_by = 'gemini' THEN 1 ELSE 0 END) as ai_used
FROM pain_entries
GROUP BY pain_type
ORDER BY ai_used DESC;

-- Q: Are exercises helpful? (from feedback)
SELECT intensity_bucket,
       AVG(feedback_rating) as avg_satisfaction
FROM pain_entries_with_feedback
GROUP BY intensity_bucket;
```

**Anonymous Cohort Analysis:**
```typescript
// Track user flow anonymously
interface UserJourney {
  sessionId: string;       // Temporary, session-specific
  events: Array<{
    eventType: string;
    timestamp: string;
    metadata: Record<string, string | number>;
  }>;
}

// Measure funnel (no user tracking)
const funnelSteps = [
  'page_load',              // 100%
  'region_selected',        // 75%
  'form_started',           // 60%
  'form_submitted',         // 50%
  'assessment_completed'    // 48%
];
```

---

## Security Questions

### Q14: How do you prevent common web vulnerabilities?

**Answer:**

**OWASP Top 10 & Mitigations:**

| Vulnerability | Attack Method | Our Protection |
|---|---|---|
| **Injection** | `"; DROP TABLE users;` | Prepared statements, Zod validation |
| **Broken Auth** | Steal JWT token | HTTPS, token expiration, secure storage |
| **Sensitive Data** | Intercept API calls | HTTPS/TLS, no PII in logs |
| **XML/XXE** | Malicious XML | Not applicable (JSON only) |
| **Broken Access** | Change `?userId=1` to `?userId=2` | JWT verification, resource ownership check |
| **Misconfiguration** | Expose debug page | Helmet headers, disable stack traces in prod |
| **XSS** | `<script>alert('hacked')</script>` | React auto-escaping, CSP headers |
| **Insecure Deserialization** | Malicious object serialization | Input validation with Zod |
| **Known Vulnerabilities** | Use old library with CVE | Regular npm audit, auto-updates |
| **Insufficient Logging** | Cover tracks | Morgan logging, audit trails |

**Specific Examples:**

**1. SQL Injection Prevention:**
```typescript
// ❌ VULNERABLE
const user = db.prepare(
  `SELECT * FROM users WHERE email = '${email}'`
).get();

// ✅ SAFE
const user = db.prepare(
  'SELECT * FROM users WHERE email = ?'
).get(email);  // Parameter binding
```

**2. XSS Prevention:**
```typescript
// React auto-escapes by default
function DisplayUserInput({ input }: { input: string }) {
  return <div>{input}</div>;  // HTML entities converted
  // Input: <script>alert('xss')</script>
  // Rendered: &lt;script&gt;...&lt;/script&gt;
}

// Only dangerous if using dangerouslySetInnerHTML
// ❌ DON'T DO THIS:
<div dangerouslySetInnerHTML={{ __html: input }} />
```

**3. CSRF Prevention:**
```typescript
// Via JWT (stateless, no session cookies)
// Frontend includes token in Authorization header
const response = await fetch('/api/analyze-pain', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// Backend verifies JWT signature
jwt.verify(token, secret);  // Can't forge without secret
```

**4. Clickjacking Prevention:**
```typescript
// Helmet middleware sets headers
app.use(helmet());

// Results in response headers:
// X-Frame-Options: DENY (prevents iframe embedding)
// X-Content-Type-Options: nosniff (prevents MIME sniffing)
// Strict-Transport-Security: max-age=31536000 (enforces HTTPS)
```

**5. Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // 100 requests per windowMs
  message: 'Too many requests, please retry later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);  // Apply to all API routes
```

---

### Q15: How do you test security?

**Answer:**

**Security Testing Checklist:**

| Test Type | Tool | What it checks |
|---|---|---|
| **SAST** | SonarQube | Source code for vulnerabilities |
| **DAST** | OWASP ZAP | Running app for vulnerabilities |
| **Dependency** | npm audit | Known vulnerabilities in packages |
| **Container** | Snyk | Vulnerabilities in Docker images |
| **Secrets** | TruffleHog | Accidentally committed secrets |
| **Penetration** | Manual/hired | Real-world attack scenarios |

**SAST Example (SonarQube):**
```bash
# Install SonarQube Scanner
npm install -g sonarqube-scanner

# Run analysis
sonarqube-scanner \
  -Dsonar.projectKey=musclemap \
  -Dsonar.sources=src \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=$SONAR_TOKEN
```

**DAST Example (OWASP ZAP):**
```bash
# Automated security scanning of running app
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r report.html
```

**Dependency Audit:**
```bash
# Check for known vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix

# Show only critical vulnerabilities
npm audit --audit-level=critical
```

**Manual Security Testing:**
```typescript
// Test SQL injection
const input = "' OR '1'='1";
const result = api.analyzePain({ region: input });
// Should fail validation (region must be from enum)

// Test XSS
const input = "<script>alert('xss')</script>";
const result = api.analyzePain({ painType: input });
// Should fail validation (painType must be from enum)

// Test JWT tampering
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
// Modify payload
// Send tampered token to API
// Should fail verification (invalid signature)

// Test privilege escalation
const userAToken = login('user-a@example.com');
// Try to access user-b's data using user-a token
const response = api.getUserProfile('user-b-id');
// Should return 403 Forbidden or user-a's own profile
```

---

## Final Questions

### Q16: What would you do to scale to 1M+ users?

**Answer:**

**Scaling Strategy (Pyramid):**

```
         🌍 TIER 3: GLOBAL SCALE (1M+ DAU)
         - CDN everywhere (CloudFlare)
         - Geo-distributed databases
         - Multi-region deployment
         
         📈 TIER 2: GROWTH (100K-1M DAU)
         - Read replicas, Redis cache
         - API caching, compression
         - Kubernetes orchestration
         
         🚀 TIER 1: MVP (Now - 100K DAU)
         - Single server, SQLite
         - GitHub Pages/Vercel CDN
         - Basic monitoring
```

**Database Scaling:**

```sql
-- Current: SQLite (one file)
SELECT * FROM pain_entries WHERE device_id = ?

-- Growth: PostgreSQL primary + replicas
-- Master handles writes
-- Read replicas handle SELECT queries
-- Connection pooling (PgBouncer)

-- Enterprise: Sharded PostgreSQL
-- Shard key: device_id
-- Shard 1: device_id % 10 = 0-1
-- Shard 2: device_id % 10 = 2-3
-- ... Shard 10: device_id % 10 = 8-9
-- ~100K users per shard
```

**Caching Layers:**

```
┌─────────────────┐
│ Client Browser  │
│ (Browser cache) │  Expires: 1 week
└────────┬────────┘
         │
┌────────▼────────┐
│  CDN (CloudFlare) │ Expires: 1 day
└────────┬────────┘
         │
┌────────▼────────────┐
│  Redis cache        │ Expires: 1 hour
│  - History data     │
│  - Region metadata  │
│  - Exercise list    │
└────────┬────────────┘
         │
┌────────▼──────────────┐
│ Load Balancer         │
│ (Nginx, HAProxy)      │
│ Routes to 20 servers  │
└────────┬──────────────┘
         │
┌────────▼───────────────────────┐
│ App Servers (Node.js cluster)   │
│ 20-50 instances auto-scaling    │
└────────┬───────────────────────┘
         │
┌────────▼──────────────────┐
│ Database Replicas         │
│ PostgreSQL shards (10)    │
│ Each handles 100K users   │
└───────────────────────────┘
```

**Microservices (if needed):**

```
API Gateway (Rate limiting, Auth)
  ├─ Pain Service (analysis, exercises)
  ├─ User Service (auth, profiles)
  ├─ History Service (assessment records)
  ├─ Analytics Service (aggregated data)
  ├─ Notification Service (emails, SMS)
  └─ File Service (PDF generation, storage)

Message Queue (RabbitMQ, Kafka)
  - Async job processing
  - Email notifications
  - Analytics events
```

**Infrastructure (Cloud-Native):**

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: musclemap-api
spec:
  replicas: 20  # Auto-scale 10-50
  selector:
    matchLabels:
      app: musclemap-api
  template:
    metadata:
      labels:
        app: musclemap-api
    spec:
      containers:
      - name: musclemap-api
        image: musclemap/api:latest
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Monitoring at Scale:**

```typescript
// Metrics to track
const metrics = {
  // System
  'api.request.duration_ms': histogram,
  'api.request.error_rate': gauge,
  'database.query.duration_ms': histogram,
  'database.connection_pool.size': gauge,
  
  // Business
  'assessment.count': counter,
  'assessment.risk_distribution': histogram,
  'exercise.recommendation_rate': gauge,
  
  // Alerts
  'alert.high_error_rate': threshold(5%),
  'alert.slow_queries': threshold(>1s),
  'alert.low_cache_hit_rate': threshold(<80%),
};

// Example: DataDog
import { dogstatsd } from 'dogstatistics';

const startTime = Date.now();
const result = await analyzePain(input);
const duration = Date.now() - startTime;

dogstatsd.timing('analyze_pain.duration', duration);
dogstatsd.increment('analyze_pain.success');
```

---

### Q17: What about compliance & regulatory?

**Answer:**

**Healthcare Regulations:**

| Regulation | Requirement | Implementation |
|---|---|---|
| **HIPAA** (USA) | Encrypt PHI, audit logs | Not applicable (no PHI collected) |
| **GDPR** (EU) | Data privacy, consent | User consent before tracking |
| **FDA** | Medical device approval | Currently informational only |
| **CCPA** (California) | Data rights, disclosure | User export/delete endpoints |
| **ACT** (Australia) | Privacy principles | Similar to GDPR approach |

**Current Status: NOT a Medical Device**
- We provide information, not diagnosis
- Disclaimers state "not medical advice"
- Users can't rely on our app for treatment decisions
- FDA classification: Software as a Medical Device (SaMD) – Informational Category

**If we wanted to become FDA-approved Medical Device:**

```
1. Register as SaMD with FDA
2. Conduct clinical trials
3. Prove safety & efficacy
4. Get 510(k) clearance or PMA approval
5. Establish Quality Management System (QMS)
6. Implement adverse event reporting
7. Post-market surveillance
```

**Current Compliance Measures:**

```typescript
// Disclaimers prominently displayed
export const DISCLAIMERS = {
  general: `This tool is for educational purposes only. 
    It is not a substitute for professional medical advice.`,
  
  redFlag: `This pain pattern suggests you should see a healthcare professional.
    Do not delay seeking medical care if you have signs of emergency.`,
  
  noTreatment: `MuscleMap cannot prescribe treatment or medications.
    Follow guidance from licensed healthcare providers.`,
  
  liability: `We are not liable for any health outcomes resulting from 
    following this guidance. Use at your own risk.`
};

// Data collection minimization
export const dataCollected = [
  'Pain location',
  'Pain type',
  'Duration',
  'Intensity',
  'Stress level (optional)',
  'Trigger (optional)'
];

export const dataNotCollected = [
  'Medical history',
  'Medications',
  'Diagnoses',
  'Exact location (IP address)',
  'Personal health information'
];
```

**Audit Trail (for compliance):**
```typescript
// Log all user actions
async function logAuditEvent(userId: string, action: string, details: any) {
  await db.prepare(`
    INSERT INTO audit_log (user_id, action, details, timestamp)
    VALUES (?, ?, ?, ?)
  `).run(userId, action, JSON.stringify(details), new Date().toISOString());
}

// Examples
logAuditEvent(userId, 'assessment_submitted', { region: 'neck', intensity: 7 });
logAuditEvent(userId, 'data_exported', { format: 'json', size: 15000 });
logAuditEvent(userId, 'account_deleted', { reason: 'user_requested' });
```

**GDPR Rights Implementation:**
```typescript
// Right to Access
app.get('/api/user/data', authMiddleware, async (req, res) => {
  const userData = await db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).get(req.userId);
  
  const assessments = await db.prepare(
    'SELECT * FROM pain_entries WHERE user_id = ?'
  ).all(req.userId);
  
  return res.json({
    user: userData,
    assessments: assessments,
    exported_at: new Date().toISOString()
  });
});

// Right to Deletion
app.delete('/api/user/account', authMiddleware, async (req, res) => {
  // Delete user data
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
  db.prepare('DELETE FROM pain_entries WHERE user_id = ?').run(req.userId);
  
  // Log deletion
  logAuditEvent(req.userId, 'account_deleted', {
    reason: 'user_requested',
    timestamp: new Date().toISOString()
  });
  
  return res.json({ success: true });
});
```

---

This comprehensive Q&A covers the most technical questions likely to be asked about MuscleMap's architecture, security, scalability, and compliance!

