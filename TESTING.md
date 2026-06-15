# Manual Testing Guide

This document provides comprehensive manual smoke tests to verify that the Carbon Footprint Tracker application is working correctly after deployment.

## Pre-Testing Checklist

Before starting tests, ensure:
- [ ] Backend is deployed and health endpoint responds
- [ ] Frontend is deployed and accessible
- [ ] Firestore security rules are deployed
- [ ] Database is seeded with emission factors and tip templates
- [ ] You have a test email address available (not your primary account)

---

## Test Environment Setup

### Test User Credentials

Create a dedicated test account for these tests:
- **Email**: `test-user-[timestamp]@example.com` (use a real email you can access)
- **Password**: Use a strong test password (min 6 characters)

### Browser Setup

- Use an incognito/private window to avoid cached data
- Open browser developer tools (F12) to monitor console for errors
- Keep the Network tab open to verify API calls

---

## Smoke Test Suite

### Test 1: User Sign Up ✅

**Objective**: Verify new user registration works correctly

**Steps**:
1. Navigate to the frontend URL (e.g., `https://your-project-id.web.app`)
2. Click "Sign Up" or navigate to the sign-up page
3. Enter test email address
4. Enter a strong password (min 6 characters)
5. Confirm password
6. Click "Sign Up" button

**Expected Results**:
- [ ] Sign-up form validates input (shows errors for invalid email/weak password)
- [ ] Loading indicator appears during sign-up
- [ ] User is successfully created
- [ ] User is automatically logged in after sign-up
- [ ] User is redirected to the quiz page (first-time user flow)
- [ ] No console errors appear
- [ ] Firebase Authentication shows the new user in the console

**Failure Scenarios to Test**:
- [ ] Invalid email format shows error
- [ ] Password too short shows error
- [ ] Passwords don't match shows error
- [ ] Duplicate email shows appropriate error

---

### Test 2: Baseline Carbon Quiz Completion ✅

**Objective**: Verify quiz functionality and score calculation

**Steps**:
1. After sign-up, you should be on the quiz page
2. Read the quiz introduction
3. Answer all quiz questions (select various options to test different scenarios)
4. Click "Submit Quiz" or "Complete Quiz" button

**Test Scenarios**:

**Scenario A: High Carbon Footprint**
- Transport: Car (daily), Long flights (monthly)
- Food: Beef (daily), Dairy products (daily)
- Energy: High electricity usage, No renewable energy
- Shopping: Frequent new purchases

**Scenario B: Low Carbon Footprint**
- Transport: Public transit, Bike/walk
- Food: Vegetarian/vegan meals
- Energy: Low usage, Renewable energy
- Shopping: Minimal purchases, secondhand items

**Expected Results**:
- [ ] All questions are displayed correctly
- [ ] Can select answers for each question
- [ ] Cannot submit until all questions are answered
- [ ] Loading indicator appears during submission
- [ ] Quiz results page displays with:
  - [ ] Total carbon footprint score (kg CO2/year)
  - [ ] Comparison to average (e.g., "20% below average")
  - [ ] Category breakdown (transport, food, energy, shopping)
  - [ ] Visual representation (chart/graph)
- [ ] Score is saved to Firestore (check in Firebase Console)
- [ ] User is redirected to dashboard after viewing results
- [ ] No console errors

**Verify in Firestore**:
- Navigate to Firebase Console > Firestore Database
- Find your user document in `users/{userId}`
- Verify `baselineScore` field is populated with quiz results

---

### Test 3: Activity Logging - Transport Category ✅

**Objective**: Verify activity logging for transport activities

**Steps**:
1. Navigate to "Log Activity" page
2. Select "Transport" category
3. Log the following activities:

**Activity 1: Car Trip**
- Activity type: Car
- Distance: 25 km
- Notes: "Commute to work"
- Click "Log Activity"

**Activity 2: Public Transit**
- Activity type: Bus
- Distance: 10 km
- Notes: "Grocery shopping"
- Click "Log Activity"

