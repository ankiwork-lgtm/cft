# Carbon Footprint Tracker — IBM Bob Build Plan (Free-Tier GCP MVP)

This plan turns the "Carbon Footprint Awareness Platform" design doc into a buildable v1: **onboarding quiz + baseline Carbon Score, manual daily logging, a dashboard, and weekly rule-based tips**, with real sign-up/login via Firebase Authentication. Everything is chosen to run on Google Cloud's Always Free tier and the Firebase Spark plan at $0/month for low/personal usage.

> ⚠️ Free-tier quotas do change over time — before your first deploy, double-check current limits in the GCP Console and Firebase Console for Cloud Run, Firestore, and Hosting, and set a billing budget alert (Step 0 below).

---

## 1. Scope for v1 (and what's deliberately deferred)

**In scope (maps to doc sections 3A–3D, 5):**
- Lifestyle quiz → baseline Carbon Score + comparison + goal setting (3A)
- Manual daily activity logging across Transport/Food/Energy/Shopping (3B, manual only — no smart integrations)
- Dashboard with trend chart, category breakdown, score, goal progress (3H)
- 3–5 rule-based personalized tips per week (3C, simplified — no ML)
- Real user accounts (Firebase Authentication)

**Deferred to later phases (do NOT build now):**
- Smart integrations, receipt scanning, voice logging (3B)
- Education hub, challenges/gamification, community/social, offset marketplace (3D–3G)
- Any ML personalization, AR scanning, "Carbon Twin" avatar, neighborhood map (3, 8)
- Banking/Plaid, smart home, travel APIs (4)

These are excluded mainly because they require paid third-party APIs, ML infrastructure, or services that exceed free-tier quotas quickly. They're a natural Phase 2 once v1 is live and you've confirmed usage stays within free limits.

---

## 2. Architecture & free-tier mapping

| Component | Technology | GCP/Firebase Service | Free tier fit |
|---|---|---|---|
| Frontend | React + Vite + TypeScript + Tailwind + Recharts | Firebase Hosting | 10 GB storage / 360 MB per day transfer, free |
| Backend API | Node.js + Express + TypeScript | Cloud Run | Always Free: ~2M requests, 360k GB-seconds, 180k vCPU-seconds/month |
| Database | Firestore (Native mode) | Firestore | 1 GiB storage, ~50k reads/day free quota |
| Auth | Firebase Authentication (email/password) | Firebase Auth | Free for email/password & most non-SMS providers |
| Container images | Docker image for backend | Artifact Registry | Small free storage quota, sufficient for one small image |
| CI/CD | GitHub Actions | GitHub-hosted runners | Free minutes on standard plans |

Reference data (emission factors, quiz scoring, tips) is stored as static seed data in Firestore — no external carbon-data APIs, so no extra cost or rate limits.

---

## 3. One-time setup (do this *before* opening IBM Bob)

