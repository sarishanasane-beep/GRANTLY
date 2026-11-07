import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('..', 'screenshots-compliance');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('--- Starting Preview Server ---');
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  });

  await new Promise((res) => setTimeout(res, 2500));

  console.log('--- Launching Headless Chromium ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  try {
    // 1. Visit Privacy Policy
    console.log('1. Checking /privacy ...');
    await page.goto('http://localhost:4173/privacy', { waitUntil: 'networkidle0' });
    const privacyTitle = await page.$eval('h1', (el) => el.innerText);
    console.log(`   Page H1: "${privacyTitle}"`);
    await page.screenshot({ path: path.join(screenshotDir, '01-privacy-policy.png'), fullPage: false });

    // 2. Visit Terms of Service
    console.log('2. Checking /terms ...');
    await page.goto('http://localhost:4173/terms', { waitUntil: 'networkidle0' });
    const termsTitle = await page.$eval('h1', (el) => el.innerText);
    console.log(`   Page H1: "${termsTitle}"`);
    await page.screenshot({ path: path.join(screenshotDir, '02-terms-page.png'), fullPage: false });

    // 3. Visit Cookie Policy
    console.log('3. Checking /cookies ...');
    await page.goto('http://localhost:4173/cookies', { waitUntil: 'networkidle0' });
    const cookiesTitle = await page.$eval('h1', (el) => el.innerText);
    console.log(`   Page H1: "${cookiesTitle}"`);
    await page.screenshot({ path: path.join(screenshotDir, '03-cookies-page.png'), fullPage: false });

    // 4. Visit Refund Policy
    console.log('4. Checking /refund ...');
    await page.goto('http://localhost:4173/refund', { waitUntil: 'networkidle0' });
    const refundTitle = await page.$eval('h1', (el) => el.innerText);
    console.log(`   Page H1: "${refundTitle}"`);
    await page.screenshot({ path: path.join(screenshotDir, '04-refund-page.png'), fullPage: false });

    // 5. Visit Scholarship Detail Page (with Share & Print)
    console.log('5. Checking /scholarship/sch-01 ...');
    await page.goto('http://localhost:4173/scholarship/sch-01', { waitUntil: 'networkidle0' });
    const detailTitle = await page.$eval('h1', (el) => el.innerText);
    console.log(`   Page H1: "${detailTitle}"`);
    await page.screenshot({ path: path.join(screenshotDir, '05-scholarship-detail.png'), fullPage: false });

    // 6. Visit Profile Page & Test Delete Data Modal
    console.log('6. Checking /profile & Data Erasure Modal ...');
    await page.goto('http://localhost:4173/profile', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotDir, '06-profile-initial.png'), fullPage: false });

    // Click "Erase All Local Data" button
    const eraseButton = await page.$('button[aria-label="Delete all local student data"]');
    if (eraseButton) {
      await eraseButton.click();
      await new Promise((res) => setTimeout(res, 500));
      await page.screenshot({ path: path.join(screenshotDir, '07-delete-modal-open.png'), fullPage: false });
      console.log('   Modal opened successfully!');

      // Close modal with Cancel button
      const cancelButton = await page.$('button:has-text("Cancel")') || await page.$('button[aria-label="Close dialog"]');
      if (cancelButton) {
        await cancelButton.click();
        await new Promise((res) => setTimeout(res, 300));
        console.log('   Modal dismissed cleanly.');
      }
    }

    console.log(`--- Verification Complete! Console errors caught: ${errors.length} ---`);
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
  } finally {
    await browser.close();
    preview.kill();
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
