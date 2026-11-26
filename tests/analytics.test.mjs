import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Exercise the real service with browser and build-environment fixtures.
function setup(env = {}, overrides = {}) {
  const scripts = [];
  const listeners = new Map();
  const window = {
    location: { origin: 'https://vhnglobal.com', pathname: '/contact', search: '?q=private' },
    innerHeight: 500, scrollY: 0,
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name, handler) => {
      if (listeners.get(name) === handler) listeners.delete(name);
    },
    ...overrides,
  };
  const document = {
    visibilityState: 'visible', documentElement: { scrollHeight: 2000 },
    referrer: 'https://example.com/private?email=private@example.com',
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
  };
  const source = readFileSync(new URL('../src/services/analytics.ts', import.meta.url), 'utf8')
    .replaceAll('import.meta.env', '__env');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  runInNewContext(outputText, {
    exports, window, document, URL, URLSearchParams,
    __env: { PROD: true, VITE_GA_MEASUREMENT_ID: 'G-TEST123', ...env },
  });
  return { api: exports, window, document, listeners, scripts, commands: () => Array.from(window.dataLayer || [], (args) => Array.from(args)) };
}

test('missing/invalid IDs and development mode do not load or collect analytics', () => {
  for (const env of [{ VITE_GA_MEASUREMENT_ID: '' }, { VITE_GA_MEASUREMENT_ID: 'invalid' }, { PROD: false }]) {
    const fixture = setup(env);
    fixture.api.trackPageView('/');
    fixture.api.trackEvent('contact_click', { contact_method: 'email' });
    assert.equal(fixture.scripts.length, 0);
    assert.equal(fixture.commands().length, 0);
  }
});

test('loads once, disables automatic pageviews, and deduplicates consecutive routes', () => {
  const fixture = setup();
  fixture.api.trackPageView('/');
  fixture.api.trackPageView('/');
  fixture.api.trackPageView('/products');
  fixture.api.trackPageView('/');
  assert.equal(fixture.scripts.length, 1);
  assert.equal(fixture.scripts[0].async, true);
  const commands = fixture.commands();
  assert.equal(commands.filter(([command]) => command === 'config').length, 1);
  assert.equal(commands.find(([command]) => command === 'config')[2].send_page_view, false);
  assert.equal(commands.filter(([, name]) => name === 'page_view').length, 3);
});

test('reported URLs omit query strings, fragments, and external referrer paths', () => {
  const fixture = setup();
  fixture.api.trackPageView('/contact');
  fixture.api.trackEvent('generate_lead', { form_source: 'contact', delivery_status: 'confirmed' });
  const payload = JSON.stringify(fixture.commands());
  assert.equal(payload.includes('private'), false);
  const pageView = fixture.commands().find(([, name]) => name === 'page_view')[2];
  assert.equal(pageView.page_referrer, 'https://example.com');
  assert.equal(pageView.page_location, 'https://vhnglobal.com/contact');
  assert.equal(fixture.commands().find(([, name]) => name === 'generate_lead')[2].delivery_status, 'confirmed');
});

test('explicit debug mode enables development testing', () => {
  const fixture = setup({ PROD: false, VITE_GA_DEBUG: 'true' });
  fixture.api.trackPageView('/');
  assert.equal(fixture.scripts.length, 1);
  assert.equal(fixture.commands().find(([command]) => command === 'config')[2].debug_mode, true);
});

test('a blocked Google tag does not throw into the application', () => {
  const fixture = setup({}, { gtag() { throw new Error('blocked'); } });
  assert.doesNotThrow(() => fixture.api.trackPageView('/contact'));
  assert.doesNotThrow(() => fixture.api.trackEvent('generate_lead', { form_source: 'contact' }));
});

