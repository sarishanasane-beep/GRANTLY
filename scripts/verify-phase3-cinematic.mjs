import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9228;
const basePort = 4180;
const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-grantly-phase3-'));

console.log('--- GRANTLY Phase 03 Comprehensive Verification ---');

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

  // --- Test 1: Initial Page Load & Self-Assembling Intro Mount ---
  console.log('\n--- Test 1: Self-Assembling Intro Mount on Initial Load ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });
  await sleep(1000);

  const overlayExists = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  const agentCursorsCount = await evaluate('document.querySelectorAll("#grantly-assemble-overlay svg").length');
  const hudText = await evaluate('document.getElementById("hud-status")?.innerText');
  const skipBtnExists = await evaluate('Boolean(document.getElementById("hud-skip-btn"))');

  console.log(`Assemble Overlay Mounted: ${overlayExists ? 'PASSED' : 'FAILED'}`);
  console.log(`Agent Cursors Rendered: ${agentCursorsCount} (Target: 12)`);
  console.log(`HUD Initial State: "${hudText}"`);
  console.log(`HUD Skip Button Active: ${skipBtnExists ? 'PASSED' : 'FAILED'}`);

  // --- Test 2: Testing Skip Button During Assembly ---
  console.log('\n--- Test 2: Testing Skip Button ---');
  await evaluate(`
    const btn = document.getElementById('hud-skip-btn');
    if (btn) btn.click();
  `);
  await sleep(600);

  const overlayAfterSkip = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  const scrollRestored = await evaluate('document.body.style.overflow === ""');
  const h1Opacity = await evaluate(`
    const h1 = document.querySelector('h1');
    h1 ? window.getComputedStyle(h1).opacity : '0';
  `);
  console.log(`Overlay Removed Immediately on Skip: ${!overlayAfterSkip ? 'PASSED' : 'FAILED'}`);
  console.log(`Scroll Lock Restored: ${scrollRestored ? 'PASSED' : 'FAILED'}`);
  console.log(`Content Fully Visible: ${parseFloat(h1Opacity) >= 0.9 ? 'PASSED' : 'FAILED'} (opacity: ${h1Opacity})`);

  // --- Test 3: Testing Replay ---
  console.log('\n--- Test 3: Testing Replay Functionality ---');
  await evaluate(`
    if (typeof window.__grantlyReplayIntro === 'function') {
      window.__grantlyReplayIntro();
    }
  `);
  await sleep(1200);

  const replayedOverlay = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  const replayedAgents = await evaluate('document.querySelectorAll("#grantly-assemble-overlay svg").length');
  console.log(`Replayed Overlay Mounted: ${replayedOverlay ? 'PASSED' : 'FAILED'}`);
  console.log(`Replayed Agent Cursors Active: ${replayedAgents} (Target: 12)`);

  // Allow replayed assembly to finish
  let hasClose = false;
  for (let i = 0; i < 30; i++) {
    hasClose = await evaluate('Boolean(document.getElementById("hud-close-btn"))');
    if (hasClose) break;
    await sleep(400);
  }

  const hudStatusAfterReplay = await evaluate('document.getElementById("hud-status")?.innerText');
  const hudCountAfterReplay = await evaluate('document.getElementById("hud-count")?.innerText');
  console.log(`Polling status: hasClose=${hasClose}, hudStatus="${hudStatusAfterReplay}", hudCount="${hudCountAfterReplay}"`);

  // Check completion state
  const replayBtnExists = await evaluate('Boolean(document.getElementById("hud-replay-btn"))');
  const completionText = await evaluate('document.body.innerText.includes("Assembled by 12 agents")');
  console.log(`Completion State Displayed: ${completionText ? 'PASSED' : 'FAILED'}`);
  console.log(`Replay Button Present in Completion HUD: ${replayBtnExists ? 'PASSED' : 'FAILED'}`);

  // Test Close Button
  const closeClicked = await evaluate(`
    (() => {
      const btn = document.getElementById('hud-close-btn');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()
  `);
  await sleep(400);
  const overlayAfterClose = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  console.log(`Close Button Dismisses HUD: ${!overlayAfterClose ? 'PASSED' : 'FAILED'}`);

  // --- Test 4: 3D Cinematic Hero Canvas & WebGL Scene ---
  console.log('\n--- Test 4: 3D Cinematic Hero Canvas & WebGL Scene ---');
  await sleep(1000);

  const canvasExists = await evaluate('Boolean(document.querySelector("canvas"))');
  const webglContextOk = await evaluate(`
    const canvas = document.querySelector('canvas');
    if (!canvas) false;
    else {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      Boolean(gl);
    }
  `);
  console.log(`Three.js Canvas Rendered: ${canvasExists ? 'PASSED' : 'FAILED'}`);
  console.log(`WebGL Context Active: ${webglContextOk ? 'PASSED' : 'FAILED'}`);

  // --- Test 5: Internal Route Navigation (No Unwanted Re-assembly) ---
  console.log('\n--- Test 5: Internal Route Navigation (Session Protection) ---');
  await send('Page.navigate', { url: `http://localhost:${actualPort}/dashboard` });
  await sleep(1500);

  const dashboardOverlay = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  console.log(`Dashboard Visited - Intro Overlay Absent: ${!dashboardOverlay ? 'PASSED' : 'FAILED'}`);

  // Navigate back to Landing Page
  await send('Page.navigate', { url: `http://localhost:${actualPort}/` });
  await sleep(1500);

  const returningOverlay = await evaluate('Boolean(document.getElementById("grantly-assemble-overlay"))');
  console.log(`Returned to Landing Page - Intro Stays Hidden (Session Storage): ${!returningOverlay ? 'PASSED' : 'FAILED'}`);

  // --- Summary ---
  console.log('\n--- Browser Console Errors Report ---');
  if (consoleErrors.length === 0) {
    console.log('✓ Zero uncaught browser console errors across all Phase 03 cinematic flows!');
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
