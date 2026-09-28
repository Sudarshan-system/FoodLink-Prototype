import React, { createContext, useContext, useState, useEffect } from 'react';
import type { VerificationDocument, UserProfile } from '../types';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured, collection, doc, setDoc, getDocs, updateDoc } from '../lib/firebase';

interface VerificationContextType {
  verifications: VerificationDocument[];
  pendingCount: number;
  submitDocument: (docData: {
    documentType: VerificationDocument['documentType'];
    documentNumber: string;
    fileName: string;
    fileSize?: string;
  }) => Promise<VerificationDocument>;
  approveDocument: (docId: string, expiryDate?: string) => Promise<void>;
  rejectDocument: (docId: string, rejectionReason: string) => Promise<void>;
  getUserDocument: (userId: string) => VerificationDocument | undefined;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

const LOCAL_STORAGE_VERIFICATIONS_KEY = 'foodlink_verifications_data';

// Initial verification submissions seeded for immediate testing and evaluation
export const INITIAL_VERIFICATIONS: VerificationDocument[] = [
  {
    id: 'verif_01',
    userId: 'demo_restaurant_01',
    userDisplayName: 'Chef Arjun (Spice Garden)',
    organizationName: 'Spice Garden Fine Dining',
    userRole: 'donor',
    userSubRole: 'restaurant',
    documentType: 'fssai_cert',
    documentNumber: 'FSSAI-21223019000452',
    name: 'Commercial FSSAI Food Hygiene & Safety License',
    fileUrl: 'https://foodlink.org/docs/demo_fssai_cert.pdf',
    fileName: 'SpiceGarden_FSSAI_Certificate_2026.pdf',
    fileSize: '1.4 MB',
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  },
  {
    id: 'verif_02',
    userId: 'demo_shelter_03',
    userDisplayName: 'Ramesh K. (Chief Caretaker)',
    organizationName: 'Ananda Elderly Haven & Shelter',
    userRole: 'recipient',
    userSubRole: 'elder_shelter',
    documentType: 'shelter_license',
    documentNumber: 'BLR-TRUST-2018-9941',
    name: 'State Elder Care Home Registration & Shelter License',
    fileUrl: 'https://foodlink.org/docs/demo_shelter_license.pdf',
    fileName: 'AnandaHaven_Trust_Care_License.pdf',
    fileSize: '2.1 MB',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  },
  {
    id: 'verif_03',
    userId: 'demo_orphanage_04',
    userDisplayName: 'Sister Mary (Superintendent)',
    organizationName: 'Hope Children’s Home & Shelter',
    userRole: 'recipient',
    userSubRole: 'orphanage',
    documentType: 'shelter_license',
    documentNumber: 'KA-JJB-2020-0082',
    name: 'Juvenile Justice Board (JJB) Child Care Institution Registration',
    fileUrl: 'https://foodlink.org/docs/demo_orphanage_reg.pdf',
    fileName: 'HopeChildren_JJB_Registration_Cert.pdf',
    fileSize: '1.8 MB',
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  }
];

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [verifications, setVerifications] = useState<VerificationDocument[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VERIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading saved verifications:', e);
    }
    return INITIAL_VERIFICATIONS;
  });

  // Keep localStorage in sync
  const saveVerifications = (newList: VerificationDocument[]) => {
    setVerifications(newList);
    localStorage.setItem(LOCAL_STORAGE_VERIFICATIONS_KEY, JSON.stringify(newList));
  };

  // If Firebase is configured, fetch latest verifications collection
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const activeDb = db;
      const fetchFromFirestore = async () => {
        try {
          const snap = await getDocs(collection(activeDb, 'verifications'));
          if (!snap.empty) {
            const list: VerificationDocument[] = [];
            snap.forEach((d) => list.push(d.data() as VerificationDocument));
            saveVerifications(list);
          }
        } catch (e) {
          console.error('Error fetching verifications from Firestore:', e);
        }
      };
      fetchFromFirestore();
    }
  }, []);

  const submitDocument = async (docData: {
    documentType: VerificationDocument['documentType'];
    documentNumber: string;
    fileName: string;
    fileSize?: string;
    base64Data?: string;
  }): Promise<VerificationDocument> => {
    if (!user) throw new Error('Must be logged in to submit verification documents.');

    const newDoc: VerificationDocument = {
      id: 'doc_' + Date.now(),
      userId: user.uid,
      userDisplayName: user.displayName,
      organizationName: user.organizationName || user.displayName,
      userRole: user.role,
      userSubRole: user.subRole,
      documentType: docData.documentType,
      documentNumber: docData.documentNumber,
      name: docData.fileName.replace(/\.[^/.]+$/, ''),
      fileUrl: 'https://foodlink.org/mock/' + docData.fileName,
      fileName: docData.fileName,
      fileSize: docData.fileSize || '1.2 MB',
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Update or prepend to list
    const updatedList = [newDoc, ...verifications.filter(v => v.userId !== user.uid)];
    saveVerifications(updatedList);

    // Update active user state to pending and remove previous rejection reason
    const updatedUser: UserProfile = {
      ...user,
      verificationStatus: 'pending',
      rejectionReason: undefined,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('foodlink_active_user', JSON.stringify(updatedUser));

    // Sync to Firestore if live
    if (isFirebaseConfigured && db) {
      const activeDb = db;
      try {
        await setDoc(doc(activeDb, 'verifications', newDoc.id), newDoc);
        
        // Write compressed base64 attachment in private subcollection (<= 700 KB)
        if (docData.base64Data) {
          const cappedBase64 = docData.base64Data.slice(0, 716800);
          await setDoc(doc(activeDb, 'verifications', newDoc.id, 'attachments', 'primary_scan'), {
            userId: user.uid,
            fileName: docData.fileName,
            base64Data: cappedBase64,
            createdAt: new Date().toISOString()
          });
        }

        await updateDoc(doc(activeDb, 'users', user.uid), {
          verificationStatus: 'pending',
          rejectionReason: null,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Firestore document submission error:', err);
      }
    }

    return newDoc;
  };

  const approveDocument = async (docId: string, expiryDate?: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can approve verification documents.');
    }

    const targetDoc = verifications.find(v => v.id === docId);
    if (!targetDoc) throw new Error('Verification document not found.');

    const calculatedExpiry = expiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    const timestamp = new Date().toISOString();

    const updatedDoc: VerificationDocument = {
      ...targetDoc,
      status: 'verified',
      rejectionReason: undefined,
      reviewedByAdminUid: user.uid,
      reviewedByAdminName: user.displayName,
      reviewedAt: timestamp,
      expiryDate: calculatedExpiry
    };

    const updatedList = verifications.map(v => v.id === docId ? updatedDoc : v);
    saveVerifications(updatedList);

    // Update target user's profile in storage
    try {
      const activeStored = localStorage.getItem('foodlink_active_user');
      if (activeStored) {
        const storedUser = JSON.parse(activeStored) as UserProfile;
        if (storedUser.uid === targetDoc.userId) {
          storedUser.verificationStatus = 'verified';
          storedUser.verificationExpiryDate = calculatedExpiry;
          storedUser.rejectionReason = undefined;
          storedUser.reviewedByAdminUid = user.uid;
          storedUser.reviewedByAdminName = user.displayName;
          storedUser.reviewedAt = timestamp;
          localStorage.setItem('foodlink_active_user', JSON.stringify(storedUser));
        }
      }
    } catch (e) {
      console.error('Error updating active user cache on approve:', e);
    }

    // Sync with Firestore if active
    if (isFirebaseConfigured && db) {
      const activeDb = db;
      try {
        await updateDoc(doc(activeDb, 'verifications', docId), {
          status: 'verified',
          rejectionReason: null,
          reviewedByAdminUid: user.uid,
          reviewedByAdminName: user.displayName,
          reviewedAt: timestamp,
          expiryDate: calculatedExpiry
        });
        await updateDoc(doc(activeDb, 'users', targetDoc.userId), {
          verificationStatus: 'verified',
          verificationExpiryDate: calculatedExpiry,
          rejectionReason: null,
          reviewedByAdminUid: user.uid,
          reviewedByAdminName: user.displayName,
          reviewedAt: timestamp
        });
      } catch (err) {
        console.error('Firestore approval update error:', err);
      }
    }
  };

  const rejectDocument = async (docId: string, rejectionReason: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can reject verification documents.');
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('A detailed rejection reason is mandatory to guide the partner on what to resolve.');
    }

    const targetDoc = verifications.find(v => v.id === docId);
    if (!targetDoc) throw new Error('Verification document not found.');

    const timestamp = new Date().toISOString();

    const updatedDoc: VerificationDocument = {
      ...targetDoc,
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      reviewedByAdminUid: user.uid,
      reviewedByAdminName: user.displayName,
      reviewedAt: timestamp
    };

    const updatedList = verifications.map(v => v.id === docId ? updatedDoc : v);
    saveVerifications(updatedList);

    // Update target user's profile in storage
    try {
      const activeStored = localStorage.getItem('foodlink_active_user');
      if (activeStored) {
        const storedUser = JSON.parse(activeStored) as UserProfile;
        if (storedUser.uid === targetDoc.userId) {
          storedUser.verificationStatus = 'rejected';
          storedUser.rejectionReason = rejectionReason.trim();
          storedUser.reviewedByAdminUid = user.uid;
          storedUser.reviewedByAdminName = user.displayName;
          storedUser.reviewedAt = timestamp;
          localStorage.setItem('foodlink_active_user', JSON.stringify(storedUser));
        }
      }
    } catch (e) {
      console.error('Error updating active user cache on reject:', e);
    }

    // Sync with Firestore if active
    if (isFirebaseConfigured && db) {
      const activeDb = db;
      try {
        await updateDoc(doc(activeDb, 'verifications', docId), {
          status: 'rejected',
          rejectionReason: rejectionReason.trim(),
          reviewedByAdminUid: user.uid,
          reviewedByAdminName: user.displayName,
          reviewedAt: timestamp
        });
        await updateDoc(doc(activeDb, 'users', targetDoc.userId), {
          verificationStatus: 'rejected',
          rejectionReason: rejectionReason.trim(),
          reviewedByAdminUid: user.uid,
          reviewedByAdminName: user.displayName,
          reviewedAt: timestamp
        });
      } catch (err) {
        console.error('Firestore rejection update error:', err);
      }
    }
  };

  const getUserDocument = (userId: string) => {
    return verifications.find(v => v.userId === userId);
  };

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <VerificationContext.Provider
      value={{
        verifications,
        pendingCount,
        submitDocument,
        approveDocument,
        rejectDocument,
        getUserDocument
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const ctx = useContext(VerificationContext);
  if (!ctx) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return ctx;
};
