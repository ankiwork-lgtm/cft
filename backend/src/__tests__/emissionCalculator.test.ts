/**
 * Unit Tests: emissionCalculator
 *
 * Tests the caching behaviour and CO2 calculation logic.
 * Firestore is mocked so no network calls are made.
 */

import {
  calculateCO2,
  validateActivity,
  clearEmissionFactorsCache,
  getEmissionFactorsByCategory,
  getActivityTypes,
} from '../utils/emissionCalculator';

// ─── Mock Firestore ───────────────────────────────────────────────────────────
// NOTE: jest.mock() hoists to the top of the file.
// The factory MUST be self-contained — do not reference variables declared
// in the outer scope (temporal dead zone risk).
jest.mock('../config/firebase', () => {
  const factors = [
    {
      id: 'car-km',
      category: 'transport',
      activityType: 'car',
      unit: 'km',
      kgCO2PerUnit: 0.192,
      lastUpdated: { toDate: () => new Date() },
    },
    {
      id: 'bus-km',
      category: 'transport',
      activityType: 'bus',
      unit: 'km',
      kgCO2PerUnit: 0.089,
      lastUpdated: { toDate: () => new Date() },
    },
    {
      id: 'bike-km',
      category: 'transport',
      activityType: 'bike',
      unit: 'km',
      kgCO2PerUnit: 0,
      lastUpdated: { toDate: () => new Date() },
    },
    {
      id: 'beef-serving',
      category: 'food',
      activityType: 'beef',
      unit: 'servings',
      kgCO2PerUnit: 6.61,
      lastUpdated: { toDate: () => new Date() },
    },
    {
      id: 'vegetarian-meal',
      category: 'food',
      activityType: 'vegetarian_meal',
      unit: 'meals',
      kgCO2PerUnit: 0.39,
      lastUpdated: { toDate: () => new Date() },
    },
    {
      id: 'electricity-kwh',
      category: 'energy',
      activityType: 'electricity',
      unit: 'kWh',
      kgCO2PerUnit: 0.385,
      lastUpdated: { toDate: () => new Date() },
    },
    {
      id: 'renewable-kwh',
      category: 'energy',
      activityType: 'renewable_electricity',
      unit: 'kWh',
      kgCO2PerUnit: 0,
      lastUpdated: { toDate: () => new Date() },
    },
    {
      id: 'clothing-new',
      category: 'shopping',
      activityType: 'new_clothing',
      unit: 'items',
      kgCO2PerUnit: 5.5,
      lastUpdated: { toDate: () => new Date() },
    },
    {
      id: 'clothing-secondhand',
      category: 'shopping',
      activityType: 'secondhand_clothing',
      unit: 'items',
      kgCO2PerUnit: 0.5,
      lastUpdated: { toDate: () => new Date() },
    },
  ];

  const getFn = jest.fn().mockResolvedValue({
    docs: factors.map((f) => ({
      id: f.id,
      data: () => f,
    })),
  });

  return {
    db: {
      collection: jest.fn().mockReturnValue({
        get: getFn,
      }),
    },
    // expose getFn so tests can spy on call count
    __mockGetFn: getFn,
  };
});

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  clearEmissionFactorsCache();
  // Reset call count between tests using the stable mock reference
  const firebaseMock = require('../config/firebase');
  firebaseMock.__mockGetFn.mockClear();
});

describe('calculateCO2', () => {
  it('should calculate CO2 correctly for a car trip', async () => {
    const co2 = await calculateCO2('transport', 'car', 25, 'km');
    // 25 km × 0.192 kg/km = 4.8
    expect(co2).toBeCloseTo(4.8, 2);
  });

  it('should return 0 for zero-emission transport (bike)', async () => {
    const co2 = await calculateCO2('transport', 'bike', 10, 'km');
    expect(co2).toBe(0);
  });

  it('should return 0 for renewable electricity', async () => {
    const co2 = await calculateCO2('energy', 'renewable_electricity', 30, 'kWh');
    expect(co2).toBe(0);
  });

  it('should return null for unknown activity type', async () => {
    const co2 = await calculateCO2('transport', 'hoverboard', 10, 'km');
    expect(co2).toBeNull();
  });

  it('should return null for unknown unit', async () => {
    const co2 = await calculateCO2('transport', 'car', 10, 'miles');
    expect(co2).toBeNull();
  });

  it('should correctly calculate beef emissions', async () => {
    const co2 = await calculateCO2('food', 'beef', 1, 'servings');
    expect(co2).toBeCloseTo(6.61, 2);
  });

  it('should correctly calculate electricity emissions', async () => {
    const co2 = await calculateCO2('energy', 'electricity', 50, 'kWh');
    // 50 × 0.385 = 19.25
    expect(co2).toBeCloseTo(19.25, 2);
  });

  it('should scale linearly with quantity', async () => {
    const co2Single = await calculateCO2('shopping', 'new_clothing', 1, 'items');
    const co2Double = await calculateCO2('shopping', 'new_clothing', 2, 'items');
    expect(co2Double).toBeCloseTo(co2Single! * 2, 5);
  });
});

describe('validateActivity', () => {
  it('should return true for known activity/unit combination', async () => {
    const valid = await validateActivity('transport', 'bus', 'km');
    expect(valid).toBe(true);
  });

  it('should return false for unknown activity type', async () => {
    const valid = await validateActivity('food', 'mystery_meat', 'servings');
    expect(valid).toBe(false);
  });

  it('should return false for mismatched unit', async () => {
    const valid = await validateActivity('energy', 'electricity', 'gallons');
    expect(valid).toBe(false);
  });
});

describe('getEmissionFactorsByCategory', () => {
  it('should return only factors for the requested category', async () => {
    const factors = await getEmissionFactorsByCategory('transport');
    const allTransport = factors.every((f) => f.category === 'transport');
    expect(allTransport).toBe(true);
    expect(factors.length).toBeGreaterThan(0);
  });

  it('should return all food factors', async () => {
    const factors = await getEmissionFactorsByCategory('food');
    expect(factors.length).toBe(2);
  });
});

describe('getActivityTypes', () => {
  it('should return unique activity types for shopping', async () => {
    const types = await getActivityTypes('shopping');
    expect(types).toContain('new_clothing');
    expect(types).toContain('secondhand_clothing');
    // Ensure uniqueness
    expect(new Set(types).size).toBe(types.length);
  });
});

describe('Caching behavior', () => {
  it('should load factors only once (cache hit after first call)', async () => {
    // Access the stable getFn reference exported by the mock factory
    const firebaseMock = require('../config/firebase');
    const getSpy = firebaseMock.__mockGetFn;

    // First call — cache miss
    await calculateCO2('transport', 'car', 1, 'km');
    // Second call — should use cache, no additional Firestore read
    await calculateCO2('transport', 'bus', 1, 'km');

    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it('should reload factors after cache is cleared', async () => {
    const firebaseMock = require('../config/firebase');
    const getSpy = firebaseMock.__mockGetFn;

    await calculateCO2('transport', 'car', 1, 'km');
    clearEmissionFactorsCache();
    await calculateCO2('transport', 'car', 1, 'km');

    expect(getSpy).toHaveBeenCalledTimes(2);
  });
});