**Activity 3: Zero Emission**
- Activity type: Bike
- Distance: 5 km
- Notes: "Evening ride"
- Click "Log Activity"

**Expected Results**:
- [ ] Activity form displays correctly
- [ ] Can select activity type from dropdown
- [ ] Can enter distance (numeric input)
- [ ] Can add optional notes
- [ ] Loading indicator appears during submission
- [ ] Success message appears after logging
- [ ] Activity appears in activity list/history
- [ ] CO2 emissions are calculated and displayed
- [ ] Dashboard updates with new data
- [ ] No console errors

**Verify Calculations**:
- Car (25 km × 0.192 kg/km) = ~4.8 kg CO2
- Bus (10 km × 0.089 kg/km) = ~0.89 kg CO2
- Bike (5 km × 0 kg/km) = 0 kg CO2

---

### Test 4: Activity Logging - Food Category ✅

**Objective**: Verify activity logging for food activities

**Steps**:
1. Navigate to "Log Activity" page
2. Select "Food" category
3. Log the following meals:

**Meal 1: Beef**
- Activity type: Beef
- Quantity: 1 serving
- Notes: "Lunch"
- Click "Log Activity"

**Meal 2: Vegetarian**
- Activity type: Vegetarian meal
- Quantity: 1 meal
- Notes: "Dinner"
- Click "Log Activity"

**Expected Results**:
- [ ] Food category displays correctly
- [ ] Can select meal type from dropdown
- [ ] Can enter quantity (servings)
- [ ] Activity logs successfully
- [ ] Emissions calculated correctly
- [ ] Dashboard updates

**Verify Calculations**:
- Beef (1 serving × 6.61 kg/serving) = ~6.61 kg CO2
- Vegetarian (1 meal × 0.39 kg/meal) = ~0.39 kg CO2

---

### Test 5: Activity Logging - Energy Category ✅

**Objective**: Verify activity logging for energy usage

**Steps**:
1. Navigate to "Log Activity" page
2. Select "Energy" category
3. Log the following:

**Activity 1: Electricity**
- Activity type: Electricity
- Amount: 50 kWh
- Notes: "Monthly usage"
- Click "Log Activity"

**Activity 2: Renewable Energy**
- Activity type: Renewable electricity
- Amount: 30 kWh
- Notes: "Solar panels"
- Click "Log Activity"

**Expected Results**:
- [ ] Energy category displays correctly
- [ ] Can enter kWh amount
- [ ] Activity logs successfully
- [ ] Emissions calculated correctly
- [ ] Dashboard updates

**Verify Calculations**:
- Electricity (50 kWh × 0.385 kg/kWh) = ~19.25 kg CO2
- Renewable (30 kWh × 0 kg/kWh) = 0 kg CO2

---

### Test 6: Activity Logging - Shopping Category ✅

**Objective**: Verify activity logging for shopping activities

**Steps**:
1. Navigate to "Log Activity" page
2. Select "Shopping" category
3. Log the following:

**Purchase 1: New Clothing**
- Activity type: New clothing
- Quantity: 2 items
- Notes: "T-shirts"
- Click "Log Activity"

**Purchase 2: Secondhand**
- Activity type: Secondhand clothing
- Quantity: 1 item
- Notes: "Jacket from thrift store"
- Click "Log Activity"

**Expected Results**:
- [ ] Shopping category displays correctly
- [ ] Can select item type
- [ ] Can enter quantity
- [ ] Activity logs successfully
- [ ] Emissions calculated correctly
- [ ] Dashboard updates

**Verify Calculations**:
- New clothing (2 items × 5.5 kg/item) = ~11 kg CO2
- Secondhand (1 item × 0.5 kg/item) = ~0.5 kg CO2

---

### Test 7: Dashboard Rendering ✅

**Objective**: Verify dashboard displays all data correctly

**Steps**:
1. Navigate to Dashboard page
2. Review all dashboard components

**Expected Results**:

**Overall Metrics**:
- [ ] Total carbon footprint displays (sum of all activities)
- [ ] Baseline score displays (from quiz)
- [ ] Comparison to baseline shows (e.g., "+15% above baseline")
- [ ] Time period selector works (Today, Week, Month, All Time)

