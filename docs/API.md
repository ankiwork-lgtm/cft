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

### Get Tips

Get personalized tips for the user.

**Endpoint**: `GET /api/tips`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `weekStart` | string (YYYY-MM-DD) | No | Get tips for specific week (default: current week) |

**Example Request**:
```
GET /api/tips?weekStart=2024-01-15
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tips": {
      "id": "tips123",
      "userId": "user123",
      "weekStart": "2024-01-15T00:00:00.000Z",
      "tips": [
        {
          "id": "tip1",
          "userId": "user123",
          "title": "Reduce transport emissions",
          "description": "Your transport activities generated 180.00 kg CO2e. Consider alternatives.",
          "category": "transport",
          "priority": "high",
          "potentialSavings": 54.0,
          "actionable": true,
          "reason": "High transport emissions detected",
          "generatedAt": "2024-01-15T10:30:00.000Z"
        },
        {
          "id": "tip2",
          "userId": "user123",
          "title": "Reduce food emissions",
          "description": "Your food activities generated 120.50 kg CO2e. Consider alternatives.",
          "category": "food",
          "priority": "medium",
          "potentialSavings": 36.15,
          "actionable": true,
          "reason": "High food emissions detected",
          "generatedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "viewed": false
    }
  }
}
```

**Error Responses**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `404 NOT_FOUND`: No tips available for the specified week

---

### Mark Tips as Viewed

Mark a tip collection as viewed.

**Endpoint**: `PUT /api/tips/:tipCollectionId/viewed`

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Tips marked as viewed"
}
```

**Error Responses**:
- `401 UNAUTHORIZED`: Missing or invalid token
- `403 FORBIDDEN`: User doesn't own these tips
- `404 NOT_FOUND`: Tip collection not found

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