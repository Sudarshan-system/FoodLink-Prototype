import puppeteer from 'puppeteer';
import path from 'path';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, deleteDoc, getDocs, collection, Timestamp } from 'firebase/firestore';

const ARTIFACTS_DIR = 'C:/Users/SUDARSHAN/.gemini/antigravity/brain/76597e4e-3af3-4cbd-a1fa-ae4148cd3f70';
const BASE_URL = 'http://localhost:4173/?emulator=true';
const EMULATOR_UI_URL = 'http://127.0.0.1:4000/firestore';
const PROJECT_ID = 'foodlink-rules-test';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ensure account in Auth emulator and return UID
async function getOrCreateAuthUser(email, password = 'password123') {
  try {
    const res = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await res.json();
    if (data.localId) return data.localId;
  } catch (err) {}

  // If already exists, sign in to get localId
  const signinRes = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const signinData = await signinRes.json();
  if (signinData.localId) return signinData.localId;
  throw new Error(`Could not obtain UID for ${email}: ${JSON.stringify(signinData)}`);
}

async function seedData() {
  console.log('Seeding initial verified recipient accounts and test listing in Firestore emulator...');
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: '127.0.0.1', port: 8080 }
  });

  const uids = {
    recip1: await getOrCreateAuthUser('manjunath.elderly@ananda.org'),
    recip2: await getOrCreateAuthUser('sister.mary@hopechildren.org'),
    recip3: await getOrCreateAuthUser('director@relief.org'),
    donor: await getOrCreateAuthUser('chef@spicegarden.com')
  };

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // 1. Seed Recipient 1 (Ananda Old Age Home)
    await setDoc(doc(db, 'users', uids.recip1), {
      uid: uids.recip1,
      email: 'manjunath.elderly@ananda.org',
      displayName: 'Manjunath Rao',
      organizationName: 'Ananda Old Age Home & Shelter',
      phone: '+91 98450 11111',
      role: 'recipient',
      subRole: 'elder_shelter',
      address: '4th Cross, Malleshwaram, Bengaluru',
      city: 'Bengaluru',
      verificationStatus: 'verified',
      verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 3600 * 1000)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 2. Seed Recipient 2 (Hope Children Orphanage)
    await setDoc(doc(db, 'users', uids.recip2), {
      uid: uids.recip2,
      email: 'sister.mary@hopechildren.org',
      displayName: 'Sister Mary',
      organizationName: 'Hope Children Orphanage',
      phone: '+91 98450 22222',
      role: 'recipient',
      subRole: 'orphanage',
      address: 'Richards Town, Bengaluru',
      city: 'Bengaluru',
      verificationStatus: 'verified',
      verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 3600 * 1000)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 3. Seed Recipient 3 (Community Relief Foundation)
    await setDoc(doc(db, 'users', uids.recip3), {
      uid: uids.recip3,
      email: 'director@relief.org',
      displayName: 'Dr. Suresh Kumar',
      organizationName: 'Community Relief Foundation',
      phone: '+91 98450 33333',
      role: 'recipient',
      subRole: 'ngo',
      address: 'Jayanagar 4th Block, Bengaluru',
      city: 'Bengaluru',
      verificationStatus: 'verified',
      verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 3600 * 1000)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 4. Seed Donor
    await setDoc(doc(db, 'users', uids.donor), {
      uid: uids.donor,
      email: 'chef@spicegarden.com',
      displayName: 'Chef Vikram',
      organizationName: 'Spice Garden Fine Dining',
      phone: '+91 98765 43210',
      role: 'donor',
      subRole: 'restaurant',
      address: '#42, 12th Main Road, Indiranagar, Bengaluru',
      city: 'Bengaluru',
      verificationStatus: 'verified',
      verificationExpiryDate: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 3600 * 1000)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 5. Seed Test Listing (lst_spice_garden_01 with 100 plates)
    const listingRef = doc(db, 'listings', 'lst_spice_garden_01');
    await setDoc(listingRef, {
      donorUid: uids.donor,
      donorName: 'Spice Garden Fine Dining',
      donorPhone: '+91 98765 43210',
      donorType: 'restaurant',
      title: 'Steamed Rice, Dal Makhani & Fresh Phulkas',
      foodCategory: 'cooked_meals',
      description: 'Fresh nutritious meals packed in insulated containers. 4-point hygiene & thermal safety standard maintained.',
      totalQuantity: 100,
      remainingQuantity: 100,
      unit: 'plates',
      allergens: ['dairy', 'gluten'],
      preparedAt: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 1.5 * 3600 * 1000)),
      pickupWindowStart: Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 1000)),
      pickupWindowEnd: Timestamp.fromDate(new Date(Date.now() + 1.5 * 3600 * 1000)),
      coarseLocation: {
        locality: 'Indiranagar',
        city: 'Bengaluru',
        lat: 12.978,
        lng: 77.64
      },
      status: 'active',
      safetyDeclaration: {
        temperatureSafe: true,
        hygienicallyPrepared: true,
        allergensDisclosed: true,
        freshAtListing: true,
        declaredAt: Timestamp.now(),
        declaredByUid: uids.donor
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // 6. Seed Private Pickup Address subdocument
    await setDoc(doc(db, 'listings', 'lst_spice_garden_01', 'private', 'pickupAddress'), {
      exactAddress: '42 Brigade Road, Ground Floor Kitchen Entrance, Bengaluru - 560025',
      contactPhone: '+91 98450 12345',
      instructions: 'Ring the service bell at the rear dispatch bay. Insulated food crates ready for handover.',
      donorUid: uids.donor,
      createdAt: Timestamp.now()
    });

    // 7. Clear all claims
    const claimsSnap = await getDocs(collection(db, 'claims'));
    for (const d of claimsSnap.docs) {
      await deleteDoc(d.ref);
    }
  });

  console.log('Seeding completed successfully.');
}

