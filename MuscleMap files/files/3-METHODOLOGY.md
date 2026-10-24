# Methodology Document - MuscleMap

## Project Development Methodology

### 1. Agile Development Approach

MuscleMap follows an **iterative, sprint-based development** model with continuous feedback and refinement.

#### Sprint Structure
- **Duration**: 2-week sprints
- **Daily Standups**: Progress tracking and blocker identification
- **Code Reviews**: Peer review before merge to main branch
- **Testing**: Unit tests and manual QA after each sprint

---

## 2. Research-Driven Design

### Domain Research
The application is built on:
- **Sports Medicine Principles**: Exercise science and physiotherapy
- **Anatomical Accuracy**: 19 core body regions with precise muscle mappings
- **Pain Classification**: Validated pain type categories (dull, sharp, stiffness, burning, numbness)
- **Risk Assessment Framework**: Evidence-based risk stratification

### Data Sources
- Anatomical databases (muscle groups, nerve distributions)
- Clinical pain assessment standards (VAS, pain typology)
- Exercise physiology research (safe, effective home exercises)
- Acupressure/TCM principles (point locations, techniques)

---

## 3. Technology Selection Methodology

### Backend Technology Decisions

#### Express.js
- **Rationale**: Lightweight, widely-used Node.js framework
- **Advantages**: Large ecosystem, excellent middleware support, good for REST APIs
- **Alternative Considered**: Fastify (faster but less mature)

#### TypeScript
- **Rationale**: Type safety reduces bugs and improves maintainability
- **Advantages**: Self-documenting code, IDE autocomplete, catch errors early
- **Alternative Considered**: JavaScript (faster development, less safe)

#### SQLite
- **Rationale**: Zero-setup relational database with ACID compliance
- **Advantages**: No external server needed, simple deployment, sufficient for MVP
- **Scaling Path**: Can migrate to PostgreSQL without code changes
- **Alternative Considered**: MongoDB (NoSQL, but overkill for structured health data)

#### Google Gemini API
- **Rationale**: Free tier available, suitable for healthcare context, fast responses
- **Advantages**: Easy integration, no setup required, graceful fallback available
- **Alternative Considered**: OpenAI GPT-4, Anthropic Claude (paid, slower)

#### Helmet & CORS
- **Rationale**: Security is paramount in healthcare applications
- **Advantages**: Prevent XSS, CSRF, clickjacking attacks
- **Standard**: Follows OWASP security guidelines

### Frontend Technology Decisions

#### React + Vite
- **Rationale**: Fast development with hot reload, modern build optimization
- **Advantages**: React ecosystem maturity, component reusability, fast HMR
- **Alternative Considered**: Vue (simpler learning curve) or Svelte (smaller bundle)

#### Three.js + React Three Fiber
- **Rationale**: Interactive 3D anatomy visualization needed
- **Advantages**: Declarative component model for 3D, active community, excellent documentation
- **Alternative Considered**: Babylon.js (more features, steeper learning curve)

#### Tailwind CSS
- **Rationale**: Rapid UI development with utility-first approach
- **Advantages**: Consistent design, easy dark mode, small production bundle
- **Alternative Considered**: CSS Modules (more control, slower development)

#### Recharts
- **Rationale**: Simple data visualization for pain history trends
- **Advantages**: React-native, responsive, composable components
- **Alternative Considered**: D3.js (more powerful, steeper learning curve)

---

## 4. Architecture Design Principles

### MVC Pattern
```
Model (Database) ← Data Layer
     ↓
Controller (Business Logic) ← Processing Layer
     ↓
View (Components) ← Presentation Layer
```

### Separation of Concerns
- **Routes**: Define HTTP endpoints only
- **Controllers**: Handle request/response, orchestrate logic
- **Logic**: Pure functions for analysis, calculation, recommendations
- **Database**: Abstracted data access with prepared statements
- **UI Components**: Presentational logic only, state management via Context

### SOLID Principles
- **Single Responsibility**: Each function does one thing
- **Open/Closed**: Easy to extend (new regions, exercises, pain types)
- **Liskov Substitution**: Gemini and rule-based analyzers are interchangeable
- **Interface Segregation**: Minimal dependencies between modules
- **Dependency Inversion**: Depends on abstractions (AnalyzeOutput interface), not concrete implementations

### Extensibility Points (Designed In)
1. **New Regions**: Add to `constants/regions.ts`, create exercises in DB
2. **New AI Provider**: Replace `geminiAnalyzer.ts`, keep same output interface
3. **New Risk Rules**: Modify `riskCalculator.ts` logic
4. **New Data Source**: Add to database schema, create migration

---

## 5. Design Patterns Used

### Factory Pattern
- **Exercise Selection**: `selectExercises()` creates exercise recommendations based on inputs
- **Risk Calculation**: Different risk levels created based on input rules

### Strategy Pattern
- **Pain Analysis**: `analyzePain()` interface with Gemini or rule-based implementations
- **Risk Calculation**: Different strategies for different pain profiles

### Observer Pattern
- **React Context**: Auth and Theme states auto-notify all subscribed components

