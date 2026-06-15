# Always Free / Spark Tier Limits & Monitoring Guide

This document provides a comprehensive overview of the free tier limits for the Carbon Footprint Tracker application and how to monitor your usage to ensure you stay within these limits.

---

## Overview

The Carbon Footprint Tracker is designed to run entirely within free tier limits across three Google Cloud services:

1. **Cloud Run** (Always Free tier)
2. **Firestore** (Spark Plan)
3. **Firebase Hosting** (Spark Plan)
4. **Firebase Authentication** (Spark Plan)

---

## Cloud Run - Always Free Tier

### Monthly Limits

| Resource | Free Tier Limit | Notes |
|----------|----------------|-------|
| **Requests** | 2,000,000 requests/month | ~66,000 requests/day |
| **Memory** | 360,000 GB-seconds/month | With 256Mi: ~1,406,250 seconds/month |
| **CPU** | 180,000 vCPU-seconds/month | With 1 vCPU: ~180,000 seconds/month |
| **Network Egress** | 1 GB/month | North America only |

### Current Configuration

Our backend is configured to maximize free tier usage:
```yaml
Memory: 256Mi (0.25 GB)
CPU: 1 vCPU
Min Instances: 0 (scales to zero when idle)
Max Instances: 2 (prevents runaway scaling)
Region: us-central1 (Always Free eligible)
```

### Usage Calculations

**Example: Typical API Request**
- Duration: ~200ms (0.2 seconds)
- Memory: 256Mi (0.25 GB)
- CPU: 1 vCPU

**Per Request Cost:**
- Memory: 0.2 seconds × 0.25 GB = 0.05 GB-seconds
- CPU: 0.2 seconds × 1 vCPU = 0.2 vCPU-seconds

**Monthly Capacity:**
- Requests: 2,000,000 requests
- Memory: 360,000 GB-seconds ÷ 0.05 = 7,200,000 requests
- CPU: 180,000 vCPU-seconds ÷ 0.2 = 900,000 requests

**Bottleneck: CPU** (900,000 requests/month = ~30,000 requests/day)

### Expected Usage for This App

**Estimated Daily Usage (10 active users):**
- Sign-in: 10 requests
- Dashboard loads: 30 requests (3 per user)
- Activity logging: 40 requests (4 per user)
- Tips fetching: 10 requests
- Quiz submissions: 2 requests
- **Total: ~92 requests/day**

**Monthly projection: ~2,760 requests/month** (well within 900,000 limit)

### How to Monitor Cloud Run Usage

#### Via Google Cloud Console:

1. Navigate to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your `cft-backend` service
3. Go to **METRICS** tab
4. View:
   - Request count
   - Request latency
   - Container instance count
   - Memory utilization
   - CPU utilization

#### Via gcloud CLI:

```bash
# Get service details
gcloud run services describe cft-backend \
  --region=us-central1 \
  --format="table(status.url,status.conditions)"

# View recent logs
gcloud run services logs read cft-backend \
  --region=us-central1 \
  --limit=100

# Get metrics (requires Cloud Monitoring API)
gcloud monitoring time-series list \
  --filter='resource.type="cloud_run_revision"' \
  --format="table(metric.type,points[0].value)"
```

#### Via Cloud Monitoring Dashboard:

1. Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring)
2. Create a custom dashboard with:
   - Cloud Run request count
   - Cloud Run CPU utilization
   - Cloud Run memory utilization
   - Cloud Run billable time

### Warning Signs

🚨 **You're approaching limits if:**
- Request count > 25,000/day (750,000/month)
- CPU usage consistently > 80%
- Memory usage consistently > 200Mi
- Container instances frequently > 1

### Optimization Tips

If you're approaching limits:
1. **Enable caching** for static responses
2. **Optimize database queries** (reduce Firestore reads)
3. **Implement request throttling** for heavy users
4. **Review logs** for inefficient endpoints
5. **Consider pagination** for large data sets

---

## Firestore - Spark Plan

### Daily Limits

| Resource | Free Tier Limit | Notes |
|----------|----------------|-------|
| **Document Reads** | 50,000/day | ~2,083/hour |
| **Document Writes** | 20,000/day | ~833/hour |
| **Document Deletes** | 20,000/day | ~833/hour |
| **Stored Data** | 1 GB | Total database size |
| **Network Egress** | 10 GB/month | Data transferred out |

### Expected Usage for This App

**Per User Per Day:**
- Sign-in: 1 read (user document)
- Dashboard load: 5-10 reads (user + recent activities)
- Activity logging: 2 writes (activity + user update)
- Tips fetching: 10 reads (tip templates)
- Quiz: 1 write (user document update)

**10 Active Users Per Day:**
- Reads: ~150-200/day
- Writes: ~30/day

**Monthly projection:**
- Reads: ~4,500-6,000/month (well within 1,500,000/month limit)
- Writes: ~900/month (well within 600,000/month limit)

### Data Structure Efficiency

Our Firestore structure is optimized for free tier:

