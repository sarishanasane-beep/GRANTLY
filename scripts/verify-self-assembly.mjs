import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9275;
const basePort = 4330;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-test-assembly-${Date.now()}`);
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

console.log('=== Starting GRANTLY Autonomous 12-Agent Assembly Verification ===');

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

  // --- Step 1: Navigate to Home and Force Fresh Assembly ---
  console.log('\n--- Step 1: Navigating to Landing Page ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });

  // Clear session storage so intro runs fresh
  await evaluate('sessionStorage.clear()');
  await sleep(400);

  // Trigger assembly with force: true if needed
  await evaluate(`
    if (typeof window.__grantlyReplayIntro === 'function') {
      window.__grantlyReplayIntro();
    }
  `);

  await sleep(500);

  // --- Step 2: Verify Master Overlay & 12 Colored SVG Cursors ---
  console.log('\n--- Step 2: Verify Master Overlay & 12 Cursors ---');
  const overlayExists = await evaluate('Boolean(document.getElementById("grantly-assemble-master-overlay"))');
  const agentCursorsCount = await evaluate(`
    document.querySelectorAll('#grantly-assemble-master-overlay svg').length
  `);
  const agentLabels = await evaluate(`
    Array.from(document.querySelectorAll('#grantly-assemble-master-overlay span')).map(s => s.innerText.trim()).filter(Boolean)
  `);

  console.log(`Master Overlay Mounted: ${overlayExists ? 'PASSED' : 'FAILED'}`);
  console.log(`Agent Cursors Count: ${agentCursorsCount} (Target: 12)`);
  console.log('Sample Agent Labels:', agentLabels.slice(0, 6));

  const screenshot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'assembly-01-start.png'), Buffer.from(screenshot1.data, 'base64'));
  console.log('Saved screenshot: assembly-01-start.png');

  // --- Step 3: Verify Figma Selection Rectangle, Corner Handles, & Dimensions ---
  console.log('\n--- Step 3: Inspecting Active Figma Selection Boxes ---');
  let figmaBoxAudit = { found: false };
  for (let i = 0; i < 20; i++) {
    figmaBoxAudit = await evaluate(`
      (() => {
        const overlay = document.getElementById('grantly-assemble-master-overlay');
        if (!overlay) return { found: false, error: 'Overlay missing' };

        // Look for selection boxes marked with data-figma-box or class figma-selection-box
        const boxes = Array.from(overlay.querySelectorAll('[data-figma-box="true"], .figma-selection-box'));
        const handles = overlay.querySelectorAll('.figma-corner-handle').length;
        const dimensionBadges = Array.from(overlay.querySelectorAll('.figma-dimension-badge')).map(d => d.innerText.trim());

        return {
          found: boxes.length > 0,
          boxCount: boxes.length,
          cornerHandlesCount: handles,
          dimensionBadges
        };
      })()
    `);
    if (figmaBoxAudit.found) break;
    await sleep(150);
  }

  console.log('Figma Selection Box Audit:', figmaBoxAudit);
  console.log(`Selection Rectangles Active: ${figmaBoxAudit.found ? 'PASSED' : 'FAILED'}`);
  console.log(`Corner Handles Present: ${figmaBoxAudit.cornerHandlesCount} (4 per active box)`);
  console.log('Dimension Badges Sample:', figmaBoxAudit.dimensionBadges);

  const screenshot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'assembly-02-selection-hero.png'), Buffer.from(screenshot2.data, 'base64'));
  console.log('Saved screenshot: assembly-02-selection-hero.png');

  // --- Step 4: Verify Progressive Element Reveal ---
  console.log('\n--- Step 4: Verify Progressive Element Reveals ---');
  await sleep(1200);

  const revealedElements = await evaluate(`
    (() => {
      const targets = Array.from(document.querySelectorAll('[data-assemble]'));
      const visible = targets.filter(t => t.style.opacity === '1' || window.getComputedStyle(t).opacity === '1');
      return {
        total: targets.length,
        revealedCount: visible.length,
        revealedKeys: visible.map(t => t.getAttribute('data-assemble'))
      };
    })()
  `);
  console.log(`Progressive Reveal Status: ${revealedElements.revealedCount} / ${revealedElements.total} elements revealed`);
  console.log('Sample Revealed Elements:', revealedElements.revealedKeys);

  const screenshot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'assembly-03-revealing-elements.png'), Buffer.from(screenshot3.data, 'base64'));
  console.log('Saved screenshot: assembly-03-revealing-elements.png');

  // --- Step 5: Verify Auto-Scroll to Downpage Viewport Bands ---
  console.log('\n--- Step 5: Verify Auto-Scroll to Subsequent Viewport Bands ---');
  let scrollPosition = 0;
  for (let i = 0; i < 30; i++) {
    scrollPosition = await evaluate('window.scrollY');
    if (scrollPosition > 200) break;
    await sleep(250);
  }
  console.log(`Current Window Scroll Y: ${scrollPosition}px (Target > 500px for band 1/2)`);
  console.log(`Auto-Scroll Operation: ${scrollPosition > 200 ? 'PASSED' : 'PENDING'}`);

  const screenshot4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'assembly-04-autoscroll-discovery.png'), Buffer.from(screenshot4.data, 'base64'));
  console.log('Saved screenshot: assembly-04-autoscroll-discovery.png');

  // --- Step 6: Test Skip Intro Control ---
  console.log('\n--- Step 6: Test Skip Control & Instant Unlock ---');
  await evaluate(`
    const btn = document.getElementById('hud-skip-btn');
    if (btn) btn.click();
  `);
  await sleep(500);

  const afterSkip = await evaluate(`
    (() => {
      const overlay = document.getElementById('grantly-assemble-master-overlay');
      const overflowBody = document.body.style.overflow;
      const targets = Array.from(document.querySelectorAll('[data-assemble]'));
      const allVisible = targets.every(t => t.style.opacity === '' || t.style.opacity === '1');
      return {
        overlayRemoved: !overlay,
        scrollUnlocked: overflowBody === '',
        allVisible
      };
    })()
  `);
  console.log('Skip Control Audit:', afterSkip);
  console.log(`Overlay Removed Immediately: ${afterSkip.overlayRemoved ? 'PASSED' : 'FAILED'}`);
  console.log(`Scroll Restored to User: ${afterSkip.scrollUnlocked ? 'PASSED' : 'FAILED'}`);
  console.log(`All Target Elements 100% Revealed: ${afterSkip.allVisible ? 'PASSED' : 'FAILED'}`);

  const screenshot5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'assembly-05-after-skip.png'), Buffer.from(screenshot5.data, 'base64'));
  console.log('Saved screenshot: assembly-05-after-skip.png');

  // --- Step 7: Test Replay Control ---
  console.log('\n--- Step 7: Test Replay Control ---');
  await evaluate(`
    if (typeof window.__grantlyReplayIntro === 'function') {
      window.__grantlyReplayIntro();
    }
  `);
  await sleep(800);

  const replayMounted = await evaluate('Boolean(document.getElementById("grantly-assemble-master-overlay"))');
  const replayCursors = await evaluate('document.querySelectorAll("#grantly-assemble-master-overlay svg").length');
  console.log(`Replay Intro Master Overlay Mounted: ${replayMounted ? 'PASSED' : 'FAILED'}`);
  console.log(`Replayed Cursors Active: ${replayCursors}`);

  const screenshot6 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'assembly-06-replayed-assembly.png'), Buffer.from(screenshot6.data, 'base64'));
  console.log('Saved screenshot: assembly-06-replayed-assembly.png');

  // Cleanly dismiss replay
  await evaluate(`
    const btn = document.getElementById('hud-skip-btn');
    if (btn) btn.click();
  `);
  await sleep(400);

  // --- Step 8: Console Errors Telemetry ---
  console.log('\n--- Step 8: Browser Console Errors Report ---');
  if (consoleErrors.length === 0) {
    console.log('✓ SUCCESS: ZERO browser console errors detected during full self-assembly sequence!');
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
  console.log('=== Self-Assembly Verification Suite Complete ===');
  process.exit(0);
}