### Decorator Pattern
- **Middleware**: Helmet, CORS, Morgan wrap the core Express logic with security/logging

### Template Method Pattern
- **API Error Handling**: Generic error handler catches all exceptions, returns consistent format

---

## 6. Database Design Methodology

### Normalization
- **1NF**: All columns contain atomic values (no nested objects in columns, use JSON when needed)
- **2NF**: All non-key attributes depend on primary key (no partial dependencies)
- **3NF**: No transitive dependencies (regions, exercises are independent)

### Denormalization Decision
- **pain_entries** table stores denormalized data (region_name, muscles as JSON)
- **Rationale**: Faster queries, historical preservation (if region name changes), query optimization
- **Trade-off**: Slight data duplication for significant performance gain

### Indexing Strategy
```sql
-- Index on foreign key for history queries
CREATE INDEX idx_pain_entries_device_id ON pain_entries(device_id);

-- Index on region for exercise queries
CREATE INDEX idx_exercises_region_id ON exercises(region_id);
```

### Scalability Considerations
- **Current**: SQLite handles ~10K concurrent requests
- **Future**: Migrate to PostgreSQL for multi-server deployment
- **Sharding**: Can shard by device_id if needed

---

## 7. API Design Principles

### RESTful Design
```
POST /api/analyze-pain       # Create new assessment
GET  /api/history            # Read past assessments
GET  /api/regions            # Read available regions
POST /api/history/:id/feedback  # Create feedback
```

### Stateless Design
- **No server-side sessions**: Uses JWT tokens, device ID
- **Advantage**: Horizontal scaling possible
- **Security**: JWTs signed and time-limited

### Versioning Strategy
- **Current**: v1 (implicit in /api)
- **Future**: Support /api/v2 for backward compatibility
- **Deprecation**: Would notify clients before removing v1

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE_ENUM",
  "timestamp": "ISO8601"
}
```

---

## 8. Security Methodology

### OWASP Top 10 Mitigation

| Vulnerability | Mitigation |
|---|---|
| Injection | Prepared SQL statements, Zod validation |
| Broken Auth | JWT tokens, bcryptjs hashing, password validation |
| Sensitive Data | HTTPS enforced, no logs of sensitive data |
| XML/XXE | Not applicable (using JSON) |
| Broken Access Control | User ID on resources, device ID validation |
| Security Misconfiguration | Helmet, CORS, environment variables for secrets |
| XSS | React escaping, Content-Security-Policy headers |
| Insecure Deserialization | Zod schema validation before use |
| Using Components with Known Vulns | Regular npm audit, dependencies kept updated |
| Insufficient Logging | Morgan middleware logs all requests |

### Authentication Flow
```
1. User Register: POST /api/auth/register
   - Validate email format
   - Hash password with bcryptjs (12 rounds)
   - Store in users table
   
2. User Login: POST /api/auth/login
   - Verify email exists
   - Compare password hash
   - Create JWT token (expires in 24h)
   - Return token to client
   
3. Protected Request:
   - Client includes token in Authorization header
   - Middleware verifies JWT signature
   - Extracts userId, attach to request object
   - Allow/deny based on userId
```

### Data Privacy
- **No PII Logging**: Logs don't contain emails or passwords
- **Device-based Anonymity**: Can assess pain without creating account
- **Encryption Ready**: HTTPS enforced in production
- **GDPR Ready**: User data can be exported, deleted via API (to implement)

---

## 9. Testing Methodology

### Test Pyramid Strategy
```
        /\
       /E2E\         (5-10 tests)
      /─────\        Selenium, Cypress
     /  API  \       (20-30 tests)
    /─────────\      Jest, Supertest
   / Unit     \      (50-100 tests)
  /─────────────\    Jest
 /               \
```

### Unit Testing (Backend)
- Test each function in isolation
- Mock database for speed
- Test happy path and error cases
- Example: `riskCalculator.test.ts`

### Integration Testing (Backend)
- Test API endpoints with real database
- Verify request/response contracts
- Check error handling
- Example: `POST /analyze-pain` flow

### Component Testing (Frontend)
- Render components in isolation
- Mock API calls
- Test user interactions
- Example: `AssessmentPanel.test.tsx`

### E2E Testing
- Run in real environment
- User perspective testing
- Complete workflows
- Example: User fills form → Submit → See results

### QA Checklist
- [ ] Form validation working (empty, invalid values)
- [ ] Error messages clear and helpful
- [ ] 3D model loads without lag
- [ ] Assessment results accurate
- [ ] History persists across sessions
- [ ] PDF downloads correctly
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility (keyboard, screen reader)
- [ ] Performance (< 3s load time)

---

## 10. Documentation Methodology

### Code Documentation
- **JSDoc Comments**: Function purpose, parameters, return type
- **Inline Comments**: Complex logic explained
- **README**: Setup, running, deployment instructions
- **API Docs**: Swagger/OpenAPI (to implement)

### User Documentation
- **Help Section**: Common pain questions
- **FAQ**: Disclaimers, medical limitations
- **Accessibility Guide**: Keyboard shortcuts, screen reader support

### Technical Documentation
- **Architecture Diagrams**: System design, data flow
- **Sequence Diagrams**: User flows, API interactions
- **ER Diagrams**: Database schema relationships

---

## 11. Version Control Strategy

### Git Workflow: Feature Branch
```
main (production)
  ↑
  └── develop (staging)
      ↑
      └── feature/pain-analyzer
      └── feature/3d-model
      └── bugfix/layout-issue
      └── hotfix/critical-security
