import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const previewPort = 4372;
const debugPort = 9298;
const tempUserDataDir = path.join(rootDir, '.chrome-originkit-profile');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactScreenshotsDir = 'C:\\Users\\Priya\\.gemini\\antigravity\\brain\\27640fca-23b9-46de-9890-15c01d8448aa\\screenshots';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
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

async function verifyOriginkit() {
  console.log('=== VERIFYING ORIGINKIT PARTICLE DRIFT & GLOBAL LOADER INTEGRATION ===\n');

  if (!fs.existsSync(artifactScreenshotsDir)) {
    fs.mkdirSync(artifactScreenshotsDir, { recursive: true });
  }

  const localScreenshotsDir = path.join(rootDir, 'screenshots');
  if (!fs.existsSync(localScreenshotsDir)) {
    fs.mkdirSync(localScreenshotsDir, { recursive: true });
  }

  // 1. Start Vite Preview
  console.log(`[1/6] Launching Vite preview server on port ${previewPort}...`);
  const previewProcess = spawn(
    'npx.cmd',
    ['vite', 'preview', '--port', String(previewPort), '--strictPort'],
    {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    }
  );

  previewProcess.stderr.on('data', (d) => {
    const err = d.toString();
    if (!err.includes('ExperimentalWarning')) console.error('[Vite Preview Error]', err);
  });

  await sleep(3000);

  // 2. Launch Chrome
  if (fs.existsSync(tempUserDataDir)) {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  }

  console.log(`[2/6] Launching Chrome on debug port ${debugPort}...`);
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
      `--user-data-dir=${tempUserDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  await sleep(2500);

  const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page');
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
        if (!text.includes("Couldn't load texture blob:") && !text.includes('GLTFLoader')) {
          consoleErrors.push(text);
        }
      }
    }
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++messageId;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  async function setViewport(width, height) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
  }

  async function takeScreenshot(name) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const localPath = path.join(localScreenshotsDir, name);
    const artifactPath = path.join(artifactScreenshotsDir, name);
    fs.writeFileSync(localPath, buffer);
    fs.writeFileSync(artifactPath, buffer);
    console.log(`Saved screenshot: ${name} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  async function evalExpr(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Runtime.evaluate failed');
    }
    return res.result?.value;
  }

  // Viewport 1: 1920x1080 Desktop
  console.log('\n[3/6] Testing 1920x1080 Desktop Viewport & Landing Page...');
  await setViewport(1920, 1080);
  await send('Page.navigate', { url: `http://localhost:${previewPort}/` });
  await sleep(4000);

  // Check Particle Drift Canvas existence
  const particleCanvasInfo = await evalExpr(`(() => {
    const canvas = document.querySelector('canvas');
    const allCanvases = Array.from(document.querySelectorAll('canvas'));
    return {
      totalCanvases: allCanvases.length,
      hasDriftCanvas: allCanvases.some(c => c.parentElement && c.parentElement.classList.contains('pointer-events-none')),
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight,
    };
  })()`);
  console.log('Canvas detection at 1920x1080:', particleCanvasInfo);

  await takeScreenshot('originkit-landing-1920.png');

  // Test pointer event clickability: Click "Skip intro" if present or verify button click
  console.log('\n[4/6] Verifying Pointer Event Pass-through on Interactive Elements...');
  const interactiveCheck = await evalExpr(`(() => {
    // Check if Skip intro button is clickable
    const skipBtn = document.querySelector('button');
    const ctas = Array.from(document.querySelectorAll('a, button'));
    // Ensure elementFromPoint can reach buttons and isn't blocked by canvas
    const sampleBtn = ctas.find(el => el.textContent && el.textContent.trim().length > 0);
    if (!sampleBtn) return { success: false, reason: 'no button found' };
    const rect = sampleBtn.getBoundingClientRect();
    const hitElement = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    const isUnblocked = sampleBtn.contains(hitElement) || hitElement === sampleBtn;
    return {
      success: isUnblocked,
      targetText: sampleBtn.textContent.trim().slice(0, 30),
      hitTagName: hitElement ? hitElement.tagName : null,
      hitClass: hitElement ? hitElement.className : null
    };
  })()`);
  console.log('Interactive element hit test:', interactiveCheck);

  // Let intro finish or click skip to inspect full landing page
  await evalExpr(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const skip = buttons.find(b => b.textContent && b.textContent.includes('SKIP'));
    if (skip) skip.click();
  })()`);
  await sleep(2000);
  await takeScreenshot('originkit-landing-assembled-1920.png');

  // Viewport 2: 1440x900 Laptop & Explore Page
  console.log('\n[5/6] Testing 1440x900 Viewport & /explore Route...');
  await setViewport(1440, 900);
  await send('Page.navigate', { url: `http://localhost:${previewPort}/explore` });
  await sleep(2500);

  const exploreDriftPresent = await evalExpr(`(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    return canvases.length >= 1;
  })()`);
  console.log('ParticleDrift present on /explore:', exploreDriftPresent);
  await takeScreenshot('originkit-explore-1440.png');

  // Viewport 3: 1024x768 Tablet & Dashboard Route
  console.log('\nTesting 1024x768 Viewport & /dashboard Route...');
  await setViewport(1024, 768);
  await send('Page.navigate', { url: `http://localhost:${previewPort}/dashboard` });
  await sleep(2000);
  await takeScreenshot('originkit-dashboard-1024.png');

  // Viewport 4: 768x1024 Tablet Portrait & Tracker Route
  console.log('\nTesting 768x1024 Viewport & /tracker Route...');
  await setViewport(768, 1024);
  await send('Page.navigate', { url: `http://localhost:${previewPort}/tracker` });
  await sleep(2000);
  await takeScreenshot('originkit-tracker-768.png');

  // Viewport 5: 375x812 Mobile Viewport & Vault Route
  console.log('\nTesting 375x812 Mobile Viewport & /vault Route...');
  await setViewport(375, 812);
  await send('Page.navigate', { url: `http://localhost:${previewPort}/vault` });
  await sleep(2000);
  await takeScreenshot('originkit-vault-mobile-375.png');

  // Cleanup
  console.log('\n[6/6] Cleaning up test processes...');
  try { ws.close(); } catch {}
  try { chromeProcess.kill(); } catch {}
  try { previewProcess.kill(); } catch {}
  if (fs.existsSync(tempUserDataDir)) {
    try { fs.rmSync(tempUserDataDir, { recursive: true, force: true }); } catch {}
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
  console.log('Console Errors caught:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }
}

verifyOriginkit().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
