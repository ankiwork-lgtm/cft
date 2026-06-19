/**
 * User Initialization Middleware
 * Creates user document in Firestore on first sign-in.
 *
 * Performance: an in-memory Set caches initialized UIDs so the Firestore
 * get/set only runs once per user per process lifetime (i.e. once per
 * Cloud Run instance cold-start), not on every authenticated request.
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';

/**
 * Process-scoped cache of UIDs that have already been initialised.
 * Cleared on process restart / Cloud Run instance recycle — that's fine,
 * because the underlying Firestore doc persists.
 */
const initializedUserIds = new Set<string>();

/**
 * Middleware to ensure a Firestore user document exists.
 * Creates the document with safe defaults on first visit; skips on all
 * subsequent requests for the same UID within this process lifetime.
 */
export const initializeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const uid = req.user.uid;

    // Fast path: UID already initialised in this process — skip Firestore entirely.
    if (initializedUserIds.has(uid)) {
      return next();
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const defaultUserData = {
        email: req.user.email || null,
        quizCompleted: false,
        baselineScore: null,
        currentScore: null,
        goalTarget: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await userRef.set(defaultUserData);
      console.log(`✅ Created user document for uid: ${uid}`);
    }

    // Mark as initialised so subsequent requests skip this check.
    initializedUserIds.add(uid);

    next();
  } catch (error) {
    console.error('User initialization error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to initialize user',
      },
    });
  }
};

// Made with Bob