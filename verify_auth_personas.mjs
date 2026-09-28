import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/SUDARSHAN/.gemini/antigravity/brain/76597e4e-3af3-4cbd-a1fa-ae4148cd3f70';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Starting FoodLink In-Browser Auth & Persona Verification Suite...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // 1. Visit App and Reset Local Storage
  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('foodlink_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(600);

  const openModal = async (mode = 'signup') => {
    await page.evaluate((targetMode) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      if (targetMode === 'signup') {
        const joinBtn = buttons.find(b => b.textContent && b.textContent.includes('Join FoodLink'));
        if (joinBtn) joinBtn.click();
      } else {
        const signinBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'Sign In');
        if (signinBtn) signinBtn.click();
      }
    }, mode);
    await sleep(500);
  };

  const closeModal = async () => {
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close dialog"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(400);
  };

  // ==========================================
  // SECTION 1: SIGNUP FLOW FOR EACH PERSONA (7 PERSONAS)
  // ==========================================
  console.log('--- Verifying Signup Flow for 7 Persona Types ---');

  // Persona 1: Restaurant Donor
  console.log('Testing Persona 1: Restaurant Donor Signup...');
  await openModal('signup');
  await page.evaluate(() => {
    const donorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Food Donor'));
    if (donorBtn) donorBtn.click();
    const restBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Restaurant / Commercial Kitchen'));
    if (restBtn) restBtn.click();
  });
  await sleep(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '01_signup_persona_restaurant.png'),
    fullPage: false
  });
  await closeModal();

  // Persona 2: Wedding / Event Donor
  console.log('Testing Persona 2: Wedding / Event Donor Signup...');
  await openModal('signup');
  await page.evaluate(() => {
    const donorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Food Donor'));
    if (donorBtn) donorBtn.click();
    const eventBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Wedding & Event Donor'));
    if (eventBtn) eventBtn.click();
  });
  await sleep(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '02_signup_persona_event_donor.png'),
    fullPage: false
  });
  await closeModal();

  // Persona 3: Elder Abandonment Shelter
  console.log('Testing Persona 3: Elder Abandonment Shelter Signup...');
  await openModal('signup');
  await page.evaluate(() => {
    const recipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Recipient Org / Shelter'));
    if (recipBtn) recipBtn.click();
  });
  await sleep(200);
  await page.evaluate(() => {
    const shelterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Elder Abandonment Shelter'));
    if (shelterBtn) shelterBtn.click();
  });
  await sleep(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '03_signup_persona_elder_shelter.png'),
    fullPage: false
  });
  await closeModal();

  // Persona 4: Old Age Home
  console.log('Testing Persona 4: Old Age Home Signup...');
  await openModal('signup');
  await page.evaluate(() => {
    const recipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Recipient Org / Shelter'));
    if (recipBtn) recipBtn.click();
  });
  await sleep(200);
  await page.evaluate(() => {
    const oldAgeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Old Age Home'));
    if (oldAgeBtn) oldAgeBtn.click();
  });
  await sleep(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '04_signup_persona_old_age_home.png'),
    fullPage: false
  });
  await closeModal();

  // Persona 5: Orphanage
  console.log('Testing Persona 5: Orphanage Signup...');
  await openModal('signup');
  await page.evaluate(() => {
    const recipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Recipient Org / Shelter'));
    if (recipBtn) recipBtn.click();
  });
  await sleep(200);
  await page.evaluate(() => {
    const orphanBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Orphanage / Children'));
    if (orphanBtn) orphanBtn.click();
  });
  await sleep(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '05_signup_persona_orphanage.png'),
    fullPage: false
  });
  await closeModal();

  // Persona 6: Registered NGO
  console.log('Testing Persona 6: Community NGO Signup...');
  await openModal('signup');
  await page.evaluate(() => {
    const recipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Recipient Org / Shelter'));
    if (recipBtn) recipBtn.click();
  });
  await sleep(200);
  await page.evaluate(() => {
    const ngoBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Community NGO / Food Bank'));
    if (ngoBtn) ngoBtn.click();
  });
  await sleep(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '06_signup_persona_ngo.png'),
    fullPage: false
  });
  await closeModal();

  // Persona 7: Individual Recipient
  console.log('Testing Persona 7: Individual Recipient Signup...');
  await openModal('signup');
  await page.evaluate(() => {
    const recipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Recipient Org / Shelter'));
    if (recipBtn) recipBtn.click();
  });
  await sleep(200);
  await page.evaluate(() => {
    const indBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Individual Recipient'));
    if (indBtn) indBtn.click();
  });
  await sleep(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '07_signup_persona_individual_recipient.png'),
    fullPage: false
  });
  await closeModal();

  // ==========================================
  // SECTION 2: LOGIN WITH EXISTING ACCOUNT
  // ==========================================
  console.log('--- Verifying Login with Existing Account ---');
  await openModal('signin');
  // Type email and password with page.type
  await page.type('input[type="email"]', 'chef.arjun@spicegarden.org', { delay: 20 });
  await page.type('input[type="password"]', 'Pass@1234', { delay: 20 });
  await sleep(300);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '08_login_modal_filled.png'),
    fullPage: false
  });

  // Click Submit
  console.log('Submitting login form...');
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Sign In to FoodLink'));
    if (submitBtn) submitBtn.click();
  });
  await sleep(800);

  // ==========================================
  // SECTION 3: ROLE-BASED ROUTING AFTER LOGIN (DASHBOARDS)
  // ==========================================
  console.log('--- Verifying Role-Based Routing After Login (Dashboards) ---');

  // 1. Restaurant Donor Dashboard
  console.log('Capturing Restaurant Donor Dashboard...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '09_dashboard_restaurant_donor.png'),
    fullPage: false
  });

  // Helper function to switch role via profile dropdown
  const switchRole = async (targetText) => {
    await page.evaluate(() => {
      const chevron = document.querySelector('button[aria-label="Switch persona"]');
      if (chevron) chevron.click();
    });
    await sleep(300);
    await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent && b.textContent.includes(text));
      if (target) target.click();
    }, targetText);
    await sleep(600);
  };

  // 2. Wedding / Event Donor Dashboard
  console.log('Capturing Wedding & Event Donor Dashboard...');
  await switchRole('Wedding/Event Donor');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '10_dashboard_event_donor.png'),
    fullPage: false
  });

  // 3. Elder Abandonment Shelter Dashboard
  console.log('Capturing Elder Abandonment Shelter Dashboard...');
  await switchRole('Elder Shelter Caretaker');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '11_dashboard_elder_shelter.png'),
    fullPage: false
  });

  // 4. Old Age Home Dashboard
  console.log('Capturing Old Age Home Dashboard...');
  await switchRole('Old Age Home');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '12_dashboard_old_age_home.png'),
    fullPage: false
  });

  // 5. Children's Orphanage Dashboard
  console.log('Capturing Children’s Orphanage Dashboard...');
  await switchRole('Children’s Orphanage');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '13_dashboard_orphanage.png'),
    fullPage: false
  });

  // 6. Registered Community NGO Dashboard
  console.log('Capturing Community NGO Dashboard...');
  await switchRole('Registered NGO');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '14_dashboard_ngo.png'),
    fullPage: false
  });

  // 7. Individual Recipient Dashboard
  console.log('Capturing Individual Recipient Dashboard...');
  await switchRole('Individual Recipient');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '15_dashboard_individual_recipient.png'),
    fullPage: false
  });

  // 8. Safety Admin Reviewer Console
  console.log('Capturing Safety Admin Review Console...');
  await switchRole('Safety Admin Reviewer');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '16_dashboard_safety_admin.png'),
    fullPage: false
  });

  // ==========================================
  // SECTION 4: SIGN OUT AND RE-SIGN-IN
  // ==========================================
  console.log('--- Verifying Sign-out and Re-sign-in ---');
  // Click Sign Out
  await page.evaluate(() => {
    const signoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Sign Out'));
    if (signoutBtn) signoutBtn.click();
  });
  await sleep(600);

  console.log('Capturing signed out landing page...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '17_signed_out_landing.png'),
    fullPage: false
  });

  // Re-sign-in as Elder Shelter Caretaker using existing credentials
  console.log('Re-signing in with existing Elder Shelter credentials...');
  await openModal('signin');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const signinTab = tabs.find(b => b.textContent && b.textContent.trim() === 'Sign In');
    if (signinTab) signinTab.click();
  });
  await sleep(300);

  await page.click('input[type="email"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="email"]', 'caretaker.ramesh@anandaoldage.org', { delay: 20 });
  
  await page.click('input[type="password"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="password"]', 'Pass@1234', { delay: 20 });
  await sleep(300);

  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Sign In to FoodLink'));
    if (submitBtn) submitBtn.click();
  });
  await sleep(1000);

  console.log('Capturing re-signed in dashboard...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '18_re_signed_in_dashboard.png'),
    fullPage: false
  });

  console.log('All 18 auth, persona, dashboard, and session verification screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Auth verification failed:', err);
  process.exit(1);
});
