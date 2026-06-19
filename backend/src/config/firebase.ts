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

import path from 'path';
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Absolute path to the service account key at the project root (3 levels up from src/config/)
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../../../serviceAccountKey.json');

// Initialize Firebase Admin SDK
// Check if already initialized
if (getApps().length === 0) {
  const isCloudRun = process.env.K_SERVICE !== undefined; // Cloud Run sets K_SERVICE

  if (isCloudRun) {
    // Cloud Run: Use default service account (metadata server available)
    console.log('🔧 Initializing Firebase Admin with Cloud Run default credentials');
    initializeApp({
      credential: applicationDefault(),
    });
  } else {
    // Local dev: Load service account key JSON directly
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(SERVICE_ACCOUNT_PATH);
      console.log('🔧 Initializing Firebase Admin with service account key file');
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch {
      console.warn(`⚠️  Could not load service account key from ${SERVICE_ACCOUNT_PATH}`);
      console.warn('   Falling back to application default credentials');
      console.log('🔧 Initializing Firebase Admin with application default credentials');
      initializeApp({
        credential: applicationDefault(),
      });
    }
  }

  console.log('✅ Firebase Admin SDK initialized successfully');
} else {
  console.log('✅ Firebase Admin SDK already initialized');
}

// Export Firestore and Auth instances
export const db: Firestore = getFirestore();
export const auth: Auth = getAuth();

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true, // Ignore undefined values in writes
});

// Made with Bob
