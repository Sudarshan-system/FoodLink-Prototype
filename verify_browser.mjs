import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/SUDARSHAN/.gemini/antigravity/brain/76597e4e-3af3-4cbd-a1fa-ae4148cd3f70';

async function run() {
  console.log('Launching browser to verify clean homepage top and simplified copy...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // 1. Visit Landing Page
  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1');

  // Clear any active session from storage to verify fresh visitor experience
  await page.evaluate(() => {
    localStorage.removeItem('foodlink_active_user');
    localStorage.setItem('foodlink_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 1: Clean Homepage Top (Light Mode)
  console.log('Capturing Screenshot 1: Clean Homepage Top (Light Mode)...');
  await page.screenshot({ 
    path: path.join(ARTIFACT_DIR, '01_clean_homepage_top_light.png'),
    fullPage: false
  });

  // Screenshot 2: Clean Homepage Top (Dark Harbor Mode)
  console.log('Toggling to Dark Harbor mode...');
  const themeToggle = await page.waitForSelector('button[aria-label="Toggle light and dark mode"]');
  await themeToggle.click();
  await new Promise(r => setTimeout(r, 600));

  console.log('Capturing Screenshot 2: Clean Homepage Top (Dark Harbor Mode)...');
  await page.screenshot({ 
    path: path.join(ARTIFACT_DIR, '02_clean_homepage_top_dark.png'),
    fullPage: false
  });

  console.log('All verification screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