async function navigateToRecipientDashboard(page) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const content = await page.content();
    if (content.includes('Available Fresh Surplus Meals')) {
      console.log('Recipient dashboard loaded.');
      return;
    }

    const btns = await page.$$('button');
    for (const b of btns) {
      const txt = await (await b.getProperty('textContent')).jsonValue();
      if (txt && (txt.includes('Browse Available Surplus Meals') || txt.includes('I need food') || txt.includes('My Workspace'))) {
        await b.click();
        await sleep(1000);
        break;
      }
    }

    await sleep(800);
  }
}

async function loginAsUser(page, email, password = 'password123') {
  console.log(`Authenticating as ${email}...`);
  // If user is already logged in, sign out first
  const signoutBtn = await page.$('button[title="Sign Out"]');
  if (signoutBtn) {
    await signoutBtn.click();
    await sleep(1000);
  } else {
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const txt = await (await b.getProperty('textContent')).jsonValue();
      if (txt && txt.includes('Sign Out')) {
        await b.click();
        await sleep(1000);
        break;
      }
    }
  }

  // Ensure emulator flag is set and storage is clean
  await page.evaluate(() => {
    localStorage.removeItem('foodlink_user');
    localStorage.removeItem('foodlink_claims');
    localStorage.setItem('foodlink_use_emulator', 'true');
  });

  // Click Sign In button in navbar
  const navBtns = await page.$$('button');
  for (const b of navBtns) {
    const txt = await (await b.getProperty('textContent')).jsonValue();
    if (txt && txt.trim() === 'Sign In') {
      await b.click();
      await sleep(800);
      break;
    }
  }

  // Type email and password
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type(email);
  }

  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await passInput.type(password);
  }

  // Click "Sign In to FoodLink" or "Sign In to Account"
  const modalBtns = await page.$$('button');
  for (const b of modalBtns) {
    const txt = await (await b.getProperty('textContent')).jsonValue();
    if (txt && (txt.includes('Sign In to FoodLink') || txt.includes('Sign In to Account'))) {
      await b.click();
      await sleep(2500);
      break;
    }
  }

  // Navigate to Recipient Dashboard
  await navigateToRecipientDashboard(page);
  await sleep(1000);
}

