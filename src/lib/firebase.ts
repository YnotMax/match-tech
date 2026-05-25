import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';
import { firebaseLog } from './logger';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, firebaseConfig.firestoreDatabaseId || '(default)');

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    firebaseLog.info("Firebase Connection verified.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      firebaseLog.error("Please check your Firebase configuration.", error);
    }
  }
}

// Test connection on boot
testConnection();
