/**
 * Integration Tests: Activity Logs API Routes
 *
 * POST   /api/logs/entries     — create an activity log entry
 * GET    /api/logs/entries     — get entries for a date
 * DELETE /api/logs/entries/:id — delete an entry
 *
 * Firebase Auth + Firestore + emissionCalculator are mocked.
 */

import request from 'supertest';
import express from 'express';

// ─── Shared mutable state ─────────────────────────────────────────────────────
const _activityStore: Record<string, any> = {};

// ─── Mock emissionCalculator ──────────────────────────────────────────────────
jest.mock('../../utils/emissionCalculator', () => ({
  calculateCO2: jest.fn(async (_cat: string, activityType: string) => {
    if (activityType === 'unknown_type') return null;
    const table: Record<string, number> = {
      car: 4.8,
      bus: 0.89,
      bike: 0,
      beef: 6.61,
      vegetarian_meal: 0.39,
      electricity: 19.25,
      renewable_electricity: 0,
      new_clothing: 5.5,
      secondhand_clothing: 0.5,
    };
    return table[activityType] ?? 1.0;
  }),
  validateActivity: jest.fn(async (_cat: string, activityType: string) => {
    return activityType !== 'unknown_type' && activityType !== 'hoverboard';
  }),
}));

// ─── Mock Firebase ────────────────────────────────────────────────────────────
const activityStore = _activityStore;