**Category Breakdown**:
- [ ] Transport emissions display correctly
- [ ] Food emissions display correctly
- [ ] Energy emissions display correctly
- [ ] Shopping emissions display correctly
- [ ] Percentages add up to 100%

**Charts and Visualizations**:
- [ ] Pie chart shows category distribution
- [ ] Line chart shows emissions over time
- [ ] Bar chart shows daily/weekly trends
- [ ] Charts are interactive (hover shows details)
- [ ] Charts update when time period changes

**Recent Activities**:
- [ ] List of recent activities displays
- [ ] Activities show correct date/time
- [ ] Activities show correct emissions
- [ ] Activities show category icons/colors
- [ ] Can view activity details

**Earth Health Meter** (if implemented):
- [ ] Visual indicator shows environmental impact
- [ ] Updates based on total emissions
- [ ] Shows encouraging/warning messages

---

### Test 8: Tips Section Rendering ✅

**Objective**: Verify personalized tips are generated and displayed

**Steps**:
1. Navigate to Tips page or Tips section on Dashboard
2. Review displayed tips

**Expected Results**:
- [ ] 3-5 tips are displayed
- [ ] Tips are relevant to logged activities (e.g., transport tips if you logged car trips)
- [ ] Each tip includes:
  - [ ] Title
  - [ ] Description
  - [ ] Actionable steps (bullet points)
  - [ ] Potential savings percentage
  - [ ] Source/reference
- [ ] Tips are prioritized (high priority tips shown first)
- [ ] Tips update as you log more activities
- [ ] No duplicate tips appear
- [ ] Tips are readable and well-formatted

**Verify Tip Logic**:
- If you logged beef meals → Should see "Reduce Beef Consumption" tip
- If you logged car trips → Should see transport-related tips
- If you logged high electricity → Should see energy efficiency tips

---

### Test 9: Sign Out ✅

**Objective**: Verify sign-out functionality

**Steps**:
1. Click "Sign Out" or "Logout" button
2. Observe behavior

**Expected Results**:
- [ ] User is signed out successfully
- [ ] Redirected to login/home page
- [ ] Cannot access protected routes (dashboard, log activity)
- [ ] Session is cleared (no cached data)
- [ ] No console errors

---

### Test 10: Sign In Persistence ✅

**Objective**: Verify user can sign back in and data persists

**Steps**:
1. Navigate to login page
2. Enter test user credentials
3. Click "Sign In"
4. Navigate through the app

**Expected Results**:
- [ ] User can sign in with correct credentials
- [ ] Invalid credentials show error message
- [ ] After sign-in, user is redirected to dashboard
- [ ] All previously logged activities are still visible
- [ ] Baseline quiz score is preserved
- [ ] Dashboard shows correct historical data
- [ ] Tips are still personalized based on history
- [ ] No data loss occurred

**Verify Data Persistence**:
- Check that activity count matches what you logged
- Verify total emissions match previous session
- Confirm quiz results are unchanged

---

### Test 11: Today View ✅

**Objective**: Verify today's activity view works correctly

**Steps**:
1. Navigate to "Today" or "Today's Activities" page
2. Review displayed information

**Expected Results**:
- [ ] Shows only activities logged today
- [ ] Displays today's total emissions
- [ ] Shows comparison to daily average
- [ ] Quick log button works
- [ ] Empty state shows if no activities today
- [ ] Date is clearly displayed

---

### Test 12: Error Handling ✅

**Objective**: Verify app handles errors gracefully

**Test Scenarios**:

**Scenario A: Network Error**
1. Disconnect from internet
2. Try to log an activity
3. Expected: Error message displays, app doesn't crash

**Scenario B: Invalid Input**
1. Try to log activity with negative distance
2. Expected: Validation error shows

**Scenario C: Backend Unavailable**
1. If backend is down, frontend should show appropriate error
2. Expected: User-friendly error message, not technical stack trace

