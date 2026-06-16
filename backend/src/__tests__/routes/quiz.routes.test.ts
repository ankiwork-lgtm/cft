/**
 * Integration Tests: Quiz API Routes
 * POST /api/quiz  —  submit quiz and get baseline score
 * GET  /api/quiz/result  —  retrieve saved quiz result
 *
 * Firebase Admin SDK (auth + Firestore) is fully mocked.
 */

import request from 'supertest';
import express from 'express';

// ─── Mock Firebase ────────────────────────────────────────────────────────────
// jest.mock is hoisted, so the factory must be self-contained.
// We use module-level stores that are mutated by the mock internals.
const _userStore: Record<string, any> = {};
const _quizDocs: any[] = [];

jest.mock('../../config/firebase', () => {
  // Internal closures referencing the outer store objects (same reference)
  const userStore = _userStore;   // eslint-disable-line @typescript-eslint/no-use-before-define
  const quizDocs  = _quizDocs;    // eslint-disable-line @typescript-eslint/no-use-before-define

  return {
    auth: {
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'user-123', email: 'test@example.com' }),
    },
    db: {
      collection: jest.fn((name: string) => ({
        doc: jest.fn((id: string) => ({
          get: jest.fn().mockImplementation(() =>
            Promise.resolve({
              exists: name === 'users' && id in userStore,
              data: () => userStore[id],
            })
          ),
          set: jest.fn().mockImplementation((data: any) => {
            userStore[id] = { ...(userStore[id] || {}), ...data };
            return Promise.resolve();
          }),
        })),
        add: jest.fn().mockImplementation((doc: any) => {
          quizDocs.push(doc);
          return Promise.resolve({ id: 'quiz-doc-1' });
        }),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockImplementation(() => {
          if (quizDocs.length === 0) {
            return Promise.resolve({ empty: true, docs: [] });
          }
          const latest = quizDocs[quizDocs.length - 1];
          return Promise.resolve({
            empty: false,
            docs: [
              {
                data: () => ({
                  ...latest,
                  completedAt: { toDate: () => new Date() },
                }),
              },
            ],
          });
        }),
      })),
    },
  };
});

// ─── Mock initializeUser middleware ───────────────────────────────────────────
jest.mock('../../middleware/initializeUser', () => ({
  initializeUser: (_req: any, _res: any, next: any) => next(),
}));

// Import router AFTER mocks are declared
import quizRouter from '../../routes/quiz';

// ─── Test App ─────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/quiz', quizRouter);

// Valid quiz payload covering all 10 questions
const validResponses = [
  { questionId: 'commute_mode',        answer: 'car_alone' },
  { questionId: 'commute_distance',    answer: 'medium' },
  { questionId: 'air_travel',          answer: 'none' },
  { questionId: 'diet_type',           answer: 'medium_meat' },
  { questionId: 'food_waste',          answer: 'minimal' },
  { questionId: 'home_type',           answer: 'small_house' },
  { questionId: 'household_size',      answer: '1' },
  { questionId: 'heating_type',        answer: 'electric' },
  { questionId: 'shopping_frequency',  answer: 'moderate' },
  { questionId: 'shopping_habits',     answer: 'conventional' },
];

const AUTH_HEADER = 'Bearer valid-firebase-token';

// Helper to reset state between tests
function resetStores() {
  Object.keys(_userStore).forEach((k) => delete _userStore[k]);
  _quizDocs.length = 0;
}

// ─── POST /api/quiz ───────────────────────────────────────────────────────────

