import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/SUDARSHAN/.gemini/antigravity/brain/76597e4e-3af3-4cbd-a1fa-ae4148cd3f70';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Starting Surplus Food Listing Creation Flow In-Browser Verification...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // ==================================================================
  // SCENARIO 1: UNVERIFIED DONOR BLOCKED WITH FRIENDLY EXPLANATION
  // ==================================================================
  console.log('--- Scenario 1: Unverified Donor Blocked From Listing ---');
  const unverifiedDonor = {
    uid: 'demo_unverified_01',
    email: 'aarav@greenharvest.com',
    displayName: 'Aarav Patel (Green Harvest)',
    organizationName: 'Green Harvest Bakery',
    phone: '+91 98450 11223',
    role: 'donor',
    subRole: 'restaurant',
    address: '12 100ft Road, Indiranagar',
    city: 'Bengaluru',
    verificationStatus: 'unverified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  await page.evaluate((u) => {
    localStorage.clear();
    localStorage.setItem('foodlink_theme', 'light');
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodlink_active_user', JSON.stringify(u));
    localStorage.setItem('foodlink_verifications', JSON.stringify([]));
  }, unverifiedDonor);

  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(600);

  // Click "List Food Surplus"
  console.log('Clicking List Food Surplus as unverified donor...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('List Food Surplus'));
    if (btn) btn.click();
  });
  await sleep(800);

  console.log('Capturing Screenshot 28: Unverified Donor Blocked with Friendly Explanatory Banner...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '28_unverified_donor_blocked_from_listing.png'),
    fullPage: false
  });

  // Close modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close dialog"]');
    if (closeBtn) closeBtn.click();
  });
  await sleep(400);

  // ==================================================================
  // SCENARIO 2: VERIFIED DONOR OPENS FORM & TESTS INCOMPLETE CHECKLIST
  // ==================================================================
  console.log('--- Scenario 2: Verified Donor Opens Form & Tests Incomplete Checklist ---');
  const verifiedDonor = {
    uid: 'demo_restaurant_01',
    email: 'chef@spicegarden.com',
    displayName: 'Chef Arjun (Spice Garden)',
    organizationName: 'Spice Garden Fine Dining',
    phone: '+91 98765 43210',
    role: 'donor',
    subRole: 'restaurant',
    address: '42 Brigade Road',
    city: 'Bengaluru',
    verificationStatus: 'verified',
    verificationExpiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const verifiedDoc = {
    id: 'doc_verified_01',
    userId: 'demo_restaurant_01',
    status: 'verified',
    documentNumber: 'FSSAI-21223019000452',
    name: 'FSSAI Food Safety & Hygiene License',
    fileName: 'fssai_cert.pdf',
    expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString()
  };

  await page.evaluate((u, doc) => {
    localStorage.setItem('foodlink_active_user', JSON.stringify(u));
    localStorage.setItem('foodlink_verifications', JSON.stringify([doc]));
  }, verifiedDonor, verifiedDoc);

  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(600);

  // Open "List Food Surplus" form
  console.log('Opening Create Listing Form as verified donor...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('List Food Surplus'));
    if (btn) btn.click();
  });
  await sleep(800);

  // Fill in Meal Title, Total Quantity, Notes, Exact Address
  await page.focus('input[placeholder*="Vegetable Pulao"]');
  await page.keyboard.type('Nutritious Vegetable Khichdi & Palak Dal (Dinner Service Surplus)', { delay: 10 });
  await sleep(200);

  await page.focus('input[placeholder*="Full street address"]');
  await page.keyboard.type('Spice Garden Kitchens, 42 Brigade Road, Ground Floor Loading Bay, Bengaluru', { delay: 10 });
  await sleep(200);

  // Check ONLY 2 of the 4 safety declarations (incomplete checklist)
  console.log('Checking only 2 of 4 safety declarations to demonstrate submission is blocked...');
  await page.evaluate(() => {
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    if (checkboxes[0]) checkboxes[0].click(); // Temperature Safe
    if (checkboxes[1]) checkboxes[1].click(); // Hygienically Packed
  });
  await sleep(500);

  console.log('Capturing Screenshot 29: Form with Incomplete Safety Declaration (Publish Disabled)...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '29_create_listing_incomplete_checklist_disabled.png'),
    fullPage: false
  });

  // ==================================================================
  // SCENARIO 3: COMPLETE CHECKLIST & PUBLISH SURPLUS LISTING
  // ==================================================================
  console.log('--- Scenario 3: Complete All 4 Safety Checks & Publish Listing ---');
  await page.evaluate(() => {
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    if (checkboxes[2]) checkboxes[2].click(); // Allergens Disclosed
    if (checkboxes[3]) checkboxes[3].click(); // Fresh at Listing
  });
  await sleep(500);

  console.log('Capturing Screenshot 30: All 4 Safety Checks Complete (Publish Enabled in Trust Blue)...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '30_create_listing_complete_checklist_enabled.png'),
    fullPage: false
  });

  // Submit Listing
  console.log('Submitting surplus food listing...');
  await page.evaluate(() => {
    const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Publish Surplus Food Listing'));
    if (publishBtn) publishBtn.click();
  });
  await sleep(2000);

  // ==================================================================
  // SCENARIO 4: VERIFY MY LISTINGS ON DONOR DASHBOARD
  // ==================================================================
  console.log('Capturing Screenshot 31: Donor Dashboard Showing Newly Published Surplus Listing...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '31_donor_dashboard_with_published_listing.png'),
    fullPage: false
  });

  // ==================================================================
  // SCENARIO 5: EVENT DONOR VARIANT FORM
  // ==================================================================
  console.log('--- Scenario 5: Event Donor Variant Form ---');
  const eventDonor = {
    uid: 'demo_event_01',
    email: 'sharma.wedding@gmail.com',
    displayName: 'Vikram Sharma (Host)',
    organizationName: 'Sharma & Verma Wedding Celebration',
    phone: '+91 99000 11223',
    role: 'donor',
    subRole: 'individual_event',
    address: 'Grand Palace Lawn, Bellandur',
    city: 'Bengaluru',
    verificationStatus: 'verified',
    verificationExpiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const eventDoc = {
    id: 'doc_event_01',
    userId: 'demo_event_01',
    status: 'verified',
    documentNumber: 'GOVT-AADHAAR-8891',
    name: 'Government ID & Function Booking Receipt',
    fileName: 'booking_receipt.pdf',
    expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString()
  };

  await page.evaluate((u, doc) => {
    localStorage.setItem('foodlink_active_user', JSON.stringify(u));
    localStorage.setItem('foodlink_verifications', JSON.stringify([doc]));
  }, eventDonor, eventDoc);

  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(600);

  console.log('Opening Event Donor listing modal...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('List Food Surplus'));
    if (btn) btn.click();
  });
  await sleep(800);

  console.log('Capturing Screenshot 32: Event Donor Variant with Wedding Details & Guest Count...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '32_event_donor_listing_modal_variant.png'),
    fullPage: false
  });

  console.log('All listing creation screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Listing verification failed:', err);
  process.exit(1);
});
