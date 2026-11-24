import { homeScenario } from './home-performance-scenario.mjs';
import { glassScenario } from './glass-effects-scenario.mjs';
import { renderingSample } from './firefox-rendering-scenario.mjs';
// Dependency-free Firefox WebDriver BiDi smoke check and frame sampling.
// Run a production preview first; TEST_URL defaults to localhost:5174.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';

const profile = await mkdtemp(join(tmpdir(), 'vhn-firefox-'));
const width = process.argv.includes('--mobile') ? 390 : 1440;
const reservation = createServer();
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const browser = spawn(process.env.FIREFOX_PATH || 'C:/Program Files/Mozilla Firefox/firefox.exe',
  ['--headless', '--no-remote', '--profile', profile, '--remote-debugging-port', String(port)],
  { windowsHide: true, env: { ...process.env, MOZ_REMOTE_ALLOW_SYSTEM_ACCESS: '1', MOZ_HEADLESS_WIDTH: String(width), MOZ_HEADLESS_HEIGHT: '1000' }, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
let stderr = '';
browser.stderr.on('data', chunk => { stderr += chunk; });
browser.on('error', error => { stderr += error.message; });
const watchdog = setTimeout(() => { browser.kill(); console.error('Firefox timed out', stderr); process.exit(1); }, process.argv.includes('--render-audit') ? 90000 : 45000);
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      socket = new WebSocket(`ws://127.0.0.1:${port}/session`);
      await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
      break;
    } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.equal(socket?.readyState, WebSocket.OPEN, stderr);
  let id = 0;
  const pending = new Map();
  const consoleMessages = [];
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'log.entryAdded') consoleMessages.push(message.params.text || '');
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.type === 'error') request.reject(new Error(JSON.stringify(message)));
    else request.resolve(message.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const session = await send('session.new', { capabilities: {} });
  await new Promise(resolve => setTimeout(resolve, 1500));
  const { context } = await send('browsingContext.create', { type: 'tab' });
  await send('session.subscribe', { events: ['log.entryAdded'] });
  await send('browsingContext.setViewport', { context, viewport: { width, height: 1100 } });
  const evaluate = async expression => {
    const result = await send('script.evaluate', { expression, target: { context }, awaitPromise: true });
    assert.equal(result.type, 'success', JSON.stringify(result));
    return JSON.parse(result.result.value);
  };
  await send('browsingContext.navigate', { context, url: process.env.TEST_URL || 'http://127.0.0.1:5174', wait: process.argv.includes('--glass-audit') ? 'interactive' : 'complete' });
  let chromeEvaluate;
  if (process.argv.includes('--profile')) {
    const { contexts } = await send('browsingContext.getTree', { 'moz:scope': 'chrome' });
    chromeEvaluate = async expression => {
      const result = await send('script.evaluate', { expression, target: { context: contexts[0].context }, awaitPromise: true });
      assert.equal(result.type, 'success', JSON.stringify(result));
      return result.result.value;
    };
    console.log('Graphics:', await chromeEvaluate('JSON.stringify(Cc["@mozilla.org/gfx/info;1"].getService(Ci.nsIGfxInfo).getFeatures())'));
    await chromeEvaluate('(async () => { await Services.profiler.StartProfiler(2000000, 2, ["js", "stackwalk", "cpu"], ["GeckoMain", "Compositor", "Renderer", "RenderBackend"]); return true; })()');
  }
  if (process.argv.includes('--glass-audit')) {
    console.log(await evaluate(`(${glassScenario})(${width}, ${process.argv.includes('--navigation-theme')})`));
    if (process.argv.includes('--screenshots')) {
      await evaluate('JSON.stringify(window.scrollTo({top: 0, behavior: "instant"}) ?? true)');
      const screenshot = await send('browsingContext.captureScreenshot', { context, origin: 'viewport' });
      const output = join(tmpdir(), `vhn-glass-firefox-${width}.png`);
      await writeFile(output, Buffer.from(screenshot.data, 'base64'));
      console.log('Screenshot:', output);
    }
  } else if (process.argv.includes('--render-audit')) {
    for (const path of ['/', '/products', '/about', '/contact']) {
      await send('browsingContext.navigate', { context, url: new URL(path, process.env.TEST_URL || 'http://127.0.0.1:5174').href, wait: 'complete' });
      for (const [mode, css] of [
        ['current', ''],
        ['no-backdrop', '*, *::before, *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }'],
        ['current-repeat', ''],
      ]) {
        const result = await evaluate(`(${renderingSample})(${JSON.stringify(css)})`);
        assert.equal(result.filters.length, 0, 'Firefox must not retain live filters');
        assert.equal(result.shadowCount, 0, 'Firefox must not retain painted box shadows');
        assert.ok(result.rootBackgrounds.every(background => background.image === 'none'), 'Firefox page backgrounds must be flat');
        console.log(JSON.stringify({ mode, ...result }));
      }
      if (process.argv.includes('--screenshots')) {
        await evaluate('JSON.stringify(window.scrollTo({top: 0, behavior: "instant"}) ?? true)');
        const screenshot = await send('browsingContext.captureScreenshot', { context, origin: 'viewport' });
        const output = join(tmpdir(), `vhn-firefox-${path.replaceAll('/', '') || 'home'}-${Date.now()}.png`);
        await writeFile(output, Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot:', output);
      }
    }
  } else if (process.argv.includes('--compare-decor') || process.argv.includes('--isolate-decor')) {
    const modes = process.argv.includes('--isolate-decor') ? ['animation', 'perspective'] : ['normal', 'decor', 'normal'];
    for (const mode of modes) {
      await evaluate(`JSON.stringify(document.getElementById('vhn-static-decor-test')?.remove() ?? true)`);
      const sample = await evaluate(`(${homeScenario})(${width}, true, ${mode !== 'normal'}, ${JSON.stringify(mode)})`);
      console.log(JSON.stringify({ mode, ...sample }));
    }
  } else {
    const scope = process.argv.includes('--photo-details') ? 'details' : process.argv.includes('--outer-panels') ? 'panels' : process.argv.includes('--header-only');
    const result = await evaluate(`(${homeScenario})(${width}, ${process.argv.includes('--scroll-only')}, ${process.argv.includes('--disable-backdrop')}, ${JSON.stringify(scope)})`);
    assert.equal(result.overflow, false, 'Horizontal overflow');
    console.log(JSON.stringify({ browser: session.capabilities.browserVersion, width,
      diagnostic: process.argv.includes('--disable-backdrop') ? scope || 'all-backdrops' : false, ...result }));
  }
  assert.equal(consoleMessages.some(message => /does not recognize.*fetchPriority/i.test(message)), false, 'React image-priority warning');
  if (chromeEvaluate) {
    const output = join(tmpdir(), `vhn-firefox-profile-${Date.now()}.json`);
    await chromeEvaluate(`(async () => { await Services.profiler.dumpProfileToFileAsync(${JSON.stringify(output)}); await Services.profiler.StopProfiler(); return true; })()`);
    console.log('Firefox profile:', output);
  }
  await send('browser.close');
} catch (error) {
  console.error(stderr);
  throw error;
} finally {
  clearTimeout(watchdog);
  socket?.close();
  if (browser.exitCode === null && browser.signalCode === null) {
    const exited = new Promise(resolve => browser.once('exit', resolve));
    browser.kill();
    await exited;
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
