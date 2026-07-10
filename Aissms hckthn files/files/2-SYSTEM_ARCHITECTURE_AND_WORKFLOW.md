# System Architecture & Workflow - MuscleMap

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  REACT APPLICATION                            │  │
│  │                                                               │  │
│  │  ┌─────────────────┐    ┌──────────────────┐               │  │
│  │  │   3D Viewport   │    │  Assessment UI   │               │  │
│  │  │  (Three.js)     │◄───┤  (React)         │               │  │
│  │  │  - Anatomy      │    │  - Form          │               │  │
│  │  │  - Regions      │    │  - Results       │               │  │
│  │  │  - Heatmap      │    │  - History       │               │  │
│  │  └────────┬────────┘    └────────┬─────────┘               │  │
│  │           │                      │                           │  │
│  │           └──────────┬───────────┘                           │  │
│  │                      │                                       │  │
│  │           ┌──────────▼──────────┐                           │  │
│  │           │  Context API        │                           │  │
│  │           │  - Auth             │                           │  │
│  │           │  - Theme            │                           │  │
│  │           │  - Global State     │                           │  │
│  │           └─────────┬───────────┘                           │  │
│  │                     │                                       │  │
│  │           ┌─────────▼──────────┐                           │  │
│  │           │  API Layer (Axios) │                           │  │
│  │           │  - painApi.ts      │                           │  │
│  │           │  - authApi.ts      │                           │  │
│  │           └─────────┬──────────┘                           │  │
│  └────────────────────┼──────────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────────┘
                      │
        HTTPS/REST    │
        JSON          │
                      │
┌─────────────────────▼──────────────────────────────────────────┐
│                    EXPRESS.JS SERVER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MIDDLEWARE STACK (executed in order)                    │  │
│  │  1. Helmet (Security Headers)                            │  │
│  │  2. CORS (Origin Validation)                             │  │
│  │  3. JSON Body Parser                                     │  │
│  │  4. Morgan (Request Logging)                             │  │
│  │  5. JWT Auth Middleware (if needed)                      │  │
│  │  6. Request Validation (Zod)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│           ┌───────────────┼───────────────┐                      │
│           │               │               │                      │
│   ┌───────▼──────┐  ┌────▼────┐  ┌──────▼──────┐               │
│   │ Auth Routes  │  │ Pain     │  │ History     │               │
│   │              │  │ Routes   │  │ Routes      │               │
│   │ - register   │  │          │  │             │               │
│   │ - login      │  │ - analyze│  │ - get       │               │
│   │ - logout     │  │ - regions│  │ - feedback  │               │
│   │ - profile    │  │          │  │             │               │
│   └───────┬──────┘  └────┬─────┘  └──────┬──────┘               │
│           │              │               │                      │
│           └──────────────┼───────────────┘                      │
│                          │                                      │
│           ┌──────────────▼──────────────┐                       │
│           │    CONTROLLER LAYER         │                       │
│           │  - Auth Controller          │                       │
│           │  - Pain Controller          │                       │
│           │  - History Controller       │                       │
│           │  - Exercise Controller      │                       │
│           │  - Health Controller        │                       │
│           │  - PDF Controller           │                       │
│           └──────────────┬──────────────┘                       │
│                          │                                      │
│           ┌──────────────▼──────────────┐                       │
│           │   BUSINESS LOGIC LAYER      │                       │
│           │  ┌────────────────────────┐ │                       │
│           │  │ Pain Analyzer          │ │                       │
│           │  │ - Gemini Integration   │ │                       │
│           │  │ - Rule-based Fallback  │ │                       │
│           │  └────────────┬───────────┘ │                       │
│           │  ┌────────────▼───────────┐ │                       │
│           │  │ Risk Calculator        │ │                       │
│           │  │ - Intensity Rules      │ │                       │
│           │  │ - Duration Mapping     │ │                       │
│           │  │ - Red Flag Detection   │ │                       │
│           │  └────────────┬───────────┘ │                       │
│           │  ┌────────────▼───────────┐ │                       │
│           │  │ Exercise Selector      │ │                       │
│           │  │ - Pain Type Matching   │ │                       │
│           │  │ - Region-based Filter  │ │                       │
│           │  └────────────┬───────────┘ │                       │
│           │  ┌────────────▼───────────┐ │                       │
│           │  │ PDF Generator          │ │                       │
│           │  │ - Report Creation      │ │                       │
│           │  │ - Download Ready       │ │                       │
│           │  └────────────────────────┘ │                       │
│           └──────────────┬──────────────┘                       │
│                          │                                      │
│           ┌──────────────▼──────────────┐                       │
│           │     DATA ACCESS LAYER       │                       │
│           │  - Prepared Statements      │                       │
│           │  - Connection Pooling       │                       │
│           │  - Query Caching            │                       │
│           └──────────────┬──────────────┘                       │
└───────────────────────────┼──────────────────────────────────────┘
                            │
        SQLite Protocol      │
        Binary Data          │
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                    SQLite DATABASE                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐             │   │
│  │  │Regions  │  │Exercises │  │Pain Entries │             │   │
│  │  │         │  │          │  │             │             │   │
│  │  │- ID     │  │- ID      │  │- ID         │             │   │
│  │  │- Name   │  │- Title   │  │- Device ID  │  ...more... │   │
│  │  │- Desc   │  │- Tags    │  │- Region     │             │   │
│  │  └─────────┘  │- Pain    │  │- Type       │             │   │
│  │               │  Types   │  │- Intensity  │             │   │
│  │               │- Instr.  │  │- Risk Level │             │   │
│  │               └──────────┘  │- Timestamp  │             │   │
│  │                             └─────────────┘             │   │
│  │                                                         │   │
│  │  Indices:                                              │   │
│  │  - pain_entries.device_id                              │   │
│  │  - exercises.region_id                                 │   │
│  │  - pain_entries.created_at                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  File: musclemap.sqlite (persistent storage)                   │
└────────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        │                                       │
   ┌────▼────────┐                    ┌────────▼───┐
   │ Google      │                    │ File System │
   │ Generative  │                    │             │
   │ AI (Gemini) │                    │ - Logs      │
   │             │                    │ - PDFs      │
   │ - Free Tier │                    │ - Database  │
   │ - Fallback  │                    │   Backups   │
   └─────────────┘                    └─────────────┘
