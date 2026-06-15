# First Deployment Checklist

This checklist guides you through the first production deployment of the Carbon Footprint Tracker, ensuring all required APIs are enabled, services are deployed, and free-tier safety measures are in place.

## Prerequisites

- [ ] Google Cloud Project created with billing enabled
- [ ] Firebase project initialized (can be same as GCP project)
- [ ] GitHub repository set up with Actions enabled
- [ ] Service account keys downloaded (for GitHub Actions)

---

## Step 1: Verify and Enable Required APIs

Run these commands to confirm all necessary Google Cloud APIs are enabled:

```bash
# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Verify current project
gcloud config get-value project

# Enable all required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable identitytoolkit.googleapis.com

# Verify APIs are enabled
gcloud services list --enabled | grep -E "(run|artifactregistry|cloudbuild|firebase|firestore|identitytoolkit)"
```

**Expected output:** You should see all 6 services listed as enabled.

---

## Step 2: Deploy Firestore Security Rules and Indexes

Deploy the security rules and indexes to production Firestore:

```bash
# Authenticate with Firebase (if not already done)
firebase login

# Set the active project
firebase use YOUR_PROJECT_ID

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Verify deployment
firebase projects:list
```

**Expected output:** 
- Rules deployed successfully
- Indexes created (may take a few minutes to build)

---

## Step 3: Seed Production Database

Run the seed script to populate emission factors and tip templates:

```bash
# Navigate to backend directory
cd backend

# Ensure you have the service account key
# (Download from Firebase Console > Project Settings > Service Accounts)
# Save as serviceAccountKey.json in backend directory

# Set environment variable for production
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
export NODE_ENV=production

# Install dependencies if not already done
npm install

# Build the backend
npm run build

# Run the seed script
npx tsx src/scripts/seedData.ts
```

**Expected output:**
```
🌱 Starting database seed...

📊 Seeding emission factors...
✅ Seeded 25 emission factors

💡 Seeding tip templates...
✅ Seeded 10 tip templates

✅ Database seeding completed successfully!
```

**Verify in Firestore Console:**
- Navigate to Firebase Console > Firestore Database
- Check that `emissionFactors` collection has ~25 documents
- Check that `tips` collection has ~10 documents

---

## Step 4: Configure GitHub Secrets

Add the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions > New repository secret`):

### Backend Deployment Secrets:
```
GCP_PROJECT_ID=your-gcp-project-id
GCP_SA_KEY=<paste entire contents of cft-deploy-key.json>
```

### Frontend Deployment Secrets:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=https://cft-backend-xxxxxxxxxx-uc.a.run.app
FIREBASE_SERVICE_ACCOUNT=<paste entire contents of firebase-service-account.json>
FIREBASE_PROJECT_ID=your-firebase-project-id
```

**Note:** You'll need to update `VITE_API_URL` after the backend deploys for the first time.

---

## Step 5: Trigger Backend Deployment

Trigger the backend deployment workflow:

```bash
# Make a small change to trigger deployment (or use GitHub UI)
# Option 1: Push a commit that touches backend files
git add backend/
git commit -m "chore: trigger initial backend deployment"
git push origin main

# Option 2: Manually trigger workflow from GitHub Actions tab
# Go to Actions > Deploy Backend to Cloud Run > Run workflow
```

**Monitor deployment:**
1. Go to GitHub repository > Actions tab
2. Watch the "Deploy Backend to Cloud Run" workflow
3. Wait for completion (typically 3-5 minutes)
4. Copy the Cloud Run service URL from the workflow logs

**Verify backend deployment:**
```bash
# Test the health endpoint (replace with your actual URL)
curl https://cft-backend-xxxxxxxxxx-uc.a.run.app/health

# Expected response:
# {"status":"ok","timestamp":"2026-06-15T12:00:00.000Z"}
```

---

## Step 6: Update Frontend Configuration

Update the `VITE_API_URL` secret with the actual backend URL:

1. Go to GitHub repository > Settings > Secrets and variables > Actions
2. Edit the `VITE_API_URL` secret
3. Replace with your actual Cloud Run URL from Step 5

---

## Step 7: Trigger Frontend Deployment

Trigger the frontend deployment workflow:

```bash
# Option 1: Push a commit that touches frontend files
git add frontend/
git commit -m "chore: trigger initial frontend deployment"
git push origin main

# Option 2: Manually trigger workflow from GitHub Actions tab
# Go to Actions > Deploy Frontend to Firebase Hosting > Run workflow
```

**Monitor deployment:**
1. Go to GitHub repository > Actions tab
2. Watch the "Deploy Frontend to Firebase Hosting" workflow
3. Wait for completion (typically 2-3 minutes)

**Verify frontend deployment:**
```bash
# Your app should be live at:
# https://YOUR_PROJECT_ID.web.app
# or
# https://YOUR_PROJECT_ID.firebaseapp.com
```

---

## Step 8: Verify Complete Deployment

Test the full application:

1. **Open the frontend URL** in your browser
2. **Sign up** with a test account
3. **Complete the baseline quiz**
4. **Log an activity** in each category
5. **Check the dashboard** renders correctly
6. **View tips** section

---

## Step 9: Monitor Initial Usage

Check that services are running within free-tier limits:

```bash
# Check Cloud Run metrics
gcloud run services describe cft-backend \
  --region=us-central1 \
  --format="table(status.url,status.conditions)"

# View recent logs
gcloud run services logs read cft-backend \
  --region=us-central1 \
  --limit=50

# Check Firestore usage in Firebase Console
# Navigate to: Firebase Console > Firestore Database > Usage tab
```

---

## Troubleshooting

### Backend deployment fails
- Check GitHub Actions logs for specific error
- Verify GCP_SA_KEY secret is correctly formatted (entire JSON)
- Ensure all APIs are enabled in GCP Console

### Frontend deployment fails
- Verify all VITE_* secrets are set correctly
- Check that FIREBASE_SERVICE_ACCOUNT is valid JSON
- Ensure frontend builds locally: `npm run build --workspace=frontend`

### Seed script fails
- Verify GOOGLE_APPLICATION_CREDENTIALS points to valid service account key
- Check that Firestore is enabled in Firebase Console
- Ensure service account has Firestore write permissions

### Backend health check fails
- Wait 1-2 minutes for Cloud Run cold start
- Check Cloud Run logs: `gcloud run services logs read cft-backend --region=us-central1`
- Verify the service is deployed: `gcloud run services list`

### Frontend can't connect to backend
- Verify VITE_API_URL is set correctly in GitHub secrets
- Check CORS settings in backend
- Ensure backend allows unauthenticated requests for public endpoints

---

## Post-Deployment Checklist

- [ ] Backend health endpoint responds successfully
- [ ] Frontend loads without errors
- [ ] User can sign up and authenticate
- [ ] Quiz completion works
- [ ] Activity logging works for all categories
- [ ] Dashboard displays data correctly
- [ ] Tips section renders
- [ ] Sign out and sign in persistence works
- [ ] Billing budget alerts configured (see DEPLOYMENT_CHECKLIST.md Step 10)
- [ ] Usage monitoring set up

---

## Next Steps

1. Set up billing budget alerts (see below)
2. Review TESTING.md for comprehensive smoke tests
3. Monitor usage in Firebase and GCP consoles
4. Review FREE_TIER_LIMITS.md for ongoing monitoring
