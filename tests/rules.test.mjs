/**
 * FoodLink Comprehensive Firestore Security Rules Unit Tests
 * Covering:
 * PART A:
 *   - Read access for /verifications and /verifications/{id}/attachments
 *   - Confidential attachments <= 700KB Base64
 *   - Privacy protection on /users/{uid} (owner + admin only)
 * PART B:
 *   - Surplus listing creation & lifecycle
 *   - Verified donor gating & expiration gating
 *   - Safety declaration completeness & server timestamps
 *   - Shelf-life limit (6h FSSAI benchmark)
 *   - Quantity invariants and donor remainingQuantity edit blocking
 *   - Recipient verification gating on reading listings
 *   - Private exact pickup address subdocument protection
 */

import { 
  initializeTestEnvironment, 
  assertFails, 
  assertSucceeds 
} from '@firebase/rules-unit-testing';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  runTransaction,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'foodlink-rules-test';
const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');

let testEnv;

async function runTests() {
  console.log('==================================================================');
  console.log('FoodLink Rules Suite: Part A (Read/Privacy/Attach) & Part B (Listings/Safety)');
  console.log('==================================================================\n');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080
    }
  });

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await testEnv.clearFirestore();
      await fn();
      console.log(`  [PASS] Test ${total.toString().padStart(2, ' ')}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total.toString().padStart(2, ' ')}: ${name}`);
      console.error(`         Error: ${err.message || err}`);
    }
  }

  // Auth Contexts
  const unauthedContext = testEnv.unauthenticatedContext();

  const legitimateAdminContext = testEnv.authenticatedContext('admin_super_01', {
    email: 'admin@foodlink.org',
    email_verified: true,
    admin: true
  });

  const verifiedDonorContext = testEnv.authenticatedContext('donor_verified_01', {
    email: 'chef@spicegarden.com',
    email_verified: true
  });

  const unverifiedDonorContext = testEnv.authenticatedContext('donor_unverified_02', {
    email: 'newbie@baker.com',
    email_verified: true
  });

  const expiredDonorContext = testEnv.authenticatedContext('donor_expired_03', {
    email: 'old@caterer.com',
    email_verified: true
  });

  const verifiedRecipientContext = testEnv.authenticatedContext('recipient_verified_01', {
    email: 'shelter@ananda.org',
    email_verified: true
  });

  const unverifiedRecipientContext = testEnv.authenticatedContext('recipient_unverified_02', {
    email: 'random@visitor.org',
    email_verified: true
  });

  const expiredRecipientContext = testEnv.authenticatedContext('recipient_expired_03', {
    email: 'expired@care.org',
    email_verified: true
  });

  const verifiedRecipient2Context = testEnv.authenticatedContext('recipient_verified_02', {
    email: 'orphanage@hope.org',
    email_verified: true
  });

  const otherUserContext = testEnv.authenticatedContext('other_user_99', {
    email: 'snooper@interloper.com',
    email_verified: true
  });

  // Seed user profiles helper
  async function seedUserProfiles() {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const fsDb = ctx.firestore();
      
      // Verified Donor (expiry 60 days in future)
      await setDoc(doc(fsDb, 'users', 'donor_verified_01'), {
        uid: 'donor_verified_01',
        email: 'chef@spicegarden.com',
        displayName: 'Spice Garden',
        role: 'donor',
        subRole: 'restaurant',
        verificationStatus: 'verified',
        verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() + 60 * 24 * 3600 * 1000))
      });

      // Unverified Donor
      await setDoc(doc(fsDb, 'users', 'donor_unverified_02'), {
        uid: 'donor_unverified_02',
        email: 'newbie@baker.com',
        displayName: 'Newbie Baker',
        role: 'donor',
        subRole: 'restaurant',
        verificationStatus: 'unverified'
      });

      // Expired Donor (expiry 10 days in past)
      await setDoc(doc(fsDb, 'users', 'donor_expired_03'), {
        uid: 'donor_expired_03',
        email: 'old@caterer.com',
        displayName: 'Old Caterer',
        role: 'donor',
        subRole: 'restaurant',
        verificationStatus: 'verified',
        verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 3600 * 1000))
      });

      // Verified Recipient 1 (expiry 90 days in future)
      await setDoc(doc(fsDb, 'users', 'recipient_verified_01'), {
        uid: 'recipient_verified_01',
        email: 'shelter@ananda.org',
        displayName: 'Ananda Elderly Shelter',
        role: 'recipient',
        subRole: 'elder_shelter',
        verificationStatus: 'verified',
        verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 3600 * 1000))
      });

      // Verified Recipient 2 (expiry 90 days in future)
      await setDoc(doc(fsDb, 'users', 'recipient_verified_02'), {
        uid: 'recipient_verified_02',
        email: 'orphanage@hope.org',
        displayName: 'Hope Children Orphanage',
        role: 'recipient',
        subRole: 'orphanage',
        verificationStatus: 'verified',
        verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 3600 * 1000))
      });

      // Unverified Recipient
      await setDoc(doc(fsDb, 'users', 'recipient_unverified_02'), {
        uid: 'recipient_unverified_02',
        email: 'random@visitor.org',
        displayName: 'Visitor Org',
        role: 'recipient',
        subRole: 'ngo',
        verificationStatus: 'unverified'
      });

      // Expired Recipient (expiry 10 days in past)
      await setDoc(doc(fsDb, 'users', 'recipient_expired_03'), {
        uid: 'recipient_expired_03',
        email: 'expired@care.org',
        displayName: 'Expired Shelter',
        role: 'recipient',
        subRole: 'elder_shelter',
        verificationStatus: 'verified',
        verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 3600 * 1000))
      });
    });
  }

  // ==================================================================
  // PART A: READ ACCESS & PRIVACY TESTS
  // ==================================================================
  console.log('--- PART A: Read Access, Attachments, and User Profile Privacy ---');

  await test('Another user cannot read someone else\'s /verifications document', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending',
        documentNumber: 'FSSAI-12345'
      });
    });

    const db = otherUserContext.firestore();
    await assertFails(getDoc(doc(db, 'verifications', 'verif_donor_alice')));
  });

  await test('Unauthenticated user cannot read /verifications document', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending'
      });
    });

    const db = unauthedContext.firestore();
    await assertFails(getDoc(doc(db, 'verifications', 'verif_donor_alice')));
  });

  await test('User can read their own /verifications document', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending'
      });
    });

    const db = verifiedDonorContext.firestore();
    await assertSucceeds(getDoc(doc(db, 'verifications', 'verif_donor_alice')));
  });

  await test('Admin can read all /verifications documents', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending'
      });
    });

    const db = legitimateAdminContext.firestore();
    await assertSucceeds(getDoc(doc(db, 'verifications', 'verif_donor_alice')));
  });

  await test('Another user cannot read /verifications/{id}/attachments/{attId}', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending'
      });
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice', 'attachments', 'fssai_scan'), {
        userId: 'donor_verified_01',
        base64Data: 'JVBERi0xLjQKJ...'
      });
    });

    const db = otherUserContext.firestore();
    await assertFails(getDoc(doc(db, 'verifications', 'verif_donor_alice', 'attachments', 'fssai_scan')));
  });

  await test('Unauthenticated user cannot read verification attachments', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending'
      });
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice', 'attachments', 'fssai_scan'), {
        userId: 'donor_verified_01',
        base64Data: 'JVBERi0xLjQKJ...'
      });
    });

    const db = unauthedContext.firestore();
    await assertFails(getDoc(doc(db, 'verifications', 'verif_donor_alice', 'attachments', 'fssai_scan')));
  });

  await test('Uploader and admin CAN read verification attachments', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending'
      });
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice', 'attachments', 'fssai_scan'), {
        userId: 'donor_verified_01',
        base64Data: 'JVBERi0xLjQKJ...'
      });
    });

    const donorDb = verifiedDonorContext.firestore();
    await assertSucceeds(getDoc(doc(donorDb, 'verifications', 'verif_donor_alice', 'attachments', 'fssai_scan')));

    const adminDb = legitimateAdminContext.firestore();
    await assertSucceeds(getDoc(doc(adminDb, 'verifications', 'verif_donor_alice', 'attachments', 'fssai_scan')));
  });

  await test('Attachment exceeding 700 KB base64 limit is rejected on create', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending'
      });
    });

    const donorDb = verifiedDonorContext.firestore();
    // 720,000 characters > 716,800 limit (700 KB)
    const largeBase64 = 'A'.repeat(720000);
    await assertFails(setDoc(doc(donorDb, 'verifications', 'verif_donor_alice', 'attachments', 'too_large'), {
      userId: 'donor_verified_01',
      base64Data: largeBase64
    }));
  });

  await test('Valid attachment <= 700 KB created by owner on pending verification succeeds', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'verifications', 'verif_donor_alice'), {
        userId: 'donor_verified_01',
        status: 'pending'
      });
    });

    const donorDb = verifiedDonorContext.firestore();
    const validBase64 = 'A'.repeat(10000); // 10 KB
    await assertSucceeds(setDoc(doc(donorDb, 'verifications', 'verif_donor_alice', 'attachments', 'valid_scan'), {
      userId: 'donor_verified_01',
      base64Data: validBase64
    }));
  });

  await test('User profile /users/{uid} privacy: owner and admin can read; other users and unauthed blocked', async () => {
    await seedUserProfiles();

    // Owner reading own profile
    const ownerDb = verifiedDonorContext.firestore();
    await assertSucceeds(getDoc(doc(ownerDb, 'users', 'donor_verified_01')));

    // Admin reading profile
    const adminDb = legitimateAdminContext.firestore();
    await assertSucceeds(getDoc(doc(adminDb, 'users', 'donor_verified_01')));

    // Another user blocked from reading private user doc
    const otherDb = otherUserContext.firestore();
    await assertFails(getDoc(doc(otherDb, 'users', 'donor_verified_01')));

    // Unauthenticated blocked
    const unauthedDb = unauthedContext.firestore();
    await assertFails(getDoc(doc(unauthedDb, 'users', 'donor_verified_01')));
  });

  // ==================================================================
  // PART B: SURPLUS LISTINGS & SAFETY WORKFLOW TESTS
  // ==================================================================
  console.log('\n--- PART B: Surplus Listing Creation, Safety Checklist, and Rules ---');

  const now = Date.now();
  const validPreparedAt = Timestamp.fromDate(new Date(now - 30 * 60 * 1000)); // 30 mins ago
  const validPickupStart = Timestamp.fromDate(new Date(now));
  const validPickupEnd = Timestamp.fromDate(new Date(now + 3 * 3600 * 1000)); // in 3 hours
  const validExpiresAt = Timestamp.fromDate(new Date(now + 4 * 3600 * 1000)); // in 4 hours (< 6 hours)

  const buildValidListing = (donorUid) => ({
    donorUid,
    donorType: 'restaurant',
    title: 'Surplus Dal Makhani & Jeera Rice',
    description: 'Hot packed portions prepared for lunchtime service.',
    foodCategory: 'cooked_meals',
    allergens: ['dairy'],
    totalQuantity: 25,
    remainingQuantity: 25,
    unit: 'boxes',
    preparedAt: validPreparedAt,
    expiresAt: validExpiresAt,
    pickupWindowStart: validPickupStart,
    pickupWindowEnd: validPickupEnd,
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
      declaredAt: serverTimestamp(),
      declaredByUid: donorUid
    }
  });

  await test('Verified donor with active credential CAN create a surplus listing', async () => {
    await seedUserProfiles();
    const db = verifiedDonorContext.firestore();
    await assertSucceeds(setDoc(doc(db, 'listings', 'listing_001'), buildValidListing('donor_verified_01')));
  });

  await test('Unverified donor is BLOCKED from creating a surplus listing', async () => {
    await seedUserProfiles();
    const db = unverifiedDonorContext.firestore();
    await assertFails(setDoc(doc(db, 'listings', 'listing_unverified'), buildValidListing('donor_unverified_02')));
  });

  await test('Expired-verification donor is BLOCKED from creating a surplus listing', async () => {
    await seedUserProfiles();
    const db = expiredDonorContext.firestore();
    await assertFails(setDoc(doc(db, 'listings', 'listing_expired'), buildValidListing('donor_expired_03')));
  });

  await test('Listing creation with incomplete safety checklist (e.g. temperatureSafe=false) is REJECTED', async () => {
    await seedUserProfiles();
    const db = verifiedDonorContext.firestore();
    const badListing = buildValidListing('donor_verified_01');
    badListing.safetyDeclaration.temperatureSafe = false;
    await assertFails(setDoc(doc(db, 'listings', 'listing_bad_checklist'), badListing));
  });

  await test('Listing creation with past expiresAt is REJECTED', async () => {
    await seedUserProfiles();
    const db = verifiedDonorContext.firestore();
    const pastListing = buildValidListing('donor_verified_01');
    pastListing.expiresAt = Timestamp.fromDate(new Date(now - 3600 * 1000)); // 1 hour ago
    await assertFails(setDoc(doc(db, 'listings', 'listing_past_expiry'), pastListing));
  });

  await test('Listing creation exceeding 6h FSSAI shelf-life window is REJECTED', async () => {
    await seedUserProfiles();
    const db = verifiedDonorContext.firestore();
    const overShelfLifeListing = buildValidListing('donor_verified_01');
    overShelfLifeListing.expiresAt = Timestamp.fromDate(new Date(now + 8 * 3600 * 1000)); // 8 hours > 6 hours max
    await assertFails(setDoc(doc(db, 'listings', 'listing_too_long'), overShelfLifeListing));
  });

  await test('Listing creation with spoofed donorUid is REJECTED', async () => {
    await seedUserProfiles();
    const db = verifiedDonorContext.firestore();
    // Authenticated as donor_verified_01, but trying to set donorUid as another user
    const spoofed = buildValidListing('other_user_99');
    await assertFails(setDoc(doc(db, 'listings', 'listing_spoofed_donor'), spoofed));
  });

  await test('Listing creation with remainingQuantity != totalQuantity is REJECTED', async () => {
    await seedUserProfiles();
    const db = verifiedDonorContext.firestore();
    const mismatch = buildValidListing('donor_verified_01');
    mismatch.totalQuantity = 20;
    mismatch.remainingQuantity = 15; // Mismatch on create
    await assertFails(setDoc(doc(db, 'listings', 'listing_mismatch_qty'), mismatch));
  });

  await test('Donor editing remainingQuantity directly is REJECTED', async () => {
    await seedUserProfiles();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'listing_live_01'), {
        ...buildValidListing('donor_verified_01'),
        safetyDeclaration: {
          ...buildValidListing('donor_verified_01').safetyDeclaration,
          declaredAt: Timestamp.now()
        }
      });
    });

    const db = verifiedDonorContext.firestore();
    // Donor tries to edit remainingQuantity directly
    await assertFails(updateDoc(doc(db, 'listings', 'listing_live_01'), {
      remainingQuantity: 10
    }));
  });

  await test('Donor CAN update description or cancel their own listing', async () => {
    await seedUserProfiles();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'listing_live_02'), {
        ...buildValidListing('donor_verified_01'),
        safetyDeclaration: {
          ...buildValidListing('donor_verified_01').safetyDeclaration,
          declaredAt: Timestamp.now()
        }
      });
    });

    const db = verifiedDonorContext.firestore();
    await assertSucceeds(updateDoc(doc(db, 'listings', 'listing_live_02'), {
      description: 'Updated packaging note: packed in compostable meal trays.',
      status: 'cancelled'
    }));
  });

  await test('Unverified recipient CANNOT read active listings', async () => {
    await seedUserProfiles();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'listing_to_read'), {
        ...buildValidListing('donor_verified_01'),
        safetyDeclaration: {
          ...buildValidListing('donor_verified_01').safetyDeclaration,
          declaredAt: Timestamp.now()
        }
      });
    });

    const unverifiedRecipDb = unverifiedRecipientContext.firestore();
    await assertFails(getDoc(doc(unverifiedRecipDb, 'listings', 'listing_to_read')));
  });

  await test('Verified recipient CAN read active listings', async () => {
    await seedUserProfiles();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'listing_to_read_verified'), {
        ...buildValidListing('donor_verified_01'),
        safetyDeclaration: {
          ...buildValidListing('donor_verified_01').safetyDeclaration,
          declaredAt: Timestamp.now()
        }
      });
    });

    const verifiedRecipDb = verifiedRecipientContext.firestore();
    await assertSucceeds(getDoc(doc(verifiedRecipDb, 'listings', 'listing_to_read_verified')));
  });

  await test('Exact pickup address subdocument is unreadable by other donors/recipients without confirmed claim', async () => {
    await seedUserProfiles();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'listing_with_private_address'), {
        ...buildValidListing('donor_verified_01'),
        safetyDeclaration: {
          ...buildValidListing('donor_verified_01').safetyDeclaration,
          declaredAt: Timestamp.now()
        }
      });
      // Store exact home/kitchen address in private subdocument
      await setDoc(doc(ctx.firestore(), 'listings', 'listing_with_private_address', 'private', 'pickupAddress'), {
        exactAddress: 'Flat 402, Sunshine Villa, 3rd Cross, Indiranagar, Bengaluru',
        contactPhone: '+91 98450 12345',
        donorUid: 'donor_verified_01'
      });
    });

    // Owning donor CAN read
    const donorDb = verifiedDonorContext.firestore();
    await assertSucceeds(getDoc(doc(donorDb, 'listings', 'listing_with_private_address', 'private', 'pickupAddress')));

    // Admin CAN read
    const adminDb = legitimateAdminContext.firestore();
    await assertSucceeds(getDoc(doc(adminDb, 'listings', 'listing_with_private_address', 'private', 'pickupAddress')));

    // Another user or unconfirmed recipient CANNOT read
    const otherDb = otherUserContext.firestore();
    await assertFails(getDoc(doc(otherDb, 'listings', 'listing_with_private_address', 'private', 'pickupAddress')));

    const recipientDb = verifiedRecipientContext.firestore();
    await assertFails(getDoc(doc(recipientDb, 'listings', 'listing_with_private_address', 'private', 'pickupAddress')));
  });

  // ==================================================================
  // PART C: RECIPIENT BROWSING, CLAIMING & CONCURRENCY TESTS
  // ==================================================================
  console.log('\n--- PART C: Recipient Claims, Invariants, and Concurrency ---');

  // Helper to seed an active listing
  async function seedActiveListing(id, totalQty = 50, remainingQty = 50) {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', id), {
        ...buildValidListing('donor_verified_01'),
        totalQuantity: totalQty,
        remainingQuantity: remainingQty,
        safetyDeclaration: {
          ...buildValidListing('donor_verified_01').safetyDeclaration,
          declaredAt: Timestamp.now()
        }
      });
      await setDoc(doc(ctx.firestore(), 'listings', id, 'private', 'pickupAddress'), {
        exactAddress: '42 Brigade Road, Bengaluru',
        contactPhone: '+91 98450 12345',
        donorUid: 'donor_verified_01'
      });
    });
  }

  // 1. Unverified recipient blocked; expired-verification recipient blocked
  await test('Unverified recipient blocked; expired-verification recipient blocked from claiming', async () => {
    await seedUserProfiles();
    await seedActiveListing('lst_claim_01', 50, 50);

    const claimData = (uid) => ({
      listingId: 'lst_claim_01',
      recipientUid: uid,
      recipientOrgName: 'Test Org',
      quantity: 10,
      status: 'confirmed',
      claimedAt: serverTimestamp(),
      pickupCode: null,
      pickupVerifiedAt: null
    });

    // Unverified recipient tries to claim
    const unverifiedDb = unverifiedRecipientContext.firestore();
    const claimIdUnverified = 'recipient_unverified_02_lst_claim_01';
    await assertFails(runTransaction(unverifiedDb, async (t) => {
      t.update(doc(unverifiedDb, 'listings', 'lst_claim_01'), {
        remainingQuantity: 40,
        lastClaimId: claimIdUnverified
      });
      t.set(doc(unverifiedDb, 'claims', claimIdUnverified), claimData('recipient_unverified_02'));
    }));

    // Expired-verification recipient tries to claim
    const expiredDb = expiredRecipientContext.firestore();
    const claimIdExpired = 'recipient_expired_03_lst_claim_01';
    await assertFails(runTransaction(expiredDb, async (t) => {
      t.update(doc(expiredDb, 'listings', 'lst_claim_01'), {
        remainingQuantity: 40,
        lastClaimId: claimIdExpired
      });
      t.set(doc(expiredDb, 'claims', claimIdExpired), claimData('recipient_expired_03'));
    }));

    // Verified recipient succeeds
    const verifiedDb = verifiedRecipientContext.firestore();
    const claimIdVerified = 'recipient_verified_01_lst_claim_01';
    await assertSucceeds(runTransaction(verifiedDb, async (t) => {
      t.update(doc(verifiedDb, 'listings', 'lst_claim_01'), {
        remainingQuantity: 40,
        lastClaimId: claimIdVerified
      });
      t.set(doc(verifiedDb, 'claims', claimIdVerified), claimData('recipient_verified_01'));
    }));
  });

  // 2. Claim on expired or cancelled listing rejected
  await test('Claim on expired or cancelled listing rejected', async () => {
    await seedUserProfiles();
    
    // Seed expired listing
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'lst_expired_01'), {
        ...buildValidListing('donor_verified_01'),
        expiresAt: Timestamp.fromDate(new Date(Date.now() - 3600 * 1000)), // expired 1h ago
        safetyDeclaration: {
          ...buildValidListing('donor_verified_01').safetyDeclaration,
          declaredAt: Timestamp.now()
        }
      });
      // Seed cancelled listing
      await setDoc(doc(ctx.firestore(), 'listings', 'lst_cancelled_01'), {
        ...buildValidListing('donor_verified_01'),
        status: 'cancelled',
        safetyDeclaration: {
          ...buildValidListing('donor_verified_01').safetyDeclaration,
          declaredAt: Timestamp.now()
        }
      });
    });

    const verifiedDb = verifiedRecipientContext.firestore();

    // Claim on expired listing
    const claimIdExp = 'recipient_verified_01_lst_expired_01';
    await assertFails(runTransaction(verifiedDb, async (t) => {
      t.update(doc(verifiedDb, 'listings', 'lst_expired_01'), {
        remainingQuantity: 15,
        lastClaimId: claimIdExp
      });
      t.set(doc(verifiedDb, 'claims', claimIdExp), {
        listingId: 'lst_expired_01',
        recipientUid: 'recipient_verified_01',
        recipientOrgName: 'Ananda Shelter',
        quantity: 10,
        status: 'confirmed',
        claimedAt: serverTimestamp(),
        pickupCode: null,
        pickupVerifiedAt: null
      });
    }));

    // Claim on cancelled listing
    const claimIdCanc = 'recipient_verified_01_lst_cancelled_01';
    await assertFails(runTransaction(verifiedDb, async (t) => {
      t.update(doc(verifiedDb, 'listings', 'lst_cancelled_01'), {
        remainingQuantity: 15,
        lastClaimId: claimIdCanc
      });
      t.set(doc(verifiedDb, 'claims', claimIdCanc), {
        listingId: 'lst_cancelled_01',
        recipientUid: 'recipient_verified_01',
        recipientOrgName: 'Ananda Shelter',
        quantity: 10,
        status: 'confirmed',
        claimedAt: serverTimestamp(),
        pickupCode: null,
        pickupVerifiedAt: null
      });
    }));
  });

  // 3. Quantity 0, negative, or above remaining rejected
  await test('Claim quantity 0, negative, or above remaining rejected', async () => {
    await seedUserProfiles();
    await seedActiveListing('lst_qty_test', 30, 30);

    const verifiedDb = verifiedRecipientContext.firestore();

    // Quantity 0
    const claimId0 = 'recipient_verified_01_lst_qty_test';
    await assertFails(runTransaction(verifiedDb, async (t) => {
      t.update(doc(verifiedDb, 'listings', 'lst_qty_test'), {
        remainingQuantity: 30,
        lastClaimId: claimId0
      });
      t.set(doc(verifiedDb, 'claims', claimId0), {
        listingId: 'lst_qty_test',
        recipientUid: 'recipient_verified_01',
        recipientOrgName: 'Ananda Shelter',
        quantity: 0,
        status: 'confirmed',
        claimedAt: serverTimestamp(),
        pickupCode: null,
        pickupVerifiedAt: null
      });
    }));

    // Negative quantity (-5)
    await assertFails(runTransaction(verifiedDb, async (t) => {
      t.update(doc(verifiedDb, 'listings', 'lst_qty_test'), {
        remainingQuantity: 35,
        lastClaimId: claimId0
      });
      t.set(doc(verifiedDb, 'claims', claimId0), {
        listingId: 'lst_qty_test',
        recipientUid: 'recipient_verified_01',
        recipientOrgName: 'Ananda Shelter',
        quantity: -5,
        status: 'confirmed',
        claimedAt: serverTimestamp(),
        pickupCode: null,
        pickupVerifiedAt: null
      });
    }));

    // Quantity exceeding remaining (40 > 30)
    await assertFails(runTransaction(verifiedDb, async (t) => {
      t.update(doc(verifiedDb, 'listings', 'lst_qty_test'), {
        remainingQuantity: -10,
        lastClaimId: claimId0
      });
      t.set(doc(verifiedDb, 'claims', claimId0), {
        listingId: 'lst_qty_test',
        recipientUid: 'recipient_verified_01',
        recipientOrgName: 'Ananda Shelter',
        quantity: 40,
        status: 'confirmed',
        claimedAt: serverTimestamp(),
        pickupCode: null,
        pickupVerifiedAt: null
      });
    }));
  });

  // 4. remainingQuantity decrement mismatch rejected
  await test('remainingQuantity decrement mismatch rejected by security rules', async () => {
    await seedUserProfiles();
    await seedActiveListing('lst_mismatch_test', 50, 50);

    const verifiedDb = verifiedRecipientContext.firestore();
    const claimIdMismatch = 'recipient_verified_01_lst_mismatch_test';

    // Quantity claimed is 20, but transaction tries to decrement remaining by only 5 (new remaining = 45 instead of 30)
    await assertFails(runTransaction(verifiedDb, async (t) => {
      t.update(doc(verifiedDb, 'listings', 'lst_mismatch_test'), {
        remainingQuantity: 45, // Mismatch! Should be 30
        lastClaimId: claimIdMismatch
      });
      t.set(doc(verifiedDb, 'claims', claimIdMismatch), {
        listingId: 'lst_mismatch_test',
        recipientUid: 'recipient_verified_01',
        recipientOrgName: 'Ananda Shelter',
        quantity: 20,
        status: 'confirmed',
        claimedAt: serverTimestamp(),
        pickupCode: null,
        pickupVerifiedAt: null
      });
    }));
  });

  // 5. Direct edit of remainingQuantity rejected
  await test('Direct edit of remainingQuantity without valid claim transaction rejected', async () => {
    await seedUserProfiles();
    await seedActiveListing('lst_direct_edit', 50, 50);

    // Recipient tries direct edit
    const verifiedDb = verifiedRecipientContext.firestore();
    await assertFails(updateDoc(doc(verifiedDb, 'listings', 'lst_direct_edit'), {
      remainingQuantity: 20
    }));

    // Donor tries direct edit
    const donorDb = verifiedDonorContext.firestore();
    await assertFails(updateDoc(doc(donorDb, 'listings', 'lst_direct_edit'), {
      remainingQuantity: 20
    }));
  });

  // 6. Cancelling someone else's claim rejected
  await test('Cancelling someone else\'s claim rejected; owner cancellation restores quantity', async () => {
    await seedUserProfiles();
    await seedActiveListing('lst_cancel_test', 50, 50);

    const recipient1Db = verifiedRecipientContext.firestore();
    const claimId = 'recipient_verified_01_lst_cancel_test';

    // Recipient 1 claims 20 portions
    await assertSucceeds(runTransaction(recipient1Db, async (t) => {
      t.update(doc(recipient1Db, 'listings', 'lst_cancel_test'), {
        remainingQuantity: 30,
        lastClaimId: claimId
      });
      t.set(doc(recipient1Db, 'claims', claimId), {
        listingId: 'lst_cancel_test',
        recipientUid: 'recipient_verified_01',
        recipientOrgName: 'Ananda Shelter',
        quantity: 20,
        status: 'confirmed',
        claimedAt: serverTimestamp(),
        pickupCode: null,
        pickupVerifiedAt: null
      });
    }));

    // Recipient 2 tries to cancel Recipient 1's claim -> REJECTED
    const recipient2Db = verifiedRecipient2Context.firestore();
    await assertFails(runTransaction(recipient2Db, async (t) => {
      t.update(doc(recipient2Db, 'listings', 'lst_cancel_test'), {
        remainingQuantity: 50,
        lastClaimId: claimId
      });
      t.update(doc(recipient2Db, 'claims', claimId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });
    }));

    // Recipient 1 cancels their own claim in atomic transaction -> SUCCEEDS and restores quantity
    await assertSucceeds(runTransaction(recipient1Db, async (t) => {
      t.update(doc(recipient1Db, 'listings', 'lst_cancel_test'), {
        remainingQuantity: 50,
        lastClaimId: claimId
      });
      t.update(doc(recipient1Db, 'claims', claimId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });
    }));
  });

  // 7. Exact address unreadable before a confirmed claim, readable after, and only by that recipient
  await test('Exact address unreadable before confirmed claim, readable after, and only by that recipient', async () => {
    await seedUserProfiles();
    await seedActiveListing('lst_address_privacy', 50, 50);

    const recipient1Db = verifiedRecipientContext.firestore();
    const recipient2Db = verifiedRecipient2Context.firestore();
    const addressDocRef = (db) => doc(db, 'listings', 'lst_address_privacy', 'private', 'pickupAddress');

    // 1. Before claiming: Recipient 1 and Recipient 2 CANNOT read exact address
    await assertFails(getDoc(addressDocRef(recipient1Db)));
    await assertFails(getDoc(addressDocRef(recipient2Db)));

    // 2. Recipient 1 claims 20 portions
    const claimId1 = 'recipient_verified_01_lst_address_privacy';
    await assertSucceeds(runTransaction(recipient1Db, async (t) => {
      t.update(doc(recipient1Db, 'listings', 'lst_address_privacy'), {
        remainingQuantity: 30,
        lastClaimId: claimId1
      });
      t.set(doc(recipient1Db, 'claims', claimId1), {
        listingId: 'lst_address_privacy',
        recipientUid: 'recipient_verified_01',
        recipientOrgName: 'Ananda Shelter',
        quantity: 20,
        status: 'confirmed',
        claimedAt: serverTimestamp(),
        pickupCode: null,
        pickupVerifiedAt: null
      });
    }));

    // 3. After confirmed claim: Recipient 1 CAN read exact address
    await assertSucceeds(getDoc(addressDocRef(recipient1Db)));

    // 4. Recipient 2 (who did not claim) STILL CANNOT read exact address
    await assertFails(getDoc(addressDocRef(recipient2Db)));

    // 5. Recipient 1 cancels their claim
    await assertSucceeds(runTransaction(recipient1Db, async (t) => {
      t.update(doc(recipient1Db, 'listings', 'lst_address_privacy'), {
        remainingQuantity: 50,
        lastClaimId: claimId1
      });
      t.update(doc(recipient1Db, 'claims', claimId1), {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });
    }));

    // 6. After cancellation: Recipient 1 CANNOT read exact address anymore
    await assertFails(getDoc(addressDocRef(recipient1Db)));
  });

  // 8. Concurrency: two claims for the last portions, exactly one succeeds
  await test('Concurrency: two claims for the last portions, exactly one succeeds', async () => {
    await seedUserProfiles();
    await seedActiveListing('lst_concurrency_race', 10, 10); // Only 10 portions remain

    const recipient1Db = verifiedRecipientContext.firestore();
    const recipient2Db = verifiedRecipient2Context.firestore();

    const claimLastPortions = async (db, uid, org) => {
      const claimId = `${uid}_lst_concurrency_race`;
      return runTransaction(db, async (t) => {
        const listingSnap = await t.get(doc(db, 'listings', 'lst_concurrency_race'));
        const remaining = listingSnap.data().remainingQuantity;
        if (remaining < 10) {
          throw new Error('Not enough portions remaining');
        }
        t.update(doc(db, 'listings', 'lst_concurrency_race'), {
          remainingQuantity: remaining - 10,
          lastClaimId: claimId
        });
        t.set(doc(db, 'claims', claimId), {
          listingId: 'lst_concurrency_race',
          recipientUid: uid,
          recipientOrgName: org,
          quantity: 10,
          status: 'confirmed',
          claimedAt: serverTimestamp(),
          pickupCode: null,
          pickupVerifiedAt: null
        });
      });
    };

    // Both fire simultaneously
    const results = await Promise.allSettled([
      claimLastPortions(recipient1Db, 'recipient_verified_01', 'Ananda Shelter'),
      claimLastPortions(recipient2Db, 'recipient_verified_02', 'Hope Children Orphanage')
    ]);

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    if (succeeded !== 1 || failed !== 1) {
      throw new Error(`Expected exactly 1 claim to succeed and 1 to fail, but got ${succeeded} succeeded and ${failed} failed.`);
    }
  });

  console.log('\n==================================================================');
  console.log(`Results: ${passed} / ${total} tests passed.`);
  console.log('==================================================================\n');

  await testEnv.cleanup();

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(async (e) => {
  console.error('Fatal testing error:', e);
  if (testEnv) await testEnv.cleanup();
  process.exit(1);
});
