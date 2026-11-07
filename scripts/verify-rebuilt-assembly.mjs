import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9292;
const basePort = 4335;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-test-rebuilt-${Date.now()}`);
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

console.log('=== Starting Rebuilt Self-Assembly Verification Suite ===');

let actualPort = basePort;
console.log(`Starting Vite preview server on port ${basePort}...`);
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

  // --- STAGE A: Initial Scanner & Clustered Cursors (0–2s) ---
  console.log('\n--- STAGE A: Testing Initial Scanner & 18 Clustered Cursors (t ~ 1.0s) ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });
  await sleep(1000);

  const stageAAudit = await evaluate(`
    (() => {
      const overlay = document.getElementById('grantly-assemble-master-overlay');
      const cursors = overlay ? overlay.querySelectorAll('svg').length : 0;
      const statusText = document.getElementById('hud-status-text')?.innerText || '';
      const spinner = Boolean(document.getElementById('hud-scanning-spinner'));
      return { overlayMounted: Boolean(overlay), cursorsCount: cursors, statusText, spinner };
    })()
  `);
  console.log('Stage A Audit:', stageAAudit);

  const screenshotA = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'stage-A-scanner-initialization.png'), Buffer.from(screenshotA.data, 'base64'));
  console.log('Saved screenshot: stage-A-scanner-initialization.png');

  // --- STAGE B: Rulers and Alignment Grid Becoming Visible (t ~ 2.5s) ---
  console.log('\n--- STAGE B: Testing Rulers & Alignment Guides Activation (t ~ 2.5s) ---');
  await sleep(1500);

  const stageBAudit = await evaluate(`
    (() => {
      const topRuler = document.getElementById('grantly-ruler-top');
      const leftRuler = document.getElementById('grantly-ruler-left');
      const hudProgress = Boolean(document.getElementById('hud-progress-section'));
      const hudAvatars = Boolean(document.getElementById('hud-avatars'));
      return {
        topRulerExists: Boolean(topRuler),
        leftRulerExists: Boolean(leftRuler),
        hudProgressVisible: hudProgress,
        hudAvatarsVisible: hudAvatars
      };
    })()
  `);
  console.log('Stage B Audit:', stageBAudit);

  const screenshotB = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'stage-B-rulers-activated.png'), Buffer.from(screenshotB.data, 'base64'));
  console.log('Saved screenshot: stage-B-rulers-activated.png');

  // --- STAGE C: At Least Four Simultaneous Active Selections & Dimensions (t ~ 4.2s) ---
  console.log('\n--- STAGE C: Testing Concurrent Active Selections & Dimension Badges (t ~ 4.2s) ---');
  let activeBoxesAudit = { boxCount: 0 };
  for (let i = 0; i < 20; i++) {
    activeBoxesAudit = await evaluate(`
      (() => {
        const overlay = document.getElementById('grantly-assemble-master-overlay');
        if (!overlay) return { boxCount: 0 };
        const boxes = overlay.querySelectorAll('[data-figma-box="true"], .figma-selection-box');
        const handles = overlay.querySelectorAll('.figma-corner-handle').length;
        const dimensions = Array.from(overlay.querySelectorAll('.figma-dimension-badge')).map(d => d.innerText.trim());
        return {
          boxCount: boxes.length,
          cornerHandlesCount: handles,
          dimensionsSample: dimensions
        };
      })()
    `);
    if (activeBoxesAudit.boxCount >= 3) break;
    await sleep(150);
  }
  console.log('Stage C Audit:', activeBoxesAudit);

  const screenshotC = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'stage-C-concurrent-selections.png'), Buffer.from(screenshotC.data, 'base64'));
  console.log('Saved screenshot: stage-C-concurrent-selections.png');

  // --- STAGE D & E: Cursors Touching Elements & Media Placeholder (t ~ 5.5s) ---
  console.log('\n--- STAGE D & E: Testing Cursors & Media Placeholder / Wipe Reveals ---');
  await sleep(1200);

  const screenshotD = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'stage-D-cursors-and-reveals.png'), Buffer.from(screenshotD.data, 'base64'));
  console.log('Saved screenshot: stage-D-cursors-and-reveals.png');

  // --- STAGE F: Completed Hero With Clean Interface & "Scroll To Keep Building" ---
  console.log('\n--- STAGE F: Testing Finished Initial Viewport (t ~ 8.5s) ---');
  await sleep(2800);

  const stageFAudit = await evaluate(`
    (() => {
      const topRuler = document.getElementById('grantly-ruler-top');
      const leftRuler = document.getElementById('grantly-ruler-left');
      const hudStatus = document.getElementById('hud-layer-counter')?.innerText || '';
      const h1Visible = window.getComputedStyle(document.querySelector('h1')).opacity === '1';
      return {
        rulersFaded: topRuler && topRuler.style.opacity === '0',
        hudStatus,
        heroHeadlineVisible: h1Visible
      };
    })()
  `);
  console.log('Stage F Audit:', stageFAudit);

  const screenshotF = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'stage-F-completed-hero.png'), Buffer.from(screenshotF.data, 'base64'));
  console.log('Saved screenshot: stage-F-completed-hero.png');

  // --- STAGE G: User Scroll Triggering Assembly of Next Viewport ---
  console.log('\n--- STAGE G: Testing User Scroll Triggering Downpage Viewport Assembly ---');
  await evaluate('window.scrollTo({ top: 1000, behavior: "smooth" })');
  await sleep(1200);

  const stageGAudit = await evaluate(`
    (() => {
      const scrollY = window.scrollY;
      const discoveryHeading = document.querySelector('[data-assemble="discovery-heading"], section:nth-of-type(2) h2');
      const isVisible = discoveryHeading ? window.getComputedStyle(discoveryHeading).opacity === '1' : false;
      const hudText = document.getElementById('hud-layer-counter')?.innerText || '';
      return { scrollY, discoveryVisible: isVisible, hudText };
    })()
  `);
  console.log('Stage G Audit:', stageGAudit);

  const screenshotG = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'stage-G-scroll-assembly.png'), Buffer.from(screenshotG.data, 'base64'));
  console.log('Saved screenshot: stage-G-scroll-assembly.png');

  // --- STAGE H: Test Reload (F5) vs Route Navigation ---
  console.log('\n--- STAGE H: Testing Reload Persistence ---');
  await send('Page.reload');
  await sleep(1000);

  const reloadOverlayExists = await evaluate('Boolean(document.getElementById("grantly-assemble-master-overlay"))');
  console.log(`Assembly Runs on Full Page Reload: ${reloadOverlayExists ? 'PASSED' : 'FAILED'}`);

  // --- STAGE I: Test Skip Control Dismissal ---
  console.log('\n--- STAGE I: Testing Instant Skip (✕) Control ---');
  await evaluate(`
    const skip = document.getElementById('hud-skip-btn');
    if (skip) skip.click();
  `);
  await sleep(400);

  const afterSkip = await evaluate(`
    (() => {
      const overlay = document.getElementById('grantly-assemble-master-overlay');
      const allElements = Array.from(document.querySelectorAll('[data-assemble]'));
      const allVisible = allElements.every(el => el.style.opacity === '1' && el.style.clipPath !== 'inset(0px 100% 0px 0px)');
      return { overlayRemoved: !overlay, allVisible };
    })()
  `);
  console.log('Skip Audit:', afterSkip);

  // --- STAGE J: Test Replay Control ---
  console.log('\n--- STAGE J: Testing Replay via window.__grantlyReplayIntro ---');
  await evaluate(`
    if (typeof window.__grantlyReplayIntro === 'function') {
      window.__grantlyReplayIntro();
    }
  `);
  await sleep(800);

  const replayMounted = await evaluate('Boolean(document.getElementById("grantly-assemble-master-overlay"))');
  console.log(`Replay Mounted Successfully: ${replayMounted ? 'PASSED' : 'FAILED'}`);

  // Dismiss replay
  await evaluate(`
    const skip = document.getElementById('hud-skip-btn');
    if (skip) skip.click();
  `);

  // --- STAGE K: Console Errors Telemetry ---
  console.log('\n--- STAGE K: Browser Console Telemetry ---');
  if (consoleErrors.length === 0) {
    console.log('✓ ZERO browser console errors detected throughout the entire rebuilt assembly sequence!');
  } else {
    console.log(`Detected ${consoleErrors.length} console errors:`, consoleErrors);
  }

  ws.close();
} catch (err) {
  console.error('Test suite error:', err);
} finally {
  console.log('\nCleaning up processes...');
  chromeProcess.kill();
  previewProcess.kill();
  console.log('=== Rebuilt Assembly Verification Suite Complete ===');
  process.exit(0);
}
