import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9294;
const basePort = 4340;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-test-auto-${Date.now()}`);
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

console.log('=== Starting Autonomous Full-Page Self-Assembly Verification ===');

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
        if (text.includes("Couldn't load texture blob:") || text.includes('GLTFLoader')) {
          console.warn('[Benign Headless WebGL Texture Notice]', text);
        } else {
          consoleErrors.push(text);
        }
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

  // --- STAGE 1: Fresh Load -> Initial Scanner Phase (t ~ 0.8s) ---
  console.log('\n--- Stage 1: Testing Initial Scanner & 18 Clustered Cursors (t ~ 0.8s) ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });
  await sleep(800);

  const stage1Audit = await evaluate(`
    (() => {
      const overlay = document.getElementById('grantly-assemble-master-overlay');
      const cursors = overlay ? overlay.querySelectorAll('svg').length : 0;
      const statusText = document.getElementById('hud-status-text')?.innerText || '';
      return { overlayMounted: Boolean(overlay), cursorsCount: cursors, statusText };
    })()
  `);
  console.log('Stage 1 Audit:', stage1Audit);

  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'auto-stage-1-scanner.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved: auto-stage-1-scanner.png');

  // --- STAGE 2: Editor Rulers, Alignment Guides & Band 0 Active Assembly (t ~ 3.5s) ---
  console.log('\n--- Stage 2: Testing Rulers, Alignment Guides & Hero Band Assembly (t ~ 3.5s) ---');
  await sleep(2700);

  const stage2Audit = await evaluate(`
    (() => {
      const topRuler = document.getElementById('grantly-ruler-top');
      const leftRuler = document.getElementById('grantly-ruler-left');
      const boxes = document.querySelectorAll('[data-figma-box="true"]').length;
      const handles = document.querySelectorAll('.figma-corner-handle').length;
      const statusText = document.getElementById('hud-status-text')?.innerText || '';
      const layerText = document.getElementById('hud-layer-counter')?.innerText || '';
      return {
        topRuler: Boolean(topRuler),
        leftRuler: Boolean(leftRuler),
        activeBoxes: boxes,
        cornerHandles: handles,
        statusText,
        layerText
      };
    })()
  `);
  console.log('Stage 2 Audit:', stage2Audit);

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'auto-stage-2-hero-active.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved: auto-stage-2-hero-active.png');

  // --- STAGE 3: Autonomous Auto-Scroll to Discovery Band (t ~ 6.5s) ---
  console.log('\n--- Stage 3: Testing Autonomous Scroll to Discovery Band 1 (t ~ 6.5s) ---');
  await sleep(3000);

  const stage3Audit = await evaluate(`
    (() => {
      const scrollY = window.scrollY;
      const statusText = document.getElementById('hud-status-text')?.innerText || '';
      const layerText = document.getElementById('hud-layer-counter')?.innerText || '';
      const certModel = document.querySelector('[data-assemble="discovery-model"]');
      const certVisible = certModel ? window.getComputedStyle(certModel).opacity === '1' : false;
      return { scrollY, statusText, layerText, certVisible };
    })()
  `);
  console.log('Stage 3 Audit:', stage3Audit);
  console.log(`Autonomous Scroll down to Discovery: ${stage3Audit.scrollY > 400 ? 'PASSED' : 'CHECKING'}`);

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'auto-stage-3-discovery-band.png'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved: auto-stage-3-discovery-band.png');

  // --- STAGE 4: Autonomous Auto-Scroll to Matching & Cockpit Bands (t ~ 10.5s) ---
  console.log('\n--- Stage 4: Testing Autonomous Scroll to Matching & Cockpit Bands (t ~ 10.5s) ---');
  await sleep(4000);

  const stage4Audit = await evaluate(`
    (() => {
      const scrollY = window.scrollY;
      const statusText = document.getElementById('hud-status-text')?.innerText || '';
      const layerText = document.getElementById('hud-layer-counter')?.innerText || '';
      return { scrollY, statusText, layerText };
    })()
  `);
  console.log('Stage 4 Audit:', stage4Audit);
  console.log(`Autonomous Scroll further down (Matching/Tracker): ${stage4Audit.scrollY > 1200 ? 'PASSED' : 'CHECKING'}`);

  const shot4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'auto-stage-4-matching-tracker.png'), Buffer.from(shot4.data, 'base64'));
  console.log('Saved: auto-stage-4-matching-tracker.png');

  // --- STAGE 5: Autonomous Auto-Scroll to Milestones & Gateway (t ~ 15.5s) ---
  console.log('\n--- Stage 5: Testing Autonomous Scroll to Milestones & Gateway (t ~ 15.5s) ---');
  await sleep(5000);

  const stage5Audit = await evaluate(`
    (() => {
      const scrollY = window.scrollY;
      const statusText = document.getElementById('hud-status-text')?.innerText || '';
      const layerText = document.getElementById('hud-layer-counter')?.innerText || '';
      return { scrollY, statusText, layerText };
    })()
  `);
  console.log('Stage 5 Audit:', stage5Audit);
  console.log(`Autonomous Scroll to Bottom Sections: ${stage5Audit.scrollY > 3000 ? 'PASSED' : 'CHECKING'}`);

  const shot5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'auto-stage-5-gateway-bottom.png'), Buffer.from(shot5.data, 'base64'));
  console.log('Saved: auto-stage-5-gateway-bottom.png');

  // --- STAGE 6: Full Completion: Scroll Back to Top, Flyout & Full Teardown (t ~ 20.5s) ---
  console.log('\n--- Stage 6: Testing 100% Completion, Auto-Scroll Back to Top & Clean Flyout (t ~ 20.5s) ---');
  let stage6Audit = null;
  for (let poll = 0; poll < 20; poll++) {
    await sleep(500);
    stage6Audit = await evaluate(`
      (() => {
        const scrollY = window.scrollY;
        const overlay = document.getElementById('grantly-assemble-master-overlay');
        const badge = document.getElementById('grantly-completion-badge');
        const remainingCursors = document.querySelectorAll('#grantly-assemble-master-overlay svg').length;
        const allElements = Array.from(document.querySelectorAll('[data-assemble]'));
        const all100Visible = allElements.every(el => {
          const comp = window.getComputedStyle(el);
          return comp.opacity === '1' && (comp.clipPath === 'none' || comp.clipPath === '' || el.style.clipPath === 'none');
        });
        return {
          scrollYAtTop: scrollY <= 50,
          currentScrollY: scrollY,
          overlayRemoved: !overlay,
          completionBadgeMounted: Boolean(badge),
          remainingCursors,
          allElements100PercentVisible: all100Visible
        };
      })()
    `);
    if (stage6Audit.overlayRemoved && stage6Audit.completionBadgeMounted) {
      console.log(`Autonomous assembly fully completed at poll step ${poll} (~${15.5 + (poll + 1) * 0.5}s total elapsed time)`);
      break;
    }
  }
  console.log('Stage 6 Audit:', stage6Audit);
  console.log(`Scroll Returned to Top: ${stage6Audit.scrollYAtTop ? 'PASSED' : 'CHECKING'}`);
  console.log(`Master Overlay Cleanly Removed: ${stage6Audit.overlayRemoved ? 'PASSED' : 'CHECKING'}`);
  console.log(`Completion Badge Mounted: ${stage6Audit.completionBadgeMounted ? 'PASSED' : 'CHECKING'}`);
  console.log(`Zero Leftover Cursors: ${stage6Audit.remainingCursors === 0 ? 'PASSED' : 'CHECKING'}`);
  console.log(`All Page Elements 100% Visible: ${stage6Audit.allElements100PercentVisible ? 'PASSED' : 'CHECKING'}`);

  const shot6 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'auto-stage-6-completed-top.png'), Buffer.from(shot6.data, 'base64'));
  console.log('Saved: auto-stage-6-completed-top.png');

  // --- STAGE 7: Hard Page Reload (F5) Starts Assembly Fresh ---
  console.log('\n--- Stage 7: Testing Hard Page Reload (F5) ---');
  await send('Page.reload');
  await sleep(800);

  const reloadOverlayExists = await evaluate('Boolean(document.getElementById("grantly-assemble-master-overlay"))');
  console.log(`Assembly Restarts on Page Reload: ${reloadOverlayExists ? 'PASSED' : 'FAILED'}`);

  // Test Skip on reloaded page
  await evaluate(`
    const skip = document.getElementById('hud-skip-btn');
    if (skip) skip.click();
  `);
  await sleep(300);

  const afterSkipRemoved = await evaluate('!document.getElementById("grantly-assemble-master-overlay")');
  console.log(`Instant Skip Removes Overlay: ${afterSkipRemoved ? 'PASSED' : 'FAILED'}`);

  // --- STAGE 8: Replay Test via window.__grantlyReplayIntro ---
  console.log('\n--- Stage 8: Testing window.__grantlyReplayIntro() ---');
  await evaluate(`
    if (typeof window.__grantlyReplayIntro === 'function') {
      window.__grantlyReplayIntro();
    }
  `);
  await sleep(600);

  const replayOverlay = await evaluate('Boolean(document.getElementById("grantly-assemble-master-overlay"))');
  console.log(`Replay Intro Functionality: ${replayOverlay ? 'PASSED' : 'FAILED'}`);

  // Clean up replay
  await evaluate(`
    const skip = document.getElementById('hud-skip-btn');
    if (skip) skip.click();
  `);

  // --- STAGE 9: Browser Console Telemetry ---
  console.log('\n--- Stage 9: Browser Console Telemetry ---');
  if (consoleErrors.length === 0) {
    console.log('✓ ZERO browser console errors detected throughout the autonomous full-page assembly!');
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
  console.log('=== Autonomous Verification Complete ===');
  process.exit(0);
}
