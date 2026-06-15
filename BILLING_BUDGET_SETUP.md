# Cloud Billing Budget Alert Setup

This guide walks you through setting up billing budget alerts to monitor your Google Cloud spending and ensure you stay within the Always Free tier limits.

## Why Set Up Budget Alerts?

Even though this application is designed to run entirely within free tier limits, budget alerts provide:
- **Early warning** if usage unexpectedly increases
- **Peace of mind** with automatic notifications
- **Cost control** to prevent surprise charges

## Recommended Alert Thresholds

For this Carbon Footprint Tracker application, we recommend:
- **$0.01 alert**: Catches any charges immediately (you should stay at $0)
- **$1.00 alert**: Safety net for unexpected usage spikes

---

## Option 1: Set Up via Google Cloud Console (Recommended)

### Step 1: Access Billing

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the hamburger menu (☰) in the top-left
3. Navigate to **Billing** → **Budgets & alerts**
4. Click **CREATE BUDGET**

### Step 2: Configure Budget Scope

1. **Name your budget**: `CFT Free Tier Alert`
2. **Select projects**: Choose your Carbon Footprint Tracker project
3. **Select services**: 
   - Leave as "All services" (recommended) OR
   - Select specific services:
     - Cloud Run
     - Cloud Firestore
     - Firebase Hosting
     - Artifact Registry
4. Click **NEXT**

### Step 3: Set Budget Amount

1. **Budget type**: Select "Specified amount"
2. **Target amount**: Enter `1` (USD)
3. **Budget period**: Select "Monthly"
4. Click **NEXT**

### Step 4: Configure Alert Thresholds

Set up multiple alert thresholds:

1. **First Alert (1% = $0.01)**:
   - Threshold: `1%` of budget
   - Trigger on: `Actual spend`
   - This alerts you immediately if ANY charges occur

2. **Second Alert (10% = $0.10)**:
   - Click **ADD THRESHOLD RULE**
   - Threshold: `10%` of budget
   - Trigger on: `Actual spend`

3. **Third Alert (50% = $0.50)**:
   - Click **ADD THRESHOLD RULE**
   - Threshold: `50%` of budget
   - Trigger on: `Actual spend`

4. **Fourth Alert (90% = $0.90)**:
   - Click **ADD THRESHOLD RULE**
   - Threshold: `90%` of budget
   - Trigger on: `Actual spend`

5. **Fifth Alert (100% = $1.00)**:
   - Click **ADD THRESHOLD RULE**
   - Threshold: `100%` of budget
   - Trigger on: `Actual spend`

6. **Forecasted Alert (100%)**:
   - Click **ADD THRESHOLD RULE**
   - Threshold: `100%` of budget
   - Trigger on: `Forecasted spend`
   - This predicts if you'll exceed the budget

### Step 5: Set Up Notifications

1. **Email alerts**: Check the box for "Email alerts to billing admins and users"
2. **Additional recipients** (optional): Add email addresses for team members
3. **Pub/Sub notifications** (optional): Skip for now unless you want programmatic alerts
4. Click **FINISH**

---

## Option 2: Set Up via gcloud CLI

If you prefer command-line setup:

```bash
# First, get your billing account ID
gcloud billing accounts list

# Set your billing account ID (replace with your actual ID)
BILLING_ACCOUNT_ID="XXXXXX-XXXXXX-XXXXXX"

# Create budget with multiple thresholds
gcloud billing budgets create \
  --billing-account=$BILLING_ACCOUNT_ID \
  --display-name="CFT Free Tier Alert" \
  --budget-amount=1USD \
  --threshold-rule=percent=1 \
  --threshold-rule=percent=10 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100 \
  --threshold-rule=percent=100,basis=forecasted-spend

# Verify budget was created
gcloud billing budgets list --billing-account=$BILLING_ACCOUNT_ID
```

**Note**: Email notifications are automatically sent to billing account admins. To add additional email recipients, you'll need to use the Cloud Console or configure Pub/Sub notifications.

---

## Option 3: Set Up via Terraform (For Infrastructure as Code)

If you're using Terraform to manage your infrastructure:

```hcl
# budget.tf

data "google_billing_account" "account" {
  billing_account = "XXXXXX-XXXXXX-XXXXXX"  # Replace with your billing account ID
}

resource "google_billing_budget" "cft_budget" {
  billing_account = data.google_billing_account.account.id
  display_name    = "CFT Free Tier Alert"

  budget_filter {
    projects = ["projects/${var.project_id}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = "1"
    }
  }

  threshold_rules {
    threshold_percent = 0.01  # $0.01
  }

  threshold_rules {
    threshold_percent = 0.10  # $0.10
  }

  threshold_rules {
    threshold_percent = 0.50  # $0.50
  }

  threshold_rules {
    threshold_percent = 0.90  # $0.90
  }

  threshold_rules {
    threshold_percent = 1.0   # $1.00
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "FORECASTED_SPEND"
  }

  all_updates_rule {
    monitoring_notification_channels = []
    disable_default_iam_recipients   = false
  }
}
```