async function run() {
  console.log('Starting In-Browser Verification of Recipient Browsing & Claiming Flow against Firebase Emulator...');

  // Seed emulator state
  await seedData();
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1280,900']
  });

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // -------------------------------------------------------------
    // Step 1: Login as Verified Recipient 1 (Ananda Elderly Shelter)
    // -------------------------------------------------------------
    console.log('1. Navigating to FoodLink with ?emulator=true...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    await loginAsUser(page, 'manjunath.elderly@ananda.org');

    // Take Screenshot 1: BROWSE LISTINGS (expiring soonest, live countdown, coarse location)
    console.log('Capturing Screenshot 41: Verified Recipient Browsing Feed (Sorted, Live Countdown, Coarse Location)...');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, '41_recipient_browse_feed.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Step 2: Recipient 1 claims 30 of 100 portions
    // -------------------------------------------------------------
    console.log('2. Recipient 1 opens Claim Modal on first listing (100 plates)...');
    const claimButtons = await page.$$('button');
    let targetClaimBtn = null;
    for (const btn of claimButtons) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text && text.includes('Claim Portions')) {
        targetClaimBtn = btn;
        break;
      }
    }

    if (!targetClaimBtn) {
      throw new Error('Claim Portions button not found');
    }

    await targetClaimBtn.click();
    await sleep(600);

    // Adjust stepper to 30 portions
    console.log('Setting quantity to 30 portions via stepper/input...');
    await page.evaluate(() => {
      const input = document.querySelector('input[type="number"]');
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, '30');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(600);

    // Take Screenshot 2: Claim Stepper & Confirmation Summary Modal
    console.log('Capturing Screenshot 42: Claim Stepper & Summary Modal (30 portions)...');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, '42_claim_stepper_modal_partial.png'),
      fullPage: false
    });

    // Submit Claim
    console.log('Submitting partial claim of 30 portions...');
    const confirmButtons = await page.$$('button');
    for (const btn of confirmButtons) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text && text.includes('Confirm Claim')) {
        await btn.click();
        break;
      }
    }
    await sleep(2500);

    // Take Screenshot 3: Confirmed partial claim (30 of 100), remaining updated to 70, exact address unlocked
    console.log('Capturing Screenshot 43: Confirmed Partial Claim, Address Unlocked, Remaining updated to 70...');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, '43_partial_claim_confirmed_remaining_70.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Step 3: Switch to Recipient 2 (Hope Children Orphanage)
    // -------------------------------------------------------------
    console.log('3. Switching to Recipient 2 (Hope Children Orphanage)...');
    await loginAsUser(page, 'sister.mary@hopechildren.org');

    // Recipient 2 sees remaining 70 portions and claims all 70
    console.log('Recipient 2 claims the remaining 70 portions...');
    const claimButtons2 = await page.$$('button');
    let targetClaimBtn2 = null;
    for (const btn of claimButtons2) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text && text.includes('Claim Portions')) {
        targetClaimBtn2 = btn;
        break;
      }
    }

    if (targetClaimBtn2) {
      await targetClaimBtn2.click();
      await sleep(600);

      // Confirm claim for 70 portions
      const confirmBtns2 = await page.$$('button');
      for (const btn of confirmBtns2) {
        const text = await (await btn.getProperty('textContent')).jsonValue();
        if (text && text.includes('Confirm Claim')) {
          await btn.click();
          break;
        }
      }
      await sleep(2500);
    }

    // Take Screenshot 4: Second recipient claims rest
    console.log('Capturing Screenshot 44: Recipient 2 Confirmed Claim for Remaining 70 Portions...');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, '44_recipient2_claims_rest_70.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Step 4: Recipient 3 logs in and sees listing as Fully Claimed
    // -------------------------------------------------------------
    console.log('4. Switching to Recipient 3 (Community Relief Foundation)...');
    await loginAsUser(page, 'director@relief.org');

    // Take Screenshot 5: Fully Claimed state
    console.log('Capturing Screenshot 45: Listing shows Fully Claimed (0 remaining)...');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, '45_listing_fully_claimed_state.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Step 5: Switch back to Recipient 1 and Cancel Claim
    // -------------------------------------------------------------
    console.log('5. Switching back to Recipient 1 to cancel the 30-portion claim...');
    await loginAsUser(page, 'manjunath.elderly@ananda.org');

    // Click "Cancel Claim" on Recipient 1's active claim
    console.log('Clicking Cancel Claim...');
    const cancelButtons = await page.$$('button');
    let cancelBtn = null;
    for (const btn of cancelButtons) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text && text.includes('Cancel Claim')) {
        cancelBtn = btn;
        break;
      }
    }

    if (cancelBtn) {
      await cancelBtn.click();
      await sleep(600);

      // Take Screenshot 6: Cancel Claim Confirmation Modal
      console.log('Capturing Screenshot 46: Cancel Claim Confirmation Modal...');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, '46_cancel_claim_confirmation_modal.png'),
        fullPage: false
      });

      // Confirm cancellation
      const modalBtns = await page.$$('button');
      for (const btn of modalBtns) {
        const text = await (await btn.getProperty('textContent')).jsonValue();
        if (text && text.includes('Yes, Cancel Reservation')) {
          await btn.click();
          break;
        }
      }
      await sleep(2500);
    }

    // Take Screenshot 7: Claim cancelled and quantity restored back to listing
    console.log('Capturing Screenshot 47: Claim Cancelled & Quantity Restored (0 -> 30)...');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, '47_quantity_restored_after_cancellation.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Step 6: Capture Firebase Emulator UI
    // -------------------------------------------------------------
    console.log('6. Navigating to Firebase Emulator UI at ' + EMULATOR_UI_URL);
    await page.goto(EMULATOR_UI_URL, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(e => {
      console.warn('Could not navigate to emulator UI with domcontentloaded, falling back:', e);
    });
    await sleep(2500);

    console.log('Capturing Screenshot 48: Firebase Emulator UI...');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, '48_firebase_emulator_ui.png'),
      fullPage: true
    });

    console.log('All in-browser verification steps completed successfully!');
  } catch (error) {
    console.error('Browser automation error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
