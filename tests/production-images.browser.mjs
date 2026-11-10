// Run against a running Vite server: node tests/production-images.browser.mjs
// Optional: --mobile, --preview; TEST_URL changes the default localhost:5174.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
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
  const loaded = new Promise(resolve => events.set('Page.loadEventFired', resolve));
  await send('Page.navigate', { url: `${process.env.TEST_URL || 'http://127.0.0.1:5174'}/about#production-process` }, sessionId);
  await loaded;
  const result = await evaluate(`(async () => {
    const frame = () => new Promise(requestAnimationFrame);
    const deadline = performance.now() + 15000;
    while (!document.querySelector('.production-feature-image img') ||
      [...document.querySelectorAll('.production-feature-image img')].some(img => !img.complete)) {
      if (performance.now() > deadline) throw new Error('Images did not load');
      await frame();
    }
    await Promise.all([...document.querySelectorAll('.production-feature-image img')].map(img => img.decode()));
    if (${process.argv.includes('--preview')}) {
      document.querySelector('.production-image-surface').click();
      while (!document.querySelector('.production-preview-image')) await frame();
      await Promise.all([...document.querySelectorAll('.production-preview-image img')].map(img => img.decode()));
    }
    const surface = document.querySelector(${JSON.stringify(process.argv.includes('--preview') ? '.production-preview-image' : '.production-image-surface')});
    const layers = [...surface.querySelectorAll('.production-feature-image')];
    // Image decoding can finish before React commits its ready state. Start
    // navigation checks only after the initial illustration has been displayed.
    while (!layers.some(layer => +getComputedStyle(layer).opacity === 1)) {
      if (performance.now() > deadline) throw new Error('Initial illustration was not displayed');
      await frame();
    }
    const transitions = [];
    surface.addEventListener('transitionend', event => transitions.push({index: layers.indexOf(event.target), property: event.propertyName, elapsed: event.elapsedTime}));
    const images = layers.map(layer => layer.querySelector('img'));
    const picker = [...document.querySelectorAll('.production-step-button')];
    const bounds = surface.getBoundingClientRect();
    const samples = [];
    for (const [selection, step] of [6, 0, 5, 1, 4, 2, 3, 0, 5].entries()) {
      const rapid = selection === 8;
      if (rapid) {
        for (const rapid of [6, 1, 4, 0]) { picker[rapid].click(); await frame(); await frame(); }
      }
      picker[step].click();
      const start = performance.now();
      let settledFrames = 0;
      while (settledFrames < 3) {
        if (performance.now() - start > 3000) throw new Error('Transition did not settle on step ' + step);
        await frame();
        const styles = layers.map(layer => getComputedStyle(layer));
        const order = styles.map((style, index) => ({index, opacity: +style.opacity, z: +style.zIndex || 0}))
          .filter(layer => layer.opacity > 0).sort((a,b) => b.z - a.z || b.index - a.index);
        const rect = surface.getBoundingClientRect();
        samples.push({step, rapid, time: Math.round(performance.now() - start), order,
          width: rect.width, height: rect.height});
        settledFrames = order.length === 1 && order[0].index === step && order[0].opacity === 1 && order[0].z === 0 ? settledFrames + 1 : 0;
      }
    }
    return { samples, transitions, bounds: {width: bounds.width, height: bounds.height},
      stableNodes: images.every((img, i) => img === surface.querySelectorAll('.production-feature-image img')[i]) };
  })()`);
  const failures = result.samples.filter(sample => {
    const coverage = 1 - sample.order.reduce((remaining, layer) => remaining * (1 - layer.opacity), 1);
    return coverage < 0.999 || Math.abs(sample.width - result.bounds.width) > 0.1 ||
      Math.abs(sample.height - result.bounds.height) > 0.1;
  });
  let lastStep;
  let lastContribution = 0;
  for (const sample of result.samples) {
    let remaining = 1;
    let contribution = 0;
    for (const layer of sample.order) {
      if (layer.index === sample.step) contribution = remaining * layer.opacity;
      remaining *= 1 - layer.opacity;
    }
    if (!sample.rapid && lastStep === sample.step && contribution < lastContribution - 0.01) failures.push({ ...sample, contribution, lastContribution });
    lastStep = sample.step;
    lastContribution = contribution;
  }
  console.log(JSON.stringify({ frames: result.samples.length, failures: failures.slice(0, 12), stableNodes: result.stableNodes }, null, 2));
  if (failures.length) console.log(JSON.stringify(result.transitions));
  assert.equal(failures.length, 0, 'every frame must remain covered, stable, and settle on the requested image');
  assert.equal(result.stableNodes, true);
} finally {
  clearTimeout(watchdog);
  socket?.close();
  browser.kill();
  await new Promise(resolve => browser.exitCode !== null || browser.signalCode !== null ? resolve() : browser.once('exit', resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
