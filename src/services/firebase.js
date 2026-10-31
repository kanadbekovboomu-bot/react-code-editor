/**
 * firebase.js
 * Firebase initialization, Auth, and Firestore connection management with demo fallback
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default or environment-provided Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyApiKeyForLocalFallbackMode000",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "react-code-editor-demo.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "react-code-editor-demo",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "react-code-editor-demo.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef1234567890"
};

let app = null;
let auth = null;
let db = null;
let isConfigured = false;

// Mock local auth state for offline / demo mode
const DEMO_AUTH_KEY = 'code_craft_demo_user_v1';

function getDemoUser() {
  try {
    const raw = localStorage.getItem(DEMO_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setDemoUser(user) {
  try {
    if (user) {
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(DEMO_AUTH_KEY);
    }
  } catch (e) {}
}

/**
 * Initializes Firebase if not already initialized
 */
export function initFirebase() {
  if (app) return { app, auth, db, isConfigured };

  try {
    // Check if valid non-dummy API key is present
    const isRealKey = firebaseConfig.apiKey && 
      !firebaseConfig.apiKey.includes('Demo') && 
      !firebaseConfig.apiKey.includes('Dummy');

    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(firebaseConfig);
    }

    auth = getAuth(app);
    db = getFirestore(app);
    isConfigured = Boolean(isRealKey);
  } catch (err) {
    console.info('Operating in Local Demo Mode (Firebase offline fallback active):', err.message);
    isConfigured = false;
  }

  return { app, auth, db, isConfigured };
}

// Auto-run initialization
initFirebase();

export function isFirebaseConfigured() {
  return isConfigured;
}

export function getFirebaseDb() {
  return db;
}

export function getFirebaseAuth() {
  return auth;
}

/**
 * Signs in anonymously (Guest Mode)
 */
export async function signInAnonymousUser() {
  if (isConfigured && auth) {
    try {
      const cred = await signInAnonymously(auth);
      return {
        uid: cred.user.uid,
        email: null,
        displayName: 'Guest #' + cred.user.uid.substring(0, 4),
        isAnonymous: true
      };
    } catch (err) {
      console.warn('Firebase anonymous signin failed, falling back to local guest:', err);
    }
  }

  // Demo fallback
  const guestId = 'guest_' + Math.random().toString(36).substring(2, 6);
  const demoUser = {
    uid: guestId,
    email: null,
    displayName: 'Guest #' + guestId.split('_')[1].toUpperCase(),
    isAnonymous: true
  };
  setDemoUser(demoUser);
  return demoUser;
}

/**
 * Signs in with email & password
 */
export async function signInWithEmail(email, password) {
  if (isConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || email.split('@')[0],
        isAnonymous: false
      };
    } catch (err) {
      // Re-throw if real Firebase to let user see error
      throw new Error(err.message);
    }
  }

  // Demo fallback
  if (!email || !password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const demoUser = {
    uid: 'user_' + btoa(email).substring(0, 8),
    email,
    displayName: email.split('@')[0],
    isAnonymous: false
  };
  setDemoUser(demoUser);
  return demoUser;
}

/**
 * Registers a new user with email & password
 */
export async function signUpWithEmail(email, password) {
  if (isConfigured && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: email.split('@')[0],
        isAnonymous: false
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // Demo fallback
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const demoUser = {
    uid: 'user_' + btoa(email).substring(0, 8),
    email,
    displayName: email.split('@')[0],
    isAnonymous: false
  };
  setDemoUser(demoUser);
  return demoUser;
}

/**
 * Signs out current user
 */
export async function signOutUser() {
  if (isConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
  }
  setDemoUser(null);
  return true;
}

/**
 * Listens to authentication state changes
 */
export function subscribeToAuth(callback) {
  if (isConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Guest #' + user.uid.substring(0, 4)),
          isAnonymous: user.isAnonymous
        });
      } else {
        const demoUser = getDemoUser();
        callback(demoUser);
      }
    });
  }

  // Demo subscription
  const demoUser = getDemoUser();
  callback(demoUser);
  return () => {};
}
