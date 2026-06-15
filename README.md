# Carbon Footprint Tracker

A web application to help users track and reduce their carbon footprint through personalized insights and actionable tips.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.8-FFCA28)](https://firebase.google.com/)

## 🌍 Features

- **Baseline Carbon Quiz**: Assess your starting carbon footprint
- **Activity Logging**: Track daily activities across transport, food, energy, and shopping
- **Dashboard Analytics**: Visualize your carbon footprint trends with interactive charts
- **Personalized Tips**: Receive 3-5 weekly tips based on your activity patterns
- **Real-time Updates**: Live data synchronization with Firestore
- **Secure Authentication**: Firebase Authentication with email/password and Google Sign-In

## 🏗️ Architecture

This is a monorepo project using npm workspaces with three main packages:

- **`/frontend`**: React + Vite + Tailwind CSS (hosted on Firebase Hosting)
- **`/backend`**: Node.js + Express + TypeScript (deployed on Cloud Run)
- **`/shared`**: Shared TypeScript types and interfaces

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- Backend: Node.js, Express, TypeScript, Firebase Admin SDK
- Database: Firestore (Native mode)
- Authentication: Firebase Authentication
- Hosting: Firebase Hosting (frontend), Cloud Run (backend)

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Firebase CLI**: `npm install -g firebase-tools`
- **Google Cloud SDK** (for Cloud Run deployment)
- **Docker** (for building backend container)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/carbon-footprint-tracker.git
cd carbon-footprint-tracker
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

This will install dependencies for all three workspaces (frontend, backend, shared).

### 3. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable **Firestore Database** (Native mode)
4. Enable **Authentication** (Email/Password and Google providers)

#### Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll down to "Your apps" and click the web icon (`</>`)
3. Register your app and copy the configuration object

#### Download Service Account Key

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Save the JSON file as `serviceAccountKey.json` in the project root
4. **⚠️ NEVER commit this file to version control!**

### 4. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API Configuration
VITE_API_URL=http://localhost:3000

# Firebase Admin SDK (Backend only)
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Backend Server Configuration
PORT=3000
NODE_ENV=development
```

### 5. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 6. Run the Application

#### Option A: Run All Services

```bash
# Terminal 1: Start backend
npm run dev --workspace=backend

# Terminal 2: Start frontend
npm run dev --workspace=frontend
```

#### Option B: Use Firebase Emulators (Recommended for Development)

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start backend
npm run dev --workspace=backend

# In another terminal, start frontend
npm run dev --workspace=frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000

## 📦 Project Structure

```
cft/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client
│   │   ├── config/        # Firebase config
│   │   └── styles/        # CSS files
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # Express backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Firebase Admin config
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── Dockerfile
│
├── shared/                # Shared TypeScript types
│   ├── src/
│   │   ├── types/         # Type definitions
│   │   └── interfaces/    # Interface definitions
│   └── package.json
│
├── docs/                  # Additional documentation
│   └── API.md            # API specification
│
├── package.json           # Root package.json (workspaces)
├── tsconfig.json          # Base TypeScript config
├── .eslintrc.json         # ESLint configuration
├── .prettierrc.json       # Prettier configuration
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── ARCHITECTURE.md        # Architecture documentation
└── README.md             # This file
```

## 🛠️ Development

### Available Scripts

#### Root Level

```bash
npm run dev          # Start all workspaces in dev mode
npm run build        # Build all workspaces
npm run lint         # Lint all workspaces
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Type check all workspaces
npm run clean        # Clean all build artifacts
```

#### Frontend

```bash
npm run dev --workspace=frontend       # Start dev server
npm run build --workspace=frontend     # Build for production
npm run preview --workspace=frontend   # Preview production build
npm run lint --workspace=frontend      # Lint frontend code
```

#### Backend

```bash
npm run dev --workspace=backend        # Start with hot reload
npm run build --workspace=backend      # Build TypeScript
npm run start --workspace=backend      # Start production server
npm run lint --workspace=backend       # Lint backend code
```

#### Shared

```bash
npm run build --workspace=shared       # Build shared types
npm run type-check --workspace=shared  # Type check shared code
```

### Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run checks before committing:

```bash
npm run lint
npm run format:check
npm run type-check
```

## 🚢 Deployment

### Frontend Deployment (Firebase Hosting)

```bash
# Build frontend
npm run build --workspace=frontend

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Backend Deployment (Cloud Run)

```bash
# Build Docker image
docker build -t gcr.io/[PROJECT-ID]/cft-backend -f backend/Dockerfile .

# Push to Google Container Registry
docker push gcr.io/[PROJECT-ID]/cft-backend

# Deploy to Cloud Run
gcloud run deploy cft-backend \
  --image gcr.io/[PROJECT-ID]/cft-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
```

**Note**: Update `VITE_API_URL` in your frontend `.env` to point to your Cloud Run URL.

### Environment Variables for Production

Update your production environment variables:

```env
VITE_API_URL=https://your-cloud-run-url
NODE_ENV=production
```

## 📊 Free Tier Limits

This application is designed to run entirely on free tiers:

### Firebase (Spark Plan)
- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Authentication**: Unlimited
- **Hosting**: 10 GB storage, 360 MB/day transfer

### Google Cloud (Always Free)
- **Cloud Run**: 2M requests/month, 360K GB-seconds memory, 180K vCPU-seconds

### Monitoring Usage

Monitor your usage in:
- [Firebase Console](https://console.firebase.google.com/) → Usage tab
- [Google Cloud Console](https://console.cloud.google.com/) → Billing

Set up billing alerts to avoid unexpected charges.

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format checking
npm run format:check
```

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed system architecture
- [docs/API.md](./docs/API.md) - API endpoint specifications
- [PLAN.md](./PLAN.md) - Project planning document

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module '@cft/shared'"

```bash
# Rebuild shared package
npm run build --workspace=shared
```

#### Firebase Emulator Connection Issues

```bash
# Clear emulator data
firebase emulators:start --clear-data
```

#### TypeScript Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### Port Already in Use

```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Firebase for providing excellent free tier services
- Google Cloud for Cloud Run free tier
- The open-source community for amazing tools and libraries

## 📞 Support

For questions or issues:
- Open an issue on [GitHub](https://github.com/yourusername/carbon-footprint-tracker/issues)
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review [docs/API.md](./docs/API.md) for API documentation

---

**Built with ❤️ for a sustainable future 🌱**