```

---

## User Journey & Workflow

### 1. User Onboarding Flow

```
┌──────────────────┐
│  Load Website    │
└────────┬─────────┘
         │
         ▼
   ┌─────────────────────┐
   │ Check Device ID in  │
   │ LocalStorage        │
   └─────┬───────────┬───┘
         │           │
         │ Found     │ Not Found
         │           │
         ▼           ▼
   ┌──────────┐   ┌──────────────────┐
   │ Use ID   │   │ Generate UUID    │
   │ for Auth │   │ Store in Storage │
   └────┬─────┘   └────────┬─────────┘
        │                  │
        └────────┬─────────┘
                 │
                 ▼
       ┌─────────────────────┐
       │ Theme Context Init  │
       │ (Dark/Light)        │
       └────────┬────────────┘
                │
                ▼
       ┌─────────────────────┐
       │ Load 3D Body Model  │
       │ (Three.js + Suspense)
       └────────┬────────────┘
                │
                ▼
      ┌─────────────────────┐
      │ Fetch History Data  │
      │ for Heatmap         │
      └────────┬────────────┘
                │
                ▼
     ┌───────────────────────┐
     │ App Ready - Hero      │
     │ Section Visible       │
     └───────────────────────┘
```

### 2. Pain Assessment Flow

```
┌────────────────────────────┐
│ User Selects 3D Region     │
│ (Click on Body Part)       │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ Assessment Panel Opens     │
│ - Region Name Displayed    │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ User Fills Questionnaire   │
│ - Pain Type Selection      │
│ - Duration Selection       │
│ - Intensity Slider (0-10)  │
│ - Stress Level (optional)  │
│ - Trigger (optional)       │
└────────────┬───────────────┘
             │
             ▼
     ┌─────────────────┐
     │ Form Validation │
     │ (Zod Schema)    │
     └────────┬────────┘
              │
      ┌───────┴───────┐
      │               │
      │ Valid         │ Invalid
      │               │
      ▼               ▼
   ┌───┐      ┌──────────┐
   │✓  │      │Show Error│
   └─┬─┘      │Messages  │
     │        └──────────┘
     │               │
     └───────┬───────┘
             │
             ▼
