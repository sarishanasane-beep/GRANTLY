import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const previewPort = 4376;
const debugPort = 9301;
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const preview = spawn('npx.cmd', ['vite', 'preview', '--port', String(previewPort)], {
    cwd: rootDir,
    shell: true,
  });
  await sleep(2500);

  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);
  await sleep(2000);

  const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const i = ++id;
      const cb = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id === i) {
          ws.removeEventListener('message', cb);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', cb);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const consoleErrors = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled' || msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg);
    }
  });

  await send('Page.navigate', { url: `http://localhost:${previewPort}/` });
  await sleep(4000);

  const driftCanvasInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelector('div[aria-hidden="true"] canvas');
      if (!canvas) return { error: 'no canvas' };
      const gl = canvas.getContext('webgl');
      return {
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        width: canvas.width,
        height: canvas.height,
        parentWidth: canvas.parentElement.clientWidth,
        parentHeight: canvas.parentElement.clientHeight,
        glDrawingWidth: gl ? gl.drawingBufferWidth : null,
        glDrawingHeight: gl ? gl.drawingBufferHeight : null,
      };
    })()`,
    returnByValue: true
  });
  console.log('Drift canvas info:', driftCanvasInfo.result.value);

  // Move pointer across canvas
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new PointerEvent('pointermove', {
        clientX: 800,
        clientY: 450,
        bubbles: true
      }));
    })()`
  });
  await sleep(300);

  const res = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(res.data, 'base64');
  const outPath = path.join(rootDir, 'screenshots', 'diagnose-hero-pointer.png');
  fs.writeFileSync(outPath, buffer);
  console.log('Saved screenshot:', outPath, 'Bytes:', buffer.length);

  try { ws.close(); } catch {}
  try { chrome.kill(); } catch {}
  try { preview.kill(); } catch {}
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
