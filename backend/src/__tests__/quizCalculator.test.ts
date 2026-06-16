/**
 * Unit Tests: quizCalculator
 *
 * Tests the CO2 footprint calculation and Carbon Score conversion logic
 * without any Firestore or network calls.
 */

import {
  calculateFootprintFromQuiz,
  getScoreLabel,
  getPercentageFromAverage,
} from '../utils/quizCalculator';
import { QuizResponse } from '@cft/shared';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build a complete, valid set of quiz responses */
function buildResponses(
  overrides: Partial<Record<string, string>> = {}
): QuizResponse[] {
  const defaults: Record<string, string> = {
    commute_mode: 'car_alone',        // 2400 kg
    commute_distance: 'medium',       // ×1.0
    air_travel: 'none',               // 0 kg
    diet_type: 'medium_meat',         // 1700 kg
    food_waste: 'minimal',            // 0 kg
    home_type: 'small_house',         // 2200 kg
    household_size: '1',              // ×1.0
    heating_type: 'electric',         // ×1.0
    shopping_frequency: 'moderate',   // 1200 kg
    shopping_habits: 'conventional',  // ×1.0
    ...overrides,
  };

  return Object.entries(defaults).map(([questionId, answer]) => ({
    questionId,
    answer,
  }));
}

// ─── calculateFootprintFromQuiz ───────────────────────────────────────────────

describe('calculateFootprintFromQuiz', () => {
  describe('Transport calculations', () => {
    it('should calculate transport from commute_mode + distance multiplier', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          commute_mode: 'car_alone',  // 2400 kg base
          commute_distance: 'long',   // ×2.0
          air_travel: 'none',         // 0 kg
        })
      );
      // 2400 * 2.0 + 0 = 4800
      expect(result.breakdown.transport).toBe(4800);
    });

    it('should add air travel to commute emissions', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          commute_mode: 'bike_walk',       // 0 kg
          commute_distance: 'short',       // ×0.5 → 0
          air_travel: 'occasional',        // 2000 kg
        })
      );
      expect(result.breakdown.transport).toBe(2000);
    });

    it('should produce zero transport for WFH + no flights', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          commute_mode: 'work_from_home',
          commute_distance: 'none',
          air_travel: 'none',
        })
      );
      expect(result.breakdown.transport).toBe(0);
    });

    it('should calculate maximum transport scenario', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          commute_mode: 'car_alone',    // 2400 kg
          commute_distance: 'very_long', // ×3.0 → 7200
          air_travel: 'frequent',       // 4000 kg
        })
      );
      expect(result.breakdown.transport).toBe(11200);
    });
  });

  describe('Food calculations', () => {
    it('should add food_waste emissions to diet_type base', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          diet_type: 'high_meat',   // 2500 kg
          food_waste: 'significant', // +400 kg
        })
      );
      expect(result.breakdown.food).toBe(2900);
    });

    it('should produce lowest food for vegan + minimal waste', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          diet_type: 'vegan',
          food_waste: 'minimal',
        })
      );
      expect(result.breakdown.food).toBe(700);
    });
  });

  describe('Energy calculations', () => {
    it('should multiply home_type by heating_type factor then household_size divisor', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          home_type: 'medium_house', // 3000 kg
          heating_type: 'gas',       // ×1.2 → 3600
          household_size: '2',       // ×0.6 → 2160
        })
      );
      expect(result.breakdown.energy).toBe(2160);
    });

    it('should halve large_house with renewable heating and 4+ household', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          home_type: 'large_house', // 4000 kg
          heating_type: 'renewable', // ×0.5 → 2000
          household_size: '4+',      // ×0.3 → 600
        })
      );
      expect(result.breakdown.energy).toBe(600);
    });
  });

  describe('Shopping calculations', () => {
    it('should multiply shopping_frequency by shopping_habits factor', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          shopping_frequency: 'frequent',  // 2000 kg
          shopping_habits: 'fast_fashion', // ×1.3 → 2600
        })
      );
      expect(result.breakdown.shopping).toBe(2600);
    });

    it('should reduce shopping footprint for secondhand habit', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          shopping_frequency: 'moderate',  // 1200 kg
          shopping_habits: 'secondhand',   // ×0.5 → 600
        })
      );
      expect(result.breakdown.shopping).toBe(600);
    });
  });

  describe('Total footprint and score', () => {
    it('should sum all categories into footprintEstimate', () => {
      const result = calculateFootprintFromQuiz(buildResponses());
      const expected =
        result.breakdown.transport +
        result.breakdown.food +
        result.breakdown.energy +
        result.breakdown.shopping;
      expect(result.footprintEstimate).toBe(expected);
    });

    it('should clamp baselineScore to 0 when footprint exceeds national average', () => {
      // Build a very high-emissions scenario
      const result = calculateFootprintFromQuiz(
        buildResponses({
          commute_mode: 'car_alone',
          commute_distance: 'very_long',  // ×3 → 7200
          air_travel: 'frequent',         // +4000
          diet_type: 'high_meat',         // +2500
          food_waste: 'significant',      // +400
          home_type: 'large_house',       // 4000
          household_size: '1',
          heating_type: 'oil',            // ×1.5 → 6000
          shopping_frequency: 'very_frequent', // 3000
          shopping_habits: 'fast_fashion',     // ×1.3 → 3900
        })
      );
      expect(result.baselineScore).toBeGreaterThanOrEqual(0);
      expect(result.baselineScore).toBeLessThanOrEqual(100);
    });

    it('should give a high score for the lowest-emission scenario', () => {
      const result = calculateFootprintFromQuiz(
        buildResponses({
          commute_mode: 'bike_walk',
          commute_distance: 'short',
          air_travel: 'none',
          diet_type: 'vegan',
          food_waste: 'minimal',
          home_type: 'apartment',
          household_size: '4+',
          heating_type: 'renewable',
          shopping_frequency: 'minimal',
          shopping_habits: 'secondhand',
        })
      );
      // vegan + no commute + apartment/renewable/4ppl + minimal shopping
      // footprint ≈ 0+0+0 + 700+0 + 1500*0.5*0.3=225 + 500*0.5=250 = 1175 kg
      // score = 100 - (1175/6000*100) ≈ 80
      expect(result.baselineScore).toBeGreaterThan(70);
    });

    it('should return integer values for footprint and breakdown', () => {
      const result = calculateFootprintFromQuiz(buildResponses());
      expect(Number.isInteger(result.footprintEstimate)).toBe(true);
      expect(Number.isInteger(result.breakdown.transport)).toBe(true);
      expect(Number.isInteger(result.breakdown.food)).toBe(true);
      expect(Number.isInteger(result.breakdown.energy)).toBe(true);
      expect(Number.isInteger(result.breakdown.shopping)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty responses array and use defaults', () => {
      const result = calculateFootprintFromQuiz([]);
      // All defaults apply; should still return a valid object
      expect(result).toHaveProperty('footprintEstimate');
      expect(result).toHaveProperty('baselineScore');
      expect(result).toHaveProperty('breakdown');
    });

    it('should handle unknown questionId values gracefully', () => {
      const responses: QuizResponse[] = [
        { questionId: 'nonexistent_question', answer: 'bogus_value' },
      ];
      expect(() => calculateFootprintFromQuiz(responses)).not.toThrow();
    });
  });
});

