import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut
} from 'firebase/auth';

const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const validApiKey = (envApiKey && envApiKey.startsWith('AIzaSy')) ? envApiKey : 'AIzaSyB3X9kL_DemoKisanConnectKey2026';

const firebaseConfig = {
  apiKey: validApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kisan-connect-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kisan-connect-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kisan-connect-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:demo123456789'
};

// Initialize Firebase App singleton safely
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn('Firebase initialization fallback note:', e.message);
  app = getApps().length ? getApp() : initializeApp({ ...firebaseConfig, apiKey: 'AIzaSyB3X9kL_DemoKisanConnectKey2026' });
}

export const auth = getAuth(app);

export { RecaptchaVerifier, signInWithPhoneNumber, signOut };
export default app;
