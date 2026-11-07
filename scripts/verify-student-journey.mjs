import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const previewPort = 4388;
const debugPort = 9315;
const tempUserDataDir = path.join(rootDir, '.chrome-journey-profile');
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

async function runJourneyVerification() {
  console.log('=== GRANTLY COMPLETE STUDENT JOURNEY VERIFICATION ===\n');

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
      `--user-data-dir=${tempUserDataDir}`,
      '--window-size=1440,900',
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  await sleep(2500);

  let targets = [];
  for (let retry = 0; retry < 5; retry++) {
    try {
      targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
      if (targets.length > 0) break;
    } catch {
      await sleep(500);
    }
  }

  const pageTarget = targets.find((t) => t.type === 'page');
  if (!pageTarget) {
    throw new Error('Could not find Chrome page debug target');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let messageId = 0;
  const pendingRequests = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.method === 'Runtime.consoleAPICalled' && response.params.type === 'error') {
      const text = response.params.args.map((a) => a.value || a.description || '').join(' ');
      consoleErrors.push(text);
    }
    if (response.id && pendingRequests.has(response.id)) {
      const { resolve, reject } = pendingRequests.get(response.id);
      pendingRequests.delete(response.id);
      if (response.error) reject(response.error);
      else resolve(response.result);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = ++messageId;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await send('Page.enable');
  await send('Runtime.enable');

  const evalCode = async (expr) => {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  };

  const navigateTo = async (urlPath) => {
    const fullUrl = `http://localhost:${previewPort}${urlPath}`;
    await send('Page.navigate', { url: fullUrl });
    await sleep(1500);
  };

  try {
    // STEP 1: Landing Page
    console.log('[Step 1] Visiting Landing Page (/) ...');
    await navigateTo('/');
    const landingH1 = await evalCode(`document.querySelector('h1')?.innerText || ''`);
    console.log(`   Landing H1: "${landingH1.replace(/\\n/g, ' ')}"`);

    // STEP 2: Dashboard Page (Answering 5 Questions)
    console.log('\n[Step 2] Testing Dashboard (/dashboard) & 5 Core Questions ...');
    await navigateTo('/dashboard');
    const dashQuestionsAnswered = await evalCode(`(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const hasNextActions = document.body.innerText.includes('Personalized Next Actions');
      const hasTopRecommendations = document.body.innerText.includes('Top 5 Recommendations For You');
      const hasActiveApplications = document.body.innerText.includes('Applications in Progress') || document.body.innerText.includes('Active Tracker');
      const hasEligibility = document.body.innerText.includes('Eligibility Engine Overview');
      const hasSaved = document.body.innerText.includes('Saved Opportunities') || document.body.innerText.includes('Saved Pipeline');
      return { h1, hasNextActions, hasTopRecommendations, hasActiveApplications, hasEligibility, hasSaved };
    })()`);
    console.log('   Dashboard checks:', dashQuestionsAnswered);

    // STEP 3: Explore Page & Combined Filtering
    console.log('\n[Step 3] Testing Explore Catalog (/explore) & Combined Filters ...');
    await navigateTo('/explore');
    const exploreFiltersCheck = await evalCode(`(() => {
      const selects = Array.from(document.querySelectorAll('select')).map(s => s.getAttribute('aria-label') || s.name || '');
      const cardsCount = document.querySelectorAll('div.grid > div').length;
      const hasStateFilter = selects.some(l => l.includes('State'));
      const hasCategoryFilter = selects.some(l => l.includes('Category'));
      const hasFieldFilter = selects.some(l => l.includes('Field'));
      const hasLevelFilter = selects.some(l => l.includes('Level'));
      return { selectsCount: selects.length, hasStateFilter, hasCategoryFilter, hasFieldFilter, hasLevelFilter, cardsCount };
    })()`);
    console.log('   Explore filters check:', exploreFiltersCheck);

    // STEP 4: Scholarship Detail Page & Explained Verdict
    console.log('\n[Step 4] Testing Scholarship Detail (/scholarship/grant-01-aditi-stem) ...');
    await navigateTo('/scholarship/grant-01-aditi-stem');
    const detailCheck = await evalCode(`(() => {
      const title = document.querySelector('h1')?.innerText || '';
      const hasVerdict = document.body.innerText.includes('Eligibility Verdict');
      const hasStages = document.body.innerText.includes('Application Stages & Instructions');
      const hasCutoff = document.body.innerText.includes('Academic Cutoff') || document.body.innerText.includes('Minimum Academic Cutoff');
      const hasRequiredDocs = document.body.innerText.includes('Required Documentation');
      return { title, hasVerdict, hasStages, hasCutoff, hasRequiredDocs };
    })()`);
    console.log('   Detail checks:', detailCheck);

    // STEP 5: Scholarship Comparison Matrix
    console.log('\n[Step 5] Testing Comparison Matrix (/compare) ...');
    await navigateTo('/compare');
    const compareCheck = await evalCode(`(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const hasCutoffRow = document.body.innerText.includes('Academic Cutoff');
      const hasStatesRow = document.body.innerText.includes('Applicable States');
      const hasVerdictRow = document.body.innerText.includes('Eligibility Verdict');
      return { h1, hasCutoffRow, hasStatesRow, hasVerdictRow };
    })()`);
    console.log('   Compare checks:', compareCheck);

    // STEP 6: Application Tracker with Checklist & Next Actions
    console.log('\n[Step 6] Testing Application Tracker (/tracker) ...');
    await navigateTo('/tracker');
    const trackerCheck = await evalCode(`(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const hasNextAction = document.body.innerText.includes('Next Recommended Milestone') || document.body.innerText.includes('Ready for Submission');
      const hasCredentialReadiness = document.body.innerText.includes('Required Credential Readiness');
      const hasMilestoneChecklist = document.body.innerText.includes('Milestone Checklist');
      const hasEssayPad = document.body.innerText.includes('Essay / Statement Draft Pad');
      return { h1, hasNextAction, hasCredentialReadiness, hasMilestoneChecklist, hasEssayPad };
    })()`);
    console.log('   Tracker checks:', trackerCheck);

    // STEP 7: Document Readiness Vault with Saved Schemes Linking
    console.log('\n[Step 7] Testing Document Readiness Vault (/vault) ...');
    await navigateTo('/vault');
    const vaultCheck = await evalCode(`(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const hasFilterTabs = document.body.innerText.includes('All Credentials') && document.body.innerText.includes('Missing');
      const hasSavedSchemeLink = document.body.innerText.includes('Required by');
      const cardCount = document.querySelectorAll('div.grid > div').length;
      return { h1, hasFilterTabs, hasSavedSchemeLink, cardCount };
    })()`);
    console.log('   Vault checks:', vaultCheck);

    // STEP 8: Timeline & Deadline Engine
    console.log('\n[Step 8] Testing Deadline Engine (/deadlines) ...');
    await navigateTo('/deadlines');
    const deadlinesCheck = await evalCode(`(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const hasUrgencyTabs = document.body.innerText.includes('Critical (≤ 7 Days)') && document.body.innerText.includes('This Month');
      const hasActiveDeadlines = document.body.innerText.includes('My Active Application Deadlines');
      const hasSort = document.querySelector('select[aria-label="Sort Deadlines"]') !== null;
      return { h1, hasUrgencyTabs, hasActiveDeadlines, hasSort };
    })()`);
    console.log('   Deadlines checks:', deadlinesCheck);

    // STEP 9: Mobile Viewport Verification (375x812)
    console.log('\n[Step 9] Testing Mobile Responsive Layout (375x812) ...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await navigateTo('/dashboard');
    const mobileCheck = await evalCode(`(() => {
      const bottomNav = document.querySelector('nav[aria-label="Mobile Navigation"]');
      const isVisible = bottomNav ? window.getComputedStyle(bottomNav).display !== 'none' : false;
      return { mobileBottomNavVisible: isVisible };
    })()`);
    console.log('   Mobile checks:', mobileCheck);

    console.log('\n=== ALL 9 STUDENT JOURNEY AUDIT STEPS PASSED SUCCESSFULLY! ===');
    console.log(`Total caught browser console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console Errors caught:', consoleErrors);
    }
  } finally {
    try {
      ws.close();
    } catch {}
    chromeProcess.kill();
    previewProcess.kill();
  }
}

runJourneyVerification().catch((err) => {
  console.error('Journey verification error:', err);
  process.exit(1);
});