describe('POST /api/quiz', () => {
  beforeEach(resetStores);

  it('should return 401 when Authorization header is missing', async () => {
    const res = await request(app).post('/api/quiz').send({ responses: validResponses });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when responses array is empty', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: [] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 when responses is not an array', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: 'bad_value' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 when responses is missing from body', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 for an invalid goalTarget (not 5, 10, or 15)', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: validResponses, goalTarget: 20 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_GOAL');
  });

  it('should successfully submit quiz with valid responses', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: validResponses });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('baselineScore');
    expect(res.body.data).toHaveProperty('footprintEstimate');
    expect(res.body.data).toHaveProperty('result');
    expect(res.body.message).toBe('Quiz completed successfully');
  });

  it('should return a baselineScore between 0 and 100', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: validResponses });

    const { baselineScore } = res.body.data;
    expect(baselineScore).toBeGreaterThanOrEqual(0);
    expect(baselineScore).toBeLessThanOrEqual(100);
  });

  it('should include a breakdown with 4 categories', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: validResponses });

    const { breakdown } = res.body.data.result;
    expect(breakdown).toHaveProperty('transport');
    expect(breakdown).toHaveProperty('food');
    expect(breakdown).toHaveProperty('energy');
    expect(breakdown).toHaveProperty('shopping');
  });

  it('should accept valid goal target of 5, 10, or 15', async () => {
    for (const goal of [5, 10, 15]) {
      const res = await request(app)
        .post('/api/quiz')
        .set('Authorization', AUTH_HEADER)
        .send({ responses: validResponses, goalTarget: goal });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }
  });

  it('should return nationalAverage in response', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: validResponses });

    expect(res.body.data).toHaveProperty('nationalAverage');
    expect(res.body.data.nationalAverage).toBe(6000);
  });

  it('should give a lower score for a high-emission quiz than a low-emission quiz', async () => {
    const highEmissionResponses = [
      { questionId: 'commute_mode',       answer: 'car_alone' },
      { questionId: 'commute_distance',   answer: 'very_long' },
      { questionId: 'air_travel',         answer: 'frequent' },
      { questionId: 'diet_type',          answer: 'high_meat' },
      { questionId: 'food_waste',         answer: 'significant' },
      { questionId: 'home_type',          answer: 'large_house' },
      { questionId: 'household_size',     answer: '1' },
      { questionId: 'heating_type',       answer: 'oil' },
      { questionId: 'shopping_frequency', answer: 'very_frequent' },
      { questionId: 'shopping_habits',    answer: 'fast_fashion' },
    ];

    const lowEmissionResponses = [
      { questionId: 'commute_mode',       answer: 'bike_walk' },
      { questionId: 'commute_distance',   answer: 'short' },
      { questionId: 'air_travel',         answer: 'none' },
      { questionId: 'diet_type',          answer: 'vegan' },
      { questionId: 'food_waste',         answer: 'minimal' },
      { questionId: 'home_type',          answer: 'apartment' },
      { questionId: 'household_size',     answer: '4+' },
      { questionId: 'heating_type',       answer: 'renewable' },
      { questionId: 'shopping_frequency', answer: 'minimal' },
      { questionId: 'shopping_habits',    answer: 'secondhand' },
    ];

    const highRes = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: highEmissionResponses });

    const lowRes = await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: lowEmissionResponses });

    expect(lowRes.body.data.baselineScore).toBeGreaterThan(
      highRes.body.data.baselineScore
    );
  });
});

// ─── GET /api/quiz/result ─────────────────────────────────────────────────────

describe('GET /api/quiz/result', () => {
  beforeEach(resetStores);

  it('should return 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/quiz/result');
    expect(res.status).toBe(401);
  });

  it('should return 404 when user document does not exist', async () => {
    const res = await request(app)
      .get('/api/quiz/result')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('should return 404 when user exists but quiz not completed', async () => {
    _userStore['user-123'] = { quizCompleted: false };

    const res = await request(app)
      .get('/api/quiz/result')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('QUIZ_NOT_COMPLETED');
  });

  it('should return 404 when user completed quiz but no quizResponse doc exists', async () => {
    _userStore['user-123'] = { quizCompleted: true, baselineScore: 55 };
    // _quizDocs is empty → collection.get returns { empty: true }

    const res = await request(app)
      .get('/api/quiz/result')
      .set('Authorization', AUTH_HEADER);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('QUIZ_RESULT_NOT_FOUND');
  });

  it('should return quiz result for a user who completed the quiz', async () => {
    // Simulate completing the quiz first
    await request(app)
      .post('/api/quiz')
      .set('Authorization', AUTH_HEADER)
      .send({ responses: validResponses });

    const res = await request(app)
      .get('/api/quiz/result')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('baselineScore');
    expect(res.body.data).toHaveProperty('result');
  });
});