```
users/{userId}
  - baselineScore (object)
  - createdAt (timestamp)
  - email (string)
  - lastActive (timestamp)
  
  entries/{entryId}  [subcollection]
    - category (string)
    - activityType (string)
    - amount (number)
    - co2Emissions (number)
    - date (timestamp)

emissionFactors/{factorId}
  - category, activityType, kgCO2PerUnit, etc.

tips/{tipId}
  - category, title, description, etc.
```

**Why this is efficient:**
- User data is denormalized (fewer reads)
- Activities are in subcollections (only load when needed)
- Emission factors and tips are cached client-side
- No complex queries requiring composite indexes

### How to Monitor Firestore Usage

#### Via Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Usage** tab
5. View:
   - Document reads (last 24 hours)
   - Document writes (last 24 hours)
   - Document deletes (last 24 hours)
   - Storage used

#### Via gcloud CLI:

```bash
# Get Firestore usage (requires billing export setup)
gcloud firestore operations list

# Check database size
gcloud firestore databases describe --database=(default)
```

#### Set Up Usage Alerts:

Unfortunately, Firestore doesn't have built-in usage alerts, but you can:

1. **Check daily** in Firebase Console
2. **Export to BigQuery** for analysis (free tier available)
3. **Use Cloud Functions** to monitor and alert (requires Blaze plan)

### Warning Signs

🚨 **You're approaching limits if:**
- Daily reads > 40,000 (80% of limit)
- Daily writes > 16,000 (80% of limit)
- Storage > 800 MB (80% of limit)
- Seeing "quota exceeded" errors

### Optimization Tips

If you're approaching limits:

1. **Implement client-side caching**:
   ```typescript
   // Cache emission factors in localStorage
   const cachedFactors = localStorage.getItem('emissionFactors');
   if (cachedFactors && Date.now() - lastFetch < 24 * 60 * 60 * 1000) {
     return JSON.parse(cachedFactors);
   }
   ```

2. **Batch operations**:
   ```typescript
   // Instead of multiple writes, use batch
   const batch = db.batch();
   batch.set(ref1, data1);
   batch.set(ref2, data2);
   await batch.commit(); // Counts as 2 writes, not 2 separate operations
   ```

3. **Use pagination**:
   ```typescript
   // Load activities in chunks
   const query = collection.limit(20).orderBy('date', 'desc');
   ```

4. **Optimize queries**:
   - Avoid `where` clauses when possible
   - Use subcollections for related data
   - Denormalize data to reduce reads

---

## Firebase Hosting - Spark Plan

### Monthly Limits

| Resource | Free Tier Limit | Notes |
|----------|----------------|-------|
| **Storage** | 10 GB | Total hosted files |
| **Transfer** | 360 MB/day | ~10.8 GB/month |
| **Custom Domain** | 1 domain | SSL included |

### Expected Usage for This App

**Frontend Build Size:**
- HTML/CSS/JS: ~500 KB (gzipped)
- Images/assets: ~200 KB
- Total: ~700 KB

**Per User Per Day:**
- Initial load: ~700 KB
- Subsequent loads: ~50 KB (cached)

**10 Active Users Per Day:**
- New users: 5 × 700 KB = 3.5 MB
- Returning users: 5 × 50 KB = 250 KB
- **Total: ~3.75 MB/day**

**Monthly projection: ~112 MB/month** (well within 10.8 GB limit)

### How to Monitor Firebase Hosting Usage

#### Via Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Hosting**
4. Click **Usage** tab
5. View:
   - Storage used
   - Data transferred (last 30 days)
   - Requests served

#### Via Firebase CLI:

```bash
# Get hosting details
firebase hosting:channel:list

# View deployment history
firebase hosting:clone --only hosting
```

### Warning Signs

🚨 **You're approaching limits if:**
- Daily transfer > 300 MB (83% of limit)
- Storage > 8 GB (80% of limit)
- Seeing slow load times

### Optimization Tips

If you're approaching limits:

1. **Enable compression** (already enabled by default)
2. **Optimize images**:
   ```bash
   # Use WebP format
   # Compress images before deployment
   npm install -g imagemin-cli
   imagemin src/assets/*.png --out-dir=dist/assets
   ```

