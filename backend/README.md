# Carbon Footprint Tracker - Backend API

Express + TypeScript backend API for the Carbon Footprint Tracker application.

## 🏗️ Architecture

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Language**: TypeScript
- **Database**: Firestore (via Firebase Admin SDK)
- **Authentication**: Firebase Authentication
- **Deployment**: Google Cloud Run

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── config/
│   │   └── firebase.ts       # Firebase Admin SDK setup
│   ├── middleware/
│   │   ├── auth.ts           # Authentication middleware
│   │   └── errorHandler.ts  # Error handling
│   ├── routes/
│   │   └── index.ts          # API routes
│   ├── utils/
│   │   ├── emissionCalculator.ts  # CO2 calculation logic
│   │   └── tipGenerator.ts        # Tip generation (placeholder)
│   └── scripts/
│       └── seedData.ts       # Database seeding script
├── Dockerfile                # Container definition for Cloud Run
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Service account key JSON file

### Installation

```bash
# From project root
npm install

# Or install backend only
npm install --workspace=backend
```

### Environment Setup

1. Download your Firebase service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root

2. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   ```

3. Configure other environment variables in `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

### Running Locally

```bash
# Start development server with hot reload
npm run dev --workspace=backend

# Or from backend directory
cd backend
npm run dev
```

The API will be available at `http://localhost:3000`

### Using Firebase Emulators

For local development with Firebase emulators:

```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start backend (will connect to emulators)
npm run dev --workspace=backend
```

Emulator UI: `http://localhost:4000`

## 📊 Database Setup

### Seed Initial Data

Load emission factors and tip templates into Firestore:

```bash
# From project root
npm run seed --workspace=backend

# Or from backend directory
cd backend
npm run seed
```

This will populate:
- **emissionFactors**: 30+ emission factors for various activities
- **tips**: 12+ tip templates for personalized recommendations

### Data Sources

All emission factors are sourced from reputable organizations:
- **EPA** (Environmental Protection Agency)
- **DEFRA** (UK Department for Environment, Food & Rural Affairs)
- **ICAO** (International Civil Aviation Organization)
- **Poore & Nemecek 2018** (Comprehensive food emissions study)

See `src/scripts/seedData.ts` for detailed citations.

## 🔌 API Endpoints

### Health Check

```
GET /health
```

Returns API health status.

### API Info

```
GET /api
```

Returns API information and available endpoints.

### Quiz (Not Implemented)

```
POST /api/quiz
```

Submit quiz answers and calculate baseline carbon score.

### Activity Logs

```
GET /api/logs
POST /api/logs
```

Get or create activity log entries.

### Dashboard (Not Implemented)

```
GET /api/dashboard
```

Get dashboard data with trends and breakdown.

### Tips (Not Implemented)

```
GET /api/tips
```

Get personalized tips based on user activity.

## 🔐 Authentication

All protected endpoints require a Firebase ID token:

```
Authorization: Bearer <firebase-id-token>
```

The `verifyAuth` middleware validates tokens and attaches user info to `req.user`.

## 🧮 Emission Calculation

The `emissionCalculator` utility provides CO2 calculation:

```typescript
import { calculateCO2 } from './utils/emissionCalculator';

// Calculate emissions
const co2Kg = await calculateCO2(
  'transport',  // category
  'car',        // activityType
  25,           // quantity
  'km'          // unit
);

console.log(`CO2 emissions: ${co2Kg} kg`);
```

### Caching

Emission factors are cached in memory for 1 hour to reduce Firestore reads.

## 🗄️ Firestore Collections

### users/{uid}

User profile and settings.

```typescript
{
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  quizCompleted: boolean;
  quizAnswers?: Record<string, string | number>;
  baselineScore: number;
  currentScore: number;
  goalTarget?: number;
  preferences: {
    emailNotifications: boolean;
    weeklyTips: boolean;
    theme: 'light' | 'dark' | 'system';
    units: 'metric' | 'imperial';
  };
}
```

### users/{uid}/entries/{entryId}

Activity log entries (subcollection).

```typescript
{
  userId: string;
  date: Timestamp;
  category: 'transport' | 'food' | 'energy' | 'shopping';
  activityType: string;
  quantity: number;
  unit: string;
  co2Kg: number;
  createdAt: Timestamp;
  notes?: string;
}
```

### emissionFactors/{factorId}

Reference data for CO2 calculations.

```typescript
{
  category: string;
  activityType: string;
  unit: string;
  kgCO2PerUnit: number;
  source: string;
  description?: string;
  lastUpdated: Timestamp;
}
```

### tips/{tipId}

Tip templates for recommendations.

```typescript
{
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionableSteps: string[];
  potentialSavingsPercent: number;
  triggerConditions: {
    category?: string;
    minCO2Threshold?: number;
    activityTypes?: string[];
    frequencyThreshold?: number;
  };
  source?: string;
  createdAt: Timestamp;
}
```

## 🔒 Security Rules

Firestore security rules enforce:
- Users can only read/write their own data
- Emission factors and tips are read-only for clients
- Only backend/admin can write reference data

See `firestore.rules` for details.

## 🏗️ Building

```bash
# Build TypeScript
npm run build --workspace=backend

# Output in backend/dist/
```

## 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t cft-backend -f backend/Dockerfile .

# Run container
docker run -p 3000:3000 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json \
  cft-backend
```

## ☁️ Deployment to Cloud Run

```bash
# Build and push to Container Registry
docker build -t gcr.io/[PROJECT-ID]/cft-backend -f backend/Dockerfile .
docker push gcr.io/[PROJECT-ID]/cft-backend

# Deploy to Cloud Run
gcloud run deploy cft-backend \
  --image gcr.io/[PROJECT-ID]/cft-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

Cloud Run will automatically use the default service account (no credentials needed).

## 🧪 Testing

```bash
# Type checking
npm run type-check --workspace=backend

# Linting
npm run lint --workspace=backend
```

## 📝 Development Notes

### TypeScript Errors

TypeScript errors about missing modules are expected until dependencies are installed:

```bash
npm install
```

### Shared Types

The backend uses shared types from `@cft/shared`. Build the shared package first:

```bash
npm run build --workspace=shared
```

### Hot Reload

The dev server uses `tsx watch` for automatic reloading on file changes.

## 🐛 Troubleshooting

### "Cannot find module '@cft/shared'"

```bash
npm run build --workspace=shared
```

### "GOOGLE_APPLICATION_CREDENTIALS not set"

```bash
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

### Port already in use

```bash
npx kill-port 3000
```

### Firestore permission denied

Check that:
1. Service account has Firestore permissions
2. Firestore security rules are deployed
3. User is authenticated (for protected endpoints)

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use ESLint and Prettier configurations
3. Document emission factor sources
4. Add error handling for all routes
5. Write meaningful commit messages

---

**Built with ❤️ for a sustainable future 🌱**