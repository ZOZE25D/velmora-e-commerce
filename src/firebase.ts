import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase with explicit configuration
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Ensure auth is initialized properly
auth.useDeviceLanguage();

// Initialize Firestore with settings for better connectivity
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Forces long polling for better stability in some networks
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export default app;
