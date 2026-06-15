/**
 * Activity Logs Routes
 * Handles daily activity logging with CO2 calculations
 */

import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyAuth } from '../middleware/auth';
import { initializeUser } from '../middleware/initializeUser';
import { calculateCO2, validateActivity } from '../utils/emissionCalculator';
import { ActivityCategory, ActivityLogEntry, ActivityLogInput } from '@cft/shared';

const router = Router();

// Middleware chain for protected routes
const protectedRoute = [verifyAuth, initializeUser];

/**
 * POST /api/logs/entries
 * Create a new activity log entry
 */
router.post('/entries', protectedRoute, async (req: Request, res: Response) => {
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

    const { date, category, activityType, quantity, unit, notes } = req.body as ActivityLogInput;

    // Validate required fields
    if (!date || !category || !activityType || quantity === undefined || !unit) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: date, category, activityType, quantity, unit',
        },
      });
    }

    // Validate category
    const validCategories: ActivityCategory[] = ['transport', 'food', 'energy', 'shopping'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY',
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        },
      });
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: 'Quantity must be a positive number',
        },
      });
    }

    // Validate activity type exists in emission factors
    const isValid = await validateActivity(category, activityType, unit);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTIVITY',
          message: `No emission factor found for ${category}/${activityType}/${unit}`,
        },
      });
    }

    // Calculate CO2 emissions
    const co2Kg = await calculateCO2(category, activityType, quantity, unit);
    if (co2Kg === null) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'CALCULATION_ERROR',
          message: 'Failed to calculate CO2 emissions',
        },
      });
    }

    // Create activity log entry
    const entryData = {
      userId,
      date: new Date(date),
      category,
      activityType,
      quantity,
      unit,
      co2Kg: parseFloat(co2Kg.toFixed(3)),
      createdAt: new Date(),
      notes: notes || null,
    };

    const docRef = await db
      .collection('activityLogs')
      .doc(userId)
      .collection('entries')
      .add(entryData);

    const entry: ActivityLogEntry = {
      id: docRef.id,
      ...entryData,
    };

    console.log(`✅ Activity logged: ${activityType} (${co2Kg.toFixed(2)} kg CO2e)`);

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('❌ Error creating activity log:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create activity log entry',
      },
    });
  }
});

/**
 * GET /api/logs/entries?date=YYYY-MM-DD
 * Get activity log entries for a specific date
 */
router.get('/entries', protectedRoute, async (req: Request, res: Response) => {
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

    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Date parameter is required (format: YYYY-MM-DD)',
        },
      });
    }

    // Parse date and create start/end of day
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Invalid date format. Use YYYY-MM-DD',
        },
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Query entries for the date
    const snapshot = await db
      .collection('activityLogs')
      .doc(userId)
      .collection('entries')
      .where('date', '>=', startOfDay)
      .where('date', '<=', endOfDay)
      .orderBy('date', 'desc')
      .get();

    const entries: ActivityLogEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as ActivityLogEntry[];

    // Calculate totals per category
    const totals: Record<ActivityCategory, number> = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
    };

    let totalCO2 = 0;

    entries.forEach(entry => {
      totals[entry.category] += entry.co2Kg;
      totalCO2 += entry.co2Kg;
    });

    console.log(`📊 Retrieved ${entries.length} entries for ${date}`);

    res.json({
      success: true,
      data: {
        date,
        entries,
        totals: {
          total: parseFloat(totalCO2.toFixed(3)),
          byCategory: {
            transport: parseFloat(totals.transport.toFixed(3)),
            food: parseFloat(totals.food.toFixed(3)),
            energy: parseFloat(totals.energy.toFixed(3)),
            shopping: parseFloat(totals.shopping.toFixed(3)),
          },
        },
        entryCount: entries.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch activity log entries',
      },
    });
  }
});

/**
 * DELETE /api/logs/entries/:id
 * Delete an activity log entry
 */
router.delete('/entries/:id', protectedRoute, async (req: Request, res: Response) => {
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

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Entry ID is required',
        },
      });
    }

    const docRef = db
      .collection('activityLogs')
      .doc(userId)
      .collection('entries')
      .doc(id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Activity log entry not found',
        },
      });
    }

    // Verify ownership
    const entryData = doc.data();
    if (entryData?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this entry',
        },
      });
    }

    await docRef.delete();

    console.log(`🗑️  Deleted activity log entry: ${id}`);

    res.json({
      success: true,
      message: 'Activity log entry deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting activity log:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete activity log entry',
      },
    });
  }
});

export default router;

// Made with Bob