┌────────────────────────────┐
│ POST /api/analyze-pain     │
│ (Send to Backend)          │
│ - Device ID                │
│ - Region                   │
│ - Pain Type                │
│ - Duration, Intensity, ... │
└────────────┬───────────────┘
             │
             ▼ (on backend)
┌────────────────────────────┐
│ 1. Validate Region Exists  │
│    in Database             │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ 2. Call Risk Calculator    │
│ - Check Red Flags          │
│ - Determine Risk Level:    │
│   * red_flag               │
│   * severe                 │
│   * moderate               │
│   * mild                   │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ 3. Call Pain Analyzer      │
│ (Try Gemini First)         │
│ - Build AI Prompt          │
│ - Send to Google Gemini    │
│ - Parse JSON Response      │
│ - Get Personalized Insight │
│ - Get Recovery Tips        │
│ - Get Exercise Suggestions │
│ (If Gemini fails, use      │
│  Rule-based Fallback)      │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ 4. Fetch Acupressure Points│
│ - Get points for region    │
│ - Map to 3D coordinates    │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ 5. Save to Database        │
│ INSERT pain_entries        │
│ - All user inputs          │
│ - AI results               │
│ - Risk level               │
│ - Timestamp                │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ 6. Return Analysis Results │
│ to Frontend                │
│ (JSON Response)            │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ FRONTEND: Receive Results  │
│ - Store in State           │
│ - Update Assessment Result │
│ - Highlight Region on 3D   │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ Display Results Panel      │
│ - Region Name              │
│ - Affected Muscles List    │
│ - AI Insight               │
│ - Recommended Exercises    │
│ - Risk Level Badge         │
│ - Warning Text             │
│ - Disclaimer               │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ User Can:                  │
│ - View Exercises Detail    │
│ - Scroll to History        │
│ - See Acupressure Points   │
│ - Download PDF Report      │
│ - Assess Another Region    │
└────────────────────────────┘
```

### 3. History & Heatmap Flow

```
┌─────────────────────────────┐
│ On App Load or Interval     │
│ getHistory(deviceId)        │
└──────────────┬──────────────┘
               │
               ▼
   ┌───────────────────────────┐
   │ GET /api/history          │
   │ ?deviceId=<uuid>          │
   │ ?limit=10                 │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ Query pain_entries Table  │
   │ WHERE device_id = ?       │
   │ ORDER BY created_at DESC  │
   │ LIMIT 10                  │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ Format Results as Array   │
   │ ┌────────────────────┐    │
   │ │ id, timestamp,     │    │
   │ │ region, intensity, │    │
   │ │ riskLevel, result  │    │
   │ └────────────────────┘    │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ FRONTEND: Process Entries │
   │ - Count by region         │
   │ - Store in State          │
   │ - Pass to Heatmap         │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ Update 3D Heatmap Colors  │
   │ - More clicks = Warmer    │
   │ - Intensity-based coloring│
   │ - Real-time updates       │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ Display History Accordion │
   │ - Latest entries first    │
   │ - Show region, date, risk │
   │ - Click to expand detail  │
   └───────────────────────────┘
```

### 4. PDF Report Generation Flow

```
┌─────────────────────────────┐
│ User Clicks "Download PDF"  │
└──────────────┬──────────────┘
               │
               ▼
   ┌───────────────────────────┐
   │ GET /api/pdf/report       │
   │ /:entryId                 │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ Fetch pain_entries Record │
   │ WHERE id = entryId        │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ Create PDF Document       │
   │ (PDFKit)                  │
   │ - Title                   │
   │ - Assessment Details      │
   │ - Results Summary         │
   │ - Exercises               │
   │ - Warnings                │
   │ - Timestamp               │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ Stream PDF to Browser     │
   │ Content-Type:             │
   │ application/pdf           │
   └──────────────┬────────────┘
                  │
                  ▼
   ┌───────────────────────────┐
   │ Browser Downloads PDF     │
   │ Filename:                 │
   │ musclemap_report_[date]   │
   └───────────────────────────┘
