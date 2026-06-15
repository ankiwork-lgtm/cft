# Cloud Build Fix for Rollup Error

## Problem
The build was failing with error: `Cannot find module @rollup/rollup-linux-x64-gnu`

This occurred because:
1. Google Cloud Build was trying to build the entire monorepo including the frontend
2. The frontend uses Vite which depends on Rollup
3. Rollup has platform-specific optional dependencies that weren't being installed correctly
4. The backend deployment doesn't need the frontend to be built

## Solution

### Files Created/Modified

1. **`.gcloudignore`** - Excludes frontend and unnecessary files from Cloud Build
   - Prevents frontend from being uploaded to Cloud Build
   - Reduces build time and potential conflicts

2. **`cloudbuild.yaml`** - Custom build configuration
   - Explicitly builds only `shared` and `backend` workspaces
   - Skips frontend build entirely
   - Provides more control over the build process

3. **`package.json`** - Updated build scripts
   - Changed default `build` script to only build backend and shared
   - Added `build:all` for local development (includes frontend)
   - Added `build:backend` as explicit backend-only build

4. **`Procfile`** - Specifies how to start the application
   - Tells buildpacks to run the backend Node.js application
   - Points to the compiled backend entry point

## Deployment Options

### Option 1: Using Cloud Build (Recommended)
```bash
gcloud builds submit --config=cloudbuild.yaml
```

### Option 2: Using Docker (Alternative)
```bash
# Build the Docker image
docker build -f backend/Dockerfile -t gcr.io/PROJECT_ID/carbon-footprint-backend .

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/carbon-footprint-backend

# Deploy to Cloud Run
gcloud run deploy carbon-footprint-tracker-backend \
  --image gcr.io/PROJECT_ID/carbon-footprint-backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

### Option 3: Direct Cloud Run Deployment
```bash
# This will use buildpacks with the new configuration
gcloud run deploy carbon-footprint-tracker-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

## Environment Variables

Make sure to set these environment variables in Cloud Run:

```bash
gcloud run services update carbon-footprint-tracker-backend \
  --region us-central1 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "PORT=8080" \
  --set-env-vars "FIREBASE_PROJECT_ID=your-project-id"
```

Or use Secret Manager for sensitive values:
```bash
gcloud run services update carbon-footprint-tracker-backend \
  --region us-central1 \
  --set-secrets "FIREBASE_PRIVATE_KEY=firebase-private-key:latest"
```

## Verification

After deployment, verify the service is running:

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe carbon-footprint-tracker-backend \
  --region us-central1 \
  --format 'value(status.url)')

# Test the health endpoint
curl $SERVICE_URL/health

# Test the API
curl $SERVICE_URL/api/dashboard
```

## Local Testing

To test the build locally before deploying:

```bash
# Install dependencies
npm ci --workspace=backend --workspace=shared

# Build backend only
npm run build:backend

# Start the backend
cd backend && npm start
```

## Troubleshooting

### If build still fails:
1. Clear the build cache:
   ```bash
   gcloud builds submit --no-cache
   ```

2. Check Cloud Build logs:
   ```bash
   gcloud builds list --limit=5
   gcloud builds log BUILD_ID
   ```

3. Verify .gcloudignore is working:
   ```bash
   # List files that will be uploaded
   gcloud meta list-files-for-upload
   ```

### If deployment succeeds but service fails:
1. Check Cloud Run logs:
   ```bash
   gcloud run services logs read carbon-footprint-tracker-backend \
     --region us-central1 \
     --limit 50
   ```

2. Verify environment variables are set correctly
3. Check that Firebase credentials are properly configured

## Frontend Deployment

The frontend should be deployed separately to Firebase Hosting:

```bash
# Build frontend locally
cd frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Notes

- The backend and frontend are now deployed independently
- Backend: Cloud Run (Node.js API)
- Frontend: Firebase Hosting (Static React app)
- This separation provides better scalability and simpler deployments