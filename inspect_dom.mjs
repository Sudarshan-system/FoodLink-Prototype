import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:4173');

  const textLines = await page.evaluate(() => {
    return document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
  });

  console.log('--- ALL VISIBLE TEXT LINES ON PAGE (FIRST 30) ---');
  textLines.slice(0, 30).forEach((line, i) => {
    console.log(`${i}: ${line}`);
  });

  await browser.close();
}

run();
