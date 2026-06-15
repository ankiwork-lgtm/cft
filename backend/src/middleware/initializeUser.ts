/**
 * User Initialization Middleware
 * Creates user document in Firestore on first sign-in
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';

/**
 * Middleware to ensure user document exists in Firestore
 * Creates document with default values if it doesn't exist
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

    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();

    // If user document doesn't exist, create it with defaults
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
      console.log(`✅ Created user document for uid: ${req.user.uid}`);
    }

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