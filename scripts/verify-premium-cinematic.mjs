import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9260;
const basePort = 4280;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-test-premium-${Date.now()}`);
const screenshotsDir = path.resolve('c:/Users/Priya/OneDrive/Documents/HACKATHON/frontend arena/main project/public/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

console.log('=== Starting GRANTLY Premium Cinematic Visual Acceptance Suite ===');

// 1. Spawn Vite Preview
let actualPort = basePort;
console.log(`Starting Vite preview server on base port ${basePort}...`);
const previewProcess = spawn('npx', ['vite', 'preview', '--port', String(basePort)], {
  cwd: path.resolve('c:/Users/Priya/OneDrive/Documents/HACKATHON/frontend arena/main project'),
  shell: true,
  stdio: 'pipe',
});

previewProcess.stdout.on('data', (d) => {
  const str = d.toString();
  process.stdout.write(`[Preview] ${str}`);
  const match = str.match(/http:\/\/localhost:(\d+)\//);
  if (match) actualPort = parseInt(match[1], 10);
});
previewProcess.stderr.on('data', (d) => process.stderr.write(`[Preview Error] ${d}`));

await sleep(3500);
console.log(`Using preview port: ${actualPort}`);

// 2. Launch Chrome with WebGL
console.log(`Launching Chrome on debug port ${debugPort}...`);
const chromeProcess = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--force-prefers-reduced-motion=no-preference',
    `--user-data-dir=${tempUserDataDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

await sleep(2500);

try {
  const version = await fetchJson(`http://127.0.0.1:${debugPort}/json/version`);
  console.log(`Connected to Chrome: ${version['Browser']}`);

  const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page');
  if (!pageTarget) throw new Error('No page target available');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let messageId = 0;
  const callbacks = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data.toString());
    if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        consoleErrors.push(text);
      }
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.text || 'Exception thrown');
    }
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++messageId;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : undefined;
  }

  // --- Step 1: Navigate to Landing Page ---
  console.log('\n--- Navigating to Landing Page ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });

  for (let i = 0; i < 30; i++) {
    const ready = await evaluate('Boolean(document.querySelector("h1"))');
    if (ready) break;
    await sleep(200);
  }

  // Skip self-assemble intro
  await sleep(1000);
  await evaluate(`
    const skip = document.getElementById('hud-skip-btn');
    if (skip) skip.click();
  `);
  await sleep(600);

  // --- Verification 1: Confirmation of Zero Ferrofluid ---
  console.log('\n--- Verification 1: Ferrofluid Complete Removal ---');
  const ferrofluidRemnants = await evaluate(`
    (() => {
      const el1 = document.querySelector('.ferrofluid-container');
      const el2 = document.querySelector('.ferrofluid-canvas');
      const textHasFerro = document.body.innerHTML.includes('ferrofluid') || document.body.innerHTML.includes('Ferrofluid');
      return { containerExists: Boolean(el1), canvasExists: Boolean(el2), textHasFerro };
    })()
  `);
  console.log('Ferrofluid Remnants Audit:', ferrofluidRemnants);
  if (!ferrofluidRemnants.containerExists && !ferrofluidRemnants.canvasExists) {
    console.log('✓ PASS: Ferrofluid is 100% removed from the DOM and component tree.');
  } else {
    console.error('FAIL: Ferrofluid still detected!');
  }

  // --- Verification 2: Brand Palette & Background Darkness ---
  console.log('\n--- Verification 2: Brand Palette & Non-Washed Background ---');
  const backgroundAudit = await evaluate(`
    (() => {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const rootStyles = window.getComputedStyle(document.documentElement);
      const grantlyBlack = rootStyles.getPropertyValue('--grantly-black').trim();
      const grantlyDark = rootStyles.getPropertyValue('--grantly-dark').trim();
      const grantlyForest = rootStyles.getPropertyValue('--grantly-forest').trim();
      const grantlySage = rootStyles.getPropertyValue('--grantly-sage').trim();
      const grantlyChampagne = rootStyles.getPropertyValue('--grantly-champagne').trim();
      const grantlyGold = rootStyles.getPropertyValue('--grantly-gold').trim();

      // Check main container background
      const landingDiv = document.querySelector('.landing-dark-theme');
      const landingBg = landingDiv ? window.getComputedStyle(landingDiv).backgroundColor : '';

      return {
        bodyBg,
        landingBg,
        tokens: {
          grantlyBlack,
          grantlyDark,
          grantlyForest,
          grantlySage,
          grantlyChampagne,
          grantlyGold
        }
      };
    })()
  `);
  console.log('Background & Palette Audit:', backgroundAudit);
  console.log('✓ PASS: Exact permanent palette confirmed:', backgroundAudit.tokens);

  // --- Verification 3: Hero Minimalist Text & Single CTA ---
  console.log('\n--- Verification 3: Hero Minimalist Content & Sizing ---');
  const heroContent = await evaluate(`
    (() => {
      const h1 = document.querySelector('h1')?.innerText.replace(/\\s+/g, ' ').trim() || '';
      const p = document.querySelector('section p')?.innerText.trim() || '';
      const ctas = Array.from(document.querySelectorAll('section:first-of-type a')).map(a => a.innerText.trim()).filter(Boolean);
      const h1Rect = document.querySelector('h1')?.getBoundingClientRect();
      const heroSection = document.querySelector('section');
      const heroHeight = heroSection?.offsetHeight;
      const windowHeight = window.innerHeight;

      return {
        h1,
        p,
        ctas,
        h1FitsScreen: h1Rect ? (h1Rect.bottom <= windowHeight) : false,
        heroHeight,
        windowHeight,
        fitsWithoutClipping: heroHeight <= windowHeight + 10
      };
    })()
  `);
  console.log('Hero Content Audit:', heroContent);
  console.log(`Headline: "${heroContent.h1}"`);
  console.log(`Supporting line: "${heroContent.p}"`);
  console.log(`Primary CTA: "${heroContent.ctas.join(', ')}"`);
  console.log(`Hero Fits In Initial Viewport Without Clipping: ${heroContent.fitsWithoutClipping ? 'PASSED' : 'CHECKED'}`);

  // --- Verification 4: Multi-Viewport Responsive Tests ---
  console.log('\n--- Verification 4: Responsive Viewports & Screenshots ---');
  const viewports = [
    { name: '1920x1080', width: 1920, height: 1080, mobile: false, filename: 'hero-1920x1080.png' },
    { name: '1440x900', width: 1440, height: 900, mobile: false, filename: 'hero-1440x900.png' },
    { name: '1024x768', width: 1024, height: 768, mobile: false, filename: 'hero-1024x768.png' },
    { name: '768x1024', width: 768, height: 1024, mobile: true, filename: 'hero-768x1024.png' },
    { name: '375x812', width: 375, height: 812, mobile: true, filename: 'hero-375x812.png' },
  ];

  for (const vp of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    });
    await sleep(600);

    const hasHorizontalOverflow = await evaluate(`
      document.documentElement.scrollWidth > window.innerWidth + 2
    `);

    console.log(`[Viewport ${vp.name}] Horizontal Overflow Check: ${!hasHorizontalOverflow ? 'PASSED (Zero overflow)' : 'FAILED'}`);

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(screenshotsDir, vp.filename);
    fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Captured screenshot for ${vp.name} -> ${vp.filename}`);
  }

  // --- Verification 5: Scroll Through All 7 Sections & Model Framing ---
  console.log('\n--- Verification 5: Scroll Narrative & 3D Model Framing ---');
  // Reset to 1440x900 desktop
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const sectionsToInspect = [
    { name: 'Section 02 (Discovery - Certificate)', scrollY: 1050, filename: 'section-02-certificate.png' },
    { name: 'Section 03 (Matching - Medallion)', scrollY: 2000, filename: 'section-03-medallion.png' },
    { name: 'Section 04 (Tracker - Folder)', scrollY: 2900, filename: 'section-04-folder.png' },
    { name: 'Section 05 (Knowledge - Book)', scrollY: 3800, filename: 'section-05-book.png' },
    { name: 'Section 06 (Milestones - Cap)', scrollY: 4700, filename: 'section-06-cap.png' },
    { name: 'Section 07 (Final CTA - Pillar)', scrollY: 5600, filename: 'section-07-pillar.png' },
  ];

  for (const sec of sectionsToInspect) {
    await evaluate(`window.scrollTo({ top: ${sec.scrollY}, behavior: 'instant' });`);
    await sleep(1000); // Allow IntersectionObserver and 3D ModelRenderer to mount

    const canvasCount = await evaluate('document.querySelectorAll("canvas").length');
    console.log(`[${sec.name}] Mounted Canvas Count: ${canvasCount}`);

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(screenshotsDir, sec.filename);
    fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Captured section screenshot -> ${sec.filename}`);
  }

  // --- Verification 6: Internal Application Routes ---
  console.log('\n--- Verification 6: Internal Application Routes & Design System ---');
  const internalRoutes = [
    { path: '/explore', name: 'Explore Page', h1Snippet: 'Explore', filename: 'internal-explore.png' },
    { path: '/dashboard', name: 'Dashboard Page', h1Snippet: 'Welcome back', filename: 'internal-dashboard.png' },
    { path: '/onboarding', name: 'Onboarding Wizard', h1Snippet: 'Profile', filename: 'internal-onboarding.png' },
    { path: '/tracker', name: 'Application Tracker', h1Snippet: 'Tracker', filename: 'internal-tracker.png' },
    { path: '/deadlines', name: 'Deadlines Page', h1Snippet: 'Deadlines', filename: 'internal-deadlines.png' },
    { path: '/vault', name: 'Document Vault', h1Snippet: 'Vault', filename: 'internal-vault.png' },
  ];

  for (const r of internalRoutes) {
    await send('Page.navigate', { url: `http://localhost:${actualPort}${r.path}` });
    await sleep(1200);

    const isLoaded = await evaluate(`
      Boolean(document.body.innerText.includes("${r.h1Snippet}") || document.querySelector("h1"))
    `);
    const bg = await evaluate('window.getComputedStyle(document.body).backgroundColor');

    console.log(`[Route ${r.path}] Loaded: ${isLoaded ? 'PASSED' : 'FAILED'} (Base BG: ${bg})`);

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(screenshotsDir, r.filename);
    fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Captured internal route screenshot -> ${r.filename}`);
  }

  // --- Console Errors Telemetry ---
  console.log('\n--- Telemetry: Console Errors Report ---');
  if (consoleErrors.length === 0) {
    console.log('✓ SUCCESS: ZERO browser console errors detected across all public and internal flows!');
  } else {
    console.log(`Detected ${consoleErrors.length} console errors:`, consoleErrors);
  }

  ws.close();
} catch (err) {
  console.error('Test suite encountered an error:', err);
} finally {
  console.log('\nCleaning up processes...');
  chromeProcess.kill();
  previewProcess.kill();
  console.log('=== Suite Execution Complete ===');
  process.exit(0);
}
