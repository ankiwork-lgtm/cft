# Daily Activity Logging Feature

## Overview

The Daily Activity Logging feature allows users to track their daily carbon footprint by logging activities across four main categories: Transport, Food, Energy, and Shopping. The system automatically calculates CO2 emissions based on emission factors and provides real-time feedback against daily targets.

## Architecture

### Backend Components

#### 1. Routes (`backend/src/routes/logs.ts`)

Three main endpoints for activity logging:

- **POST /api/logs/entries** - Create a new activity log entry
- **GET /api/logs/entries?date=YYYY-MM-DD** - Retrieve entries for a specific date
- **DELETE /api/logs/entries/:id** - Delete a specific entry

#### 2. Emission Calculator (`backend/src/utils/emissionCalculator.ts`)

Utility functions for CO2 calculations:
- `calculateCO2()` - Calculate emissions based on activity type and quantity
- `validateActivity()` - Verify activity type exists in emission factors
- `getEmissionFactorsByCategory()` - Retrieve factors for a category
- Caching mechanism for emission factors (1-hour TTL)

#### 3. Data Structure

**Firestore Collections:**
```
emissionFactors/
  {factorId}/
    category: string
    activityType: string
    unit: string
    kgCO2PerUnit: number
    source: string
    description: string
    lastUpdated: timestamp

activityLogs/
  {userId}/
    entries/
      {entryId}/
        userId: string
        date: timestamp
        category: string
        activityType: string
        quantity: number
        unit: string
        co2Kg: number
        createdAt: timestamp
        notes: string (optional)
```

### Frontend Components

#### 1. Log Activity Page (`frontend/src/pages/LogActivity.tsx`)

**Features:**
- Category selection with visual icons
- Quick-log buttons with default amounts
- Custom amount entry with activity type selection
- Notes field for additional context
- Real-time success/error feedback

**User Flow:**
1. Select category (Transport, Food, Energy, Shopping)
2. Either:
   - Quick log with default amount, or
   - Select activity type and enter custom amount
3. Optionally add notes
4. Submit to log activity

#### 2. Today View Page (`frontend/src/pages/TodayView.tsx`)

**Features:**
- Daily progress indicator with visual progress bar
- Total CO2 vs. daily target comparison
- Category breakdown (4 categories)
- Entries grouped by category
- Delete functionality for mis-logged entries
- Empty state with call-to-action

**Daily Target Calculation:**
```
Daily Target = (Baseline Score × (1 - Goal Percentage / 100)) / 365
```

#### 3. Dashboard Integration

Updated dashboard includes:
- Quick action buttons for "Log Activity" and "Today's Activities"
- Easy navigation to activity logging features

## Activity Categories

### 1. Transport
- **Car** - 0.192 kg CO2e/km
- **Bus** - 0.089 kg CO2e/km
- **Train** - 0.041 kg CO2e/km
- **Bike** - 0 kg CO2e/km
- **Walk** - 0 kg CO2e/km

### 2. Food
- **Beef Meal** - 6.61 kg CO2e/serving
- **Pork Meal** - 1.72 kg CO2e/serving
- **Chicken Meal** - 0.89 kg CO2e/serving
- **Fish Meal** - 1.24 kg CO2e/serving
- **Vegetarian Meal** - 0.39 kg CO2e/serving
- **Vegan Meal** - 0.29 kg CO2e/serving

### 3. Energy
- **Electricity** - 0.385 kg CO2e/kWh
- **Natural Gas** - 0.185 kg CO2e/kWh
- **Heating** - 0.215 kg CO2e/kWh
- **Cooling** - 0.195 kg CO2e/kWh

### 4. Shopping
- **Clothing** - 5.5 kg CO2e/item
- **Electronics** - 85.0 kg CO2e/item
- **Furniture** - 45.0 kg CO2e/item
- **Other** - 2.5 kg CO2e/item

## API Reference

### POST /api/logs/entries

Create a new activity log entry.

**Request Body:**
```json
{
  "date": "2024-01-15T10:30:00.000Z",
  "category": "transport",
  "activityType": "car",
  "quantity": 15.5,
  "unit": "km",
  "notes": "Commute to work"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "entry123",
    "userId": "user456",
    "date": "2024-01-15T10:30:00.000Z",
    "category": "transport",
    "activityType": "car",
    "quantity": 15.5,
    "unit": "km",
    "co2Kg": 2.976,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "notes": "Commute to work"
  }
}
```

**Error Responses:**
- `400` - Invalid input (missing fields, invalid category, invalid quantity)
- `401` - Unauthorized (user not authenticated)
- `500` - Server error

### GET /api/logs/entries?date=YYYY-MM-DD

Retrieve activity log entries for a specific date.

