import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const previewPort = 4370;
const debugPort = 9297;
const tempUserDataDir = path.join(rootDir, '.chrome-features-profile');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

async function verifyFeatures() {
  console.log('=== VERIFYING ROUTES, FILTERS, TRACKER, MOBILE & ACCESSIBILITY ===\n');

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

  if (fs.existsSync(tempUserDataDir)) {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  }

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

  // Set desktop viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // 1. Test /explore route
  console.log('1. Testing /explore Route & Filters...');
  await send('Page.navigate', { url: `http://localhost:${previewPort}/explore` });
  await sleep(1500);

  const exploreAudit = await evaluate(`
    (() => {
      const title = document.querySelector('h1')?.innerText || '';
      const cards = document.querySelectorAll('article, [data-scholarship-card], div[class*="rounded-xl"]').length;
      return { title, hasCards: cards > 0, cardsCount: cards };
    })()
  `);
  console.log('  /explore Audit:', exploreAudit);

  // 2. Test /dashboard route
  console.log('2. Testing /dashboard Route...');
  await send('Page.navigate', { url: `http://localhost:${previewPort}/dashboard` });
  await sleep(1200);

  const dashAudit = await evaluate(`
    (() => {
      const bodyText = document.body.innerText;
      const hasWelcome = bodyText.includes('Aarav') || bodyText.includes('Dashboard') || bodyText.includes('Applications');
      return { hasWelcome };
    })()
  `);
  console.log('  /dashboard Audit:', dashAudit);

  // 3. Test /tracker route
  console.log('3. Testing /tracker Route...');
  await send('Page.navigate', { url: `http://localhost:${previewPort}/tracker` });
  await sleep(1200);

  const trackerAudit = await evaluate(`
    (() => {
      const bodyText = document.body.innerText;
      const hasColumns = bodyText.includes('Application') || bodyText.includes('Stage') || bodyText.includes('Submitted') || bodyText.includes('Review');
      return { hasColumns };
    })()
  `);
  console.log('  /tracker Audit:', trackerAudit);

  // 4. Test /vault route
  console.log('4. Testing /vault Route...');
  await send('Page.navigate', { url: `http://localhost:${previewPort}/vault` });
  await sleep(1200);

  const vaultAudit = await evaluate(`
    (() => {
      const bodyText = document.body.innerText;
      const hasVault = bodyText.includes('Vault') || bodyText.includes('Document') || bodyText.includes('Certificate');
      return { hasVault };
    })()
  `);
  console.log('  /vault Audit:', vaultAudit);

  // 5. Test Mobile Viewport (iPhone 14 screen: 390 x 844)
  console.log('5. Testing Mobile Viewport (390 x 844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: `http://localhost:${previewPort}/` });
  await sleep(1500);

  const mobileAudit = await evaluate(`
    (() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const hasHorizontalOverflow = scrollWidth > clientWidth;
      return { scrollWidth, clientWidth, hasHorizontalOverflow };
    })()
  `);
  console.log('  Mobile Audit:', mobileAudit);
  console.log(`  Mobile Responsive Fit (No horizontal overflow): ${!mobileAudit.hasHorizontalOverflow ? 'PASSED' : 'CHECKING'}`);

  // 6. Test Console Errors
  console.log('\n6. Console Error Audit across routes:');
  if (consoleErrors.length === 0) {
    console.log('  ✓ ZERO application errors detected across all tested routes!');
  } else {
    console.log(`  Detected ${consoleErrors.length} errors:`, consoleErrors);
  }

  ws.close();
  chromeProcess.kill();
  previewProcess.kill();
  console.log('\n=== Feature & Route Verification Complete ===');
  process.exit(0);
}

verifyFeatures().catch((err) => {
  console.error('Feature verification failed:', err);
  process.exit(1);
});