jest.mock('../../config/firebase', () => ({
  auth: {
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'user-123', email: 'test@example.com' }),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          add: jest.fn(async (data: any) => {
            const id = `entry-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            activityStore[id] = { ...data, userId: 'user-123' };
            return { id };
          }),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          get: jest.fn(async () => {
            const docs = Object.entries(activityStore).map(([id, data]) => ({
              id,
              data: () => ({
                ...data,
                date: { toDate: () => (data.date instanceof Date ? data.date : new Date(data.date)) },
                createdAt: { toDate: () => new Date() },
              }),
            }));
            return { docs };
          }),
          doc: jest.fn((id: string) => ({
            get: jest.fn(async () => ({
              exists: id in activityStore,
              data: () => activityStore[id],
            })),
            delete: jest.fn(async () => {
              delete activityStore[id];
            }),
          })),
        })),
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ quizCompleted: true }) }),
        set: jest.fn().mockResolvedValue(undefined),
      })),
    })),
  },
}));

// ─── Mock initializeUser middleware ───────────────────────────────────────────
jest.mock('../../middleware/initializeUser', () => ({
  initializeUser: (_req: any, _res: any, next: any) => next(),
}));

// ─── Import router AFTER mocks ────────────────────────────────────────────────
import logsRouter from '../../routes/logs';

// ─── Test App ─────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/logs', logsRouter);

const AUTH_HEADER = 'Bearer valid-firebase-token';

const validEntry = {
  date: '2026-01-15',
  category: 'transport',
  activityType: 'car',
  quantity: 25,
  unit: 'km',
  notes: 'Commute to work',
};

function resetStore() {
  Object.keys(_activityStore).forEach((k) => delete _activityStore[k]);
}

// ─── POST /api/logs/entries ───────────────────────────────────────────────────

describe('POST /api/logs/entries', () => {
  beforeEach(resetStore);

  it('should return 401 without Authorization header', async () => {
    const res = await request(app).post('/api/logs/entries').send(validEntry);
    expect(res.status).toBe(401);
  });

  it('should return 400 when required fields are missing (no date)', async () => {
    const { date: _d, ...body } = validEntry;
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('should return 400 when required fields are missing (no category)', async () => {
    const { category: _c, ...body } = validEntry;
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send(body);
    expect(res.status).toBe(400);
  });

  it('should return 400 for an invalid category', async () => {
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validEntry, category: 'aviation' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_CATEGORY');
  });

  it('should return 400 for a zero quantity', async () => {
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validEntry, quantity: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QUANTITY');
  });

  it('should return 400 for a negative quantity', async () => {
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validEntry, quantity: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QUANTITY');
  });

  it('should return 400 for an unknown activity type', async () => {
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validEntry, activityType: 'unknown_type' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ACTIVITY');
  });

  it('should create entry and return 201 with correct data', async () => {
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send(validEntry);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.category).toBe('transport');
    expect(res.body.data.activityType).toBe('car');
    expect(res.body.data.co2Kg).toBeCloseTo(4.8, 1);
  });

  it('should log a food activity (beef) with correct CO2', async () => {
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send({
        date: '2026-01-15',
        category: 'food',
        activityType: 'beef',
        quantity: 1,
        unit: 'servings',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.co2Kg).toBeCloseTo(6.61, 1);
  });

  it('should log an energy activity with zero CO2 (renewable)', async () => {
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send({
        date: '2026-01-15',
        category: 'energy',
        activityType: 'renewable_electricity',
        quantity: 30,
        unit: 'kWh',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.co2Kg).toBe(0);
  });

  it('should accept all four valid categories', async () => {
    const categories = [
      { category: 'transport', activityType: 'bus',          unit: 'km' },
      { category: 'food',      activityType: 'beef',         unit: 'servings' },
      { category: 'energy',    activityType: 'electricity',  unit: 'kWh' },
      { category: 'shopping',  activityType: 'new_clothing', unit: 'items' },
    ];

    for (const cat of categories) {
      const res = await request(app)
        .post('/api/logs/entries')
        .set('Authorization', AUTH_HEADER)
        .send({ date: '2026-01-15', quantity: 1, ...cat });
      expect(res.status).toBe(201);
    }
  });

  it('should store optional notes field when provided', async () => {
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validEntry, notes: 'Evening ride' });

    expect(res.status).toBe(201);
    expect(res.body.data.notes).toBe('Evening ride');
  });
});

// ─── GET /api/logs/entries ────────────────────────────────────────────────────

describe('GET /api/logs/entries', () => {
  it('should return 401 without Authorization header', async () => {
    const res = await request(app).get('/api/logs/entries?date=2026-01-15');
    expect(res.status).toBe(401);
  });

  it('should return 400 when date parameter is missing', async () => {
    const res = await request(app)
      .get('/api/logs/entries')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('should return 400 for an invalid date format', async () => {
    const res = await request(app)
      .get('/api/logs/entries?date=not-a-date')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE');
  });

  it('should return 200 with entries and totals structure', async () => {
    const res = await request(app)
      .get('/api/logs/entries?date=2026-01-15')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('entries');
    expect(res.body.data).toHaveProperty('totals');
    expect(res.body.data.totals).toHaveProperty('total');
    expect(res.body.data.totals).toHaveProperty('byCategory');
    expect(res.body.data.totals.byCategory).toHaveProperty('transport');
    expect(res.body.data.totals.byCategory).toHaveProperty('food');
    expect(res.body.data.totals.byCategory).toHaveProperty('energy');
    expect(res.body.data.totals.byCategory).toHaveProperty('shopping');
  });

  it('should return the date in the response', async () => {
    const res = await request(app)
      .get('/api/logs/entries?date=2026-01-15')
      .set('Authorization', AUTH_HEADER);

    expect(res.body.data.date).toBe('2026-01-15');
  });
});

// ─── DELETE /api/logs/entries/:id ────────────────────────────────────────────

describe('DELETE /api/logs/entries/:id', () => {
  let createdId: string;

  beforeEach(async () => {
    resetStore();
    // Create an entry to delete
    const res = await request(app)
      .post('/api/logs/entries')
      .set('Authorization', AUTH_HEADER)
      .send(validEntry);
    createdId = res.body.data?.id;
  });

  it('should return 401 without Authorization header', async () => {
    const res = await request(app).delete('/api/logs/entries/some-id');
    expect(res.status).toBe(401);
  });

  it('should return 404 when entry does not exist', async () => {
    const res = await request(app)
      .delete('/api/logs/entries/nonexistent-id')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should successfully delete an existing entry', async () => {
    if (!createdId) return;

    const res = await request(app)
      .delete(`/api/logs/entries/${createdId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
