# Carbon Footprint Tracker - Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Firestore Data Model](#firestore-data-model)
6. [API Design](#api-design)
7. [Authentication & Security](#authentication--security)
8. [Deployment Architecture](#deployment-architecture)
9. [Scalability Considerations](#scalability-considerations)

---

## Overview

The Carbon Footprint Tracker is a web application that helps users track and reduce their carbon emissions through:

- **Baseline Assessment**: Initial carbon footprint quiz
- **Activity Logging**: Daily tracking of transport, food, energy, and shopping activities
- **Dashboard Analytics**: Visual representation of carbon footprint trends
- **Personalized Tips**: Rule-based recommendations for reducing emissions

**Key Constraints:**
- Must run entirely on Google Cloud's Always Free tier
- Firebase Spark (free) plan only
- No paid APIs or third-party integrations
- No ML services

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                              │
│                  (Static React App)                              │
└────────────┬────────────────────────────────────┬────────────────┘
             │                                    │
             │ Firebase SDK                       │ REST API
             │                                    │
             ▼                                    ▼
┌────────────────────────┐          ┌────────────────────────────┐
│  Firebase Auth         │          │   Cloud Run                │
│  (Authentication)      │◄─────────│   (Express Backend)        │
└────────────────────────┘  Verify  └────────────┬───────────────┘
             │                Token               │
             │                                    │
             │                                    │
             ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firestore (Native Mode)                       │
│  Collections: users, activities, quizResponses, carbonScores,   │
│               tips                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Frontend (React + Vite)
- **Hosting**: Firebase Hosting (free tier)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React hooks + Context API
- **Routing**: React Router

#### Backend (Node.js + Express)
- **Hosting**: Cloud Run (Always Free tier: 2M requests/month)
- **Runtime**: Node.js 18+
- **Framework**: Express with TypeScript
- **Authentication**: Firebase Admin SDK
- **Database**: Firestore via Admin SDK

#### Shared Package
- **Purpose**: Type definitions and interfaces shared between frontend and backend
- **Structure**: npm workspace package (`@cft/shared`)

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI framework |
| TypeScript | 5.4+ | Type safety |
| Vite | 5.1+ | Build tool & dev server |
| Tailwind CSS | 3.4+ | Styling |
| Recharts | 2.12+ | Data visualization |
| Firebase SDK | 10.8+ | Auth & Firestore client |
| React Router | 6.22+ | Client-side routing |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.18+ | Web framework |
| TypeScript | 5.4+ | Type safety |
| Firebase Admin | 12.0+ | Server-side Firebase |
| Helmet | 7.1+ | Security headers |
| CORS | 2.8+ | Cross-origin requests |

### Development Tools

| Tool | Purpose |
|------|---------|
| npm workspaces | Monorepo management |
| ESLint | Code linting |
| Prettier | Code formatting |
| tsx | TypeScript execution |

---

## Data Flow

### 1. User Authentication Flow

```
User → Firebase Auth (Sign In/Up)
     → Frontend receives ID token
     → Token stored in memory
     → Token sent with API requests
     → Backend verifies token with Firebase Admin SDK
     → Request processed
```

### 2. Quiz Submission Flow

```
User completes quiz
     → Frontend sends responses to backend API
     → Backend calculates baseline carbon score
     → Backend stores quiz response in Firestore
     → Backend creates initial user profile
     → Backend returns calculated score
     → Frontend displays results
```

### 3. Activity Logging Flow

```
User logs activity
     → Frontend sends activity data to backend API
     → Backend calculates CO2 impact
     → Backend stores activity in Firestore
     → Backend updates user's carbon score
     → Backend returns activity with CO2 impact
     → Frontend updates dashboard
```

### 4. Dashboard Data Flow

```
User opens dashboard
     → Frontend reads activities from Firestore (direct read)
     → Frontend reads scores from Firestore (direct read)
     → Frontend aggregates data locally
     → Frontend renders charts with Recharts
     → Real-time updates via Firestore listeners
```

### 5. Tips Generation Flow

```
Weekly cron job (or manual trigger)
     → Backend queries user activities
     → Backend analyzes patterns by category
     → Backend generates 3-5 personalized tips
     → Backend stores tips in Firestore
     → Frontend displays tips to user
     → User can mark tips as viewed
```

---

## Firestore Data Model

### Collection: `users`

**Document ID**: Firebase Auth UID

```typescript
{
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  baselineScore: number;
  preferences: {
    emailNotifications: boolean;
    weeklyTips: boolean;
    theme: 'light' | 'dark' | 'system';
    units: 'metric' | 'imperial';
  };
}
```

**Indexes**: None required (single document reads by UID)

---

### Collection: `activities`

**Document ID**: Auto-generated

```typescript
{
  userId: string;           // Indexed
  date: Timestamp;          // Indexed
  category: string;         // 'transport' | 'food' | 'energy' | 'shopping'
  type: string;             // Specific activity type
  amount: number;
  unit: string;
  co2Impact: number;        // kg CO2e
  notes?: string;
  createdAt: Timestamp;
}
```

**Composite Indexes**:
1. `userId` (ASC) + `date` (DESC)
2. `userId` (ASC) + `category` (ASC) + `date` (DESC)

---

### Collection: `quizResponses`

**Document ID**: userId (one quiz per user)

```typescript
{
  userId: string;
  responses: {
    [questionId: string]: string | number;
  };
  calculatedScore: number;
  breakdown: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
  };
  completedAt: Timestamp;
}
```

**Indexes**: None required (single document reads by userId)

---

### Collection: `carbonScores`

**Document ID**: Auto-generated

```typescript
{
  userId: string;           // Indexed
  date: Timestamp;          // Indexed
  score: number;            // Total CO2 in kg
  breakdown: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
  };
  calculatedAt: Timestamp;
}
```

**Composite Index**: `userId` (ASC) + `date` (DESC)

---

### Collection: `tips`

**Document ID**: Auto-generated

```typescript
{
  userId: string;           // Indexed
  weekStart: Timestamp;     // Indexed
  tips: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    potentialSavings: number;
    actionable: boolean;
    reason: string;
    generatedAt: Timestamp;
  }>;
  generatedAt: Timestamp;
  viewed: boolean;
}
```

**Composite Index**: `userId` (ASC) + `weekStart` (DESC)

---

## API Design

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://[cloud-run-url]/api`

### Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

#### Health Check

```
GET /health
Response: { status: 'ok', timestamp: string }
```

#### Quiz

```
POST /api/quiz
Headers: Authorization: Bearer <token>
Body: {
  responses: Record<string, string | number>
}
Response: {
  success: boolean;
  data: {
    result: QuizResult
  }
}
```

#### Activities

```
GET /api/activities?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&category=transport
Headers: Authorization: Bearer <token>
Response: {
  success: boolean;
  data: {
    activities: Activity[];
    total: number;
  }
}

POST /api/activities
Headers: Authorization: Bearer <token>
Body: {
  activity: ActivityInput
}
Response: {
  success: boolean;
  data: {
    activity: Activity
  }
}
```

#### Scores

```
GET /api/scores?period=week|month|year
Headers: Authorization: Bearer <token>
Response: {
  success: boolean;
  data: {
    currentScore: CarbonScore;
    trend: ScoreTrend;
  }
}
```

#### Tips

```
GET /api/tips
Headers: Authorization: Bearer <token>
Response: {
  success: boolean;
  data: {
    tips: TipCollection
  }
}
```

---

## Authentication & Security

### Firebase Authentication

- **Methods**: Email/Password, Google Sign-In
- **Token Management**: ID tokens stored in memory (not localStorage)
- **Token Refresh**: Automatic via Firebase SDK
- **Session Duration**: 1 hour (default)

### Firestore Security Rules

```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Activities: users can only access their own
match /activities/{activityId} {
  allow read, write: if request.auth != null 
    && resource.data.userId == request.auth.uid;
}

// Tips: users can read their own, only backend can create
match /tips/{tipId} {
  allow read: if request.auth != null 
    && resource.data.userId == request.auth.uid;
  allow create: if false; // Backend only
}
```

### Backend Security

- **Helmet**: Security headers
- **CORS**: Configured for frontend origin only
- **Token Verification**: Every request validates Firebase ID token
- **Input Validation**: All inputs sanitized and validated
- **Rate Limiting**: Handled by Cloud Run (2M requests/month limit)

---

## Deployment Architecture

### Frontend Deployment (Firebase Hosting)

```bash
# Build
cd frontend
npm run build

# Deploy
firebase deploy --only hosting
```

**Configuration**: `firebase.json`
- Rewrites all routes to `/index.html` (SPA)
- Cache static assets (1 year)
- Serves from `frontend/dist`

### Backend Deployment (Cloud Run)

```bash
# Build Docker image
docker build -t gcr.io/[PROJECT-ID]/cft-backend -f backend/Dockerfile .

# Push to Container Registry
docker push gcr.io/[PROJECT-ID]/cft-backend

# Deploy to Cloud Run
gcloud run deploy cft-backend \
  --image gcr.io/[PROJECT-ID]/cft-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
```

**Always Free Tier Limits**:
- 2 million requests per month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds of compute time

### Environment Variables

**Frontend** (`.env`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=https://[cloud-run-url]
```

**Backend** (Cloud Run environment variables):
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
PORT=3000
NODE_ENV=production
```

---

## Scalability Considerations

### Current Limitations (Free Tier)

1. **Cloud Run**: 2M requests/month
   - ~66,000 requests/day
   - ~2,700 requests/hour
   - Sufficient for MVP with ~1000 active users

2. **Firestore**: 
   - 50,000 reads/day
   - 20,000 writes/day
   - 20,000 deletes/day
   - 1 GB storage

3. **Firebase Hosting**: 10 GB storage, 360 MB/day transfer

### Optimization Strategies

1. **Caching**:
   - Frontend caches Firestore data locally
   - Use Firestore offline persistence
   - Cache static assets aggressively

2. **Batch Operations**:
   - Batch Firestore writes when possible
   - Aggregate data on frontend to reduce reads

3. **Direct Firestore Access**:
   - Frontend reads directly from Firestore for dashboard
   - Reduces backend API calls
   - Leverages Firestore's real-time capabilities

4. **Efficient Queries**:
   - Use composite indexes
   - Limit query results
   - Paginate large datasets

### Future Scaling Path

If usage exceeds free tier:

1. **Upgrade to Paid Tiers**:
   - Cloud Run: Pay-as-you-go
   - Firestore: Blaze plan
   - Firebase Hosting: Blaze plan

2. **Add Caching Layer**:
   - Redis/Memcached for frequently accessed data
   - CDN for static assets

3. **Database Optimization**:
   - Denormalize data for faster reads
   - Archive old data
   - Implement data retention policies

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start backend (with hot reload)
npm run dev --workspace=backend

# Start frontend (with hot reload)
npm run dev --workspace=frontend

# Run Firebase emulators
firebase emulators:start
```

### Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build --workspace=frontend
npm run build --workspace=backend
```

---

## Monitoring & Logging

### Cloud Run Logs

- Access via Google Cloud Console
- View request logs, errors, and performance metrics
- Set up log-based alerts

### Firestore Monitoring

- Monitor read/write operations
- Track storage usage
- Set up billing alerts

### Frontend Monitoring

- Firebase Performance Monitoring (free)
- Track page load times
- Monitor API response times

---

## Security Best Practices

1. **Never commit secrets**: Use `.env` files (gitignored)
2. **Rotate credentials**: Regularly update service account keys
3. **Principle of least privilege**: Grant minimal Firestore permissions
4. **Input validation**: Validate all user inputs on backend
5. **HTTPS only**: Enforce HTTPS for all connections
6. **Token expiration**: Implement proper token refresh logic
7. **Rate limiting**: Monitor and limit API usage per user

---

## Conclusion

This architecture provides a solid foundation for the Carbon Footprint Tracker MVP while staying within free tier limits. The design is modular, scalable, and follows best practices for security and performance.

For questions or contributions, please refer to the README.md file.