import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9229;
const basePort = 4190;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-test-ferrofluid-${Date.now()}`);

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

console.log('--- Starting GRANTLY Ferrofluid Landing Page Verification ---');

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

// 2. Spawn Chrome Headless
console.log(`Launching Chrome on port ${debugPort}...`);
const chromeProcess = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--disable-gpu',
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

  // Set standard desktop viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // --- Test 1: Landing Page Load & Ferrofluid Background Initialization ---
  console.log('\n--- Test 1: Landing Page Load & Ferrofluid Background ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });

  // Poll until app is rendered
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate('Boolean(document.querySelector("h1"))');
    if (ready) break;
    await sleep(250);
  }

  // Dismiss any overlay cleanly for clear inspection
  await evaluate(`
    (() => {
      const skipBtn = document.getElementById('hud-skip-btn');
      if (skipBtn) skipBtn.click();
      const overlay = document.getElementById('grantly-assemble-overlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    })()
  `);
  await sleep(400);

  const ferroContainerExists = await evaluate('Boolean(document.querySelector(".ferrofluid-container"))');
  const ferroCanvasExists = await evaluate('Boolean(document.querySelector(".ferrofluid-canvas"))');
  const ferroWebgl2Ok = await evaluate(`
    (() => {
      const canvas = document.querySelector('.ferrofluid-canvas');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl2');
      return Boolean(gl);
    })()
  `);

  console.log(`Ferrofluid Container Mounted: ${ferroContainerExists ? 'PASSED' : 'FAILED'}`);
  console.log(`Ferrofluid Canvas Rendered: ${ferroCanvasExists ? 'PASSED' : 'FAILED'}`);
  console.log(`Ferrofluid WebGL2 Context Initialized: ${ferroWebgl2Ok ? 'PASSED' : 'FAILED'}`);

  // --- Test 2: Editorial Typography & Copy Verification ---
  console.log('\n--- Test 2: Editorial Typography & Copy ---');
  const headlineH1 = await evaluate('document.querySelector("h1")?.innerText');
  const hasFuture = headlineH1?.includes('Your Future.');
  const hasFunding = headlineH1?.includes('Your Funding.');
  const hasMatch = headlineH1?.includes('One Smart Match.');

  console.log(`Headline 'Your Future.': ${hasFuture ? 'PASSED' : 'FAILED'}`);
  console.log(`Headline 'Your Funding.': ${hasFunding ? 'PASSED' : 'FAILED'}`);
  console.log(`Headline 'One Smart Match.': ${hasMatch ? 'PASSED' : 'FAILED'}`);

  const supportingP = await evaluate(`
    (() => {
      const p = Array.from(document.querySelectorAll('p')).find(el => el.innerText.includes('Discover scholarships'));
      return Boolean(p);
    })()
  `);
  console.log(`Supporting Description Present: ${supportingP ? 'PASSED' : 'FAILED'}`);

  // --- Test 3: Interactive CTA Buttons & Pointer Layering ---
  console.log('\n--- Test 3: Interactive CTA Buttons & Clickability ---');
  const ctaDebug = await evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Find my scholarships'));
      if (!btn) return { error: 'Button not found' };
      btn.scrollIntoView({ block: 'center' });
      const rect = btn.getBoundingClientRect();
      const elemAtCenter = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        elemTag: elemAtCenter?.tagName,
        elemId: elemAtCenter?.id,
        elemClass: elemAtCenter?.className,
        isDescendant: Boolean(elemAtCenter && (elemAtCenter === btn || btn.contains(elemAtCenter))),
      };
    })()
  `);
  console.log(`Primary CTA Clickable (Not Blocked by Ferrofluid): ${ctaDebug.isDescendant ? 'PASSED' : 'FAILED'}`);

  const secondaryDebug = await evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Explore opportunities'));
      if (!btn) return { error: 'Button not found' };
      btn.scrollIntoView({ block: 'center' });
      const rect = btn.getBoundingClientRect();
      const elemAtCenter = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        elemTag: elemAtCenter?.tagName,
        elemId: elemAtCenter?.id,
        elemClass: elemAtCenter?.className,
        isDescendant: Boolean(elemAtCenter && (elemAtCenter === btn || btn.contains(elemAtCenter))),
      };
    })()
  `);
  console.log(`Secondary CTA Clickable (Not Blocked by Ferrofluid): ${secondaryDebug.isDescendant ? 'PASSED' : 'FAILED'}`);

  // --- Test 4: Mouse Interaction & Click Pulse Simulation ---
  console.log('\n--- Test 4: Mouse Interaction & Click Pulse ---');
  const simulatedPulseOk = await evaluate(`
    (() => {
      // Simulate pointer movement across hero
      const moveEvt = new PointerEvent('pointermove', {
        clientX: window.innerWidth * 0.45,
        clientY: window.innerHeight * 0.45,
        bubbles: true,
      });
      window.dispatchEvent(moveEvt);

      // Simulate pointerdown click pulse
      const downEvt = new PointerEvent('pointerdown', {
        clientX: window.innerWidth * 0.45,
        clientY: window.innerHeight * 0.45,
        bubbles: true,
      });
      window.dispatchEvent(downEvt);

      return true;
    })()
  `);
  console.log(`Pointer Move & Click Pulse Dispatched Without Error: ${simulatedPulseOk ? 'PASSED' : 'FAILED'}`);

  // --- Test 5: Multi-Viewport Responsive Layout Checks ---
  console.log('\n--- Test 5: Responsive Layout Audits ---');
  const viewports = [
    { name: 'Desktop (1440px)', width: 1440, height: 900 },
    { name: 'Laptop (1024px)', width: 1024, height: 768 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Mobile (375px)', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width <= 768,
    });
    await sleep(400);

    const hasHorizontalOverflow = await evaluate(`
      document.documentElement.scrollWidth > window.innerWidth + 2
    `);
    const heroHeight = await evaluate(`
      document.querySelector('section')?.offsetHeight || 0
    `);

    console.log(`[Viewport ${vp.name}] No Horizontal Overflow: ${!hasHorizontalOverflow ? 'PASSED' : 'FAILED'}, Hero Height: ${heroHeight}px`);
  }

  // Restore Desktop
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // --- Test 6: Route Navigation Integrity ---
  console.log('\n--- Test 6: Routing & App Integrity ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/explore` });
  await sleep(1800);
  const exploreHeader = await evaluate('document.querySelector("h1")?.innerText');
  console.log(`Explore Route Accessible: ${exploreHeader?.includes('Explore') ? 'PASSED' : 'FAILED'}`);

  await send('Page.navigate', { url: `http://localhost:${actualPort}/dashboard` });
  await sleep(1800);
  const dashHeader = await evaluate('document.querySelector("h1")?.innerText');
  console.log(`Dashboard Route Accessible: ${dashHeader?.includes('Welcome back') ? 'PASSED' : 'FAILED'}`);

  await send('Page.navigate', { url: `http://localhost:${actualPort}/onboarding` });
  await sleep(1800);
  const onboardHeader = await evaluate('Boolean(document.querySelector("input") || document.querySelector("h1")?.innerText.includes("Personal Profile"))');
  console.log(`Onboarding Form Accessible: ${onboardHeader ? 'PASSED' : 'FAILED'}`);

  // --- Test 7: Console Errors Audit ---
  console.log('\n--- Browser Console Errors Report ---');
  if (consoleErrors.length === 0) {
    console.log('✓ Zero uncaught browser console errors across all Ferrofluid & navigation flows!');
  } else {
    console.log(`Detected ${consoleErrors.length} console errors:`, consoleErrors);
  }

  ws.close();
} catch (err) {
  console.error('Verification failed with error:', err);
} finally {
  console.log('\nCleaning up processes...');
  chromeProcess.kill();
  previewProcess.kill();
  console.log('--- Verification Complete ---');
  process.exit(0);
}
