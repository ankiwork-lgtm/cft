# Dashboard Feature Documentation

## Overview

The Dashboard is the main interface for users to view their carbon footprint data, track progress toward goals, and visualize their emissions over time.

## Backend API

### GET /api/dashboard/summary

Retrieves aggregated dashboard data for a specified time range.

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `range` (optional): Time range for data aggregation
  - Values: `week` | `month`
  - Default: `week`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCO2": 45.5,
    "categoryBreakdown": [
      {
        "category": "transport",
        "co2Kg": 20.5,
        "percentage": 45.1
      },
      {
        "category": "food",
        "co2Kg": 15.0,
        "percentage": 33.0
      },
      {
        "category": "energy",
        "co2Kg": 8.0,
        "percentage": 17.6
      },
      {
        "category": "shopping",
        "co2Kg": 2.0,
        "percentage": 4.4
      }
    ],
    "dailyTotals": [
      {
        "date": "2026-06-08",
        "total": 6.5,
        "byCategory": {
          "transport": 3.0,
          "food": 2.5,
          "energy": 1.0,
          "shopping": 0.0
        }
      }
    ],
    "goalProgress": {
      "currentScore": 52,
      "baselineScore": 50,
      "percentageChange": 4.0,
      "goalTarget": 10,
      "progressTowardGoal": 20.0
    },
    "period": {
      "range": "week",
      "startDate": "2026-06-08",
      "endDate": "2026-06-15"
    },
    "hasData": true
  }
}
```

## Frontend Components

### Dashboard Page

**Location:** `frontend/src/pages/Dashboard.tsx`

**Features:**

1. **Carbon Score Display**
   - Shows current score vs. baseline
   - Displays score delta and percentage change
   - Visual indicator (🌟 for improvement, 📊 for decline)

2. **Range Toggle**
   - Switch between week and month views
   - Automatically reloads data when changed

3. **Goal Progress Bar**
   - Shows progress toward user's reduction goal
   - Displays target percentage and achievement percentage
   - Visual progress bar with green fill

4. **Statistics Cards**
   - Total CO₂ emissions for the period
   - Period date range
   - Daily average emissions

5. **Charts**
   - **Daily CO₂ Line Chart**: Shows total emissions over time
   - **Category Pie Chart**: Breakdown by category with percentages
   - **Stacked Bar Chart**: Daily breakdown by all categories
   - **Category Details Table**: Detailed list with colors and values

6. **Empty State**
   - Displayed when user has no activity logs yet
   - Shows baseline score
   - Encourages user to log first activity
   - Provides helpful tips about what to track

## Data Flow

1. **User Authentication**
   - Dashboard checks if user is authenticated
   - Redirects to login if not authenticated

2. **Quiz Completion Check**
   - Verifies user has completed baseline quiz
   - Redirects to quiz if not completed

3. **Data Loading**
   - Fetches dashboard summary from backend API
   - Uses selected range (week/month)
   - Handles loading and error states

4. **Score Calculation**
   - Backend calculates current score based on recent activity
   - Compares to baseline score from quiz
   - Updates user's currentScore in database
   - Returns percentage change and goal progress

5. **Data Visualization**
   - Transforms API data for chart components
   - Uses Recharts library for all visualizations
   - Responsive design adapts to screen size

## Aggregation Logic

The backend performs the following aggregations:

1. **Time Range Filtering**
   - Week: Last 7 days
   - Month: Last 30 days

2. **Category Totals**
   - Sums CO₂ emissions by category
   - Calculates percentage of total for each category

3. **Daily Totals**
   - Groups entries by date
   - Calculates total and per-category emissions for each day
   - Sorts chronologically

4. **Score Calculation**
   - Calculates daily average CO₂ over the period
   - Compares to baseline daily average
   - Adjusts score based on performance
   - Score range: 0-100 (higher is better)

## Score System

### Baseline Score
- Calculated from quiz responses
- Represents user's initial carbon footprint
- Formula: `100 - (userFootprint / nationalAverage * 100)`
- National average: ~6000 kg CO₂/year

### Current Score
- Updated based on actual logged activities
- Reflects recent behavior vs. baseline
- Improves when user emits less than baseline average
- Decreases when user emits more than baseline average

### Goal Progress
- Optional reduction target (e.g., 10% reduction)
- Progress = (actual improvement / target) * 100
- Capped at 100% when goal is achieved

## Color Scheme

Categories use consistent colors throughout:
- **Transport**: Blue (#3b82f6)
- **Food**: Green (#10b981)
- **Energy**: Orange (#f59e0b)
- **Shopping**: Purple (#8b5cf6)

## Error Handling

1. **Authentication Errors**
   - Redirects to login page
   - Shows error message

2. **Data Loading Errors**
   - Displays error banner
   - Allows retry by changing range

3. **Empty State**
   - Gracefully handles no data
   - Provides clear call-to-action

## Performance Considerations

1. **Data Caching**
   - Dashboard data is fetched on mount and range change
   - No automatic refresh (user must manually reload)

2. **Chart Rendering**
   - Uses ResponsiveContainer for adaptive sizing
   - Recharts handles efficient re-rendering

3. **Database Queries**
   - Uses indexed date field for fast filtering
   - Limits query to specific time range
   - Aggregation done in backend to minimize data transfer

## Future Enhancements

1. **Real-time Updates**
   - WebSocket connection for live data
   - Auto-refresh when new activities logged

2. **Comparison Features**
   - Compare to previous periods
   - Compare to other users (anonymized)
   - Compare to national/regional averages

3. **Export Functionality**
   - Download charts as images
   - Export data as CSV/PDF

4. **Custom Date Ranges**
   - Allow user to select specific date ranges
   - Year view option

5. **Insights and Recommendations**
   - AI-powered insights based on patterns
   - Personalized reduction suggestions
   - Achievement badges and milestones

## Testing

To test the dashboard:

1. **With Data:**
   - Complete quiz to set baseline
   - Log several activities across different categories
   - View dashboard to see charts and statistics
   - Toggle between week and month views

2. **Empty State:**
   - Create new user account
   - Complete quiz
   - View dashboard before logging any activities
   - Verify empty state displays correctly

3. **Score Changes:**
   - Log activities with varying CO₂ levels
   - Observe score changes over time
   - Verify goal progress updates correctly

## Made with Bob