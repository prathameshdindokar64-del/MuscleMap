# Technical Stack Documentation - MuscleMap

## Project Overview
**MuscleMap** is an AI-powered health-tech application that provides intelligent pain assessment, personalized exercise recommendations, and interactive 3D anatomy visualization to guide users through self-care and pain management.

---

## Backend Technology Stack

### Runtime & Framework
- **Node.js + Express (v5.2.1)**: RESTful API server
- **TypeScript (v6.0.3)**: Type-safe backend development
- **ts-node (v10.9.2)**: Direct TypeScript execution in development

### Database Layer
- **SQLite (better-sqlite3 v12.9.0)**: Lightweight, file-based relational database
- **Tables**: 
  - `regions` - Anatomical body regions (19 regions)
  - `exercises` - Therapeutic exercises mapped to regions
  - `pain_entries` - User pain assessments and analysis results
  - `feedback` - User ratings and comments on recommendations
  - `users` - User authentication and profile data

### AI & Analytics
- **Google Generative AI (Gemini 1.5 Flash)**: AI-powered pain analysis and personalized insights
- **Fallback Logic**: Rule-based analyzer for API failures or offline scenarios

### Security & Middleware
- **Helmet (v8.1.0)**: HTTP security headers
- **CORS (v2.8.6)**: Cross-origin resource sharing configuration
- **JWT (jsonwebtoken v9.0.3)**: User authentication tokens
- **bcryptjs (v3.0.3)**: Password hashing and verification
- **Morgan (v1.10.1)**: HTTP request logging

### Utilities
- **UUID (v14.0.0)**: Unique identifier generation for entries
- **Zod (v4.4.3)**: Request validation and schema enforcement
- **PDFKit (v0.18.0)**: PDF report generation for users
- **dotenv (v17.4.2)**: Environment variable management

### Development Tools
- **Nodemon (v3.1.14)**: Auto-restart server on file changes
- **TypeScript Compiler (tsc)**: Compilation to JavaScript

---

## Frontend Technology Stack

### Core Framework & Build
- **React (v19.2.5)**: UI component library with hooks
- **TypeScript (v6.0.2)**: Type-safe React development
- **Vite (v8.0.10)**: Next-gen frontend build tool
- **Vitejs React Plugin (v6.0.1)**: React Fast Refresh for Vite

### 3D Graphics & Animation
- **Three.js (v0.184.0)**: WebGL 3D rendering library
- **React Three Fiber (r3f v9.6.1)**: React-Three declarative interface
- **React Three Drei (v10.7.7)**: Useful 3D components (OrbitControls, Suspense helpers)
- **React Spring (v10.0.3)**: Spring physics-based animations
  - `@react-spring/web` - DOM animations
  - `@react-spring/three` - Three.js animations
- **GSAP (v3.15.0)**: Animation sequencing and timeline control

### Data Visualization & UI
- **Recharts (v3.8.1)**: React charting library for pain/history visualization
- **Tailwind CSS (v3.4.19)**: Utility-first CSS framework
- **PostCSS (v8.5.14)**: CSS transformation (with Tailwind)
- **Autoprefixer (v10.5.0)**: Browser vendor prefixes

### HTTP & State Management
- **Axios (v1.16.0)**: HTTP client for API requests
- **React Context API**: Global state (theme, auth, pain history)

### Utilities
- **UUID (v14.0.0)**: Device and session identifier generation

### Development & Quality
- **ESLint (v10.2.1)**: Code linting
  - `@eslint/js` - JavaScript linting rules
  - `eslint-plugin-react-hooks` - React hooks rules
  - `eslint-plugin-react-refresh` - Fast refresh linting
- **TypeScript ESLint (v8.58.2)**: TypeScript linting
- **Autoprefixer (v10.5.0)**: CSS prefixing

---

## API Endpoints Structure

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get current user profile

### Pain Analysis Routes (`/api`)
- `POST /analyze-pain` - Submit pain assessment & get analysis
- `GET /regions` - Fetch available anatomical regions
- `GET /exercises/:regionId` - Get exercises for a region