**Expected Results**:
- [ ] Error messages are user-friendly
- [ ] App doesn't crash on errors
- [ ] User can recover from errors
- [ ] Console shows helpful debug info (in dev mode)

---

## Performance Tests

### Test 13: Load Time ✅

**Objective**: Verify app loads quickly

**Steps**:
1. Clear browser cache
2. Navigate to app URL
3. Measure load time using browser DevTools

**Expected Results**:
- [ ] Initial page load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] Dashboard loads < 2 seconds after login
- [ ] No unnecessary API calls
- [ ] Images/assets load efficiently

---

### Test 14: Responsiveness ✅

**Objective**: Verify app works on different screen sizes

**Test Devices**:
1. Desktop (1920×1080)
2. Tablet (768×1024)
3. Mobile (375×667)

**Expected Results**:
- [ ] Layout adapts to screen size
- [ ] All buttons are clickable
- [ ] Text is readable
- [ ] Charts resize appropriately
- [ ] Navigation works on mobile
- [ ] No horizontal scrolling (unless intended)

---

## Security Tests

### Test 15: Authentication Protection ✅

**Objective**: Verify protected routes require authentication

**Steps**:
1. Sign out
2. Try to access protected URLs directly:
   - `/dashboard`
   - `/log-activity`
   - `/tips`

**Expected Results**:
- [ ] Redirected to login page
- [ ] Cannot access protected content
- [ ] URL changes to login page
- [ ] After login, redirected to intended page

---

### Test 16: Data Privacy ✅

**Objective**: Verify users can only see their own data

**Steps**:
1. Create a second test user
2. Log some activities with second user
3. Sign out and sign in with first user
4. Check dashboard and activity list

**Expected Results**:
- [ ] First user only sees their own activities
- [ ] No data leakage between users
- [ ] Firestore rules prevent unauthorized access

---

## Post-Testing Checklist

After completing all tests:

- [ ] All critical tests passed
- [ ] No console errors during normal usage
- [ ] Data persists correctly in Firestore
- [ ] Performance is acceptable
- [ ] Mobile experience is good
- [ ] Error handling works
- [ ] Security measures are effective

---

## Test Results Template

Use this template to document your test results:

```
Test Date: [Date]
Tester: [Name]
Environment: [Production/Staging]
Browser: [Chrome/Firefox/Safari] [Version]

Test Results:
✅ Test 1: User Sign Up - PASSED
✅ Test 2: Quiz Completion - PASSED
✅ Test 3: Transport Logging - PASSED
✅ Test 4: Food Logging - PASSED
✅ Test 5: Energy Logging - PASSED
✅ Test 6: Shopping Logging - PASSED
✅ Test 7: Dashboard Rendering - PASSED
✅ Test 8: Tips Section - PASSED
✅ Test 9: Sign Out - PASSED
✅ Test 10: Sign In Persistence - PASSED
✅ Test 11: Today View - PASSED
✅ Test 12: Error Handling - PASSED
✅ Test 13: Load Time - PASSED
✅ Test 14: Responsiveness - PASSED
✅ Test 15: Authentication - PASSED
✅ Test 16: Data Privacy - PASSED

Issues Found:
[List any issues discovered]

Notes:
[Additional observations]
```

---

## Automated Testing (Future)

For future improvements, consider adding:
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests using Cypress or Playwright
- Performance monitoring with Lighthouse CI
- Accessibility testing with axe-core

---

## Reporting Issues

If you find bugs during testing:

1. **Document the issue**:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/videos
   - Browser and device info
   - Console errors

2. **Check Firestore Console** for data issues

3. **Check Cloud Run Logs** for backend errors:
   ```bash
   gcloud run services logs read cft-backend --region=us-central1 --limit=100
   ```

4. **Create a GitHub Issue** with all details

---

## Success Criteria

The application is ready for production use when:

✅ All 16 smoke tests pass
✅ No critical bugs found
✅ Performance meets expectations
✅ Security measures verified
✅ Data persistence confirmed
✅ Mobile experience acceptable
✅ Error handling works correctly
