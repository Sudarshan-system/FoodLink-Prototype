import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  type Auth, 
  connectAuthEmulator,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  deleteUser,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  type Firestore, 
  connectFirestoreEmulator,
  runTransaction,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isEmulatorRequested = 
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
  (typeof window !== 'undefined' && (
    window.location.search.includes('emulator=true') ||
    localStorage.getItem('foodlink_use_emulator') === 'true'
  ));

export const isFirebaseConfigured = Boolean(
  (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) ||
  isEmulatorRequested
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    const configToUse = isEmulatorRequested && !firebaseConfig.apiKey ? {
      apiKey: 'demo-api-key',
      authDomain: 'foodlink-emulator.firebaseapp.com',
      projectId: 'foodlink-rules-test',
      storageBucket: 'foodlink-emulator.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef'
    } : firebaseConfig;

    app = getApps().length === 0 ? initializeApp(configToUse) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    if (isEmulatorRequested) {
      if (db) {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        console.info('[FoodLink Firebase] Connected to Firestore Emulator on 127.0.0.1:8080');
      }
      if (auth) {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099');
        console.info('[FoodLink Firebase] Connected to Auth Emulator on http://127.0.0.1:9099');
      }
    } else {
      console.info('[FoodLink Firebase] Connected to Firebase Project:', firebaseConfig.projectId);
    }
  } catch (error) {
    console.warn('[FoodLink Firebase] Initialization error. Running in local preview mode:', error);
  }
} else {
  console.info('[FoodLink Firebase] No remote API keys detected in .env.local. Running in offline/local state mode.');
}

export { 
  app, 
  auth, 
  db, 
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  signInWithPopup,
  deleteUser,
  onAuthStateChanged,
  type User,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  runTransaction
};
