import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9288;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-ref-${Date.now()}`);
const outDir = path.resolve('c:/Users/Priya/OneDrive/Documents/HACKATHON/frontend arena/main project/public/ref-frames');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

console.log('Launching Chrome to inspect reference video...');
const chromeProcess = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--allow-file-access-from-files',
    '--autoplay-policy=no-user-gesture-required',
    '--no-first-run',
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

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data.toString());
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

const videoPath = path.resolve('c:/Users/Priya/OneDrive/Documents/HACKATHON/frontend arena/main project/public/reference.mp4').replace(/\\/g, '/');

// Create HTML player
const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin:0; background:#000; overflow:hidden; display:flex; justify-content:center; align-items:center; height:100vh;">
  <video id="vid" src="file:///${videoPath}" style="width:100%; height:100%; object-fit:contain;" controls muted></video>
</body>
</html>
`;

const playerHtmlPath = path.resolve('c:/Users/Priya/OneDrive/Documents/HACKATHON/frontend arena/main project/public/player.html');
fs.writeFileSync(playerHtmlPath, htmlContent);

await send('Page.navigate', { url: `file:///${playerHtmlPath.replace(/\\/g, '/')}` });
await sleep(1500);

const duration = await evaluate(`
  new Promise(res => {
    const v = document.getElementById('vid');
    if (v.duration) res(v.duration);
    else v.onloadedmetadata = () => res(v.duration);
  })
`);

console.log('Video duration:', duration, 'seconds');

const timestamps = [0.5, 1.2, 1.8, 2.4, 3.2, 4.0, 5.0, 6.2, 7.5, 8.8, 10.0, 11.0];

for (const t of timestamps) {
  await evaluate(`
    new Promise(res => {
      const v = document.getElementById('vid');
      v.currentTime = ${t};
      v.onseeked = () => res(true);
    })
  `);
  await sleep(300);

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const filename = `frame_${String(Math.round(t * 10)).padStart(3, '0')}.png`;
  fs.writeFileSync(path.join(outDir, filename), Buffer.from(screenshot.data, 'base64'));
  console.log(`Captured frame at ${t}s -> ${filename}`);
}

ws.close();
chromeProcess.kill();
console.log('Frame extraction complete!');