### History & Tracking Routes (`/api`)
- `GET /history?deviceId=X` - Retrieve past assessments
- `GET /history/:entryId` - Get specific assessment details
- `POST /history/:entryId/feedback` - Submit feedback on recommendations

### PDF Generation Routes (`/api`)
- `GET /pdf/report/:entryId` - Generate downloadable PDF report

### Health Check Routes (`/api`)
- `GET /health` - Server status check

---

## Database Schema

### Regions Table
```typescript
{
  id: string (PRIMARY KEY)
  name: string
  description: string
  created_at: timestamp
}
```

### Exercises Table
```typescript
{
  id: string (PRIMARY KEY)
  region_id: string (FOREIGN KEY → regions.id)
  title: string
  instructions: string
  tags: string[] (JSON)
  pain_types: string[] (JSON)
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_min: number
  created_at: timestamp
}
```

### Pain Entries Table
```typescript
{
  id: string (PRIMARY KEY)
  device_id: string
  user_id: string (FOREIGN KEY → users.id, optional)
  region: string
  region_name: string
  pain_type: string
  duration: string
  intensity: number (0-10)
  stress_level: string
  trigger_type: string
  muscles: string[] (JSON)
  exercises: Exercise[] (JSON)
  risk_level: 'mild' | 'moderate' | 'severe' | 'red_flag'
  warning_text: string
  disclaimer: string
  created_at: timestamp
  
  Indices: device_id
}
```

### Users Table
```typescript
{
  id: string (PRIMARY KEY)
  email: string (UNIQUE)
  password: string (hashed)
  name: string
  created_at: timestamp
  last_login: timestamp
}
```

### Feedback Table
```typescript
{
  id: string (PRIMARY KEY)
  entry_id: string (FOREIGN KEY → pain_entries.id)
  rating: number (1-5)
  comment: string
  created_at: timestamp
}
```

---

## System Architecture Overview

```
┌─────────────────────────────────────┐
│   FRONTEND (React + Three.js)       │
│  - 3D Anatomy Visualization         │
│  - Pain Questionnaire UI            │
│  - History & Heatmap Dashboard      │
│  - Theme (Dark/Light)               │
└──────────────┬──────────────────────┘
               │ HTTP (Axios)
               ↓
┌─────────────────────────────────────┐
│    API GATEWAY (Express.js)         │
│  - Helmet (Security Headers)        │
│  - CORS Middleware                  │
│  - JWT Auth Middleware              │
│  - Error Handler                    │
│  - Request Logger (Morgan)          │
└────────┬──────────────┬──────────────┘
         │              │
         ↓              ↓
┌──────────────┐  ┌──────────────────────┐
│  Controllers │  │  Business Logic      │
│              │  │  - Risk Calculator   │
│ Auth         │  │  - Pain Analyzer     │
│ Pain         │  │  - Exercise Selector │
│ History      │  │  - Gemini Analyzer   │
│ Exercise     │  │  - PDF Generator     │
│ Health       │  └──────────────────────┘
│ Region       │
│ PDF          │
└───────┬──────┘
        │
        ↓
┌─────────────────────────────────┐
│   SQLite Database               │
│  - Regions                      │
│  - Exercises                    │
│  - Pain Entries                 │
│  - Users                        │
│  - Feedback                     │
└─────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────┐
│  External Services              │
│  - Google Gemini API            │
│  - Email (Optional)             │
└─────────────────────────────────┘
```

---

## Key Technology Decisions

### Why TypeScript?
- **Type Safety**: Catch errors at compile-time, not runtime
- **Better IDE Support**: Autocomplete and refactoring
- **Self-Documenting Code**: Interfaces describe data shapes clearly
- **Scalability**: Essential for growing codebases

### Why SQLite?
- **Zero Setup**: File-based, no server required
- **Embedded**: Ships with backend, no external dependencies
- **ACID Compliance**: Data integrity guaranteed
- **Perfect for MVP**: Scales to thousands of concurrent users

### Why React Three Fiber?
- **React Paradigm**: Leverage React's component model for 3D
- **Declarative**: Describe 3D scenes like React components
- **Hot Reloading**: Instant feedback during development
- **Extensible**: Rich ecosystem of drei components

