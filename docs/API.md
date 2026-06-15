# Carbon Footprint Tracker - API Specification

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://[your-cloud-run-url]/api`

## Authentication

All protected endpoints require a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

### Getting an ID Token

Frontend applications can obtain the ID token from Firebase Authentication:

```typescript
import { auth } from './config/firebase';

const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  // Use token in API requests
}
```

## Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional error details
    }
  }
}
```

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User doesn't have permission for this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### API Info

Get API information and available endpoints.

**Endpoint**: `GET /api`

**Authentication**: Not required

**Response**:
```json
{
  "message": "Carbon Footprint Tracker API",
  "version": "1.0.0",
  "endpoints": {
    "quiz": "/api/quiz",
    "activities": "/api/activities",
    "scores": "/api/scores",
    "tips": "/api/tips"
  }
}
```

---

## Quiz Endpoints

### Submit Quiz

Submit baseline carbon footprint quiz responses.

**Endpoint**: `POST /api/quiz`

**Authentication**: Required

**Request Body**:
```json
{
  "responses": {
    "transport_car_miles": 100,
    "transport_flight_hours": 5,
    "food_meat_servings": 7,
    "energy_electricity_kwh": 500,
    "shopping_clothing_items": 3
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "result": {
      "userId": "user123",
      "calculatedScore": 5420.5,
      "breakdown": {
        "transport": 2100.0,
        "food": 1500.5,
        "energy": 1200.0,
        "shopping": 620.0
      },
      "responses": {
        "transport_car_miles": 100,
        "transport_flight_hours": 5,
        "food_meat_servings": 7,
        "energy_electricity_kwh": 500,
        "shopping_clothing_items": 3
      },
      "completedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `400 VALIDATION_ERROR`: Invalid quiz responses
- `401 UNAUTHORIZED`: Missing or invalid token

---

## Activity Endpoints

### Get Activities

Retrieve user's logged activities with optional filters.

**Endpoint**: `GET /api/activities`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string (YYYY-MM-DD) | No | Filter activities from this date |
| `endDate` | string (YYYY-MM-DD) | No | Filter activities until this date |
| `category` | string | No | Filter by category: `transport`, `food`, `energy`, `shopping` |
| `limit` | number | No | Maximum number of results (default: 100) |

**Example Request**:
```
GET /api/activities?startDate=2024-01-01&endDate=2024-01-31&category=transport&limit=50
```

**Response**:
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity123",
        "userId": "user123",
        "date": "2024-01-15T10:30:00.000Z",
        "category": "transport",
        "type": "car",
        "amount": 25,
        "unit": "km",
        "co2Impact": 4.8,
        "notes": "Commute to work",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

### Create Activity

Log a new activity.

**Endpoint**: `POST /api/activities`

**Authentication**: Required

**Request Body**:
```json
{
  "activity": {
    "category": "transport",
    "type": "car",
    "amount": 25,
    "unit": "km",
    "date": "2024-01-15T10:30:00.000Z",
    "notes": "Commute to work"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "activity123",
      "userId": "user123",
      "date": "2024-01-15T10:30:00.000Z",
      "category": "transport",
      "type": "car",
      "amount": 25,
      "unit": "km",
      "co2Impact": 4.8,
      "notes": "Commute to work",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Activity Types by Category**:

**Transport**:
- `car` (unit: km)
- `bus` (unit: km)
- `train` (unit: km)
- `flight` (unit: km)
- `bike` (unit: km)
- `walk` (unit: km)

**Food**:
- `beef` (unit: servings)
- `pork` (unit: servings)
- `chicken` (unit: servings)
- `fish` (unit: servings)
- `vegetarian` (unit: servings)
- `vegan` (unit: servings)

**Energy**:
- `electricity` (unit: kWh)
- `gas` (unit: kWh)
- `heating` (unit: kWh)
- `cooling` (unit: kWh)

**Shopping**:
- `clothing` (unit: items)
- `electronics` (unit: items)
- `furniture` (unit: items)
- `other` (unit: items)

**Error Responses**:
- `400 VALIDATION_ERROR`: Invalid activity data
- `401 UNAUTHORIZED`: Missing or invalid token

---

### Update Activity

Update an existing activity.

**Endpoint**: `PUT /api/activities/:activityId`

**Authentication**: Required

**Request Body**:
```json
{
  "updates": {
    "amount": 30,
    "notes": "Updated commute distance"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "activity123",
      "userId": "user123",
      "date": "2024-01-15T10:30:00.000Z",
      "category": "transport",
      "type": "car",
      "amount": 30,
      "unit": "km",
      "co2Impact": 5.76,
      "notes": "Updated commute distance",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `400 VALIDATION_ERROR`: Invalid update data
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User doesn't own this activity
- `404 NOT_FOUND`: Activity not found

---

### Delete Activity

Delete an activity.

**Endpoint**: `DELETE /api/activities/:activityId`

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Activity deleted successfully"
}
```

**Error Responses**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User doesn't own this activity
- `404 NOT_FOUND`: Activity not found

---
---

## Dashboard Endpoints

### Get Dashboard Summary

Get aggregated dashboard data with CO2 trends, category breakdown, and goal progress.

**Endpoint**: `GET /api/dashboard/summary`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | string | No | Time range: `week` or `month` (default: `week`) |

**Example Request**:
```
GET /api/dashboard/summary?range=month
```

**Response**:
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
      },
      {
        "date": "2026-06-09",
        "total": 7.2,
        "byCategory": {
          "transport": 3.5,
          "food": 2.0,
          "energy": 1.2,
          "shopping": 0.5
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

**Response Fields**:
- `totalCO2`: Total CO2 emissions for the period (kg CO2e)
- `categoryBreakdown`: Array of emissions by category with percentages
- `dailyTotals`: Array of daily totals with category breakdown
- `goalProgress`: Score and goal tracking information
  - `currentScore`: Current carbon score (0-100, higher is better)
  - `baselineScore`: Initial score from quiz
  - `percentageChange`: Percentage change from baseline
  - `goalTarget`: User's reduction goal percentage (optional)
  - `progressTowardGoal`: Progress toward goal as percentage (optional)
- `period`: Date range information
- `hasData`: Boolean indicating if user has logged any activities

**Empty State Response** (when user has no activity logs):
```json
{
  "success": true,
  "data": {
    "totalCO2": 0,
    "categoryBreakdown": [],
    "dailyTotals": [],
    "goalProgress": {
      "currentScore": 50,
      "baselineScore": 50,
      "percentageChange": 0
    },
    "period": {
      "range": "week",
      "startDate": "2026-06-08",
      "endDate": "2026-06-15"
    },
    "hasData": false
  }
}
```

**Error Responses**:
- `400 INVALID_RANGE`: Invalid range parameter (must be 'week' or 'month')
- `401 UNAUTHORIZED`: Missing or invalid token
- `404 USER_NOT_FOUND`: User data not found

**Notes**:
- The endpoint automatically updates the user's `currentScore` based on recent activity
- Score calculation compares daily average emissions to baseline
- Week range: last 7 days
- Month range: last 30 days
- All aggregation is performed server-side for optimal performance


## Score Endpoints

### Get Current Score

Get user's current carbon score with trend analysis.

**Endpoint**: `GET /api/scores`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | Time period for trend: `week`, `month`, `year` (default: `month`) |

**Example Request**:
```
GET /api/scores?period=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "currentScore": {
      "id": "score123",
      "userId": "user123",
      "date": "2024-01-15T10:30:00.000Z",
      "score": 450.5,
      "breakdown": {
        "transport": 180.0,
        "food": 120.5,
        "energy": 100.0,
        "shopping": 50.0
      },
      "calculatedAt": "2024-01-15T10:30:00.000Z"
    },
    "trend": {
      "userId": "user123",
      "period": "month",
      "scores": [
        {
          "date": "2024-01-01T00:00:00.000Z",
          "score": 500.0,
          "breakdown": {
            "transport": 200.0,
            "food": 150.0,
            "energy": 100.0,
            "shopping": 50.0
          }
        },
        {
          "date": "2024-01-15T00:00:00.000Z",
          "score": 450.5,
          "breakdown": {
            "transport": 180.0,
            "food": 120.5,
            "energy": 100.0,
            "shopping": 50.0
          }
        }
      ],
      "average": 475.25,
      "trend": "decreasing",
      "percentageChange": -9.9
    }
  }
}
```

**Error Responses**:
- `401 UNAUTHORIZED`: Missing or invalid token

---

### Get Score History

Get historical carbon scores.

**Endpoint**: `GET /api/scores/history`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string (YYYY-MM-DD) | No | Start date for history |
| `endDate` | string (YYYY-MM-DD) | No | End date for history |

**Example Request**:
```
GET /api/scores/history?startDate=2024-01-01&endDate=2024-01-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "scores": [
      {
        "id": "score123",
        "userId": "user123",
        "date": "2024-01-15T10:30:00.000Z",
        "score": 450.5,
        "breakdown": {
          "transport": 180.0,
          "food": 120.5,
          "energy": 100.0,
          "shopping": 50.0
        },
        "calculatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Tips Endpoints

### Get Personalized Tips

Get personalized carbon reduction tips based on the current week's activity data.

**Endpoint**: `GET /api/tips`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of tips to return (default: 5, max: 10) |

**Example Request**:
```
GET /api/tips?limit=5
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tips": [
      {
        "id": "transport-high-percentage",
        "title": "Reduce Transportation Emissions",
        "message": "Transportation makes up a large portion of your carbon footprint. Consider carpooling, public transit, or cycling for shorter trips to make a meaningful impact.",
        "category": "transport",
        "priority": "high",
        "estimatedSavings": {
          "amount": 0.7,
          "period": "day",
          "description": "Save ~0.7 kg CO2/day"
        },
        "actionableSteps": [
          "Use public transportation for your daily commute",
          "Carpool with colleagues or neighbors",
          "Bike or walk for trips under 3 km",
          "Combine errands into a single trip"
        ],
        "matchReason": "transport accounts for 45.2% of your weekly emissions (threshold: 40%)",
        "relevanceScore": 55,
        "source": "EPA Transportation Emissions Data"
      },
      {
        "id": "red-meat-frequent",
        "title": "Explore Plant-Based Meals",
        "message": "You've logged red meat several times this week. Swapping just one or two meals for plant-based options can significantly reduce your food-related emissions.",
        "category": "food",
        "priority": "high",
        "estimatedSavings": {
          "amount": 1.2,
          "period": "day",
          "description": "Save ~1.2 kg CO2/day"
        },
        "actionableSteps": [
          "Try \"Meatless Monday\" or another meat-free day",
          "Explore plant-based protein alternatives",
          "Choose chicken or fish instead of beef",
          "Experiment with vegetarian recipes"
        ],
        "matchReason": "You logged beef 4 times this week (threshold: 3)",
        "relevanceScore": 70,
        "source": "Oxford University Food Emissions Study"
      }
    ],
    "period": {
      "start": "2026-06-08T00:00:00.000Z",
      "end": "2026-06-14T23:59:59.999Z"
    },
    "activityCount": 15,
    "generatedAt": "2026-06-15T10:30:00.000Z"
  }
}
```

**Response Fields**:
- `tips`: Array of personalized tip objects
  - `id`: Unique tip rule identifier
  - `title`: Tip headline
  - `message`: Detailed tip message (positive, non-judgmental)
  - `category`: Activity category (`transport`, `food`, `energy`, `shopping`, `general`)
  - `priority`: Tip priority (`high`, `medium`, `low`)
  - `estimatedSavings`: Estimated CO2 savings if tip is followed
    - `amount`: Savings amount in kg CO2
    - `period`: Time period (`day` or `week`)
    - `description`: Human-readable savings description
  - `actionableSteps`: Array of specific actions to take
  - `matchReason`: Why this tip was generated for the user
  - `relevanceScore`: Relevance score (0-100, higher = more relevant)
  - `source`: Optional citation for the tip
- `period`: Week date range used for evaluation
- `activityCount`: Number of activities logged in the period
- `generatedAt`: Timestamp when tips were generated

**Tip Selection Logic**:
- Evaluates current week's activity data (Monday-Sunday)
- Returns 3-5 most relevant tips based on:
  - Category percentage thresholds (e.g., transport > 40% of total)
  - Activity frequency (e.g., beef logged 3+ times)
  - High-impact activities
  - Inactivity (no logs in 2+ days)
- Falls back to general tips if fewer than 3 specific matches
- All tips are framed positively as opportunities, not criticism

**Empty State Response** (no activity data):
```json
{
  "success": true,
  "data": {
    "tips": [
      {
        "id": "general-reduce-waste",
        "title": "Reduce, Reuse, Recycle",
        "message": "Small daily choices add up. Bringing reusable bags, bottles, and containers reduces waste and the carbon footprint of single-use items.",
        "category": "general",
        "priority": "low",
        "estimatedSavings": {
          "amount": 0.2,
          "period": "day",
          "description": "Save ~0.2 kg CO2/day"
        },
        "actionableSteps": [
          "Carry a reusable water bottle",
          "Use reusable shopping bags",
          "Bring your own coffee cup",
          "Choose products with minimal packaging"
        ],
        "matchReason": "General tip",
        "relevanceScore": 30
      }
    ],
    "period": {
      "start": "2026-06-08T00:00:00.000Z",
      "end": "2026-06-14T23:59:59.999Z"
    },
    "activityCount": 0,
    "generatedAt": "2026-06-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to generate tips

---

### Preview Tip Rules (Debug)

Preview all available tip rules for debugging or admin purposes.

**Endpoint**: `GET /api/tips/preview`

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "totalRules": 18,
    "rules": [
      {
        "id": "transport-high-percentage",
        "title": "Reduce Transportation Emissions",
        "category": "transport",
        "priority": "high",
        "conditionType": "category_percentage",
        "estimatedSavings": "0.7 kg CO2/day"
      }
    ]
  }
}
```

**Error Responses**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `500 INTERNAL_SERVER_ERROR`: Failed to fetch tip rules

---

## Rate Limiting

The API is subject to the following rate limits (Cloud Run free tier):

- **2 million requests per month**
- Approximately **66,000 requests per day**
- Approximately **2,700 requests per hour**

When rate limits are exceeded, the API will return:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

**HTTP Status**: `429 Too Many Requests`

---

## Pagination

For endpoints that return lists (e.g., activities), use the `limit` query parameter:

```
GET /api/activities?limit=50
```

**Default limit**: 100
**Maximum limit**: 1000

---

## Timestamps

All timestamps are in ISO 8601 format with UTC timezone:

```
2024-01-15T10:30:00.000Z
```

---

## CORS

The API supports CORS for the following origins:

- Development: `http://localhost:5173`
- Production: Your Firebase Hosting domain

---

## Versioning

Current API version: **v1**

The API version is included in the base URL path: `/api/v1/...`

For backward compatibility, `/api/...` routes to the latest version.

---

## Support

For API issues or questions:
- Check the [ARCHITECTURE.md](../ARCHITECTURE.md) for system design
- Review the [README.md](../README.md) for setup instructions
- Open an issue on GitHub

---

**Last Updated**: 2024-01-15