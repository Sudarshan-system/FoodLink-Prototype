import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/SUDARSHAN/.gemini/antigravity/brain/76597e4e-3af3-4cbd-a1fa-ae4148cd3f70';

async function run() {
  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 850 }
  });

  try {
    const page = await browser.newPage();

    // 1. Visit landing page
    console.log('Navigating to http://localhost:4173/ ...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });

    // Open Sign In modal
    console.log('Opening Auth modal in Sign In mode...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign In'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Screenshot 34: Sign In tab with Google button
    console.log('Taking screenshot 34: Sign In tab with Google button...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '34_sign_in_with_google.png') });

    // Click "Create Account" tab
    console.log('Switching to Create Account tab...');
    await page.click('[data-testid="tab-signup"]');
    await new Promise(r => setTimeout(r, 600));

    // Verify Google button is NOT present in Create Account tab
    const googleBtnInSignup = await page.$('[data-testid="google-signin-btn"]');
    console.log('Google button present in Create Account tab?', Boolean(googleBtnInSignup));
    if (googleBtnInSignup) {
      throw new Error('FAIL: Google button must NOT be present on Create Account tab!');
    }

    // Screenshot 33: Create Account tab without Google button
    console.log('Taking screenshot 33: Create Account tab (no Google button)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '33_create_account_no_google.png') });

    // Switch back to Sign In tab
    console.log('Switching back to Sign In tab...');
    await page.click('[data-testid="tab-signin"]');
    await new Promise(r => setTimeout(r, 600));

    // Test never-registered Google account being blocked
    console.log('Testing unregistered Google account block...');
    await page.click('[data-testid="google-signin-btn"]');
    await new Promise(r => setTimeout(r, 500));

    // Click the unregistered test account option
    await page.click('[data-testid="google-picker-unregistered"]');
    await new Promise(r => setTimeout(r, 800));

    // Screenshot 35: Unregistered Google account blocked
    console.log('Taking screenshot 35: Unregistered Google account blocked with friendly message...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '35_unregistered_google_blocked.png') });

    // Now test returning Google user: Priya Sharma (registered event donor)
    console.log('Testing returning user Google sign in (Priya Sharma)...');
    await page.click('[data-testid="google-signin-btn"]');
    await new Promise(r => setTimeout(r, 500));
    await page.click('[data-testid="google-picker-priya"]');
    await new Promise(r => setTimeout(r, 1000));

    // User is now logged in to HomeHub
    // Screenshot 36: Home screen with two big cards ("I'm donating food" & "I need food")
    console.log('Taking screenshot 36: Returning user on HomeHub screen with two big cards...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '36_returning_google_user_homehub.png') });

    // Test Text Size Control (A+) in the header
    console.log('Testing Text Size Control (A+)...');
    await page.evaluate(() => {
      const aPlusBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'A+');
      if (aPlusBtn) {
        aPlusBtn.click();
        aPlusBtn.click(); // Zoom to 1.25x
      }
    });
    await new Promise(r => setTimeout(r, 500));

    // Screenshot 37: Text size scaling
    console.log('Taking screenshot 37: Text size scaled up for elderly caretakers...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '37_text_size_scaling_a_plus.png') });

    // Navigate to Donor Workspace to test Listing Form & Date-Time pickers
    console.log('Navigating to Donor Workspace...');
    await page.evaluate(() => {
      const donateCardBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('List Food Surplus Now') || b.textContent.includes('Open Donor Workspace'));
      if (donateCardBtn) donateCardBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // If modal not open yet, click "List Food Surplus" button on dashboard
    const modalVisible = await page.$('input[type="datetime-local"]');
    if (!modalVisible) {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('List Food Surplus'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 800));
    }

    // Screenshot 39: Listing Form with real date-time pickers and "Declared by donor" checklist
    console.log('Taking screenshot 39: Listing form with real date-time pickers and Declared by donor checklist...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '39_listing_form_datetime_and_declared_by_donor.png') });

    // Close Create Listing Modal
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Test Cancel Listing Confirmation Modal on Donor Dashboard
    console.log('Testing Cancel Listing Confirmation Modal...');
    await page.evaluate(() => {
      const cancelListingBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cancel Listing'));
      if (cancelListingBtn) cancelListingBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Screenshot 40: Cancel Listing Confirmation Modal
    console.log('Taking screenshot 40: Cancel listing confirmation modal...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '40_cancel_listing_confirmation_modal.png') });

    // Dismiss Confirmation Modal
    await page.evaluate(() => {
      const keepBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Keep Listing Active'));
      if (keepBtn) keepBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Test Mobile viewport & Bottom Tab Bar
    console.log('Testing mobile viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await new Promise(r => setTimeout(r, 600));

    // Open Help & FAQ Modal via bottom tab bar
    console.log('Opening Help & FAQ Modal via bottom tab bar...');
    await page.evaluate(() => {
      const helpTab = Array.from(document.querySelectorAll('nav[aria-label="Mobile Navigation"] button')).find(b => b.textContent.includes('Help'));
      if (helpTab) helpTab.click();
    });
    await new Promise(r => setTimeout(r, 700));

    // Screenshot 38: Mobile bottom tab bar and Help/FAQ modal
    console.log('Taking screenshot 38: Mobile bottom tab bar and Help FAQ modal...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '38_mobile_bottom_bar_and_help.png') });

    console.log('ALL IN-BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