**Query Parameters:**
- `date` (required) - Date in YYYY-MM-DD format

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "entries": [
      {
        "id": "entry123",
        "userId": "user456",
        "date": "2024-01-15T10:30:00.000Z",
        "category": "transport",
        "activityType": "car",
        "quantity": 15.5,
        "unit": "km",
        "co2Kg": 2.976,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "notes": "Commute to work"
      }
    ],
    "totals": {
      "total": 2.976,
      "byCategory": {
        "transport": 2.976,
        "food": 0,
        "energy": 0,
        "shopping": 0
      }
    },
    "entryCount": 1
  }
}
```

**Error Responses:**
- `400` - Invalid date format
- `401` - Unauthorized
- `500` - Server error

### DELETE /api/logs/entries/:id

Delete a specific activity log entry.

**URL Parameters:**
- `id` (required) - Entry ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Activity log entry deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not entry owner)
- `404` - Entry not found
- `500` - Server error

## Setup Instructions

### 1. Seed Emission Factors

Before using the activity logging feature, populate the emission factors database:

```bash
cd backend
npm run seed:emissions
```

This will create emission factor documents for all activity types across the four categories.

### 2. Environment Variables

Ensure Firebase credentials are configured in `backend/.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### 3. Firestore Indexes

The following composite indexes are required:

```
Collection: activityLogs/{userId}/entries
Fields: date (Ascending), createdAt (Descending)
```

Add to `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "entries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Usage Examples

### Logging a Car Trip

1. Navigate to "Log Activity" from dashboard
2. Select "Transport" category
3. Click "Car" quick-log button (logs 10 km default), or
4. Select "Car" and enter custom distance
5. Optionally add notes
6. Submit

### Viewing Today's Activities

1. Navigate to "Today's Activities" from dashboard
2. View total CO2 and progress against daily target
3. See entries grouped by category
4. Delete any incorrect entries

### Daily Target Calculation Example

If a user has:
- Baseline score: 10,000 kg CO2e/year
- Goal: Reduce by 20%

Daily target = (10,000 × (1 - 20/100)) / 365 = 21.92 kg CO2e/day

## Data Sources

Emission factors are sourced from reputable organizations:

- **Transport**: UK Government GHG Conversion Factors 2023
- **Food**: Our World in Data - Environmental Impacts of Food
- **Energy**: US EPA eGRID 2023, UK Government GHG Conversion Factors
- **Shopping**: Ellen MacArthur Foundation, EPA Electronics Calculator

## Future Enhancements

Potential improvements for the activity logging feature:

1. **Weekly/Monthly Views** - Aggregate data over longer periods
2. **Activity Trends** - Visualize patterns over time
3. **Recurring Activities** - Template for daily commutes
4. **Location-Based Factors** - Region-specific emission factors
5. **Activity Suggestions** - AI-powered recommendations
6. **Social Features** - Compare with friends or community averages
7. **Gamification** - Badges and achievements for low-carbon days
8. **Export Data** - Download activity logs as CSV/PDF
9. **Bulk Import** - Upload activities from other apps
10. **Carbon Offset Integration** - Purchase offsets for logged emissions

## Troubleshooting

### Issue: "No emission factor found" error

**Solution:** Run the emission factors seed script:
```bash
cd backend
npm run seed:emissions
```

### Issue: Entries not appearing in Today view

**Possible causes:**
1. Date mismatch - Check timezone settings
2. Firestore permissions - Verify security rules
3. User authentication - Ensure user is logged in

### Issue: Daily target shows as 0

**Solution:** User needs to complete the baseline quiz first. The daily target is calculated from the quiz results.

## Testing

### Manual Testing Checklist

- [ ] Log activity in each category
- [ ] Verify CO2 calculations are correct
- [ ] Check daily target calculation
- [ ] Test quick-log buttons
- [ ] Test custom amount entry
- [ ] Add and view notes
- [ ] Delete an entry
- [ ] View empty state (no activities)
- [ ] Test date filtering
- [ ] Verify progress bar updates

### API Testing with cURL

**Create Entry:**
```bash
curl -X POST http://localhost:3000/api/logs/entries \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15T10:00:00Z",
    "category": "transport",
    "activityType": "car",
    "quantity": 10,
    "unit": "km"
  }'
```

**Get Entries:**
```bash
curl -X GET "http://localhost:3000/api/logs/entries?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Delete Entry:**
```bash
curl -X DELETE http://localhost:3000/api/logs/entries/ENTRY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Support

For issues or questions about the activity logging feature:
1. Check this documentation
2. Review the API error messages
3. Check browser console for frontend errors
4. Review backend logs for server errors

---

**Made with Bob** - Carbon Footprint Tracker Activity Logging Feature