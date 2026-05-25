import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// In this environment, we attempt to initialize with available credentials or default
// Since we don't have a direct service account JSON file, we'll use notice and error handling
// WARNING: This depends on the environment setup by AI Studio's set_up_firebase tool.

let db: FirebaseFirestore.Firestore;
let auth: any;

try {
  if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      initializeApp();
    }
  }
  db = getFirestore();
  auth = getAuth();
} catch (error) {
  console.error("Firebase Admin initialization failed. Check credentials/environment.");
  throw error;
}

export { db, auth };
