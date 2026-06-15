# Authentication Setup Guide

This guide explains how to set up and test Firebase Authentication in the Carbon Footprint Tracker app.

## Overview

The app uses Firebase Authentication with email/password sign-in. The authentication flow includes:

1. **Frontend**: React context manages auth state and provides sign-up, sign-in, and sign-out methods
2. **Backend**: Express middleware verifies Firebase ID tokens and initializes user documents
3. **Firestore**: User documents are automatically created on first sign-in with default values

## Architecture

### Frontend Components

- **`AuthContext`** (`frontend/src/contexts/AuthContext.tsx`): React context that wraps the app and provides:
  - `currentUser`: The authenticated Firebase user object
  - `loading`: Boolean indicating if auth state is being determined
  - `signUp(email, password)`: Create a new user account
  - `signIn(email, password)`: Sign in an existing user
  - `signOut()`: Sign out the current user
  - `getIdToken()`: Get a fresh ID token for API requests

- **`SignUp`** (`frontend/src/components/auth/SignUp.tsx`): Registration form with email/password validation

- **`Login`** (`frontend/src/components/auth/Login.tsx`): Sign-in form with error handling

- **`ProtectedRoute`** (`frontend/src/components/auth/ProtectedRoute.tsx`): Route wrapper that redirects unauthenticated users to `/login`

- **`Dashboard`** (`frontend/src/pages/Dashboard.tsx`): Protected page showing user info and logout button

### Backend Middleware

- **`verifyAuth`** (`backend/src/middleware/auth.ts`): 
  - Extracts and verifies Firebase ID token from `Authorization: Bearer <token>` header
  - Attaches decoded user info (`uid`, `email`) to `req.user`
  - Returns 401 if token is missing or invalid

- **`initializeUser`** (`backend/src/middleware/initializeUser.ts`):
  - Runs after `verifyAuth` on all protected routes
  - Checks if user document exists in Firestore
  - Creates document with default values if it doesn't exist:
    ```typescript
    {
      email: string | null,
      quizCompleted: false,
      baselineScore: null,
      currentScore: null,
      goalTarget: null,
      createdAt: ISO 8601 timestamp,
      updatedAt: ISO 8601 timestamp
    }
    ```

### Route Protection

