import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/SUDARSHAN/.gemini/antigravity/brain/76597e4e-3af3-4cbd-a1fa-ae4148cd3f70';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

  // Scroll to How it Works and Problem statement
  await page.evaluate(() => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ 
    path: path.join(ARTIFACT_DIR, '06_how_it_works_section.png'),
    fullPage: false
  });

  // Scroll to Impact Calculator & Safety Pledge
  await page.evaluate(() => {
    document.getElementById('safety-pledge')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ 
    path: path.join(ARTIFACT_DIR, '07_safety_pledge_and_calculator.png'),
    fullPage: false
  });

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