```

---

## Data Flow Diagram

### Pain Assessment Data Flow

```
                    USER INPUT
                        │
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
   ┌─────────────┐              ┌─────────────────┐
   │ Region      │              │ Questionnaire   │
   │ Selection   │              │ Inputs          │
   │ (3D Click)  │              │ - Pain Type     │
   └────┬────────┘              │ - Duration      │
        │                       │ - Intensity     │
        │                       │ - Stress Level  │
        │                       │ - Trigger       │
        └──────┬────────────────┘
               │
               ▼
        ┌─────────────────┐
        │ Frontend Form   │
        │ Validation      │
        │ (Zod)           │
        └────┬────────────┘
             │
             ▼
        ┌─────────────────────────┐
        │ HTTP POST Request       │
        │ /api/analyze-pain       │
        │ (Axios)                 │
        └────┬────────────────────┘
             │
             ▼ (Network)
        
        ┌─────────────────────────┐
        │ Backend Controllers     │
        │ (painController)        │
        └────┬────────────────────┘
             │
      ┌──────┴──────────────────┐
      │                         │
      ▼                         ▼
  ┌──────────┐      ┌──────────────────┐
  │Validate  │      │ Risk Calculator  │
  │Region    │      │ (Intensity,      │
  │          │      │ Duration, Type)  │
  └────┬─────┘      │                  │
       │            └────┬─────────────┘
       │                 │
       │            ┌────▼────────────────┐
       │            │ Risk Level Assigned │
       │            │ - mild              │
       │            │ - moderate          │
       │            │ - severe            │
       │            │ - red_flag          │
       │            └────┬────────────────┘
       │                 │
       └────┬────────────┘
            │
            ▼
       ┌─────────────────────────┐
       │ Pain Analyzer           │
       │ (geminiAnalyzer)        │
       │                         │
       │ ┌────────────────────┐  │
       │ │Try Gemini API      │  │
       │ │ - Build Prompt     │  │
       │ │ - Get AI Response  │  │
       │ │ - Parse JSON       │  │
       │ └────┬───────────────┘  │
       │      │                  │
       │      ├─Success─┐   ┌─Failure─┐
       │      │         │   │         │
       │      ▼         ▼   ▼         │
       │  ┌──────┐  ┌──────────────┐  │
       │  │Use   │  │Fall back to  │  │
       │  │Gemini│  │Rule-based    │  │
       │  │Output│  │Analyzer      │  │
       │  └─┬────┘  └─┬────────────┘  │
       │    │        │                │
       └────┼────────┼────────────────┘
            │        │
            └────┬───┘
                 │
                 ▼
        ┌────────────────────┐
        │ Exercise Selector  │
        │ - Match pain type  │
        │ - Filter region    │
        │ - Get 2-3 best     │
        └────┬───────────────┘
             │
             ▼
        ┌────────────────────┐
        │ Fetch Acupressure  │
        │ Points for Region  │
        │ (from constants)   │
        └────┬───────────────┘
             │
             ▼
        ┌────────────────────┐
        │ Get Warning Text   │
        │ for Risk Level     │
        └────┬───────────────┘
             │
             ▼
        ┌────────────────────┐
        │ Build Response:    │
        │ ┌────────────────┐ │
        │ │regionName      │ │
        │ │muscles[]       │ │
        │ │exercises[]     │ │
        │ │aiInsight       │ │
        │ │recoveryTips[]  │ │
        │ │riskLevel       │ │
        │ │warningText     │ │
        │ │acupressure[]   │ │
        │ │disclaimerText  │ │
        │ │generatedBy     │ │
        │ └────────────────┘ │
        └────┬───────────────┘
             │
             ▼
        ┌────────────────────┐
        │ INSERT pain_entries│
        │ to Database        │
        └────┬───────────────┘
             │
             ▼
        ┌────────────────────┐
        │ Send JSON Response │
        │ to Frontend        │
        └────┬───────────────┘
             │
             ▼ (Network)
        
        ┌─────────────────────────┐
        │ Frontend Receives Data  │
        │ (Axios Response)        │
        └────┬────────────────────┘
             │
             ▼
        ┌─────────────────────────┐
        │ Update React State      │
        │ - setAssessmentResult   │
        │ - setSelectedRegion     │
        └────┬────────────────────┘
             │
             ▼
        ┌─────────────────────────┐
        │ Trigger Re-render       │
        │ (Results Panel          │
        │ becomes visible)        │
        └────┬────────────────────┘
             │
             ▼
        ┌─────────────────────────┐
        │ 3D Model Updates        │
        │ - Highlight Region      │
        │ - Show Points Markers   │
        │ - Animate Ripple        │
        └────┬────────────────────┘
             │
             ▼
        ┌─────────────────────────┐
        │ Display to User         │
        │ - Results Panel         │
        │ - Risk Badge            │
        │ - Warnings              │
        │ - Exercise List         │
        │ - Download PDF Button   │
        └─────────────────────────┘
