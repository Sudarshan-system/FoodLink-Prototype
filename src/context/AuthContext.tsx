import React, { createContext, useContext, useEffect, useState } from 'react';
import type { 
  UserProfile, 
  UserRole, 
  VerificationStatus 
} from '../types';
import { 
  auth, 
  db, 
  isFirebaseConfigured, 
  isEmulatorRequested,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  signInWithPopup, 
  googleProvider,
  deleteUser,
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc,
  collection,
  getDocs,
  query,
  where,
  type User
} from '../lib/firebase';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  authModalRoleHint: UserRole | null;
  openAuthModal: (mode?: 'signin' | 'signup', roleHint?: UserRole) => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, data: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: (emailOverride?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchPersonaDemo: (preset: 'restaurant' | 'event_donor' | 'elder_shelter' | 'old_age_home' | 'orphanage' | 'ngo' | 'individual_recipient' | 'admin') => void;
  updateUserVerification: (status: VerificationStatus, expiry?: string) => Promise<void>;
  isFirebaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo Presets for quick persona evaluation and offline testing
export const DEMO_PROFILES: Record<string, UserProfile> = {
  restaurant: {
    uid: 'demo_restaurant_01',
    email: 'chef.arjun@spicegarden.org',
    displayName: 'Chef Arjun (Spice Garden)',
    phone: '+91 98765 43210',
    role: 'donor',
    subRole: 'restaurant',
    organizationName: 'Spice Garden Fine Dining',
    address: '42 Brigade Road, Central District',
    city: 'Bengaluru',
    location: { lat: 12.9716, lng: 77.5946 },
    verificationStatus: 'verified',
    verificationExpiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  event_donor: {
    uid: 'demo_event_02',
    email: 'priya.sharma@gmail.com',
    displayName: 'Priya Sharma (Wedding Host)',
    phone: '+91 91234 56789',
    role: 'donor',
    subRole: 'individual_event',
    organizationName: 'Sharma & Verma Wedding Banquet',
    address: 'Grand Palace Lawns, Outer Ring Rd',
    city: 'Bengaluru',
    location: { lat: 12.9352, lng: 77.6245 },
    verificationStatus: 'verified',
    verificationExpiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  elder_shelter: {
    uid: 'demo_shelter_03',
    email: 'caretaker.ramesh@anandaoldage.org',
    displayName: 'Ramesh K. (Chief Caretaker)',
    phone: '+91 94455 66778',
    role: 'recipient',
    subRole: 'elder_shelter',
    organizationName: 'Ananda Elderly Haven & Shelter',
    address: '15 Shanti Lane, Green Valley',
    city: 'Bengaluru',
    location: { lat: 12.9611, lng: 77.6387 },
    verificationStatus: 'verified',
    verificationExpiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  orphanage: {
    uid: 'demo_orphanage_04',
    email: 'sister.mary@hopechildren.org',
    displayName: 'Sister Mary (Superintendent)',
    phone: '+91 93322 11445',
    role: 'recipient',
    subRole: 'orphanage',
    organizationName: 'Hope Children’s Home & Shelter',
    address: '88 St. Francis Cross Rd',
    city: 'Bengaluru',
    location: { lat: 12.9840, lng: 77.6050 },
    verificationStatus: 'verified',
    verificationExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ngo: {
    uid: 'demo_ngo_05',
    email: 'coordinator@feedall.org',
    displayName: 'Kavita Menon (Field Lead)',
    phone: '+91 97788 99001',
    role: 'recipient',
    subRole: 'ngo',
    organizationName: 'FeedAll Community Aid Foundation',
    address: '104 Metro Circle, Indiranagar',
    city: 'Bengaluru',
    location: { lat: 12.9784, lng: 77.6408 },
    verificationStatus: 'verified',
    verificationExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  old_age_home: {
    uid: 'demo_oldage_06',
    email: 'matron.sarla@vridhashram.org',
    displayName: 'Sarla Devi (Matron)',
    phone: '+91 98877 66554',
    role: 'recipient',
    subRole: 'old_age_home',
    organizationName: 'Vridh Seva Ashram Trust',
    address: '22 Temple Bell Road, Malleshwaram',
    city: 'Bengaluru',
    location: { lat: 13.0035, lng: 77.5694 },
    verificationStatus: 'verified',
    verificationExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  individual_recipient: {
    uid: 'demo_individual_07',
    email: 'manjunath.b@gmail.com',
    displayName: 'Manjunath B.',
    phone: '+91 97654 32190',
    role: 'recipient',
    subRole: 'individual_recipient',
    organizationName: 'Individual Recipient (Family Care)',
    address: 'Slum Cluster B, Shivaji Nagar',
    city: 'Bengaluru',
    location: { lat: 12.9856, lng: 77.6057 },
    verificationStatus: 'pending',
    verificationExpiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  admin: {
    uid: 'demo_admin_00',
    email: 'admin@foodlink.org',
    displayName: 'FoodLink Safety Admin',
    phone: '+91 90000 00000',
    role: 'admin',
    address: 'FoodLink HQ',
    city: 'Bengaluru',
    verificationStatus: 'verified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
};

const LOCAL_STORAGE_USER_KEY = 'foodlink_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authModalRoleHint, setAuthModalRoleHint] = useState<UserRole | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured && auth && db) {
      const activeDb = db;
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            const userRef = doc(activeDb, 'users', fbUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const profile = userSnap.data() as UserProfile;
              setUser(profile);
              localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
            }
          } catch (e) {
            console.error('Error fetching Firestore user profile:', e);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin', roleHint: UserRole | null = null) => {
    setAuthModalMode(mode);
    setAuthModalRoleHint(roleHint);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth && db) {
      let credential;
      try {
        credential = await signInWithEmailAndPassword(auth, email, pass);
      } catch (err: any) {
        if (isEmulatorRequested || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            credential = await createUserWithEmailAndPassword(auth, email, pass);
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              credential = await signInWithEmailAndPassword(auth, email, pass);
            } else {
              throw createErr;
            }
          }
        } else {
          throw err;
        }
      }

      const userRef = doc(db, 'users', credential.user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setUser(profile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      } else {
        const isRecip = email.includes('ananda') || email.includes('shelter') || email.includes('hope') || email.includes('relief') || email.includes('elder');
        const defaultProfile: UserProfile = {
          uid: credential.user.uid,
          email,
          displayName: email.split('@')[0],
          phone: '+91 98450 12345',
          role: isRecip ? 'recipient' : 'donor',
          subRole: isRecip ? 'elder_shelter' : 'restaurant',
          organizationName: isRecip ? 'Registered Recipient' : 'Registered Food Donor',
          address: 'Bengaluru',
          city: 'Bengaluru',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, defaultProfile);
        setUser(defaultProfile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(defaultProfile));
      }
    } else {
      if (!import.meta.env.DEV) {
        throw new Error('Firebase Authentication is required for production.');
      }
      let registeredUsers: Record<string, UserProfile> = {};
      try {
        const raw = localStorage.getItem('foodlink_registered_users_db');
        if (raw) registeredUsers = JSON.parse(raw);
      } catch {}

      const matched = registeredUsers[email.toLowerCase()] || 
        Object.values(DEMO_PROFILES).find(p => p.email.toLowerCase() === email.toLowerCase());

      const profile: UserProfile = matched || {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0],
        phone: '+91 98000 00000',
        role: 'donor',
        subRole: 'restaurant',
        organizationName: 'Sample Kitchen',
        address: 'MG Road',
        city: 'Bengaluru',
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(profile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    }
    closeAuthModal();
  };

  const registerWithEmail = async (email: string, pass: string, data: Partial<UserProfile>) => {
    const newProfile: UserProfile = {
      uid: '',
      email,
      displayName: data.displayName || email.split('@')[0],
      phone: data.phone || '',
      role: data.role || 'donor',
      subRole: data.subRole || (data.role === 'donor' ? 'restaurant' : 'elder_shelter'),
      organizationName: data.organizationName || '',
      address: data.address || '',
      city: data.city || '',
      verificationStatus: 'pending',
      verificationExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    if (isFirebaseConfigured && auth && db) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      newProfile.uid = cred.user.uid;
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    } else {
      newProfile.uid = 'usr_' + Date.now();
    }

    // Persist in local database so returning Google Sign In and Account Linking can find this user
    try {
      const raw = localStorage.getItem('foodlink_registered_users_db');
      const dbUsers: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
      dbUsers[email.toLowerCase()] = newProfile;
      localStorage.setItem('foodlink_registered_users_db', JSON.stringify(dbUsers));
    } catch (e) {
      console.error('Error saving registered user locally:', e);
    }

    setUser(newProfile);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
    closeAuthModal();
  };

  const loginWithGoogle = async (emailOverride?: string) => {
    if (isFirebaseConfigured && auth && db && googleProvider) {
      let cred;
      try {
        cred = await signInWithPopup(auth, googleProvider);
      } catch (err: any) {
        if (err.code === 'auth/account-exists-with-different-credential') {
          throw new Error("An account already exists with this email address using email and password. Please sign in with your email and password below.");
        }
        throw err;
      }

      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && snap.data()?.role) {
        const existing = snap.data() as UserProfile;
        setUser(existing);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(existing));
        closeAuthModal();
        return;
      }

      // Check whether a user registered with this email under a different UID in Firestore (e.g. email/password first)
      if (cred.user.email) {
        try {
          const q = query(collection(db, 'users'), where('email', '==', cred.user.email));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const existing = querySnap.docs[0].data() as UserProfile;
            if (existing && existing.role) {
              setUser(existing);
              localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(existing));
              closeAuthModal();
              return;
            }
          }
        } catch (queryErr) {
          console.warn('[FoodLink Auth] Secondary email query lookup:', queryErr);
        }
      }

      // No profile with role found in /users
      try {
        await deleteUser(cred.user);
      } catch (delErr) {
        console.warn('[FoodLink Auth] Could not delete auto-created unlinked Firebase user:', delErr);
      }
      await fbSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      throw new Error("We couldn't find a FoodLink account for this Google email. Please create an account first, then you can sign in with Google.");
    } else {
      // Offline / local preview simulation
      const targetEmail = (emailOverride || '').trim().toLowerCase();
      if (!targetEmail) {
        throw new Error("Please choose or specify a Google account to sign in.");
      }

      if (targetEmail.includes('different-credential')) {
        throw new Error("An account already exists with this email address using email and password. Please sign in with your email and password below.");
      }

      let registeredUsers: Record<string, UserProfile> = {};
      try {
        const raw = localStorage.getItem('foodlink_registered_users_db');
        if (raw) registeredUsers = JSON.parse(raw);
      } catch {}

      // Account linking / existing account lookup:
      // Match against registered users or demo profiles by email
      const linkedProfile = registeredUsers[targetEmail] || 
        Object.values(DEMO_PROFILES).find(p => p.email.toLowerCase() === targetEmail);

      if (linkedProfile && linkedProfile.role) {
        setUser(linkedProfile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(linkedProfile));
        closeAuthModal();
        return;
      }

      // Not registered! Block entry, reset state, and return friendly message
      setUser(null);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      throw new Error("We couldn't find a FoodLink account for this Google email. Please create an account first, then you can sign in with Google.");
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const switchPersonaDemo = (presetKey: 'restaurant' | 'event_donor' | 'elder_shelter' | 'old_age_home' | 'orphanage' | 'ngo' | 'individual_recipient' | 'admin') => {
    if (!import.meta.env.DEV) {
      console.warn('Demo persona switching is strictly disabled in production builds.');
      return;
    }
    const preset = DEMO_PROFILES[presetKey];
    if (preset) {
      setUser({ ...preset });
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(preset));
    }
  };

  const updateUserVerification = async (status: VerificationStatus, expiry?: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      verificationStatus: status,
      verificationExpiryDate: expiry || user.verificationExpiryDate,
      updatedAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      } catch (e) {
        console.error('Error updating verification status in Firestore:', e);
      }
    }
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAuthModalOpen,
        authModalMode,
        authModalRoleHint,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        switchPersonaDemo,
        updateUserVerification,
        isFirebaseLive: isFirebaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
