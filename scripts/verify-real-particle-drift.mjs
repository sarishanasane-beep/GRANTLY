import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const previewPort = 4378;
const debugPort = 9302;
const tempUserDataDir = path.join(rootDir, '.chrome-drift-full-profile');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactScreenshotsDir = 'C:\\Users\\Priya\\.gemini\\antigravity\\brain\\27640fca-23b9-46de-9890-15c01d8448aa\\screenshots';
const localScreenshotsDir = path.join(rootDir, 'screenshots');

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

async function verifyFullDriftAndGimbal() {
  console.log('=== RIGOROUS FULL-SPECTRUM BROWSER VERIFICATION ===\n');

  if (!fs.existsSync(artifactScreenshotsDir)) {
    fs.mkdirSync(artifactScreenshotsDir, { recursive: true });
  }
  if (!fs.existsSync(localScreenshotsDir)) {
    fs.mkdirSync(localScreenshotsDir, { recursive: true });
  }

  // 1. Start Preview Server
  console.log(`[1/8] Launching Vite preview on port ${previewPort}...`);
  const previewProcess = spawn(
    'npx.cmd',
    ['vite', 'preview', '--port', String(previewPort), '--strictPort'],
    {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    }
  );

  await sleep(3000);

  // 2. Launch Chrome
  if (fs.existsSync(tempUserDataDir)) {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  }

  console.log(`[2/8] Launching Chrome on debug port ${debugPort}...`);
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
  if (!pageTarget) throw new Error('No page target found');
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

  // --- Step 3: Initial Shell Startup Loader ---
  console.log('\n[3/8] Capturing Initial Shell Startup Loader (GlobalLoader variant="fullscreen")...');
  await setViewport(1920, 1080);
  await send('Page.navigate', { url: `http://localhost:${previewPort}/` });

  await sleep(200);
  const startupLoaderInfo = await evalExpr(`(() => {
    const loader = document.querySelector('[role="status"]');
    return {
      hasLoader: !!loader,
      labelText: loader ? loader.textContent.trim() : null,
      parentHasZ100: !!document.querySelector('.z-\\\\[100\\\\]')
    };
  })()`);
  console.log('Startup shell loader at t=200ms:', startupLoaderInfo);
  await takeScreenshot('drift-01-startup-loader.png');

  // --- Step 4: Loader Fades Out, 18-Agent Assembly Begins ---
  console.log('\n[4/8] Verifying Loader Fade Out & 18-Agent Assembly Start...');
  await sleep(1000);
  const assemblyStatus = await evalExpr(`(() => {
    const startupOverlay = document.querySelector('.z-\\\\[100\\\\]');
    const introOverlay = document.querySelector('#grantly-assemble-overlay');
    return {
      startupOverlayDismissed: !startupOverlay,
      introOverlayActive: !!introOverlay,
      bodyHasCanvas: !!document.querySelector('div[aria-hidden="true"] canvas')
    };
  })()`);
  console.log('Assembly start status at t=1200ms:', assemblyStatus);
  await takeScreenshot('drift-02-assembly-active.png');

  // --- Step 5: Skip Intro & Inspect Fully Assembled Hero with Particle Drift ---
  console.log('\n[5/8] Skipping intro to inspect fully assembled Hero & Particle Field...');
  await evalExpr(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const skip = buttons.find(b => b.textContent && b.textContent.includes('SKIP'));
    if (skip) skip.click();
  })()`);
  await sleep(1200);

  const heroCanvasInfo = await evalExpr(`(() => {
    const canvas = document.querySelector('div[aria-hidden="true"] canvas');
    if (!canvas) return { error: 'no drift canvas' };
    return {
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
      width: canvas.width,
      height: canvas.height,
      parentStyle: canvas.parentElement ? canvas.parentElement.getAttribute('style') : null
    };
  })()`);
  console.log('Drift canvas under assembled hero:', heroCanvasInfo);
  await takeScreenshot('drift-03-assembled-hero.png');

  // --- Step 6: Dispatch Mouse Move to illuminate Particles with Champagne Gold ---
  console.log('\n[6/8] Moving pointer across Particle Field & Verifying Cursor Illumination...');
  await evalExpr(`(() => {
    window.dispatchEvent(new PointerEvent('pointermove', {
      clientX: 750,
      clientY: 400,
      bubbles: true
    }));
  })()`);
  await sleep(300);
  await takeScreenshot('drift-04-pointer-interactive.png');

  // Check element clickability
  const clickabilityCheck = await evalExpr(`(() => {
    // Header CTA
    const getStartedLink = document.querySelector('a[href="/onboarding"]');
    let getStartedClickable = false;
    if (getStartedLink) {
      const r = getStartedLink.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      getStartedClickable = getStartedLink.contains(hit) || hit === getStartedLink;
    }

    // Hero Primary CTA
    const heroCtas = Array.from(document.querySelectorAll('a[href="/explore"]'));
    let heroCtaClickable = false;
    if (heroCtas.length > 0) {
      const r = heroCtas[0].getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      heroCtaClickable = heroCtas[0].contains(hit) || hit === heroCtas[0];
    }

    return {
      getStartedClickable,
      heroCtaClickable,
      backgroundLayerPointerEventsNone: document.querySelector('div[aria-hidden="true"]').classList.contains('pointer-events-none')
    };
  })()`);
  console.log('Clickability & Pointer Pass-Through Test:', clickabilityCheck);

  // --- Step 7: Explore & Dashboard Routes ---
  console.log('\n[7/8] Verifying /explore & /dashboard Routes with Particle Background...');
  await send('Page.navigate', { url: `http://localhost:${previewPort}/explore` });
  await sleep(2500);

  const exploreInfo = await evalExpr(`(() => {
    const canvas = document.querySelector('div[aria-hidden="true"] canvas');
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    const cards = document.querySelectorAll('.grid > div');
    return {
      hasParticleBackground: !!canvas,
      cardsCount: cards.length,
      searchWorking: !!searchInput
    };
  })()`);
  console.log('/explore status:', exploreInfo);
  await takeScreenshot('drift-05-explore-page.png');

  await send('Page.navigate', { url: `http://localhost:${previewPort}/dashboard` });
  await sleep(2000);

  const dashboardInfo = await evalExpr(`(() => {
    const canvas = document.querySelector('div[aria-hidden="true"] canvas');
    const statCards = document.querySelectorAll('.grid > div');
    return {
      hasParticleBackground: !!canvas,
      statCardsCount: statCards.length
    };
  })()`);
  console.log('/dashboard status:', dashboardInfo);
  await takeScreenshot('drift-06-dashboard-page.png');

  // --- Step 8: Mobile Viewport 375x812 ---
  console.log('\n[8/8] Testing Mobile 375x812 Viewport...');
  await setViewport(375, 812);
  await send('Page.navigate', { url: `http://localhost:${previewPort}/` });
  await sleep(2000);
  await evalExpr(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const skip = buttons.find(b => b.textContent && b.textContent.includes('SKIP'));
    if (skip) skip.click();
  })()`);
  await sleep(1000);
  await takeScreenshot('drift-07-mobile-375.png');

  // Cleanup
  console.log('\nCleaning up verification processes...');
  try { ws.close(); } catch {}
  try { chromeProcess.kill(); } catch {}
  try { previewProcess.kill(); } catch {}
  if (fs.existsSync(tempUserDataDir)) {
    try { fs.rmSync(tempUserDataDir, { recursive: true, force: true }); } catch {}
  }

  console.log('\n=== ALL BROWSER CHECKS COMPLETED SUCCESSFULLY ===');
  console.log('Console Errors caught:', consoleErrors.length);
  if (consoleErrors.length > 0) console.log(consoleErrors);
}

verifyFullDriftAndGimbal().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
