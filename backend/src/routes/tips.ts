/**
 * Tips Routes
 * Handles personalized tip generation based on user activity
 */

import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyAuth } from '../middleware/auth';
import { initializeUser } from '../middleware/initializeUser';
import { evaluateTips, formatTipsForResponse } from '../utils/tipEvaluator';
import { ActivityLogEntry } from '@cft/shared';

const router = Router();

// Middleware chain for protected routes
const protectedRoute = [verifyAuth, initializeUser];

/**
 * GET /api/tips
 * Get personalized tips based on the current week's activity data
 * Query params:
 *   - limit: number (default: 5, max: 10) - Number of tips to return
 */
router.get('/', protectedRoute, async (req: Request, res: Response) => {
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

    // Parse limit parameter
    const limitParam = req.query.limit;
    let limit = 5; // Default
    if (limitParam) {
      const parsedLimit = parseInt(limitParam as string, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 10) {
        limit = parsedLimit;
      }
    }

    // Calculate current week's date range (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    console.log(`📊 Fetching tips for user ${userId} (week: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]})`);

    // Fetch current week's activity logs
    const snapshot = await db
      .collection('activityLogs')
      .doc(userId)
      .collection('entries')
      .where('date', '>=', weekStart)
      .where('date', '<=', weekEnd)
      .orderBy('date', 'desc')
      .get();

    const entries: ActivityLogEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as ActivityLogEntry[];

    console.log(`📝 Found ${entries.length} activity entries for the week`);

    // Evaluate tips based on activity data
    const evaluatedTips = evaluateTips(entries, limit);
    
    // Format tips for response
    const tips = formatTipsForResponse(evaluatedTips);

    console.log(`💡 Generated ${tips.length} personalized tips`);

    res.json({
      success: true,
      data: {
        tips,
        period: {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString(),
        },
        activityCount: entries.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error generating tips:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate personalized tips',
      },
    });
  }
});

/**
 * GET /api/tips/preview
 * Preview all available tip rules (for debugging/admin)
 */
router.get('/preview', protectedRoute, async (_req: Request, res: Response) => {
  try {
    const { TIP_RULES } = await import('@cft/shared');
    
    res.json({
      success: true,
      data: {
        totalRules: TIP_RULES.length,
        rules: TIP_RULES.map(rule => ({
          id: rule.id,
          title: rule.title,
          category: rule.category,
          priority: rule.priority,
          conditionType: rule.condition.type,
          estimatedSavings: `${rule.estimatedSavingsKg} kg CO2/${rule.savingsPeriod}`,
        })),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching tip rules:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tip rules',
      },
    });
  }
});

export default router;

// Made with Bob