/**
 * Tip Evaluator
 * Evaluates tip rules against user activity data
 */

import {
  TipRule,
  EvaluatedTip,
  ActivityCategory,
  ActivityLogEntry,
} from '@cft/shared';
import { TIP_RULES } from '@cft/shared';

interface WeeklyActivityData {
  entries: ActivityLogEntry[];
  totalCO2: number;
  categoryTotals: Record<ActivityCategory, number>;
  activityCounts: Record<string, number>;
  lastLogDate: Date | null;
}

/**
 * Aggregate weekly activity data for tip evaluation
 */
export const aggregateWeeklyData = (
  entries: ActivityLogEntry[]
): WeeklyActivityData => {
  const categoryTotals: Record<ActivityCategory, number> = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
  };

  const activityCounts: Record<string, number> = {};
  let totalCO2 = 0;
  let lastLogDate: Date | null = null;

  entries.forEach((entry) => {
    totalCO2 += entry.co2Kg;
    categoryTotals[entry.category] += entry.co2Kg;

    // Count activity types
    const key = `${entry.category}:${entry.activityType}`;
    activityCounts[key] = (activityCounts[key] || 0) + 1;

    // Track last log date
    const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
    if (!lastLogDate || entryDate > lastLogDate) {
      lastLogDate = entryDate;
    }
  });

  return {
    entries,
    totalCO2,
    categoryTotals,
    activityCounts,
    lastLogDate,
  };
};

/**
 * Evaluate a single tip rule against weekly data
 */
const evaluateRule = (
  rule: TipRule,
  data: WeeklyActivityData
): EvaluatedTip | null => {
  const { condition } = rule;
  let matches = false;
  let matchReason = '';
  let relevanceScore = 0;

  switch (condition.type) {
    case 'category_percentage': {
      if (condition.category && condition.threshold) {
        const categoryTotal = data.categoryTotals[condition.category];
        const percentage = data.totalCO2 > 0 ? (categoryTotal / data.totalCO2) * 100 : 0;
        
        if (percentage > condition.threshold) {
          matches = true;
          matchReason = `${condition.category} accounts for ${percentage.toFixed(1)}% of your weekly emissions (threshold: ${condition.threshold}%)`;
          relevanceScore = Math.min(100, 50 + percentage - condition.threshold);
        }
      }
      break;
    }

    case 'category_absolute': {
      if (condition.category && condition.threshold) {
        const categoryTotal = data.categoryTotals[condition.category];
        
        if (categoryTotal > condition.threshold) {
          matches = true;
          matchReason = `${condition.category} emissions: ${categoryTotal.toFixed(2)} kg CO2 (threshold: ${condition.threshold} kg)`;
          relevanceScore = Math.min(100, 50 + ((categoryTotal - condition.threshold) / condition.threshold) * 50);
        }
      }
      break;
    }

    case 'activity_frequency': {
      if (condition.category && condition.activityType && condition.threshold) {
        const key = `${condition.category}:${condition.activityType}`;
        const count = data.activityCounts[key] || 0;
        
        if (count >= condition.threshold) {
          matches = true;
          matchReason = `You logged ${condition.activityType} ${count} times this week (threshold: ${condition.threshold})`;
          relevanceScore = Math.min(100, 60 + (count - condition.threshold) * 10);
        }
      }
      break;
    }

    case 'no_activity': {
      if (condition.days) {
        const now = new Date();
        const daysSinceLastLog = data.lastLogDate
          ? Math.floor((now.getTime() - data.lastLogDate.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        
        if (daysSinceLastLog >= condition.days) {
          matches = true;
          matchReason = `No activity logged in ${daysSinceLastLog} days`;
          relevanceScore = Math.min(100, 40 + daysSinceLastLog * 5);
        }
      }
      break;
    }

    case 'high_impact_activity': {
      if (condition.threshold !== undefined) {
        const threshold = condition.threshold;
        const hasHighImpact = data.entries.some(
          (entry) => entry.co2Kg >= threshold
        );
        
        if (hasHighImpact) {
          matches = true;
          matchReason = `High-impact activity detected (>${condition.threshold} kg CO2)`;
          relevanceScore = 70;
        }
      }
      break;
    }

    case 'always': {
      matches = true;
      matchReason = 'General tip';
      relevanceScore = 30; // Lower score for general tips
      break;
    }
  }

  if (!matches) {
    return null;
  }

  // Boost relevance score based on priority
  if (rule.priority === 'high') {
    relevanceScore += 10;
  } else if (rule.priority === 'medium') {
    relevanceScore += 5;
  }

  return {
    rule,
    matchReason,
    relevanceScore: Math.min(100, relevanceScore),
  };
};

/**
 * Evaluate all tip rules and return top matches
 */
export const evaluateTips = (
  entries: ActivityLogEntry[],
  limit: number = 5
): EvaluatedTip[] => {
  // Aggregate weekly data
  const data = aggregateWeeklyData(entries);

  // Evaluate all rules
  const evaluatedTips: EvaluatedTip[] = [];
  
  for (const rule of TIP_RULES) {
    const result = evaluateRule(rule, data);
    if (result) {
      evaluatedTips.push(result);
    }
  }

  // Sort by relevance score (descending)
  evaluatedTips.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // If we have fewer than 3 specific tips, add general tips
  const specificTips = evaluatedTips.filter(
    (tip) => tip.rule.condition.type !== 'always'
  );
  const generalTips = evaluatedTips.filter(
    (tip) => tip.rule.condition.type === 'always'
  );

  let finalTips: EvaluatedTip[] = [];

  if (specificTips.length >= 3) {
    // We have enough specific tips
    finalTips = specificTips.slice(0, limit);
  } else {
    // Mix specific and general tips
    finalTips = [
      ...specificTips,
      ...generalTips.slice(0, Math.max(3, limit) - specificTips.length),
    ];
  }

  return finalTips.slice(0, limit);
};

/**
 * Format tips for API response
 */
export const formatTipsForResponse = (evaluatedTips: EvaluatedTip[]) => {
  return evaluatedTips.map((tip) => ({
    id: tip.rule.id,
    title: tip.rule.title,
    message: tip.rule.message,
    category: tip.rule.category,
    priority: tip.rule.priority,
    estimatedSavings: {
      amount: tip.rule.estimatedSavingsKg,
      period: tip.rule.savingsPeriod,
      description: `Save ~${tip.rule.estimatedSavingsKg} kg CO2/${tip.rule.savingsPeriod}`,
    },
    actionableSteps: tip.rule.actionableSteps,
    matchReason: tip.matchReason,
    relevanceScore: tip.relevanceScore,
    source: tip.rule.source,
  }));
};

// Made with Bob