```

### Commit Message Convention
```
[TYPE] [SCOPE]: [SUBJECT]

Types: feat, fix, docs, style, refactor, test, chore
Scope: auth, pain, exercise, database, frontend, backend
Example: feat(pain): add Gemini AI analysis integration
```

### Code Review Checklist
- [ ] Follows project style guide
- [ ] No hardcoded values or secrets
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Performance impact analyzed
- [ ] Security implications reviewed
- [ ] Backwards compatible

---

## 12. Continuous Integration/Deployment (CI/CD)

### Automated Checks
1. **Linting**: ESLint, TypeScript strict mode
2. **Testing**: Jest unit tests, 80% coverage target
3. **Build**: tsc compilation, Vite optimization
4. **Security**: `npm audit` for vulnerabilities
5. **Coverage**: Report and enforce minimums

### Deployment Pipeline
```
┌─ Push to GitHub
├─ GitHub Actions CI
│  ├─ Lint
│  ├─ Test
│  ├─ Build
│  └─ Security Audit
├─ Deploy to Staging (on develop)
├─ Manual QA
└─ Deploy to Production (on main)
```

---

## 13. Performance Optimization Strategy

### Frontend Performance
- **Lazy Loading**: 3D model loaded via React Suspense
- **Code Splitting**: Separate bundles for core app and 3D components
- **Memoization**: `useMemo`, `useCallback` for expensive computations
- **Image Optimization**: WebP format, responsive sizing

### Backend Performance
- **Query Optimization**: Indexes, LIMIT clauses, prepared statements
- **Caching**: Browser caching with Cache-Control headers
- **Compression**: gzip on all responses
- **Monitoring**: Response time metrics logged

### Metrics to Track
- **Frontend**: Time to Interactive (TTI), Cumulative Layout Shift (CLS)
- **Backend**: API response time, error rate, database query time
- **Database**: Query execution time, index usage

---

## 14. Release Management

### Semantic Versioning
```
MAJOR.MINOR.PATCH
1.0.0
├─ MAJOR: Breaking changes (major features, API changes)
├─ MINOR: New features (backward compatible)
└─ PATCH: Bug fixes (backward compatible)
```

### Release Process
1. Create release branch from develop
2. Update version in package.json
3. Update CHANGELOG.md
4. Tag commit with version
5. Push to main, create GitHub Release
6. Deploy to production
7. Monitor error rates and performance

### Rollback Plan
- Keep previous version deployed on standby
- Database migrations are reversible
- Git tags enable quick version revert

---

## 15. Monitoring & Analytics

### Logging Strategy
- **Request Logs**: Morgan (method, path, status, response time)
- **Error Logs**: Full stack traces, user context, timestamp
- **Audit Logs**: Auth events (login, registration, token generation)

### Metrics to Track
- **Availability**: Uptime %, error rate
- **Performance**: API response time, 3D model load time
- **Usage**: Assessment count, region popularity, pain type distribution
- **Errors**: 404s, 500s, API failures

### Alerting
- Error rate > 5% → Alert engineering
- Response time > 5s → Alert performance team
- Failed Gemini API calls > 10% → Check quota

---

## 16. Accessibility Methodology

### WCAG 2.1 Compliance (AA Level)
- **Keyboard Navigation**: All UI interactive via keyboard
- **Color Contrast**: 4.5:1 ratio for normal text
- **Screen Readers**: Semantic HTML, ARIA labels
- **Focus Management**: Visible focus indicators

### Testing
- Manual testing with screen readers (NVDA, JAWS)
- Browser accessibility inspection tools
- Automated testing (axe, Lighthouse)

---

## 17. User Research & Feedback

### User Testing
- **Validation**: Confirm pain classification is intuitive
- **Usability**: Test form completion time and error rates
- **Accessibility**: Test with users of different abilities
- **Feedback**: Collect ratings and comments

### A/B Testing (Future)
- Test different exercise recommendation strategies
- Measure engagement, completion rate
- Iterate based on data

---

## 18. Regulatory & Compliance

### Medical/Healthcare Compliance
- **Disclaimers**: Clear communication of limitations
- **Data Privacy**: No diagnosis, never replace doctor
- **FDA Status**: Currently informational app (not medical device)
- **HIPAA Ready**: Can implement BAA for healthcare organizations

### Legal Considerations
- **Terms of Service**: Users acknowledge this is not medical advice
- **Privacy Policy**: Explain data collection, storage, usage
- **Liability Waiver**: Users assume responsibility for their health
- **Accessibility**: Comply with ADA requirements

