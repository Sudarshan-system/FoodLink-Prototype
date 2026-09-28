import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/SUDARSHAN/.gemini/antigravity/brain/76597e4e-3af3-4cbd-a1fa-ae4148cd3f70';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Starting FoodLink Admin Verification Review Flow In-Browser Verification...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // 1. Visit App and Reset Local Storage with initial pending test state
  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('foodlink_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(600);

  // Helper to switch demo persona
  const switchPersona = async (roleName) => {
    await page.evaluate(() => {
      const chevron = document.querySelector('button[aria-label="Switch persona"]');
      if (chevron) chevron.click();
    });
    await sleep(300);
    await page.evaluate((name) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent && b.textContent.includes(name));
      if (target) target.click();
    }, roleName);
    await sleep(600);
  };

  // Helper to log in via Quick Test buttons inside AuthModal
  const loginWithHelper = async (helperName) => {
    await page.evaluate(() => {
      const signinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Sign In');
      if (signinBtn) signinBtn.click();
    });
    await sleep(500);
    await page.evaluate((name) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent && b.textContent.includes(name));
      if (target) target.click();
    }, helperName);
    await sleep(600);
  };

  // ==========================================
  // STEP 1: TEST DONOR DOCUMENT SUBMISSION
  // ==========================================
  console.log('--- Step 1: Donor Submits Verification Document ---');
  await loginWithHelper('Restaurant');
  
  // Set status to pending initially to demonstrate submission
  await page.evaluate(() => {
    const raw = localStorage.getItem('foodlink_active_user');
    if (raw) {
      const u = JSON.parse(raw);
      u.verificationStatus = 'pending';
      localStorage.setItem('foodlink_active_user', JSON.stringify(u));
    }
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(600);

  // Open Document Submission Modal
  console.log('Opening Document Submission Modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitDocBtn = buttons.find(b => b.textContent && (b.textContent.includes('Submit Document') || b.textContent.includes('Update Document') || b.textContent.includes('Resubmit')));
    if (submitDocBtn) submitDocBtn.click();
  });
  await sleep(500);

  // Fill in document reference number and attach sample file
  await page.evaluate(() => {
    const sampleAttachBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Attach Sample Verification Document'));
    if (sampleAttachBtn) sampleAttachBtn.click();
  });
  await sleep(300);
  await page.focus('input[placeholder*="FSSAI"]');
  await page.keyboard.type('FSSAI-21223019000452', { delay: 15 });
  await sleep(400);

  console.log('Capturing Screenshot 19: Donor Document Submission Modal...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '19_donor_document_submission_modal.png'),
    fullPage: false
  });

  // Submit document
  console.log('Submitting document for review...');
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Submit for Review'));
    if (submitBtn) submitBtn.click();
  });
  await sleep(1500);

  console.log('Capturing Screenshot 20: Donor Dashboard with Pending Verification Banner...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '20_donor_dashboard_pending_verification.png'),
    fullPage: false
  });

  // ==========================================
  // STEP 2: ADMIN LOGIN & QUEUE INSPECTION
  // ==========================================
  console.log('--- Step 2: Switch to Safety Admin Reviewer ---');
  await switchPersona('Safety Admin Reviewer');
  await sleep(600);

  console.log('Capturing Screenshot 21: Admin Review Console Verification Queue...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '21_admin_verification_queue.png'),
    fullPage: false
  });

  // ==========================================
  // STEP 3: ADMIN APPROVAL OF DONOR DOCUMENT (SPICE GARDEN)
  // ==========================================
  console.log('--- Step 3: Admin Reviews and Approves Spice Garden Document ---');
  // Open Review modal for first pending document (Spice Garden)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const reviewBtn = buttons.find(b => b.textContent && b.textContent.includes('Review & Decide'));
    if (reviewBtn) reviewBtn.click();
  });
  await sleep(600);

  console.log('Capturing Screenshot 22: Admin Review Modal for Approval...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '22_admin_review_modal_approve.png'),
    fullPage: false
  });

  // Click Approve & Grant Verified Status
  console.log('Approving Spice Garden verification with 180-day expiry...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const approveBtn = buttons.find(b => b.textContent && b.textContent.includes('Approve & Grant'));
    if (approveBtn) approveBtn.click();
  });
  await sleep(800);

  console.log('Capturing Screenshot 23: Admin Queue After Approving Spice Garden...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '23_admin_queue_after_approval.png'),
    fullPage: false
  });

  // ==========================================
  // STEP 4: ADMIN REJECTION WITH MANDATORY REASON (ANANDA SHELTER)
  // ==========================================
  console.log('--- Step 4: Admin Rejects Ananda Shelter with Reason ---');
  // Open Review modal for Ananda Shelter document
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const reviewButtons = buttons.filter(b => b.textContent && b.textContent.includes('Review & Decide'));
    if (reviewButtons.length > 0) reviewButtons[0].click();
  });
  await sleep(600);

  // Click "Reject with Reason"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const rejectBtn = buttons.find(b => b.textContent && b.textContent.includes('Reject with Reason'));
    if (rejectBtn) rejectBtn.click();
  });
  await sleep(400);

  // Type mandatory rejection reason
  const rejectionRationale = 'Shelter Trust Registration expired on March 2025. Please upload active renewed trust deed and local municipal fire safety certificate.';
  console.log('Entering mandatory rejection reason...');
  await page.type('textarea', rejectionRationale, { delay: 15 });
  await sleep(400);

  console.log('Capturing Screenshot 24: Admin Rejection Modal with Mandatory Reason...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '24_admin_review_modal_rejection_reason.png'),
    fullPage: false
  });

  // Confirm rejection
  console.log('Confirming audited rejection...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const confirmBtn = buttons.find(b => b.textContent && b.textContent.includes('Confirm Rejection'));
    if (confirmBtn) confirmBtn.click();
  });
  await sleep(800);

  // Switch to "Rejected" tab in Admin table to capture stored audit reason
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const rejectedTab = buttons.find(b => b.textContent && b.textContent.includes('Rejected ('));
    if (rejectedTab) rejectedTab.click();
  });
  await sleep(400);

  console.log('Capturing Screenshot 25: Admin Audit Log Showing Rejection with Reason...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '25_admin_audit_log_rejected.png'),
    fullPage: false
  });

  // ==========================================
  // STEP 5: VERIFY PARTNERS SEE UPDATED STATUS
  // ==========================================
  console.log('--- Step 5: Verify Approved & Rejected Status on Partner Dashboards ---');

  // Verify Approved Partner (Spice Garden)
  console.log('Switching to approved partner Spice Garden...');
  await switchPersona('Restaurant Donor');
  await sleep(600);

  console.log('Capturing Screenshot 26: Approved Donor Dashboard (Verified 180-Day Badge)...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '26_donor_dashboard_approved_verified.png'),
    fullPage: false
  });

  // Verify Rejected Partner (Ananda Shelter)
  console.log('Switching to rejected partner Ananda Elderly Haven...');
  await switchPersona('Elder Shelter Caretaker');
  await sleep(600);

  console.log('Capturing Screenshot 27: Rejected Shelter Dashboard with Exact Admin Reason...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '27_shelter_dashboard_rejected_with_reason.png'),
    fullPage: false
  });

  console.log('All admin verification review screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Admin review verification failed:', err);
  process.exit(1);
});