```

---

## Key Workflow Features

### 1. Rule-Based Risk Calculation
- Evaluates intensity threshold
- Duration-based mapping
- Pain type patterns
- Regional red flags
- Stress level modifiers
- Returns: mild | moderate | severe | red_flag

### 2. AI-Powered Analysis (Gemini)
- Builds contextual prompt with user inputs
- Sends to Google Generative AI API
- Expects structured JSON response
- Generates personalized exercises
- Creates medical-safe insights
- Provides recovery tips

### 3. Graceful Fallback
- If Gemini API unavailable: uses rule-based analyzer
- If database error: returns generic message
- If validation fails: returns 400 error
- If region not found: returns 404 error
- All errors logged via Morgan

### 4. Device-Based Tracking
- No authentication required for basic features
- Device ID generated and stored in localStorage
- Enables history tracking across sessions
- Optional user accounts for advanced features
- All entries linked to device/user

### 5. 3D Visualization Layer
- Interactive Three.js body model
- 19 anatomical regions (selectable)
- Region-based highlighting on assessment
- Heat map coloring based on history
- Acupressure point markers
- Smooth animations and transitions

---

## Security & Validation Flow

```
┌────────────────────┐
│ User Request       │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Helmet Middleware  │
│ (Security Headers) │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ CORS Check         │
│ (Validate Origin)  │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ JSON Body Parser   │
│ (Limit: 10mb)      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Morgan Logger      │
│ (Log Request)      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ JWT Auth Check     │
│ (if endpoint needs │
│ authentication)    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Zod Schema         │
│ Validation         │
└────────┬───────────┘
         │
      ┌──┴──┐
      │     │
   Valid  Invalid
      │     │
      ▼     ▼
  ┌────┐ ┌──────────┐
  │✓   │ │400 Error │
  └─┬──┘ │Return    │
    │    └──────────┘
    │
    ▼
┌────────────────────┐
│ Database Query     │
│ (Prepared Stmt)    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Error Handler      │
│ Middleware         │
│ (Generic messages) │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ JSON Response      │
└────────────────────┘
```

---

## Performance Considerations

### Caching Strategy
- **Frontend**: React Context for global state
- **Backend**: Prepared SQL statements (cached by better-sqlite3)
- **3D Model**: Lazy-loaded via React Suspense

### Query Optimization
- Indexes on `device_id` for history lookups
- Indexes on `region_id` for exercise retrieval
- LIMIT clauses to prevent large result sets

### Network Optimization
- Gzip compression on responses
- JSON parsing happens once
- Image and 3D assets served from public folder

### Database Optimization
- WAL (Write-Ahead Logging) for SQLite
- Prepared statements prevent SQL injection
- Connection pooling in production

---

## Error Handling Strategy

1. **Validation Errors**: 400 Bad Request (Zod validation fails)
2. **Not Found Errors**: 404 Not Found (region/entry doesn't exist)
3. **Authentication Errors**: 401 Unauthorized (invalid token)
4. **Server Errors**: 500 Internal Server Error (logged, generic message to user)
5. **Timeout**: Gemini API failure → fallback to rule-based
6. **CORS Errors**: 403 Forbidden (origin not allowed)

All errors are logged via Morgan middleware for debugging.

