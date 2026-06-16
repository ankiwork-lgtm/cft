/**
 * Integration Tests: Dashboard API Routes
 *
 * GET /api/dashboard/summary?range=week|month
 *
 * Firebase Auth + Firestore are mocked.
 */

import request from 'supertest';
import express from 'express';

// ─── Mock Firebase ────────────────────────────────────────────────────────────
// Defined at module scope so the factory can reference them as closures.
const mockEntries = [
  {
    id: 'entry-1',
    userId: 'user-123',
    category: 'transport',
    activityType: 'car',
    quantity: 25,
    unit: 'km',
    co2Kg: 4.8,
    date: { toDate: () => new Date() },
    createdAt: { toDate: () => new Date() },
  },
  {
    id: 'entry-2',
    userId: 'user-123',
    category: 'food',
    activityType: 'beef',
    quantity: 1,
    unit: 'servings',
    co2Kg: 6.61,
    date: { toDate: () => new Date() },
    createdAt: { toDate: () => new Date() },
  },
];

jest.mock('../../config/firebase', () => ({
  auth: {
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'user-123', email: 'test@example.com' }),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn((id: string) => ({
        get: jest.fn().mockResolvedValue({
          exists: id === 'user-123',
          data: () =>
            id === 'user-123'
              ? { baselineScore: 60, currentScore: 60, goalTarget: 10, quizCompleted: true }
              : undefined,
        }),
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: mockEntries.map((e) => ({ id: e.id, data: () => e })),
          }),
        })),
        set: jest.fn().mockResolvedValue(undefined),
      })),
    })),
  },
}));

jest.mock('../../middleware/initializeUser', () => ({
  initializeUser: (_req: any, _res: any, next: any) => next(),
}));

// Import router AFTER mocks are registered
import dashboardRouter from '../../routes/dashboard';

// ─── Test App ─────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRouter);

const AUTH_HEADER = 'Bearer valid-firebase-token';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/dashboard/summary', () => {
  it('should return 401 without Authorization header', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(401);
  });

  it('should return 400 for an invalid range parameter', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=quarterly')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_RANGE');
  });

  it('should return 200 with default "week" range', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.period.range).toBe('week');
  });

  it('should return 200 with explicit "week" range', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=week')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.period.range).toBe('week');
  });

  it('should return 200 with "month" range', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=month')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.period.range).toBe('month');
  });

  it('should return all required dashboard fields', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=week')
      .set('Authorization', AUTH_HEADER);

    const { data } = res.body;
    expect(data).toHaveProperty('totalCO2');
    expect(data).toHaveProperty('categoryBreakdown');
    expect(data).toHaveProperty('dailyTotals');
    expect(data).toHaveProperty('goalProgress');
    expect(data).toHaveProperty('period');
    expect(data).toHaveProperty('hasData');
  });

  it('should include goalProgress with score fields', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=week')
      .set('Authorization', AUTH_HEADER);

    const { goalProgress } = res.body.data;
    expect(goalProgress).toHaveProperty('currentScore');
    expect(goalProgress).toHaveProperty('baselineScore');
    expect(goalProgress).toHaveProperty('percentageChange');
  });

  it('should include period with ISO-format startDate and endDate', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=week')
      .set('Authorization', AUTH_HEADER);

    const { period } = res.body.data;
    expect(period).toHaveProperty('startDate');
    expect(period).toHaveProperty('endDate');
    expect(period.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(period.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return categoryBreakdown array with all four categories', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=week')
      .set('Authorization', AUTH_HEADER);

    const { categoryBreakdown } = res.body.data;
    expect(Array.isArray(categoryBreakdown)).toBe(true);
    expect(categoryBreakdown).toHaveLength(4);

    const categories = categoryBreakdown.map((c: any) => c.category);
    expect(categories).toContain('transport');
    expect(categories).toContain('food');
    expect(categories).toContain('energy');
    expect(categories).toContain('shopping');
  });

  it('should return currentScore within 0-100 range', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=week')
      .set('Authorization', AUTH_HEADER);

    const { currentScore } = res.body.data.goalProgress;
    expect(currentScore).toBeGreaterThanOrEqual(0);
    expect(currentScore).toBeLessThanOrEqual(100);
  });

  it('should mark hasData as true when entries exist', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=week')
      .set('Authorization', AUTH_HEADER);

    expect(res.body.data.hasData).toBe(true);
  });

  it('should return totalCO2 as a non-negative number', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?range=week')
      .set('Authorization', AUTH_HEADER);

    expect(res.body.data.totalCO2).toBeGreaterThanOrEqual(0);
  });
});
