# @cft/frontend

React + TypeScript frontend for the **Carbon Footprint Tracker** — a web application that helps users track, understand, and reduce their personal carbon footprint.

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React 18](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite 5](https://vitejs.dev/) | Build tool & dev server |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first styling |
| [Recharts](https://recharts.org/) | Data visualisation charts |
| [Firebase Auth](https://firebase.google.com/docs/auth) | User authentication |
| [Firebase Hosting](https://firebase.google.com/docs/hosting) | Production deployment |

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx                  # Root component, routing setup
│   ├── main.tsx                 # App entry point
│   ├── components/
│   │   ├── auth/                # Login, SignUp, ProtectedRoute
│   │   ├── common/              # Shared UI components
│   │   ├── quiz/                # Quiz step components
│   │   └── tips/                # Personalised tips components
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard with charts & stats
│   │   ├── LogActivity.tsx      # Activity logging form
│   │   ├── QuizPage.tsx         # Carbon footprint assessment quiz
│   │   └── TodayView.tsx        # Today's activity summary
│   ├── contexts/
│   │   └── AuthContext.tsx      # Firebase Auth React context
│   ├── services/
│   │   └── api.ts               # Backend API client
│   ├── config/                  # Firebase initialisation
│   ├── styles/                  # Global CSS
│   └── utils/                   # Helper functions
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Redirects to `/dashboard` |
| `/login` | Public | Firebase email/password login |
| `/signup` | Public | New user registration |
| `/dashboard` | 🔒 Protected | Overview charts, score, tips |
| `/today` | 🔒 Protected | Today's logged activities |
| `/log-activity` | 🔒 Protected | Log a new activity |
| `/quiz` | 🔒 Protected | Carbon footprint assessment |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A Firebase project with **Authentication** (Email/Password) enabled

### 1. Environment Variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Backend API (leave empty to use mock data locally)
VITE_API_URL=https://cft-backend-lrprfu36yq-uc.a.run.app
```

> **Never commit `.env` to source control.** It is already listed in `.gitignore`.

### 2. Install Dependencies

From the **monorepo root**:

```bash
npm ci --workspace=frontend
```

Or from within the `frontend/` directory:

```bash
npm ci
```

### 3. Start the Dev Server

```bash
# From monorepo root
npm run dev --workspace=frontend

# Or from frontend/
npm run dev
```

Opens at **http://localhost:5173** with hot module replacement.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Run `tsc --noEmit` without emitting files |
| `npm run lint` | Run ESLint across all `.ts`/`.tsx` files |
| `npm run clean` | Delete the `dist/` output folder |

## Building for Production

```bash
npm run build --workspace=frontend
```

Output is written to `frontend/dist/`. The build:
- Type-checks all TypeScript
- Bundles with Vite (tree-shaking, code splitting)
- Generates source maps
- Inlines environment variables from `.env`

> ⚠️ Environment variables are baked in at build time. Rebuild after changing `.env`.

## Deployment — Firebase Hosting

Firebase Hosting is already configured in [`firebase.json`](../firebase.json) (public dir: `frontend/dist`, SPA rewrites enabled).

### Deploy

```bash
# 1. Build the frontend
npm run build --workspace=frontend

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Deploy with Firestore rules

```bash
firebase deploy --only hosting,firestore
```

The live URL will be printed after deployment, e.g.:
```
Hosting URL: https://your-project-id.web.app
```

## Environment Variables Reference

All Vite env variables must be prefixed with `VITE_` to be accessible in the browser bundle.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Auth domain (`project.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Storage bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase Web App ID |
| `VITE_API_URL` | ⬜ | Backend Cloud Run URL (omit for local mock) |

## Architecture Notes

- **Authentication** is handled entirely by Firebase Auth. The `AuthContext` provides `user`, `loading`, and `signOut` to the entire app via React Context.
- **Protected routes** are wrapped in `<ProtectedRoute>` which redirects unauthenticated users to `/login`.
- **API calls** go through `src/services/api.ts` which reads `VITE_API_URL` and attaches the Firebase ID token as a `Bearer` authorization header on every request.
- **Shared types** are consumed from the `@cft/shared` workspace package — build that first if you see type errors.

## Troubleshooting

### `@cft/shared` types not found
Build the shared package first:
```bash
npm run build --workspace=shared
```

### Blank screen after login
Check the browser console for Firebase config errors. Ensure all `VITE_FIREBASE_*` variables are set in `.env` and you've rebuilt (`npm run build`).

### API requests failing in production
Verify `VITE_API_URL` is set to the Cloud Run backend URL before building. The variable is baked in at build time — rebuilding is required after changes.
