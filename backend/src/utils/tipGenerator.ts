/**
 * Rule-based Tip Generator
 * Generates personalized tips based on user activity patterns
 */

import { PersonalizedTip, ActivityCategory } from '@cft/shared';

/**
 * Generate personalized tips for a user based on their activity data
 * @param userId - User ID
 * @param activities - User's recent activities
 * @returns Array of personalized tips (3-5 tips)
 */
export const generateTips = (
  userId: string,
  activities: Array<{ category: ActivityCategory; co2Impact: number }>
): PersonalizedTip[] => {
  // TODO: Implement actual tip generation logic
  // This is a placeholder that returns sample tips

  const tips: PersonalizedTip[] = [];

  // Analyze activities by category
  const categoryTotals: Record<ActivityCategory, number> = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
  };

  activities.forEach((activity) => {
    categoryTotals[activity.category] += activity.co2Impact;
  });

  // Generate tips based on highest impact categories
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  sortedCategories.forEach(([category, impact], index) => {
    if (impact > 0) {
      tips.push({
        id: `tip-${userId}-${Date.now()}-${index}`,
        userId,
        title: `Reduce ${category} emissions`,
        description: `Your ${category} activities generated ${impact.toFixed(
          2
        )} kg CO2e. Consider alternatives.`,
        category: category as ActivityCategory,
        priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
        potentialSavings: impact * 0.3, // Estimate 30% reduction potential
        actionable: true,
        reason: `High ${category} emissions detected`,
        generatedAt: new Date(),
      });
    }
  });

  return tips.slice(0, 5); // Return max 5 tips
};

// Made with Bob