test('campaign attribution uses only short slug labels from the landing URL', () => {
  const fixture = setup({}, {
    location: { origin: 'https://vhnglobal.com', pathname: '/', search: '?utm_source=linkedin&utm_medium=social&utm_campaign=cocopeat_2026&q=private@example.com&utm_term=private' },
  });
  fixture.api.trackPageView('/');
  const config = fixture.commands().find(([command]) => command === 'config')[2];
  assert.equal(config.campaign_source, 'linkedin');
  assert.equal(config.campaign_medium, 'social');
  assert.equal(config.campaign_name, 'cocopeat_2026');
  assert.equal(JSON.stringify(fixture.commands()).includes('private'), false);

  for (const value of ['private@example.com', 'a'.repeat(65), 'https://example.com', 'a name']) {
    const rejected = setup({}, {
      location: { origin: 'https://vhnglobal.com', pathname: '/', search: `?utm_campaign=${encodeURIComponent(value)}` },
    });
    rejected.api.trackPageView('/');
    assert.equal(rejected.commands().find(([command]) => command === 'config')[2].campaign_name, undefined);
  }
});

test('enquiry funnel deduplicates starts, retains product context, and keeps errors separate from leads', () => {
  const fixture = setup();
  const enquiry = fixture.api.createEnquiryAnalytics('product', 'product-123');
  enquiry.start();
  enquiry.start();
  enquiry.attempt();
  enquiry.error('unconfirmed');
  let events = fixture.commands().filter(([command]) => command === 'event');
  assert.deepEqual(events.map(([, name]) => name), ['enquiry_start', 'enquiry_attempt', 'enquiry_error']);
  assert.equal(events[2][2].error_type, 'unconfirmed');
  enquiry.attempt();
  enquiry.confirmed();
  events = fixture.commands().filter(([command]) => command === 'event');
  assert.equal(events.filter(([, name]) => name === 'generate_lead').length, 1);
  assert.equal(events.at(-1)[2].delivery_status, 'confirmed');
  for (const [, , parameters] of events) {
    assert.equal(parameters.product_id, 'product-123');
    assert.equal(parameters.form_source, 'product');
    assert.equal(parameters.page_location, 'https://vhnglobal.com/contact');
  }
  enquiry.start();
  assert.equal(fixture.commands().filter(([, name]) => name === 'enquiry_start').length, 2);
});

test('autofilled submissions and validation errors establish a start without a confirmed lead', () => {
  for (const action of ['attempt', 'error']) {
    const fixture = setup();
    const enquiry = fixture.api.createEnquiryAnalytics('contact');
    enquiry[action]('validation');
    const events = fixture.commands().filter(([command]) => command === 'event');
    assert.equal(events[0][1], 'enquiry_start');
    assert.equal(events.length, 2);
    assert.equal(events.some(([, name]) => name === 'generate_lead'), false);
    assert.equal(events[0][2].product_id, undefined);
  }
});

test('scroll thresholds emit once per page lifecycle and listeners are cleaned up', () => {
  const fixture = setup();
  const stop = fixture.api.startScrollTracking();
  const scroll = fixture.listeners.get('scroll');
  scroll();
  assert.equal(fixture.commands().length, 0);
  fixture.window.scrollY = 500;
  scroll();
  scroll();
  fixture.window.scrollY = 1400;
  scroll();
  const depths = () => fixture.commands().filter(([, name]) => name === 'scroll_depth').map(([, , params]) => params.percent_scrolled);
  assert.deepEqual(depths(), [25, 50, 75, 90]);
  stop();
  assert.equal(fixture.listeners.has('scroll'), false);
  const stopNext = fixture.api.startScrollTracking();
  fixture.listeners.get('scroll')();
  assert.deepEqual(depths(), [25, 50, 75, 90, 25, 50, 75, 90]);
  stopNext();
});

test('short pages and hidden tabs do not emit scroll depth', () => {
  const fixture = setup();
  fixture.api.startScrollTracking();
  fixture.window.scrollY = 100;
  fixture.document.documentElement.scrollHeight = 500;
  fixture.listeners.get('scroll')();
  fixture.document.documentElement.scrollHeight = 2000;
  fixture.document.visibilityState = 'hidden';
  fixture.listeners.get('scroll')();
  assert.equal(fixture.commands().length, 0);
});
