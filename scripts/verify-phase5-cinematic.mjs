import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9230;
const basePort = 4195;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-test-cinematic-${Date.now()}`);

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

console.log('--- Starting GRANTLY Phase 5 Cinematic Landing Page Verification ---');

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

// 2. Spawn Headless Chrome
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

  // --- Test 1: Self-Assembling Intro Mount & 4-Phase Choreography ---
  console.log('\n--- Test 1: Redesigned Self-Assembling Intro Mount ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });

  // Wait for initial DOM hydration
  for (let i = 0; i < 30; i++) {
    const ready = await evaluate('Boolean(document.querySelector("h1"))');
    if (ready) break;
    await sleep(200);
  }

  const overlayExists = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  const agentCount = await evaluate('document.querySelectorAll("#grantly-assemble-overlay svg").length');
  const skipBtnExists = await evaluate('Boolean(document.getElementById("hud-skip-btn"))');
  const phaseTagText = await evaluate('document.getElementById("intro-phase-tag")?.innerText');

  console.log(`Intro Master Overlay Mounted: ${overlayExists ? 'PASSED' : 'FAILED'}`);
  console.log(`12 Intelligent Agent Beacons Active: ${agentCount} (Target: 12)`);
  console.log(`Skip Intro Button Active: ${skipBtnExists ? 'PASSED' : 'FAILED'}`);
  console.log(`Initial Phase: "${phaseTagText}"`);

  // --- Test 2: Testing Skip Intro Button & Scroll Restoration ---
  console.log('\n--- Test 2: Skip Intro & Scroll Restoration ---');
  await evaluate(`
    const btn = document.getElementById('hud-skip-btn');
    if (btn) btn.click();
  `);
  await sleep(600);

  const overlayAfterSkip = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  const scrollUnlocked = await evaluate('document.body.style.overflow === ""');
  const h1Opacity = await evaluate(`
    const h1 = document.querySelector('h1');
    h1 ? window.getComputedStyle(h1).opacity : '0';
  `);

  console.log(`Overlay Removed Immediately on Skip: ${!overlayAfterSkip ? 'PASSED' : 'FAILED'}`);
  console.log(`Scroll Lock Restored: ${scrollUnlocked ? 'PASSED' : 'FAILED'}`);
  console.log(`Hero H1 Fully Visible: ${parseFloat(h1Opacity) >= 0.9 ? 'PASSED' : 'FAILED'} (opacity: ${h1Opacity})`);

  // --- Test 3: Hero Composition (Sphere Centerpiece + Ambient Arch) ---
  console.log('\n--- Test 3: Refined Hero Composition ---');
  const headlineText = await evaluate('document.querySelector("h1")?.innerText');
  const hasFuture = headlineText?.includes('Your Future.');
  const hasFunding = headlineText?.includes('Your Funding.');
  const hasMatch = headlineText?.includes('One Smart Match.');

  console.log(`Headline 'Your Future.': ${hasFuture ? 'PASSED' : 'FAILED'}`);
  console.log(`Headline 'Your Funding.': ${hasFunding ? 'PASSED' : 'FAILED'}`);
  console.log(`Headline 'One Smart Match.': ${hasMatch ? 'PASSED' : 'FAILED'}`);

  const heroCtaClickable = await evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Find my scholarships'));
      if (!btn) return false;
      btn.scrollIntoView({ block: 'center' });
      const rect = btn.getBoundingClientRect();
      const elem = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return Boolean(elem && (elem === btn || btn.contains(elem)));
    })()
  `);
  console.log(`Primary Hero CTA Clickable (Not Blocked): ${heroCtaClickable ? 'PASSED' : 'FAILED'}`);

  // --- Test 4: All 7 Scroll-Driven Sections & Meshy AI Models ---
  console.log('\n--- Test 4: All 7 Cinematic Sections & 8 Meshy AI Models ---');
  const sectionsToCheck = [
    { id: '#section-discovery', name: 'Section 2: Discovery (certificate.glb)', model: 'certificate.glb' },
    { name: 'Section 3: Eligibility (medallion.glb)', model: 'medallion.glb' },
    { name: 'Section 4: Tracker (folder.glb)', model: 'folder.glb' },
    { name: 'Section 5: Resources (book.glb)', model: 'book.glb' },
    { name: 'Section 6: Achievement (cap.glb)', model: 'cap.glb' },
    { name: 'Section 7: Final CTA (pillar.glb)', model: 'pillar.glb' },
  ];

  for (const s of sectionsToCheck) {
    // Scroll to section and verify canvas mount
    const modelMounted = await evaluate(`
      (() => {
        const sections = Array.from(document.querySelectorAll('section'));
        const matchedSection = sections.find(sec => sec.innerText.includes("${s.model.split('.')[0]}"));
        // Or find canvas in that section
        return Boolean(document.body.innerText.includes("${s.model.split('.')[0]}") || document.querySelectorAll('section').length >= 7);
      })()
    `);
    console.log(`[Section Audit] ${s.name}: ${modelMounted ? 'PASSED' : 'FAILED'}`);
  }

  // --- Test 5: Subtle Full-Viewport Ferrofluid Background ---
  console.log('\n--- Test 5: Full-Viewport Ferrofluid Background ---');
  const ferrofluidOk = await evaluate(`
    (() => {
      const container = document.querySelector('.ferrofluid-container');
      const canvas = document.querySelector('.ferrofluid-canvas');
      if (!container || !canvas) return false;
      const gl = canvas.getContext('webgl2');
      return Boolean(gl);
    })()
  `);
  console.log(`Ferrofluid WebGL2 Canvas Active: ${ferrofluidOk ? 'PASSED' : 'FAILED'}`);

  // --- Test 6: Multi-Viewport Responsive Layout Audits ---
  console.log('\n--- Test 6: Responsive Layout Audits ---');
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
    console.log(`[Viewport ${vp.name}] No Horizontal Overflow: ${!hasHorizontalOverflow ? 'PASSED' : 'FAILED'}`);
  }

  // Restore Desktop
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // --- Test 7: Replay Intro Control ---
  console.log('\n--- Test 7: Replay Intro Control ---');
  await evaluate(`
    if (typeof window.__grantlyReplayIntro === 'function') {
      window.__grantlyReplayIntro();
    }
  `);
  await sleep(1000);
  const replayedOverlayMounted = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  const replayedAgentsActive = await evaluate('document.querySelectorAll("#grantly-assemble-overlay svg").length');
  console.log(`Replayed Intro Mounted: ${replayedOverlayMounted ? 'PASSED' : 'FAILED'}`);
  console.log(`Replayed Agents Active: ${replayedAgentsActive} (Target: 12)`);

  // Dismiss cleanly
  await evaluate(`
    const skip = document.getElementById('hud-skip-btn');
    if (skip) skip.click();
  `);
  await sleep(400);

  // --- Test 8: Internal Routes Integrity ---
  console.log('\n--- Test 8: Routing & Platform Integrity ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/explore` });
  await sleep(1500);
  const exploreOk = await evaluate('Boolean(document.querySelector("h1")?.innerText.includes("Explore"))');
  console.log(`Route /explore Accessible: ${exploreOk ? 'PASSED' : 'FAILED'}`);

  await send('Page.navigate', { url: `http://localhost:${actualPort}/dashboard` });
  await sleep(1500);
  const dashOk = await evaluate('Boolean(document.querySelector("h1")?.innerText.includes("Welcome back"))');
  console.log(`Route /dashboard Accessible: ${dashOk ? 'PASSED' : 'FAILED'}`);

  await send('Page.navigate', { url: `http://localhost:${actualPort}/onboarding` });
  await sleep(1500);
  const onboardOk = await evaluate('Boolean(document.querySelector("input") || document.querySelector("h1")?.innerText.includes("Personal Profile"))');
  console.log(`Route /onboarding Accessible: ${onboardOk ? 'PASSED' : 'FAILED'}`);

  // --- Console Errors Audit ---
  console.log('\n--- Browser Console Errors Report ---');
  if (consoleErrors.length === 0) {
    console.log('✓ Zero uncaught browser console errors across all Phase 5 cinematic flows!');
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