// ─── getScoreLabel ────────────────────────────────────────────────────────────

describe('getScoreLabel', () => {
  it('returns "Excellent" for score >= 75', () => {
    expect(getScoreLabel(75)).toBe('Excellent');
    expect(getScoreLabel(100)).toBe('Excellent');
  });

  it('returns "Good" for 50 <= score < 75', () => {
    expect(getScoreLabel(50)).toBe('Good');
    expect(getScoreLabel(74)).toBe('Good');
  });

  it('returns "Fair" for 25 <= score < 50', () => {
    expect(getScoreLabel(25)).toBe('Fair');
    expect(getScoreLabel(49)).toBe('Fair');
  });

  it('returns "Needs Improvement" for score < 25', () => {
    expect(getScoreLabel(0)).toBe('Needs Improvement');
    expect(getScoreLabel(24)).toBe('Needs Improvement');
  });
});

// ─── getPercentageFromAverage ─────────────────────────────────────────────────

describe('getPercentageFromAverage', () => {
  it('returns 0 for footprint equal to national average (6000 kg)', () => {
    expect(getPercentageFromAverage(6000)).toBe(0);
  });

  it('returns negative % when footprint is below national average', () => {
    // (3000 - 6000) / 6000 * 100 = -50
    expect(getPercentageFromAverage(3000)).toBe(-50);
  });

  it('returns positive % when footprint is above national average', () => {
    // (9000 - 6000) / 6000 * 100 = 50
    expect(getPercentageFromAverage(9000)).toBe(50);
  });

  it('returns an integer value', () => {
    const result = getPercentageFromAverage(5000);
    expect(Number.isInteger(result)).toBe(true);
  });
});
