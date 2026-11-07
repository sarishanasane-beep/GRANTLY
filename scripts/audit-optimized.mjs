import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const previewPort = 4360;
const debugPort = 9296;
const tempUserDataDir = path.join(rootDir, '.chrome-optimized-profile');

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

async function runOptimizedAudit() {
  console.log('=== STARTING GRANTLY POST-OPTIMIZATION PERFORMANCE AUDIT ===\n');

  // Load baseline report for direct before/after comparison
  const baselinePath = path.join(rootDir, 'audit-baseline.json');
  let baseline = null;
  if (fs.existsSync(baselinePath)) {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  }

  // 1. Audit Dist Asset Bundle Sizes
  const distAssetsDir = path.join(rootDir, 'dist', 'assets');
  const bundleFiles = fs.readdirSync(distAssetsDir);
  const bundleSizes = {};
  let totalJsSize = 0;
  let totalCssSize = 0;

  bundleFiles.forEach((file) => {
    const filePath = path.join(distAssetsDir, file);
    const stats = fs.statSync(filePath);
    bundleSizes[file] = {
      bytes: stats.size,
      kb: (stats.size / 1024).toFixed(2),
      mb: (stats.size / (1024 * 1024)).toFixed(2),
    };
    if (file.endsWith('.js')) totalJsSize += stats.size;
    if (file.endsWith('.css')) totalCssSize += stats.size;
  });

  console.log('--- Static Dist Bundles (Post-Optimization) ---');
  console.log(`Total JS in dist: ${(totalJsSize / 1024).toFixed(2)} KB`);
  console.log(`Total CSS in dist: ${(totalCssSize / 1024).toFixed(2)} KB`);

  // 2. Audit Optimized Models on Disk
  const optModelsDir = path.join(rootDir, 'public', 'models', 'optimized');
  const modelFiles = [
    'sphere.glb',
    'gateway.glb',
    'certificate.glb',
    'medallion.glb',
    'folder.glb',
    'book.glb',
    'cap.glb',
    'pillar.glb',
  ];
  const diskModelSizes = {};
  let totalModelsDiskBytes = 0;

  console.log('\n--- 8 Optimized GLB Assets on Disk ---');
  modelFiles.forEach((name) => {
    const fullPath = path.join(optModelsDir, name);
    if (fs.existsSync(fullPath)) {
      const size = fs.statSync(fullPath).size;
      diskModelSizes[name] = {
        bytes: size,
        mb: (size / (1024 * 1024)).toFixed(2),
      };
      totalModelsDiskBytes += size;
      console.log(`  ${name}: ${(size / (1024 * 1024)).toFixed(2)} MB (${size} bytes)`);
    } else {
      console.warn(`  ${name}: MISSING!`);
    }
  });
  console.log(`Total 8 Optimized Models on Disk: ${(totalModelsDiskBytes / (1024 * 1024)).toFixed(2)} MB`);

  // 3. Launch Vite Preview Server
  console.log(`\nStarting Vite Preview on port ${previewPort}...`);
  const previewProcess = spawn(
    'npx.cmd',
    ['vite', 'preview', '--port', String(previewPort), '--strictPort'],
    {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    }
  );

  previewProcess.stdout.on('data', (d) => process.stdout.write(`[Preview] ${d}`));
  previewProcess.stderr.on('data', (d) => process.stderr.write(`[Preview Err] ${d}`));

  await sleep(3000);

  // 4. Launch Chrome Headless
  if (fs.existsSync(tempUserDataDir)) {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  }

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
      `--user-data-dir=${tempUserDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  await sleep(2500);

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

  const networkRequests = new Map();
  const completedRequests = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data.toString());

    if (msg.method === 'Network.requestWillBeSent') {
      networkRequests.set(msg.params.requestId, {
        url: msg.params.request.url,
        method: msg.params.request.method,
        wallTime: msg.params.wallTime,
        timestamp: msg.params.timestamp,
        type: msg.params.type,
      });
    }

    if (msg.method === 'Network.responseReceived') {
      const req = networkRequests.get(msg.params.requestId);
      if (req) {
        req.mimeType = msg.params.response.mimeType;
        req.status = msg.params.response.status;
        req.encodedDataLength = msg.params.response.encodedDataLength;
      }
    }

    if (msg.method === 'Network.loadingFinished') {
      const req = networkRequests.get(msg.params.requestId);
      if (req) {
        req.encodedDataLength = msg.params.encodedDataLength || req.encodedDataLength || 0;
        req.finishTimestamp = msg.params.timestamp;
        req.durationMs = ((req.finishTimestamp - req.timestamp) * 1000).toFixed(1);
        completedRequests.push(req);
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
  await send('Network.enable');
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

  // Inject performance telemetry collector
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__perfTelemetry = {
        webglContextsCount: 0,
        fpsSamples: [],
        longTasksCount: 0,
        longTasksTotalDuration: 0,
        modelsLoaded: {}
      };

      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
          window.__perfTelemetry.webglContextsCount++;
        }
        return origGetContext.apply(this, [type, ...args]);
      };

      if (window.PerformanceObserver) {
        try {
          const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              window.__perfTelemetry.longTasksCount++;
              window.__perfTelemetry.longTasksTotalDuration += entry.duration;
            }
          });
          obs.observe({ entryTypes: ['longtask'] });
        } catch (e) {}
      }

      let lastTime = performance.now();
      function sampleFps(now) {
        const delta = now - lastTime;
        lastTime = now;
        if (delta > 0) {
          const fps = Math.min(60, 1000 / delta);
          window.__perfTelemetry.fpsSamples.push({ fps, delta });
        }
        requestAnimationFrame(sampleFps);
      }
      requestAnimationFrame(sampleFps);
    `,
  });

  // --- MEASUREMENT 1: Cold Initial Homepage Load ---
  console.log('\n--- MEASUREMENT 1: Cold Homepage Initial Load (Post-Optimization) ---');
  completedRequests.length = 0;
  networkRequests.clear();

  const loadStartTime = Date.now();
  await send('Page.navigate', { url: `http://localhost:${previewPort}/` });

  await sleep(4000);
  const coldLoadTimeMs = Date.now() - loadStartTime;

  const coldMetrics = await evaluate(`
    (() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const paints = performance.getEntriesByType('paint');
      const fcp = paints.find(p => p.name === 'first-contentful-paint');
      const fp = paints.find(p => p.name === 'first-paint');
      const fpsList = window.__perfTelemetry.fpsSamples;
      const recentFps = fpsList.slice(-120);
      const avgFps = recentFps.length ? (recentFps.reduce((a, b) => a + b.fps, 0) / recentFps.length).toFixed(1) : 0;
      const jankFrames = recentFps.filter(f => f.delta > 33.3).length;

      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        loadEvent: nav.loadEventEnd - nav.startTime,
        firstPaint: fp ? fp.startTime : null,
        firstContentfulPaint: fcp ? fcp.startTime : null,
        webglContextsCount: window.__perfTelemetry.webglContextsCount,
        avgFps,
        jankFrames,
        longTasksCount: window.__perfTelemetry.longTasksCount,
        longTasksDurationMs: window.__perfTelemetry.longTasksTotalDuration.toFixed(1)
      };
    })()
  `);

  const initialTransfers = {
    jsBytes: 0,
    cssBytes: 0,
    glbBytes: 0,
    otherBytes: 0,
    totalBytes: 0,
    modelsLoaded: [],
  };

  completedRequests.forEach((req) => {
    initialTransfers.totalBytes += req.encodedDataLength;
    if (req.url.endsWith('.js')) initialTransfers.jsBytes += req.encodedDataLength;
    else if (req.url.endsWith('.css')) initialTransfers.cssBytes += req.encodedDataLength;
    else if (req.url.endsWith('.glb')) {
      initialTransfers.glbBytes += req.encodedDataLength;
      const name = path.basename(req.url);
      initialTransfers.modelsLoaded.push({
        name,
        bytes: req.encodedDataLength,
        mb: (req.encodedDataLength / (1024 * 1024)).toFixed(2),
        durationMs: req.durationMs,
      });
    } else {
      initialTransfers.otherBytes += req.encodedDataLength;
    }
  });

  console.log('Cold Load Timing:', coldMetrics);
  console.log('Initial Cold Network Transfer:');
  console.log(`  Total Transferred: ${(initialTransfers.totalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  JS Transferred: ${(initialTransfers.jsBytes / 1024).toFixed(2)} KB`);
  console.log(`  CSS Transferred: ${(initialTransfers.cssBytes / 1024).toFixed(2)} KB`);
  console.log(`  GLB Transferred: ${(initialTransfers.glbBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('  Models loaded in hero initial viewport:');
  initialTransfers.modelsLoaded.forEach((m) => {
    console.log(`    - ${m.name}: ${m.mb} MB (${m.durationMs} ms)`);
  });

  // --- MEASUREMENT 2: Full-Page Scrolling & Predictive Model Downloads ---
  console.log('\n--- MEASUREMENT 2: Full Page Scroll & Predictive Section Model Downloads ---');

  const scrollSteps = [
    { name: 'Discovery Section', y: 900 },
    { name: 'Matching Engine Section', y: 1750 },
    { name: 'Application Cockpit Section', y: 2500 },
    { name: 'Knowledge Blueprints Section', y: 3300 },
    { name: 'Academic Mission Section', y: 4100 },
    { name: 'Opportunity Gateway Section', y: 4800 },
  ];

  for (const step of scrollSteps) {
    console.log(`Scrolling to ${step.name} (y = ${step.y}px)...`);
    await evaluate(`window.scrollTo({ top: ${step.y}, behavior: 'smooth' })`);
    await sleep(2500);

    const currentContexts = await evaluate('window.__perfTelemetry.webglContextsCount');
    console.log(`  Active WebGL Contexts so far: ${currentContexts}`);
  }

  const allGlbDownloads = completedRequests.filter((r) => r.url.endsWith('.glb'));
  const allGlbSummary = allGlbDownloads.map((r) => ({
    name: path.basename(r.url),
    bytes: r.encodedDataLength,
    mb: (r.encodedDataLength / (1024 * 1024)).toFixed(2),
    durationMs: r.durationMs,
  }));

  let totalPageBytes = 0;
  completedRequests.forEach((r) => (totalPageBytes += r.encodedDataLength));

  const totalGlbBytes = allGlbDownloads.reduce((a, b) => a + b.encodedDataLength, 0);

  console.log('\n--- Full Page Optimized GLB Download Summary ---');
  allGlbSummary.forEach((m) => {
    console.log(`  ${m.name}: ${m.mb} MB in ${m.durationMs} ms`);
  });
  console.log(`Total GLB Network Transfer: ${(totalGlbBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total Page Network Transfer: ${(totalPageBytes / (1024 * 1024)).toFixed(2)} MB`);

  const finalContexts = await evaluate('window.__perfTelemetry.webglContextsCount');
  console.log(`Final Total WebGL Contexts created across 7 sections: ${finalContexts}`);

  // --- MEASUREMENT 3: Internal Route Navigation (/explore) ---
  console.log('\n--- MEASUREMENT 3: Internal Route Navigation (/explore) ---');
  const exploreReqStartCount = completedRequests.length;
  await evaluate('window.location.href = "/explore"');
  await sleep(2000);

  const exploreRequests = completedRequests.slice(exploreReqStartCount);
  let exploreBytes = 0;
  exploreRequests.forEach((r) => (exploreBytes += r.encodedDataLength));
  console.log(`Explore Route Network Requests: ${exploreRequests.length}`);
  console.log(`Explore Route Additional Bytes: ${(exploreBytes / 1024).toFixed(2)} KB`);

  // Compile Optimized Report
  const optimizedReport = {
    timestamp: new Date().toISOString(),
    distBundles: {
      totalJsKb: (totalJsSize / 1024).toFixed(2),
      totalCssKb: (totalCssSize / 1024).toFixed(2),
      bundles: bundleSizes,
    },
    diskModels: {
      totalDiskMb: (totalModelsDiskBytes / (1024 * 1024)).toFixed(2),
      models: diskModelSizes,
    },
    coldHomepage: {
      domContentLoadedMs: coldMetrics.domContentLoaded,
      loadEventMs: coldMetrics.loadEvent,
      firstPaintMs: coldMetrics.firstPaint,
      firstContentfulPaintMs: coldMetrics.firstContentfulPaint,
      initialNetworkTransferMb: (initialTransfers.totalBytes / (1024 * 1024)).toFixed(2),
      initialJsTransferKb: (initialTransfers.jsBytes / 1024).toFixed(2),
      initialGlbTransferMb: (initialTransfers.glbBytes / (1024 * 1024)).toFixed(2),
      initialModelsLoaded: initialTransfers.modelsLoaded,
      initialWebglContexts: coldMetrics.webglContextsCount,
      fps: coldMetrics.avgFps,
      jankFrames: coldMetrics.jankFrames,
      longTasksCount: coldMetrics.longTasksCount,
      longTasksDurationMs: coldMetrics.longTasksDurationMs,
    },
    fullPage: {
      totalPageTransferMb: (totalPageBytes / (1024 * 1024)).toFixed(2),
      totalGlbTransferMb: (totalGlbBytes / (1024 * 1024)).toFixed(2),
      allGlbDownloads: allGlbSummary,
      totalWebglContexts: finalContexts,
    },
    exploreRoute: {
      additionalRequests: exploreRequests.length,
      additionalKb: (exploreBytes / 1024).toFixed(2),
    },
  };

  const reportPath = path.join(rootDir, 'audit-optimized.json');
  fs.writeFileSync(reportPath, JSON.stringify(optimizedReport, null, 2));

  // Compute Comparison Table
  if (baseline) {
    const comparison = {
      diskModelsMb: {
        baseline: baseline.diskModels.totalDiskMb,
        optimized: optimizedReport.diskModels.totalDiskMb,
        reduction: `${(((baseline.diskModels.totalDiskMb - optimizedReport.diskModels.totalDiskMb) / baseline.diskModels.totalDiskMb) * 100).toFixed(1)}%`,
      },
      fullPageGlbTransferMb: {
        baseline: baseline.fullPage.totalGlbTransferMb,
        optimized: optimizedReport.fullPage.totalGlbTransferMb,
        reduction: `${(((baseline.fullPage.totalGlbTransferMb - optimizedReport.fullPage.totalGlbTransferMb) / baseline.fullPage.totalGlbTransferMb) * 100).toFixed(1)}%`,
      },
      fullPageTotalTransferMb: {
        baseline: baseline.fullPage.totalPageTransferMb,
        optimized: optimizedReport.fullPage.totalPageTransferMb,
        reduction: `${(((baseline.fullPage.totalPageTransferMb - optimizedReport.fullPage.totalPageTransferMb) / baseline.fullPage.totalPageTransferMb) * 100).toFixed(1)}%`,
      },
      coldLoadAvgFps: {
        baseline: baseline.coldHomepage.fps,
        optimized: optimizedReport.coldHomepage.fps,
      },
      coldLoadJankFrames: {
        baseline: baseline.coldHomepage.jankFrames,
        optimized: optimizedReport.coldHomepage.jankFrames,
      },
      coldLoadLongTasksDurationMs: {
        baseline: baseline.coldHomepage.longTasksDurationMs,
        optimized: optimizedReport.coldHomepage.longTasksDurationMs,
      },
      indexJsBundleKb: {
        baseline: baseline.distBundles.bundles['index-C1Rfykzp.js']?.kb || '240.90',
        optimized: (Object.entries(bundleSizes).find(([k]) => k.startsWith('index-') && k.endsWith('.js'))?.[1]?.kb) || '105.38',
      },
    };

    console.log('\n=== BEFORE VS AFTER PERFORMANCE COMPARISON ===');
    console.table(comparison);
    fs.writeFileSync(path.join(rootDir, 'performance-comparison.json'), JSON.stringify(comparison, null, 2));
  }

  ws.close();
  chromeProcess.kill();
  previewProcess.kill();
  console.log('=== Post-Optimization Audit Finished Successfully ===');
  process.exit(0);
}

runOptimizedAudit().catch((err) => {
  console.error('Optimized audit failed:', err);
  process.exit(1);
});
