import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  serverTimestamp, 
  Timestamp,
  runTransaction,
  onSnapshot
} from 'firebase/firestore';

export interface ListingSafetyDeclaration {
  temperatureSafe: boolean;
  hygienicallyPrepared: boolean;
  allergensDisclosed: boolean;
  freshAtListing: boolean;
  declaredAt: any;
  declaredByUid: string;
}

export interface CoarseLocation {
  locality: string;
  city: string;
  lat: number;
  lng: number;
}

export interface PrivatePickupDetails {
  exactAddress: string;
  contactPhone: string;
  instructions?: string;
  donorUid: string;
}

export interface Claim {
  id: string;
  listingId: string;
  recipientUid: string;
  recipientOrgName: string;
  quantity: number;
  status: 'confirmed' | 'picked_up' | 'cancelled' | 'expired';
  claimedAt: any;
  cancelledAt?: any;
  pickupCode?: string | null;
  pickupVerifiedAt?: any;
  listingTitle?: string;
  listingUnit?: string;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  exactAddress?: string;
  contactPhone?: string;
  donorName?: string;
}

export interface SurplusListing {
  id: string;
  donorUid: string;
  donorName?: string;
  donorType: 'restaurant' | 'individual_event';
  title: string;
  description: string;
  foodCategory: string;
  allergens: string[];
  totalQuantity: number;
  remainingQuantity: number;
  unit: 'boxes' | 'kg' | 'plates';
  preparedAt: any;
  expiresAt: any;
  pickupWindowStart: any;
  pickupWindowEnd: any;
  status: 'active' | 'expired' | 'cancelled';
  coarseLocation: CoarseLocation;
  safetyDeclaration: ListingSafetyDeclaration;
  eventName?: string;
  estimatedGuests?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingInput {
  title: string;
  description: string;
  foodCategory: string;
  allergens: string[];
  totalQuantity: number;
  unit: 'boxes' | 'kg' | 'plates';
  shelfLifeHours?: number; // Optional fallback
  pickupWindowHours?: number; // Optional fallback
  preparedAt?: string; // Exact ISO date-time string
  expiresAt?: string; // Exact ISO date-time string
  pickupWindowStart?: string; // Exact ISO date-time string
  pickupWindowEnd?: string; // Exact ISO date-time string
  coarseLocation: CoarseLocation;
  exactAddress: string;
  contactPhone: string;
  instructions?: string;
  safetyDeclaration: {
    temperatureSafe: boolean;
    hygienicallyPrepared: boolean;
    allergensDisclosed: boolean;
    freshAtListing: boolean;
  };
  eventName?: string;
  estimatedGuests?: number;
}

interface ListingContextType {
  listings: SurplusListing[];
  claims: Claim[];
  createListing: (input: CreateListingInput) => Promise<SurplusListing>;
  cancelListing: (listingId: string) => Promise<void>;
  claimListing: (listingId: string, quantity: number) => Promise<{ claim: Claim; privateDetails: PrivatePickupDetails | null }>;
  cancelClaim: (listingId: string) => Promise<void>;
  getPrivateDetails: (listingId: string) => Promise<PrivatePickupDetails | null>;
  isLoading: boolean;
}

const LOCAL_STORAGE_LISTINGS_KEY = 'foodlink_surplus_listings';
const LOCAL_STORAGE_CLAIMS_KEY = 'foodlink_claims';

const INITIAL_LISTINGS: SurplusListing[] = [
  {
    id: 'lst_spice_garden_01',
    donorUid: 'demo_restaurant_01',
    donorName: 'Spice Garden Fine Dining',
    donorType: 'restaurant',
    title: 'Steamed Rice, Dal Makhani & Fresh Phulkas',
    description: 'Fresh nutritious meals packed in insulated containers. 4-point hygiene & thermal safety standard maintained.',
    foodCategory: 'cooked_meals',
    allergens: ['dairy'],
    totalQuantity: 100,
    remainingQuantity: 100,
    unit: 'plates',
    preparedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(), // Under 2 hours -> CRITICAL live countdown
    pickupWindowStart: new Date(Date.now()).toISOString(),
    pickupWindowEnd: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(),
    status: 'active',
    coarseLocation: {
      locality: 'Indiranagar',
      city: 'Bengaluru',
      lat: 12.978,
      lng: 77.640
    },
    safetyDeclaration: {
      temperatureSafe: true,
      hygienicallyPrepared: true,
      allergensDisclosed: true,
      freshAtListing: true,
      declaredAt: new Date().toISOString(),
      declaredByUid: 'demo_restaurant_01'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lst_royal_palace_02',
    donorUid: 'demo_event_02',
    donorName: 'Royal Palace Banquet & Lawns',
    donorType: 'individual_event',
    title: 'Vegetable Pulao, Paneer Gravy & Gulab Jamun',
    description: 'Fresh wedding surplus cooked with high-grade ingredients, stored in food-grade insulated canisters.',
    foodCategory: 'cooked_meals',
    allergens: ['dairy', 'nuts'],
    totalQuantity: 65,
    remainingQuantity: 65,
    unit: 'boxes',
    preparedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // > 2 hours -> normal urgency
    pickupWindowStart: new Date(Date.now()).toISOString(),
    pickupWindowEnd: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    status: 'active',
    coarseLocation: {
      locality: 'Bellandur',
      city: 'Bengaluru',
      lat: 12.935,
      lng: 77.668
    },
    safetyDeclaration: {
      temperatureSafe: true,
      hygienicallyPrepared: true,
      allergensDisclosed: true,
      freshAtListing: true,
      declaredAt: new Date().toISOString(),
      declaredByUid: 'demo_event_02'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lst_bakers_crust_03',
    donorUid: 'demo_restaurant_01',
    donorName: 'Bakers Crust Artisan Kitchen',
    donorType: 'restaurant',
    title: 'Whole Wheat Loaves, Buns & Veg Sandwiches',
    description: 'Freshly baked bread batches and wholesome veg sandwiches sealed in paper cartons.',
    foodCategory: 'bakery',
    allergens: ['gluten'],
    totalQuantity: 30,
    remainingQuantity: 30,
    unit: 'boxes',
    preparedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5.5 * 3600 * 1000).toISOString(),
    pickupWindowStart: new Date(Date.now()).toISOString(),
    pickupWindowEnd: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    status: 'active',
    coarseLocation: {
      locality: 'Koramangala',
      city: 'Bengaluru',
      lat: 12.934,
      lng: 77.622
    },
    safetyDeclaration: {
      temperatureSafe: true,
      hygienicallyPrepared: true,
      allergensDisclosed: true,
      freshAtListing: true,
      declaredAt: new Date().toISOString(),
      declaredByUid: 'demo_restaurant_01'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_PRIVATE_ADDRESSES: Record<string, PrivatePickupDetails> = {
  lst_spice_garden_01: {
    exactAddress: '42 Brigade Road, Ground Floor Kitchen Entrance, Bengaluru - 560025',
    contactPhone: '+91 98450 12345',
    instructions: 'Ring the service bell at the rear dispatch bay. Insulated food crates ready for handover.',
    donorUid: 'demo_restaurant_01'
  },
  lst_royal_palace_02: {
    exactAddress: 'Gate 3, Royal Palace Lawns, Outer Ring Road, Bellandur, Bengaluru - 560103',
    contactPhone: '+91 98765 43210',
    instructions: 'Ask for Banquet Manager Suresh at the service gate. Van access available.',
    donorUid: 'demo_event_02'
  },
  lst_bakers_crust_03: {
    exactAddress: '100 Feet Rd, 4th Block, Koramangala, Bengaluru - 560034',
    contactPhone: '+91 91234 56789',
    instructions: 'Collect from the kitchen collection window behind the bakery.',
    donorUid: 'demo_restaurant_01'
  }
};

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export const ListingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<SurplusListing[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LISTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading stored listings:', e);
    }
    return INITIAL_LISTINGS;
  });

  const [claims, setClaims] = useState<Claim[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CLAIMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading stored claims:', e);
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  const saveListings = (newList: SurplusListing[]) => {
    setListings(newList);
    localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(newList));
  };

  const saveClaims = (newClaims: Claim[]) => {
    setClaims(newClaims);
    localStorage.setItem(LOCAL_STORAGE_CLAIMS_KEY, JSON.stringify(newClaims));
  };

  // Seed initial listings into Firestore if empty
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const activeDb = db;
      const seedIfEmpty = async () => {
        try {
          const snap = await getDocs(collection(activeDb, 'listings'));
          if (snap.empty) {
            for (const item of INITIAL_LISTINGS) {
              await setDoc(doc(activeDb, 'listings', item.id), {
                donorUid: item.donorUid,
                donorName: item.donorName,
                donorType: item.donorType,
                title: item.title,
                description: item.description,
                foodCategory: item.foodCategory,
                allergens: item.allergens,
                totalQuantity: item.totalQuantity,
                remainingQuantity: item.remainingQuantity,
                unit: item.unit,
                preparedAt: Timestamp.fromDate(new Date(item.preparedAt)),
                expiresAt: Timestamp.fromDate(new Date(item.expiresAt)),
                pickupWindowStart: Timestamp.fromDate(new Date(item.pickupWindowStart)),
                pickupWindowEnd: Timestamp.fromDate(new Date(item.pickupWindowEnd)),
                status: item.status,
                coarseLocation: item.coarseLocation,
                safetyDeclaration: {
                  temperatureSafe: true,
                  hygienicallyPrepared: true,
                  allergensDisclosed: true,
                  freshAtListing: true,
                  declaredAt: serverTimestamp(),
                  declaredByUid: item.donorUid
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });

              const priv = INITIAL_PRIVATE_ADDRESSES[item.id];
              if (priv) {
                await setDoc(doc(activeDb, 'listings', item.id, 'private', 'pickupAddress'), {
                  ...priv,
                  createdAt: serverTimestamp()
                });
              }
            }
          }
        } catch (e) {
          console.warn('Initial Firestore seeding check:', e);
        }
      };
      seedIfEmpty();
    }
  }, []);

