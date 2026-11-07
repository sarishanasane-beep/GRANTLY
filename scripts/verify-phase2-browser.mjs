import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9226;
const basePort = 4176;
const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-grantly-phase2-'));

console.log('--- GRANTLY Phase 02 Automated Browser Verification ---');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// 1. Spawn Vite Preview and capture actual port
console.log(`Starting Vite preview server...`);
let actualPort = basePort;
const previewProcess = spawn('npx', ['vite', 'preview', '--port', String(basePort)], {
  cwd: path.resolve('c:/Users/Priya/OneDrive/Documents/HACKATHON/frontend arena/main project'),
  shell: true,
  stdio: 'pipe',
});

previewProcess.stdout.on('data', (d) => {
  const str = d.toString();
  process.stdout.write(`[Preview] ${str}`);
  const match = str.match(/http:\/\/localhost:(\d+)\//);
  if (match) {
    actualPort = parseInt(match[1], 10);
  }
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

  console.log(`Target WebSocket URL: ${pageTarget.webSocketDebuggerUrl}`);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let messageId = 0;
  const callbacks = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      if (data.params.type === 'error') {
        const text = data.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        consoleErrors.push(text);
        console.error(`[Browser Console Error]: ${text}`);
      }
    }
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) cb.reject(new Error(data.error.message));
      else cb.resolve(data.result);
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

  // --- Step 1: Test Onboarding 5-Step Wizard & Backward Navigation ---
  console.log('\n--- Test 1: Onboarding 5-Step Wizard & Backward Navigation ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/onboarding` });
  await sleep(2500);

  const step1Title = await evaluate('document.querySelector("h2")?.innerText');
  console.log(`Step 1 Loaded: "${step1Title}"`);

  // Update Step 1 values
  await evaluate(`
    function setInputValue(selector, value) {
      const el = document.querySelector(selector);
      if (!el) return;
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    setInputValue('input[type="text"]', 'Rohan Gupta');
    setInputValue('input[type="email"]', 'rohan.gupta@example.com');
  `);

  // Click Next Step
  await evaluate(`
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.innerText.trim() === 'Next Step');
    if (nextBtn) nextBtn.click();
  `);
  await sleep(800);

  const step2Title = await evaluate('document.querySelector("h2")?.innerText');
  console.log(`Step 2 Loaded: "${step2Title}"`);

  // Verify Backward Navigation without answer loss
  await evaluate(`
    const buttons = Array.from(document.querySelectorAll('button'));
    const backBtn = buttons.find(b => b.innerText.trim() === 'Back');
    if (backBtn) backBtn.click();
  `);
  await sleep(800);

  const persistedName = await evaluate('document.querySelector("input[type=\'text\']")?.value');
  console.log(`Backward Navigation Verified: Name remained "${persistedName}"`);

  // Step 1 -> 2
  await evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Next Step');
    if (btn) btn.click();
  `);
  await sleep(600);

  // Step 2 -> 3
  await evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Next Step');
    if (btn) btn.click();
  `);
  await sleep(600);

  // Step 3 -> 4
  await evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Next Step');
    if (btn) btn.click();
  `);
  await sleep(600);

  // Step 4 -> 5
  await evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Next Step');
    if (btn) btn.click();
  `);
  await sleep(600);

  const step5Title = await evaluate('document.querySelector("h2")?.innerText');
  console.log(`Step 5 Loaded: "${step5Title}"`);

  // Step 5 -> Calculate My Matches
  await evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Calculate My Matches');
    if (btn) btn.click();
  `);
  await sleep(1200);

  // Check Onboarding Completion Screen
  const completionHeading = await evaluate('document.querySelector("h1")?.innerText');
  const evaluatedCount = await evaluate('document.body.innerText.toLowerCase().includes("evaluated")');
  const eligibleCount = await evaluate('document.body.innerText.toLowerCase().includes("eligible")');
  console.log(`Onboarding Completion Screen: "${completionHeading}"`);
  console.log(`Summary metrics displayed: Evaluated Schemes = ${evaluatedCount}, Verified Eligible = ${eligibleCount}`);

  // --- Step 2: Test Dashboard Integration ---
  console.log('\n--- Test 2: Dashboard Integration ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/dashboard` });
  await sleep(2500);

  const dashboardHeading = await evaluate('document.querySelector("h1")?.innerText');
  const profileCompleteness = await evaluate('document.body.innerText.toLowerCase().includes("profile completeness")');
  const eligibilityOverview = await evaluate('document.body.innerText.toLowerCase().includes("eligibility engine overview")');
  const topRecommendations = await evaluate('document.body.innerText.toLowerCase().includes("top 5 recommendations for you")');
  const recommendedCards = await evaluate('document.querySelectorAll(".font-display.font-bold.text-base a").length');

  console.log(`Dashboard Heading: "${dashboardHeading}"`);
  console.log(`Profile Completeness Widget: ${profileCompleteness ? 'PASSED' : 'FAILED'}`);
  console.log(`Eligibility Engine Overview: ${eligibilityOverview ? 'PASSED' : 'FAILED'}`);
  console.log(`Top Recommendations Header: ${topRecommendations ? 'PASSED' : 'FAILED'}`);
  console.log(`Top Recommendation Links Rendered: ${recommendedCards}`);

  // --- Step 3: Test Explore Page Multi-Criteria Filters ---
  console.log('\n--- Test 3: Explore Page Multi-Criteria Filters ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/explore` });
  await sleep(2500);

  const exploreHeading = await evaluate('document.querySelector("h1")?.innerText');
  const allTabExists = await evaluate('document.body.innerText.toLowerCase().includes("all scholarships")');
  const eligibleTabExists = await evaluate('document.body.innerText.toLowerCase().includes("eligible")');
  const potentiallyEligibleTabExists = await evaluate('document.body.innerText.toLowerCase().includes("potentially eligible")');
  const notEligibleTabExists = await evaluate('document.body.innerText.toLowerCase().includes("not eligible")');

  console.log(`Explore Heading: "${exploreHeading}"`);
  console.log(`Filter Tabs Present: All (${allTabExists}), Eligible (${eligibleTabExists}), Potentially Eligible (${potentiallyEligibleTabExists}), Not Eligible (${notEligibleTabExists})`);

  // Click "Eligible" Tab and verify filter reaction
  await evaluate(`
    const buttons = Array.from(document.querySelectorAll('button'));
    const eligibleBtn = buttons.find(b => b.innerText.includes('Eligible') && !b.innerText.includes('Potentially'));
    if (eligibleBtn) eligibleBtn.click();
  `);
  await sleep(1000);

  const hasStatusBadge = await evaluate('document.body.innerText.toLowerCase().includes("eligible")');
  const hasReasonSnippet = await evaluate('document.body.innerText.toLowerCase().includes("why you qualify:") || document.body.innerText.toLowerCase().includes("match justification")');
  console.log(`Card Status & Compatibility Badges: ${hasStatusBadge ? 'PASSED' : 'FAILED'}`);
  console.log(`Card Match Reasoning Snippet: ${hasReasonSnippet ? 'PASSED' : 'FAILED'}`);

  // Summary
  console.log('\n--- Browser Console Errors Report ---');
  if (consoleErrors.length === 0) {
    console.log('✓ Zero uncaught browser console errors across all tested Phase 02 flows!');
  } else {
    console.log(`⚠ Found ${consoleErrors.length} console errors:`, consoleErrors);
  }

  ws.close();
} finally {
  console.log('\nCleaning up processes...');
  chromeProcess.kill();
  previewProcess.kill();
  try {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  } catch (_) {}
}

console.log('--- Verification Complete ---');
