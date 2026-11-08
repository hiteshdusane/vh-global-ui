import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Exercise the real service with browser and build-environment fixtures.
function setup(env = {}, overrides = {}) {
  const scripts = [];
  const window = {
    location: { origin: 'https://vhnglobal.com', pathname: '/contact', search: '?q=private' },
    ...overrides,
  };
  const document = {
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
    exports, window, document, URL,
    __env: { PROD: true, VITE_GA_MEASUREMENT_ID: 'G-TEST123', ...env },
  });
  return { api: exports, window, scripts, commands: () => (window.dataLayer || []).map((args) => Array.from(args)) };
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
