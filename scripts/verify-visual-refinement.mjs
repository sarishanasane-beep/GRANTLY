import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9245;
const basePort = 4220;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-test-refinement-${Date.now()}`);
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

console.log('=== Starting GRANTLY Visual Foundation & Ferrofluid Verification ===');

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

console.log(`Launching Chrome with WebGL on debug port ${debugPort}...`);
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : undefined;
  }

  // --- Step 1: Navigate to Home ---
  console.log('\n--- Navigating to Landing Page ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });

  // Wait for initial hydration
  for (let i = 0; i < 30; i++) {
    const ready = await evaluate('Boolean(document.querySelector("h1"))');
    if (ready) break;
    await sleep(200);
  }

  // Skip the assemble intro
  await sleep(1000);
  console.log('Skipping intro to inspect final hero composition...');
  await evaluate(`
    const skip = document.getElementById('hud-skip-btn');
    if (skip) skip.click();
  `);
  await sleep(800);

  // --- Step 2: Ferrofluid Canvas & Configuration Audit ---
  console.log('\n--- Ferrofluid Canvas Audit ---');
  const ferrofluidDetails = await evaluate(`
    (() => {
      const container = document.querySelector('.ferrofluid-container');
      const canvas = document.querySelector('.ferrofluid-canvas');
      if (!container || !canvas) return { mounted: false };
      const gl = canvas.getContext('webgl2');
      const style = window.getComputedStyle(container);
      return {
        mounted: true,
        webgl2: Boolean(gl),
        width: canvas.width,
        height: canvas.height,
        backgroundColor: style.backgroundColor,
        zIndex: style.zIndex || window.getComputedStyle(canvas).zIndex,
        position: style.position,
      };
    })()
  `);
  console.log('Ferrofluid Status:', ferrofluidDetails);

  // --- Step 3: Minimalist Hero Visual Structure Audit ---
  console.log('\n--- Hero Section Audit ---');
  const heroAudit = await evaluate(`
    (() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const ctas = Array.from(document.querySelectorAll('a')).map(a => a.innerText.trim()).filter(Boolean);
      const badges = Array.from(document.querySelectorAll('[class*="badge"], [class*="Badge"]')).map(b => b.innerText.trim());
      const floatingCanvases = document.querySelectorAll('canvas').length;
      return {
        h1,
        ctaCount: ctas.length,
        hasPrimaryCta: ctas.some(c => c.includes('Find my scholarships')),
        hasSecondaryCta: ctas.some(c => c.includes('Explore opportunities')),
        canvasCount: floatingCanvases
      };
    })()
  `);
  console.log('Hero Structure:', heroAudit);

  // --- Step 4: Capture Desktop Screenshot ---
  console.log('\n--- Capturing Desktop Hero Screenshot (1440x900) ---');
  await sleep(1500); // Allow WebGL frames to render
  const desktopScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  const desktopPath = path.join(screenshotsDir, 'desktop-hero-refined.png');
  fs.writeFileSync(desktopPath, Buffer.from(desktopScreenshot.data, 'base64'));
  console.log(`Saved screenshot to: ${desktopPath}`);

  // --- Step 5: Test Scroll Through Narrative Sections ---
  console.log('\n--- Scrolling Through Narrative Sections ---');
  const scrollSections = await evaluate(`
    (() => {
      const sections = Array.from(document.querySelectorAll('section'));
      return sections.map(s => {
        const h2 = s.querySelector('h2')?.innerText || '';
        return { h2, height: s.offsetHeight };
      });
    })()
  `);
  console.log('Found Sections:', scrollSections);

  // Scroll to Discovery section and take screenshot
  await evaluate(`window.scrollTo({ top: 1200, behavior: 'instant' });`);
  await sleep(1200);
  const discoveryScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  const discoveryPath = path.join(screenshotsDir, 'desktop-section-discovery.png');
  fs.writeFileSync(discoveryPath, Buffer.from(discoveryScreenshot.data, 'base64'));
  console.log(`Saved discovery section screenshot to: ${discoveryPath}`);

  // --- Step 6: Responsive Audit (375x812 Mobile) ---
  console.log('\n--- Testing Mobile Viewport (375x812) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' });`);
  await sleep(800);

  const mobileOverflow = await evaluate('document.documentElement.scrollWidth > window.innerWidth + 2');
  console.log(`Mobile Horizontal Overflow Check: ${!mobileOverflow ? 'PASSED (no overflow)' : 'FAILED'}`);

  const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  const mobilePath = path.join(screenshotsDir, 'mobile-hero-refined.png');
  fs.writeFileSync(mobilePath, Buffer.from(mobileScreenshot.data, 'base64'));
  console.log(`Saved mobile screenshot to: ${mobilePath}`);

  // --- Step 7: Console Errors Audit ---
  console.log('\n--- Browser Console Errors Report ---');
  if (consoleErrors.length === 0) {
    console.log('✓ SUCCESS: Zero browser console errors detected!');
  } else {
    console.log(`Detected ${consoleErrors.length} console errors:`, consoleErrors);
  }

  ws.close();
} catch (err) {
  console.error('Audit failed with error:', err);
} finally {
  console.log('\nCleaning up processes...');
  chromeProcess.kill();
  previewProcess.kill();
  console.log('=== Audit Complete ===');
  process.exit(0);
}
