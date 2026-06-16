/**
 * Dashboard Routes
 * Handles dashboard summary with aggregated activity data
 */

import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyAuth } from '../middleware/auth';
import { initializeUser } from '../middleware/initializeUser';
import { ActivityCategory, ActivityLogEntry } from '@cft/shared';

const router = Router();

// Middleware chain for protected routes
const protectedRoute = [verifyAuth, initializeUser];

interface DailyCO2Total {
  date: string;
  total: number;
  byCategory: Record<ActivityCategory, number>;
}

interface DashboardSummary {
  totalCO2: number;
  categoryBreakdown: {
    category: ActivityCategory;
    co2Kg: number;
    percentage: number;
  }[];
  dailyTotals: DailyCO2Total[];
  goalProgress: {
    currentScore: number;
    baselineScore: number;
    percentageChange: number;
    goalTarget?: number;
    progressTowardGoal?: number;
  };
  period: {
    range: 'week' | 'month';
    startDate: string;
    endDate: string;
  };
  hasData: boolean;
}

/**
 * GET /api/dashboard/summary?range=week|month
 * Get aggregated dashboard data for the specified time range
 */
router.get('/summary', protectedRoute, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Get range parameter (default to week)
    const range = (req.query.range as string) || 'week';
    if (range !== 'week' && range !== 'month') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RANGE',
          message: 'Range must be either "week" or "month"',
        },
      });
    }

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    if (range === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }
    startDate.setHours(0, 0, 0, 0);

    // Fetch activity logs for the period
    const snapshot = await db
      .collection('activityLogs')
      .doc(userId)
      .collection('entries')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    const entries: ActivityLogEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as ActivityLogEntry[];

    // Check if user has any data
    const hasData = entries.length > 0;

    // Initialize category totals
    const categoryTotals: Record<ActivityCategory, number> = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
    };

    // Initialize daily totals map
    const dailyTotalsMap = new Map<string, DailyCO2Total>();

    // Aggregate data
    let totalCO2 = 0;

    entries.forEach(entry => {
      // Add to category totals
      categoryTotals[entry.category] += entry.co2Kg;
      totalCO2 += entry.co2Kg;

      // Add to daily totals
      const dateKey = entry.date.toISOString().split('T')[0];
      if (!dailyTotalsMap.has(dateKey)) {
        dailyTotalsMap.set(dateKey, {
          date: dateKey,
          total: 0,
          byCategory: {
            transport: 0,
            food: 0,
            energy: 0,
            shopping: 0,
          },
        });
      }

      const dailyTotal = dailyTotalsMap.get(dateKey)!;
      dailyTotal.total += entry.co2Kg;
      dailyTotal.byCategory[entry.category] += entry.co2Kg;
    });

    // Convert daily totals map to sorted array
    const dailyTotals = Array.from(dailyTotalsMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate category breakdown with percentages
    const categoryBreakdown = (Object.keys(categoryTotals) as ActivityCategory[])
      .map(category => ({
        category,
        co2Kg: parseFloat(categoryTotals[category].toFixed(3)),
        percentage: totalCO2 > 0 
          ? parseFloat(((categoryTotals[category] / totalCO2) * 100).toFixed(1))
          : 0,
      }))
      .sort((a, b) => b.co2Kg - a.co2Kg);

    // Get user data for score calculation
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User data not found',
        },
      });
    }

    const baselineScore = userData.baselineScore || 0;
    const goalTarget = userData.goalTarget;

    // Calculate current score based on recent activity
    // Current score is based on daily average CO2 over the period
    // compared to the baseline (which is annual, so we need to convert)
    const daysInPeriod = range === 'week' ? 7 : 30;
    const dailyAverageCO2 = hasData ? totalCO2 / daysInPeriod : 0;
    
    // Convert baseline to daily (assuming baseline is annual kg CO2)
    // National average is ~6000 kg/year, so daily is ~16.4 kg
    const baselineDailyCO2 = (6000 * (100 - baselineScore)) / 100 / 365;
    
    // Calculate current score (0-100, higher is better)
    // If user emits less than baseline daily average, score improves
    let currentScore = baselineScore;
    if (hasData && baselineDailyCO2 > 0) {
      const scoreAdjustment = ((baselineDailyCO2 - dailyAverageCO2) / baselineDailyCO2) * 10;
      currentScore = Math.max(0, Math.min(100, Math.round(baselineScore + scoreAdjustment)));
    }

    // Update user's current score in database
    await db.collection('users').doc(userId).set({
      currentScore,
      lastScoreUpdate: new Date(),
    }, { merge: true });

    // Calculate percentage change from baseline
    const percentageChange = baselineScore > 0
      ? parseFloat(((currentScore - baselineScore) / baselineScore * 100).toFixed(1))
      : 0;

    // Calculate progress toward goal (if goal exists)
    let progressTowardGoal: number | undefined;
    if (goalTarget !== undefined) {
      // Goal target is a percentage reduction (e.g., 20 means 20% reduction)
      // Progress is how much of that reduction has been achieved
      const actualImprovement = currentScore - baselineScore;
      progressTowardGoal = goalTarget > 0
        ? Math.min(100, Math.max(0, (actualImprovement / goalTarget) * 100))
        : 0;
      progressTowardGoal = parseFloat(progressTowardGoal.toFixed(1));
    }

    const summary: DashboardSummary = {
      totalCO2: parseFloat(totalCO2.toFixed(3)),
      categoryBreakdown,
      dailyTotals,
      goalProgress: {
        currentScore,
        baselineScore,
        percentageChange,
        goalTarget,
        progressTowardGoal,
      },
      period: {
        range,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      hasData,
    };

    console.log(`📊 Dashboard summary generated for user ${userId} (${range})`);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('❌ Error generating dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate dashboard summary',
      },
    });
  }
});

export default router;

// Made with Bob