3. **Implement code splitting**:
   ```typescript
   // Lazy load routes
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

4. **Use CDN caching** (Firebase Hosting has built-in CDN)

5. **Minimize bundle size**:
   ```bash
   # Analyze bundle
   npm run build -- --analyze
   
   # Remove unused dependencies
   npm prune
   ```

---

## Firebase Authentication - Spark Plan

### Limits

| Resource | Free Tier Limit | Notes |
|----------|----------------|-------|
| **Users** | Unlimited | No limit on user count |
| **Sign-ins** | Unlimited | No limit on authentication |
| **Providers** | Multiple | Email, Google, etc. |

### Expected Usage

**No limits to worry about!** Firebase Authentication is completely free for:
- Email/password authentication
- Google Sign-In
- Phone authentication (with reasonable usage)

### How to Monitor Authentication

#### Via Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication**
4. View:
   - Total users
   - Sign-in methods
   - Recent activity

---

## Composite Usage Monitoring

### Daily Monitoring Routine

**Every Morning (5 minutes):**

1. **Check Firebase Console**:
   - Firestore: Usage tab (reads/writes)
   - Hosting: Usage tab (transfer)
   - Authentication: User count

2. **Check Cloud Console**:
   - Cloud Run: Metrics tab (requests)
   - Billing: Reports (should be $0)

3. **Review Logs**:
   ```bash
   # Check for errors
   gcloud run services logs read cft-backend \
     --region=us-central1 \
     --limit=50 \
     | grep ERROR
   ```

### Weekly Monitoring Routine

**Every Monday (15 minutes):**

1. **Generate usage report**:
   - Cloud Run: Total requests this week
   - Firestore: Total reads/writes this week
   - Hosting: Total transfer this week

2. **Compare to limits**:
   - Calculate percentage of free tier used
   - Identify any unusual spikes

3. **Review trends**:
   - Is usage growing?
   - Are there patterns (e.g., weekday vs weekend)?

4. **Check billing**:
   - Verify $0 charges
   - Review any alerts received

### Monthly Monitoring Routine

**First of Each Month (30 minutes):**

1. **Comprehensive review**:
   - Export usage data
   - Create usage graphs
   - Document any issues

2. **Capacity planning**:
   - Project next month's usage
   - Identify optimization opportunities

3. **Update documentation**:
   - Note any changes in usage patterns
   - Update this document if needed

---

## Usage Monitoring Dashboard

### Create a Custom Monitoring Dashboard

```bash
# Create a dashboard configuration
cat > monitoring-dashboard.json << 'EOF'
{
  "displayName": "CFT Free Tier Monitoring",
  "mosaicLayout": {
    "columns": 12,
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Cloud Run Requests",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_revision\"",
                  "aggregation": {
                    "alignmentPeriod": "3600s",
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              }
            }]
          }
        }
      }
    ]
  }
}
EOF

# Create the dashboard
gcloud monitoring dashboards create --config-from-file=monitoring-dashboard.json
```

---

## What to Do If You Exceed Limits

### Firestore Quota Exceeded

**Immediate Actions:**
1. Check for runaway queries in logs
2. Implement client-side caching
3. Reduce query frequency
4. Consider upgrading to Blaze plan (pay-as-you-go)

### Cloud Run Quota Exceeded

**Immediate Actions:**
1. Check for DDoS or abuse
2. Implement rate limiting
3. Optimize slow endpoints
4. Consider upgrading to paid tier

### Firebase Hosting Quota Exceeded

**Immediate Actions:**
1. Check for large file downloads
2. Optimize asset sizes
3. Implement better caching
4. Consider CDN for large assets

---

## Upgrading to Paid Tiers

If your app grows beyond free tier limits:

### Blaze Plan (Pay-as-you-go)

**Costs after free tier:**
- Firestore: $0.06 per 100K reads, $0.18 per 100K writes
- Cloud Run: $0.00002400 per request (after 2M)
- Hosting: $0.15 per GB (after 10 GB)

**Example: 100 active users/day**
- Firestore: ~2,000 reads/day = 60K/month = $0.04/month
- Cloud Run: ~1,000 requests/day = 30K/month = $0 (within free tier)
- Hosting: ~40 MB/day = 1.2 GB/month = $0 (within free tier)
- **Total: ~$0.04/month**

---

## Summary: Key Metrics to Watch

### Critical Thresholds (80% of limit)

| Service | Metric | Threshold | Action |
|---------|--------|-----------|--------|
| Cloud Run | Requests/day | 24,000 | Optimize endpoints |
| Cloud Run | CPU seconds/day | 4,800 | Reduce processing time |
| Firestore | Reads/day | 40,000 | Implement caching |
| Firestore | Writes/day | 16,000 | Batch operations |
| Hosting | Transfer/day | 300 MB | Optimize assets |

### How You'll Notice You're Getting Close

**Cloud Run:**
- Slower response times (CPU throttling)
- "Quota exceeded" errors in logs
- Increased cold start frequency

**Firestore:**
- "Quota exceeded" errors in console
- Failed read/write operations
- Slow query performance

**Firebase Hosting:**
- Slow page loads
- Failed asset downloads
- "Bandwidth exceeded" errors

### Monitoring Tools Summary

1. **Firebase Console**: Daily usage checks (5 min/day)
2. **Cloud Console**: Weekly metrics review (15 min/week)
3. **gcloud CLI**: Automated monitoring scripts
4. **Billing Alerts**: Set at $0.01 and $1.00
5. **Custom Dashboard**: Real-time usage visualization

---

## Conclusion

The Carbon Footprint Tracker is designed to comfortably operate within free tier limits for small to medium usage (up to 50 active users per day). By following the monitoring practices in this guide, you can:

✅ Stay within free tier limits
✅ Detect usage spikes early
✅ Optimize before hitting limits
✅ Scale confidently when needed

**Remember**: The free tier is generous, but monitoring is essential for peace of mind and early detection of issues.