  // Realtime synchronization of listings from Firestore
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const activeDb = db;
      setIsLoading(true);
      const unsubscribe = onSnapshot(
        collection(activeDb, 'listings'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remote: SurplusListing[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              remote.push({
                id: d.id,
                ...(data as any),
                preparedAt: data.preparedAt?.toDate ? data.preparedAt.toDate().toISOString() : data.preparedAt,
                expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate().toISOString() : data.expiresAt,
                pickupWindowStart: data.pickupWindowStart?.toDate ? data.pickupWindowStart.toDate().toISOString() : data.pickupWindowStart,
                pickupWindowEnd: data.pickupWindowEnd?.toDate ? data.pickupWindowEnd.toDate().toISOString() : data.pickupWindowEnd,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
              });
            });
            saveListings(remote);
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn('Firestore listings listener error:', error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, []);

  const createListing = async (input: CreateListingInput): Promise<SurplusListing> => {
    if (!user) throw new Error('Authentication required to create a surplus food listing.');
    
    if (user.role !== 'donor' && user.role !== 'admin') {
      throw new Error('Only registered food donors can publish surplus food listings.');
    }

    if (user.verificationStatus !== 'verified') {
      throw new Error('Mandatory Verification Required: Your donor verification document must be approved by a safety officer before publishing surplus food listings.');
    }

    // Shelf life cap (6h FSSAI benchmark)
    if (input.shelfLifeHours && input.shelfLifeHours > 6) {
      throw new Error('Safety Limit Exceeded: Cooked perishable food cannot have a shelf life exceeding 6 hours under FSSAI safe food practices.');
    }

    const now = Date.now();
    const preparedTime = input.preparedAt ? new Date(input.preparedAt) : new Date(now - 30 * 60 * 1000);
    const expiresTime = input.expiresAt ? new Date(input.expiresAt) : new Date(now + (input.shelfLifeHours || 4) * 3600 * 1000);
    const pickupStartTime = input.pickupWindowStart ? new Date(input.pickupWindowStart) : new Date(now);
    const pickupEndTime = input.pickupWindowEnd ? new Date(input.pickupWindowEnd) : new Date(now + (input.pickupWindowHours || 3) * 3600 * 1000);

    if (pickupEndTime > expiresTime) {
      throw new Error('Pickup window must close before the food shelf-life expiry.');
    }

    const listingId = 'lst_' + Date.now();
    const donorType: 'restaurant' | 'individual_event' = user.subRole === 'restaurant' ? 'restaurant' : 'individual_event';

    const newListing: SurplusListing = {
      id: listingId,
      donorUid: user.uid,
      donorName: user.organizationName || user.displayName,
      donorType,
      title: input.title.trim(),
      description: input.description.trim(),
      foodCategory: input.foodCategory,
      allergens: input.allergens,
      totalQuantity: input.totalQuantity,
      remainingQuantity: input.totalQuantity,
      unit: input.unit,
      preparedAt: preparedTime.toISOString(),
      expiresAt: expiresTime.toISOString(),
      pickupWindowStart: pickupStartTime.toISOString(),
      pickupWindowEnd: pickupEndTime.toISOString(),
      status: 'active',
      coarseLocation: input.coarseLocation,
      safetyDeclaration: {
        temperatureSafe: input.safetyDeclaration.temperatureSafe,
        hygienicallyPrepared: input.safetyDeclaration.hygienicallyPrepared,
        allergensDisclosed: input.safetyDeclaration.allergensDisclosed,
        freshAtListing: input.safetyDeclaration.freshAtListing,
        declaredAt: new Date().toISOString(),
        declaredByUid: user.uid
      },
      eventName: input.eventName,
      estimatedGuests: input.estimatedGuests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newListing, ...listings];
    saveListings(updated);

    // Save exact address in local cache for offline/demo
    const privateDetails: PrivatePickupDetails = {
      exactAddress: input.exactAddress,
      contactPhone: input.contactPhone,
      instructions: input.instructions,
      donorUid: user.uid
    };
    try {
      localStorage.setItem(`foodlink_pickup_${listingId}`, JSON.stringify(privateDetails));
    } catch (e) {
      console.error('Error saving private pickup details locally:', e);
    }

    // Write to Firestore if connected
    if (isFirebaseConfigured && db) {
      const activeDb = db;
      try {
        const firestoreListing = {
          donorUid: user.uid,
          donorName: user.organizationName || user.displayName,
          donorType,
          title: newListing.title,
          description: newListing.description,
          foodCategory: newListing.foodCategory,
          allergens: newListing.allergens,
          totalQuantity: newListing.totalQuantity,
          remainingQuantity: newListing.remainingQuantity,
          unit: newListing.unit,
          preparedAt: Timestamp.fromDate(preparedTime),
          expiresAt: Timestamp.fromDate(expiresTime),
          pickupWindowStart: Timestamp.fromDate(pickupStartTime),
          pickupWindowEnd: Timestamp.fromDate(pickupEndTime),
          status: 'active',
          coarseLocation: newListing.coarseLocation,
          safetyDeclaration: {
            temperatureSafe: true,
            hygienicallyPrepared: true,
            allergensDisclosed: true,
            freshAtListing: true,
            declaredAt: serverTimestamp(),
            declaredByUid: user.uid
          },
          eventName: input.eventName || null,
          estimatedGuests: input.estimatedGuests || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(activeDb, 'listings', listingId), firestoreListing);

        // Write confidential exact pickup address into protected subcollection
        await setDoc(doc(activeDb, 'listings', listingId, 'private', 'pickupAddress'), {
          exactAddress: input.exactAddress,
          contactPhone: input.contactPhone,
          instructions: input.instructions || '',
          donorUid: user.uid,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Firestore listing creation error:', err);
      }
    }

    return newListing;
  };

  const cancelListing = async (listingId: string) => {
    if (!user) throw new Error('Must be logged in to cancel a listing.');

    const target = listings.find(l => l.id === listingId);
    if (!target) throw new Error('Listing not found.');
    if (target.donorUid !== user.uid && user.role !== 'admin') {
      throw new Error('Unauthorized: You can only cancel your own listings.');
    }

    const updated = listings.map(l => l.id === listingId ? { ...l, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : l);
    saveListings(updated);

    if (isFirebaseConfigured && db) {
      const activeDb = db;
      try {
        await updateDoc(doc(activeDb, 'listings', listingId), {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Firestore listing cancellation error:', err);
      }
    }
  };

  const claimListing = async (listingId: string, quantity: number): Promise<{ claim: Claim; privateDetails: PrivatePickupDetails | null }> => {
    if (!user) throw new Error('Must be logged in to claim surplus food portions.');
    if (user.role !== 'recipient' && user.role !== 'admin') {
      throw new Error('Only verified recipient organizations can claim surplus food.');
    }
    if (user.verificationStatus !== 'verified') {
      throw new Error('Verification Required: Your organization must be verified by safety admin before claiming surplus food.');
    }

    const target = listings.find(l => l.id === listingId);
    if (!target) throw new Error('Listing not found.');
    if (target.status !== 'active') throw new Error('This listing is no longer active.');
    if (quantity <= 0) throw new Error('Claim quantity must be greater than zero.');
    if (quantity > target.remainingQuantity) {
      throw new Error(`Insufficient portions remaining. Only ${target.remainingQuantity} portions available.`);
    }

    const claimId = `${user.uid}_${listingId}`;
    let fetchedAddress: PrivatePickupDetails | null = null;

    if (isFirebaseConfigured && db) {
      const activeDb = db;
      const listingRef = doc(activeDb, 'listings', listingId);
      const claimRef = doc(activeDb, 'claims', claimId);

      await runTransaction(activeDb, async (transaction) => {
        const listingSnap = await transaction.get(listingRef);
        if (!listingSnap.exists()) throw new Error('Listing does not exist in database.');
        const lData = listingSnap.data() as any;
        if (lData.status !== 'active') throw new Error('This listing is no longer active.');
        if (quantity <= 0 || quantity > lData.remainingQuantity) {
          throw new Error(`Invalid claim quantity. ${lData.remainingQuantity} portions remain.`);
        }

        const newRemaining = lData.remainingQuantity - quantity;
        transaction.update(listingRef, {
          remainingQuantity: newRemaining,
          lastClaimId: claimId,
          updatedAt: serverTimestamp()
        });

        transaction.set(claimRef, {
          listingId,
          recipientUid: user.uid,
          recipientOrgName: user.organizationName || user.displayName || 'Verified Recipient',
          quantity,
          status: 'confirmed',
          claimedAt: serverTimestamp(),
          pickupCode: null,
          pickupVerifiedAt: null
        });
      });

      // Now fetch private pickup address allowed for confirmed claim recipient
      try {
        const privSnap = await getDoc(doc(activeDb, 'listings', listingId, 'private', 'pickupAddress'));
        if (privSnap.exists()) {
          fetchedAddress = privSnap.data() as PrivatePickupDetails;
        }
      } catch (err) {
        console.warn('Could not read private address after claim:', err);
      }
    }

    if (!fetchedAddress) {
      fetchedAddress = await getPrivateDetails(listingId);
    }

    const newClaim: Claim = {
      id: claimId,
      listingId,
      recipientUid: user.uid,
      recipientOrgName: user.organizationName || user.displayName || 'Verified Recipient',
      quantity,
      status: 'confirmed',
      claimedAt: new Date().toISOString(),
      pickupCode: null,
      pickupVerifiedAt: null,
      listingTitle: target.title,
      listingUnit: target.unit,
      pickupWindowStart: target.pickupWindowStart,
      pickupWindowEnd: target.pickupWindowEnd,
      donorName: target.donorName,
      exactAddress: fetchedAddress?.exactAddress,
      contactPhone: fetchedAddress?.contactPhone
    };

    const nextClaims = [newClaim, ...claims.filter(c => c.id !== claimId)];
    saveClaims(nextClaims);

    const nextListings = listings.map(l => {
      if (l.id === listingId) {
        const rem = Math.max(0, l.remainingQuantity - quantity);
        return { ...l, remainingQuantity: rem, updatedAt: new Date().toISOString() };
      }
      return l;
    });
    saveListings(nextListings);

    return { claim: newClaim, privateDetails: fetchedAddress };
  };

  const cancelClaim = async (listingId: string): Promise<void> => {
    if (!user) throw new Error('Must be logged in to cancel a claim.');
    const claimId = `${user.uid}_${listingId}`;
    const targetClaim = claims.find(c => c.id === claimId || (c.listingId === listingId && c.recipientUid === user.uid && c.status === 'confirmed'));
    if (!targetClaim) throw new Error('No confirmed claim found to cancel.');

    if (isFirebaseConfigured && db) {
      const activeDb = db;
      const listingRef = doc(activeDb, 'listings', listingId);
      const claimRef = doc(activeDb, 'claims', claimId);

      await runTransaction(activeDb, async (transaction) => {
        const claimSnap = await transaction.get(claimRef);
        if (!claimSnap.exists()) throw new Error('Claim record not found in database.');
        const cData = claimSnap.data() as any;
        if (cData.status !== 'confirmed') throw new Error('Only confirmed claims can be cancelled.');
        if (cData.recipientUid !== user.uid) throw new Error('Unauthorized to cancel this claim.');

        const listingSnap = await transaction.get(listingRef);
        if (!listingSnap.exists()) throw new Error('Listing record not found.');
        const lData = listingSnap.data() as any;

        const restoredRemaining = lData.remainingQuantity + cData.quantity;
        transaction.update(listingRef, {
          remainingQuantity: restoredRemaining,
          lastClaimId: claimId,
          updatedAt: serverTimestamp()
        });

        transaction.update(claimRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp()
        });
      });
    }

    const nextClaims = claims.map(c => {
      if (c.id === claimId || (c.listingId === listingId && c.recipientUid === user.uid)) {
        return { ...c, status: 'cancelled' as const, cancelledAt: new Date().toISOString() };
      }
      return c;
    });
    saveClaims(nextClaims);

    const nextListings = listings.map(l => {
      if (l.id === listingId) {
        return { ...l, remainingQuantity: l.remainingQuantity + targetClaim.quantity, updatedAt: new Date().toISOString() };
      }
      return l;
    });
    saveListings(nextListings);
  };

  const getPrivateDetails = async (listingId: string): Promise<PrivatePickupDetails | null> => {
    // First check hardcoded initial mock table for known IDs
    if (INITIAL_PRIVATE_ADDRESSES[listingId]) {
      return INITIAL_PRIVATE_ADDRESSES[listingId];
    }

    try {
      const stored = localStorage.getItem(`foodlink_pickup_${listingId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading local private pickup details:', e);
    }

    if (isFirebaseConfigured && db) {
      const activeDb = db;
      try {
        const snap = await getDoc(doc(activeDb, 'listings', listingId, 'private', 'pickupAddress'));
        if (snap.exists()) {
          return snap.data() as PrivatePickupDetails;
        }
      } catch (err) {
        console.error('Firestore private pickup details read error:', err);
      }
    }

    return null;
  };

  return (
    <ListingContext.Provider value={{
      listings,
      claims,
      createListing,
      cancelListing,
      claimListing,
      cancelClaim,
      getPrivateDetails,
      isLoading
    }}>
      {children}
    </ListingContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
};