All API routes except `/health` are protected with the middleware chain:
```typescript
const protectedRoute = [verifyAuth, initializeUser];

router.post('/quiz', protectedRoute, handler);
router.get('/logs', protectedRoute, handler);
router.post('/logs', protectedRoute, handler);
router.get('/dashboard', protectedRoute, handler);
router.get('/tips', protectedRoute, handler);
```

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Authentication:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password** provider
4. Create a Firestore database:
   - Go to **Firestore Database** → **Create database**
   - Choose **Production mode** (we'll use security rules)
   - Select a location close to your users

### 2. Get Firebase Configuration

#### Frontend Config (Web App)
1. Go to **Project Settings** → **General**
2. Scroll to **Your apps** → Click **Web** icon (</>) to add a web app
3. Register app with a nickname (e.g., "CFT Frontend")
4. Copy the Firebase config object

#### Backend Config (Service Account)
1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Save the JSON file securely (DO NOT commit to git)

### 3. Configure Environment Variables

#### Frontend `.env`
Create `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend `.env`
Create `backend/.env`:
```env
NODE_ENV=development
PORT=3000

# Path to Firebase service account key (for local development)
GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json

# For Cloud Run deployment (uses default credentials)
# GOOGLE_CLOUD_PROJECT=your_project_id
```

### 4. Deploy Firestore Security Rules

Deploy the security rules from `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

Or manually copy the rules in Firebase Console → Firestore → Rules.

### 5. Install Dependencies

From the project root:
```bash
npm install
```

This installs dependencies for all workspaces (root, shared, backend, frontend).

## Testing the Authentication Flow

### 1. Start Firebase Emulators (Recommended for Development)

```bash
firebase emulators:start
```

This starts:
- Authentication Emulator: `http://localhost:9099`
- Firestore Emulator: `http://localhost:8080`
- Emulator UI: `http://localhost:4000`

Update `frontend/src/config/firebase.ts` to use emulators in development:
```typescript
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### 2. Start Backend Server

In a new terminal:
```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Start Frontend Dev Server

In another terminal:
```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Test Sign-Up Flow

1. Open `http://localhost:5173` in your browser
2. You'll be redirected to `/login` (not authenticated)
3. Click "Sign up" link to go to `/signup`
4. Enter email and password (min 6 characters)
5. Click "Sign Up"
6. On success, you'll be redirected to `/dashboard`
7. Check the backend logs - you should see: `✅ Created user document for uid: <user_id>`

### 5. Verify User Document in Firestore

**Using Emulator UI:**
1. Go to `http://localhost:4000`
2. Click **Firestore** tab
3. Navigate to `users` collection
4. You should see a document with your user ID containing default values

**Using Firebase Console (Production):**
1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Find your user document

### 6. Test Sign-Out and Sign-In

1. Click "Log Out" button on dashboard
2. You'll be redirected to `/login`
3. Enter the same email/password
4. Click "Log In"
5. You'll be redirected back to `/dashboard`
6. Check backend logs - user document should already exist (no creation message)

### 7. Test Protected Routes

Try accessing the API directly:

**Without Authentication (should fail):**
```bash
curl http://localhost:3000/api/dashboard
# Response: 401 Unauthorized
```

**With Authentication (should succeed):**
```bash
# First, get an ID token from the frontend
# Open browser console on dashboard page and run:
# firebase.auth().currentUser.getIdToken().then(token => console.log(token))

curl -H "Authorization: Bearer <your_token>" http://localhost:3000/api/dashboard
# Response: 501 Not Implemented (but authenticated!)
```

### 8. Test Protected Frontend Routes

1. While signed in, copy the dashboard URL
2. Sign out
3. Try to paste the dashboard URL in the browser
4. You should be redirected to `/login`
5. Sign in again
6. You should be redirected back to `/dashboard`

## Common Issues

### Frontend: "Firebase: Error (auth/invalid-api-key)"
- Check that `VITE_FIREBASE_API_KEY` in `frontend/.env` is correct
- Restart the Vite dev server after changing `.env`

### Backend: "Error: Could not load the default credentials"
- Check that `GOOGLE_APPLICATION_CREDENTIALS` points to valid service account key
- Ensure the file path is correct (relative to backend directory)
- For Cloud Run, ensure the service account has Firestore permissions

### Backend: "Error: 7 PERMISSION_DENIED: Missing or insufficient permissions"
- Check Firestore security rules
- Ensure the service account has `Cloud Datastore User` role
- For emulators, rules are not enforced by default

### Frontend: Components not rendering / TypeScript errors
- Run `npm install` from project root
- Check that all dependencies are installed
- Restart VS Code TypeScript server

### CORS errors when calling backend from frontend
- Ensure backend has CORS enabled (already configured in `backend/src/index.ts`)
- Check that frontend is calling the correct backend URL
- For production, configure CORS to only allow your frontend domain

## Security Best Practices

1. **Never commit `.env` files or service account keys to git**
   - Already in `.gitignore`
   - Use environment variables in production

2. **Use Firebase Emulators for development**
   - Avoid using production Firebase project during development
   - Emulators are free and don't count against quotas

3. **Implement rate limiting in production**
   - Add rate limiting middleware to prevent abuse
   - Firebase has built-in rate limiting for auth operations

4. **Validate user input on backend**
   - Don't trust client-side validation alone
   - Sanitize and validate all request data

5. **Use HTTPS in production**
   - Cloud Run provides HTTPS by default
   - Firebase Hosting provides HTTPS by default

6. **Rotate service account keys regularly**
   - Generate new keys every 90 days
   - Revoke old keys after rotation

## Next Steps

After authentication is working:

1. **Implement the quiz endpoint** to calculate baseline carbon score
2. **Implement activity logging** to track daily CO2 emissions
3. **Build the dashboard** with charts and trends
4. **Add personalized tips** based on user activity patterns
5. **Deploy to production** (Cloud Run + Firebase Hosting)

## Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [React Context API](https://react.dev/reference/react/useContext)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)