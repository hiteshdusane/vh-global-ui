import { homeScenario } from './home-performance-scenario.mjs';
import { glassScenario } from './glass-effects-scenario.mjs';
// Run against Vite preview. TEST_URL defaults to localhost:5174.
// Optional: --mobile, --scroll-only; CHROME_PATH also supports Edge.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const profile = await mkdtemp(join(tmpdir(), 'vhn-production-browser-'));
const browser = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
const watchdog = setTimeout(() => { console.error('Browser verification timed out'); browser.kill(); process.exitCode = 1; }, 30000);
try {
  const endpoint = await new Promise((resolve, reject) => {
    browser.once('error', reject);
    browser.once('exit', (code) => reject(new Error(`Browser exited: ${code}`)));
    browser.stderr.on('data', (chunk) => {
      const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) resolve(match[1]);
    });
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onclose = () => {
    for (const request of pending.values()) request.reject(new Error('Browser connection closed'));
    pending.clear();
  };
  const events = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    events.get(message.method)?.(message.params);
    if (!message.id) return;
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId);
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const width = process.argv.includes('--mobile') ? 390 : 1440;
  await send('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: width < 640 }, sessionId);
  if (process.argv.includes('--reduced-motion')) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
  await send('Page.navigate', { url: process.env.TEST_URL || 'http://127.0.0.1:5174' }, sessionId);
  const result = JSON.parse(await evaluate(process.argv.includes('--glass-audit') ? `(${glassScenario})(${width}, ${process.argv.includes('--navigation-theme')})` : `(${homeScenario})(${width}, ${process.argv.includes('--scroll-only')})`));
  if (!process.argv.includes('--glass-audit')) assert.equal(result.overflow, false, 'Horizontal overflow');
  console.log(JSON.stringify({ browser: process.env.CHROME_PATH || 'Chrome', width, ...result }));
  if (process.argv.includes('--screenshots')) {
    await evaluate('window.scrollTo({top: 0, behavior: "instant"})');
    const screenshot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
    const output = join(tmpdir(), `vhn-glass-chrome-${width}.png`);
    await writeFile(output, Buffer.from(screenshot.data, 'base64'));
    console.log('Screenshot:', output);
  }
} finally {
  clearTimeout(watchdog);
  socket?.close();
  browser.kill();
  await new Promise(resolve => browser.exitCode !== null || browser.signalCode !== null ? resolve() : browser.once('exit', resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
