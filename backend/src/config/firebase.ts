/**
 * Firebase Admin SDK Configuration
 *
 * Local Development:
 * - Uses GOOGLE_APPLICATION_CREDENTIALS environment variable
 * - Points to service account key JSON file
 *
 * Cloud Run Production:
 * - Uses default service account (no credentials needed)
 * - Automatically authenticated via Cloud Run environment
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isCloudRun = process.env.K_SERVICE !== undefined; // Cloud Run sets K_SERVICE

  if (isCloudRun) {
    // Cloud Run: Use default service account
    console.log('🔧 Initializing Firebase Admin with Cloud Run default credentials');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Local dev: Use service account key file
    console.log('🔧 Initializing Firebase Admin with service account key');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    // Fallback: Try application default credentials
    console.log('🔧 Initializing Firebase Admin with application default credentials');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  console.log('✅ Firebase Admin SDK initialized successfully');
}

// Export Firestore and Auth instances
export const db = admin.firestore();
export const auth = admin.auth();

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true, // Ignore undefined values in writes
});

export default admin;

// Made with Bob