1. **GCP project**: create a new project, enable billing (required even to use free tier, but you won't be charged while under quota).
2. **Budget alert**: in Billing → Budgets & alerts, create a budget of ~$1 with alerts at 50%/90%/100% so you're notified immediately if anything starts costing money.
3. **Firebase**: go to the Firebase console, "Add project" using the *same* GCP project. Enable:
   - **Authentication** → Email/Password provider
   - **Firestore** → Native mode, pick a region close to you (e.g., `us-central1`)
   - **Hosting**
4. **GitHub**: create a new empty repo (e.g., `carbon-tracker`), clone it locally.
5. **Local tools**: install Node.js (LTS), `gcloud` CLI, `firebase` CLI. Run `gcloud auth login` and `firebase login`.
6. Open the cloned repo folder in IBM Bob.

---

## 4. Prompt sequence for IBM Bob

Run these **in order**, one at a time, in the same Bob session/project so it retains context. Steps 1 is best run in **Architect Mode** (planning); the rest in **Code Mode** (implementation). Review and run/test each step before moving to the next.

### Prompt 1 — Project scaffolding & architecture (Architect Mode)

```
I'm building a Carbon Footprint Awareness web app — v1/MVP scope only.

Goal: users take a baseline carbon quiz and get a starting "Carbon Score",
log daily activities (transport/food/energy/shopping) and see the
estimated CO2 impact, view a dashboard with trends and a category
breakdown, and receive 3-5 rule-based personalized tips per week. Real
user accounts via Firebase Authentication.

Hard constraints: must run entirely on Google Cloud's Always Free tier
and Firebase's Spark plan. Backend on Cloud Run, frontend on Firebase
Hosting, data in Firestore (Native mode), auth via Firebase
Authentication. No paid APIs, no ML services, no third-party
integrations (banking, smart home, etc.).

Stack: TypeScript throughout. React + Vite for the frontend, Tailwind
CSS for styling, Recharts for charts. Node.js + Express for the backend
API. npm workspaces monorepo with /frontend, /backend, /shared.

Please:
1. Propose a monorepo folder structure.
2. Set up npm workspaces, TypeScript configs, ESLint/Prettier, .gitignore.
3. Write an ARCHITECTURE.md describing the data flow, the Firestore
   collections at a high level, and how frontend/backend/Firebase fit
   together.
4. Create a placeholder README.md with setup instructions.

Don't implement features yet — scaffolding and docs only. If anything is
ambiguous, confirm the plan with me before generating files.
```

### Prompt 2 — Backend skeleton & Firestore data model (Code Mode)

```
Now build the backend API skeleton in /backend (Node.js + Express +
TypeScript).

1. Initialize Firebase Admin SDK — read service account credentials from
   GOOGLE_APPLICATION_CREDENTIALS for local dev, and rely on Cloud Run's
   default service account in production.
2. Define Firestore collections and TypeScript interfaces in
   /shared/types:
   - users/{uid}: profile, quiz answers, baseline carbon score,
     current score, goal target, quizCompleted flag
   - activityLogs/{uid}/entries/{entryId}: date, category
     (transport/food/energy/shopping), activityType, quantity, unit,
     co2Kg, createdAt
   - emissionFactors: static reference data — category, activityType,
     unit, kgCO2PerUnit
   - tips: static pool of tip templates with trigger conditions
3. Create an emission calculation utility: given category/activityType/
   quantity, look up the matching factor and return kgCO2.
4. Add Express routes: GET /health, and stub routes for /quiz, /logs,
   /dashboard, /tips returning "not implemented" placeholders.
5. Write a seed script that loads starter emissionFactors and tips data
   into Firestore (document your source/assumptions for each factor in
   comments — use widely-cited public averages, e.g. EPA/DEFRA-style
   figures).
6. Write Firestore security rules (/firebase/firestore.rules): users can
   only read/write their own user doc and activityLogs; emissionFactors
   and tips are readable by any authenticated user, writable by no one
   from the client.
7. Set up the Firestore emulator (firebase.json + emulator config) for
   local development.
```

### Prompt 3 — Authentication (Code Mode)

```
Add Firebase Authentication (email/password) end to end.

Frontend (/frontend):
1. Initialize the Firebase client SDK from environment variables.
2. Build Sign Up, Log In, and Log Out flows using a React auth context/
   provider that exposes the current user and a fresh ID token.
3. Add a protected-route wrapper that redirects unauthenticated users to
   the login page.

Backend (/backend):
4. Add Express middleware that verifies the Firebase ID token from the
   Authorization: Bearer <token> header via Firebase Admin SDK and
   attaches the decoded uid to req.user.
5. Protect all routes except /health with this middleware.
6. On first sign-in, create the user's users/{uid} Firestore document
   with defaults: quizCompleted: false, baselineScore: null,
   currentScore: null, goalTarget: null.

Keep the UI minimal — plain forms, no styling polish yet.
```

### Prompt 4 — Onboarding quiz & baseline Carbon Score (Code Mode)

```
Implement the onboarding lifestyle quiz and baseline Carbon Score.

1. Define ~8-10 quiz questions in /shared covering transport (commute
   mode/distance/frequency), diet (meat consumption frequency), home
   energy (heating type, household size), and shopping habits, with
   answer options and scoring weights.
2. Build a multi-step quiz UI (one question per screen with a progress
   indicator). Show it automatically for users where quizCompleted is
   false; skip it otherwise.
3. POST /quiz on the backend should:
   - Estimate a weekly/annual CO2 footprint from the answers using
     simple documented assumptions (comment your formula).
   - Convert that into a 0-100 "Carbon Score" (lower footprint = higher
     score) — define and document the formula clearly.
   - Save answers, baselineScore, currentScore (= baselineScore
     initially), and footprint estimate to the user's Firestore doc; set
     quizCompleted: true.
4. Show a results screen with the score and a simple comparison to a
   hardcoded reference "national average" figure (include a source
   comment for the figure).
5. Let the user pick a reduction goal (5/10/15% over 3 months) and save
   it to goalTarget.
```

### Prompt 5 — Daily activity logging (Code Mode)

```
Build daily activity logging.

1. Frontend "Log Activity" screen with quick-select categories
   (Transport, Food, Energy, Shopping) and common activity types per
   category, e.g.:
   - Transport: car/bus/train/bike/walk + distance (km)
   - Food: meal type with a meat/veg toggle
   - Energy: electricity usage (kWh) or a "typical day" quick option
   - Shopping: item category with a rough quantity/cost-based estimate
2. POST /logs/entries — validate input, look up the matching
   emissionFactors doc, compute co2Kg using the utility from Prompt 2,
   and write to activityLogs/{uid}/entries.
3. GET /logs/entries?date=YYYY-MM-DD — return that day's entries plus
   totals per category.
4. DELETE /logs/entries/:id — let users remove a mis-logged entry.
5. Frontend "Today" view: entries grouped by category, running total vs.
   a daily target derived from (baseline annual footprint / 365),
   adjusted down by the user's goal percentage.
```

### Prompt 6 — Dashboard (Code Mode)

```
Build the main dashboard.

1. GET /dashboard/summary?range=week|month — aggregate activityLogs over
   the range and return: total CO2, percentage breakdown by category,
   daily totals (for charting), and progress toward the user's goal (%
   reduction vs. baseline). Update and return the user's currentScore
   based on recent activity.
2. Frontend dashboard page:
   - Carbon Score display (current vs. baseline, with delta)
   - Line/area chart of daily totals over the selected range (Recharts)
   - Pie or bar chart of category breakdown
   - Goal progress bar
   - Week/month range toggle
3. Keep all aggregation logic in the backend; the frontend only renders
   returned data.
4. Handle the empty state for brand-new users (no logs yet) with an
   encouraging message and a call-to-action to log their first activity.
```

### Prompt 7 — Personalized tips (Code Mode)

```
Add rule-based personalized tips (3-5 per week, no ML).

1. Define a small library of tip rules in /shared/tips. Each rule has a
   condition (e.g., "transport > 40% of weekly total", "red meat logged
   3+ times this week", "no logs in the last 2 days") plus a tip message
   and an estimated CO2 savings if followed.
2. GET /tips — evaluate the current week's aggregated data against all
   rules and return the top 3-5 matches; fall back to a default rotating
   set of general tips if fewer than 3 rules match.
3. Frontend "Tips for you" section (dashboard card or dedicated page)
   showing each tip with its estimated impact (e.g., "Save ~0.7 kg
   CO2/day").
4. Keep all copy positive and non-judgmental — frame tips as
   opportunities, never as criticism.
```

### Prompt 8 — UI polish & design system (Code Mode)

```
Polish the UI/UX following these principles: simplicity (one-tap
logging), positivity (no guilt-based language), tangibility (translate
CO2 numbers into relatable comparisons), accessibility (works for
complete beginners).

1. Define a small Tailwind-based design system: a palette built on
   greens for good progress and neutral grays (avoid red/alarm tones for
   normal states), a typography scale, and consistent spacing.
2. Add a "CO2 translator" utility that converts a kg CO2 figure into a
   relatable comparison string (e.g., equivalent km driven), and use it
   anywhere a CO2 total is displayed.
3. Add an "Earth Health Meter" component — a horizontal gauge from green
   to yellow reflecting the user's current Carbon Score — and place it on
   the dashboard.
4. Make the layout responsive for mobile and desktop.
5. Add loading and error states for every data-fetching screen.
6. Review empty/zero states across quiz, logging, dashboard, and tips.
```

### Prompt 9 — Containerization & CI/CD (Code Mode)

```
Prepare the project for deployment, staying within Always Free tier
limits.

1. Write a multi-stage Dockerfile for /backend (Node 20-alpine,
   production deps only) suitable for Cloud Run, plus a .dockerignore.
2. Write firebase.json hosting config for /frontend (Vite build output,
   SPA rewrites to index.html).
3. Add GitHub Actions workflows under /.github/workflows:
   - backend-deploy.yml: on push to main affecting backend/**, build and
     push the image to Artifact Registry, then deploy to Cloud Run in
     us-central1 with min-instances=0, max-instances=2, memory 256-512Mi,
     using a service account key stored in GitHub Secrets.
   - frontend-deploy.yml: on push to main affecting frontend/**, build
     the Vite app and deploy to Firebase Hosting using a Firebase CI
     token stored in GitHub Secrets.
4. Add a root .env.example documenting every required environment
   variable (Firebase config keys, project ID, etc.) with placeholder
   values only.
5. Update README.md with step-by-step setup instructions: enabling
   required APIs (Cloud Run, Artifact Registry, Firestore, Identity
   Platform), creating a deploy service account with minimal roles, and
   adding the GitHub Secrets these workflows need.
```

### Prompt 10 — First deploy & free-tier safety checklist (Code Mode)

```
Help me do the first deployment and verify free-tier safety.

1. Give me a checklist (not code) of the exact gcloud and firebase CLI
   commands to: confirm required APIs are enabled, deploy Firestore
   security rules and run the seed script against production, and
   trigger both GitHub Actions workflows for the first deploy.
2. Add a backend startup check that logs a clear warning if any required
   environment variable is missing, so misconfiguration fails fast.
3. Describe (no code needed) how to set up a Cloud Billing budget alert
   at $0.01 and $1 if I haven't already.
4. Write a TESTING.md with a manual smoke-test checklist: sign up, quiz
   completion, logging one activity per category, dashboard rendering,
   tips rendering, sign out/sign in persistence.
5. Summarize the Always Free / Spark limits I should watch for this
   stack — Cloud Run requests & vCPU-seconds, Firestore reads/writes per
   day, Firebase Hosting bandwidth — and how I'd notice if I'm getting
   close to any of them.
```

---

## 5. After v1 is live

Once the smoke tests pass and the app has run for a few days without billing alerts firing, you've validated the free-tier architecture. From here, Phase 2 candidates from the original doc (education hub, challenges, community feed, gamification) can be layered on as new Bob prompts — each should get its own free-tier cost check before you start, since social/gamification features tend to increase Firestore read/write volume quickly.