---

## Verifying Your Budget Alerts

After setup, verify your budget is active:

### Via Console:
1. Go to **Billing** → **Budgets & alerts**
2. You should see "CFT Free Tier Alert" listed
3. Click on it to view details and threshold rules

### Via CLI:
```bash
# List all budgets
gcloud billing budgets list --billing-account=$BILLING_ACCOUNT_ID

# Get details of a specific budget
gcloud billing budgets describe BUDGET_ID --billing-account=$BILLING_ACCOUNT_ID
```

---

## What to Do When You Receive an Alert

### If you receive a $0.01 alert:

1. **Don't panic** - Small charges can occur during initial setup
2. **Check the Billing Report**:
   - Go to **Billing** → **Reports**
   - Filter by date range and service
   - Identify which service caused the charge

3. **Common causes**:
   - Cloud Run cold starts during initial deployment
   - Artifact Registry storage (minimal)
   - Cloud Build minutes (if manually building)
   - Firestore operations exceeding free tier

4. **Verify free tier usage**:
   - Check Cloud Run: Should be well under 2M requests/month
   - Check Firestore: Should be under 50K reads, 20K writes per day
   - Check Firebase Hosting: Should be under 360MB/day transfer

### If charges continue:

1. **Review your configuration**:
   - Ensure Cloud Run min-instances is set to 0
   - Verify max-instances is set to 2
   - Check that memory is set to 256Mi

2. **Check for runaway processes**:
   - Review Cloud Run logs for errors causing retries
   - Check for infinite loops or excessive API calls

3. **Consider scaling down**:
   - Temporarily disable the service if needed
   - Review and optimize code for efficiency

---

## Additional Cost Monitoring

### Set Up Cost Breakdown Alerts

1. Go to **Billing** → **Reports**
2. Use filters to view costs by:
   - Service (Cloud Run, Firestore, etc.)
   - Project
   - Time range

### Enable Billing Export (Optional)

For detailed cost analysis:

1. Go to **Billing** → **Billing export**
2. Set up export to BigQuery (free tier available)
3. Create custom queries to analyze spending patterns

### Use Cloud Monitoring (Optional)

Set up custom dashboards:

```bash
# Create a dashboard for key metrics
gcloud monitoring dashboards create --config-from-file=dashboard.json
```

---

## Free Tier Limits Reference

Keep these limits in mind:

### Cloud Run (Always Free):
- 2 million requests per month
- 360,000 GB-seconds of memory per month
- 180,000 vCPU-seconds per month
- 1 GB network egress per month (North America)

### Firestore (Spark Plan):
- 50,000 document reads per day
- 20,000 document writes per day
- 20,000 document deletes per day
- 1 GB stored data

### Firebase Hosting (Spark Plan):
- 10 GB storage
- 360 MB per day transfer
- Custom domain and SSL included

### Firebase Authentication (Spark Plan):
- Unlimited users
- Email/password and Google Sign-In included

---

## Troubleshooting

### "I don't see the Billing section in my console"

- Ensure you have billing permissions on the project
- You may need to be added as a Billing Account Administrator

### "Budget alerts aren't being sent"

- Check your email spam folder
- Verify email addresses in budget configuration
- Ensure billing account has valid payment method (even for free tier)

### "I want to delete a budget"

Via Console:
1. Go to **Billing** → **Budgets & alerts**
2. Click the three dots (⋮) next to the budget
3. Select **Delete**

Via CLI:
```bash
gcloud billing budgets delete BUDGET_ID --billing-account=$BILLING_ACCOUNT_ID
```

---

## Best Practices

1. **Set up alerts immediately** after creating your project
2. **Review billing reports weekly** during initial deployment
3. **Monitor usage trends** in Firebase and GCP consoles
4. **Keep budget thresholds conservative** ($1 is plenty for this app)
5. **Document any expected charges** if you add paid features
6. **Test in development** before deploying changes that might increase usage

---

## Summary

✅ **Recommended Setup:**
- Budget amount: $1.00 USD per month
- Alert thresholds: 1%, 10%, 50%, 90%, 100% (actual), 100% (forecast)
- Email notifications enabled
- Project-specific scope

This configuration ensures you'll be notified immediately if any charges occur, giving you time to investigate and adjust before costs accumulate.

For ongoing monitoring, see **FREE_TIER_LIMITS.md** for detailed usage tracking guidance.