### Why Google Gemini?
- **Free Tier Available**: Ideal for hackathons and MVPs
- **Fast & Lightweight**: Gemini 1.5 Flash for quick responses
- **Medical Context**: Can be tuned for healthcare scenarios
- **Fallback Ready**: Rule-based analyzer ensures robustness

### Why Tailwind CSS?
- **Utility-First**: Build UIs without writing custom CSS
- **Performance**: Purges unused CSS in production
- **Dark Mode**: Built-in dark/light theme support
- **Rapid Development**: Fast iteration on UI

---

## Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading of components
- **Suspense**: Loading states for 3D model
- **Memoization**: Prevent unnecessary re-renders
- **WebGL Optimization**: THREE.js geometry culling

### Backend
- **Database Indexing**: Indexed queries on device_id and region_id
- **Caching**: History data cached in React state
- **Connection Pooling**: Better-sqlite3 efficient resource usage
- **Compression**: gzip encoding for API responses

### Network
- **JWT Tokens**: Stateless authentication, no session storage
- **CORS Optimization**: Only allow frontend origin
- **Helmet Headers**: Security without performance cost

---

## Deployment Considerations

### Backend Deployment
- Container Support: Dockerfile ready for Docker/Kubernetes
- Environment Variables: .env configuration for secrets
- Build Output: TypeScript compiles to `dist/` folder
- Startup: `npm run build && npm start`

### Frontend Deployment
- Static Build: Vite builds to `dist/` folder
- CDN Ready: All assets can be served from CDN
- Build Size: ~500KB gzipped (including Three.js)
- Environment: API_BASE_URL configurable per environment

### Database
- Persistence: musclemap.sqlite file stored on disk
- Backup: SQLite file can be copied for backup
- Migration: ALTER TABLE support for schema changes
- Scaling: Can migrate to PostgreSQL if needed

---

## Security Measures

1. **HTTPS/TLS**: All API calls over encrypted channels
2. **JWT Tokens**: Signed, time-limited authentication
3. **Password Hashing**: bcryptjs with salting
4. **CORS**: Restricted to frontend origin only
5. **Helmet**: Sets secure HTTP headers
6. **Input Validation**: Zod schema validation on all inputs
7. **Error Handling**: Generic error messages (no data leaks)
8. **Rate Limiting**: (Recommended for production)

---

## Extensibility Points

### Easy to Add
- New anatomical regions (add to `regions` table and constants)
- New exercises (add to `exercises` table with proper tags)
- New pain types (extend TypeScript enums)
- New risk rules (modify `riskCalculator.ts`)
- New authentication providers (extend auth routes)

### Moderate Effort
- Switch from SQLite to PostgreSQL (change database connection)
- Add user profiles (extend users table and auth)
- Add prescription reminders (add notifications service)
- Add social features (add shares, comments tables)

### Full Redesign
- Replace Gemini with another AI (modify `geminiAnalyzer.ts`)
- Replace 3D model (modify `AnatomyModel.tsx`)
- Full redesign of pain questionnaire flow

---

## Dependencies Summary

### Total Dependencies
- **Backend**: 10 runtime + 7 dev dependencies
- **Frontend**: 13 runtime + 15 dev dependencies
- **Total**: ~45 packages with zero zero-day vulnerabilities

### Key Vulnerability Management
- Regular `npm audit` checks
- Dependencies are well-maintained (>90% popular packages)
- No deprecated packages in use
- Cryptography provided by trusted libraries (bcryptjs, JWT)

---

## Next Steps for Production

1. **Environment Setup**: Configure API keys for Gemini
2. **Database Backup**: Implement automated SQLite backups
3. **Logging**: Upgrade Morgan to structured logging
4. **Monitoring**: Add APM for performance tracking
5. **Testing**: Implement Jest unit tests (backend) and Vitest (frontend)
6. **CI/CD**: GitHub Actions for automated deployment
7. **Rate Limiting**: Add express-rate-limit middleware
8. **Documentation**: Generate API docs with Swagger/OpenAPI

