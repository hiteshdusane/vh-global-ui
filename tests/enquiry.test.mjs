import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const requestId = '12345678-1234-4123-8123-123456789abc';
const enquiry = { name: 'Buyer', email: 'buyer@example.com', contact: '+919876543210', subject: 'Product information', message: 'Please share availability.' };
const endpoint = 'https://script.google.com/macros/s/test-deployment/exec';

function client(fetch, url = endpoint) {
  const source = readFileSync(new URL('../src/services/enquiry.ts', import.meta.url), 'utf8')
    .replaceAll('import.meta.env', '__env');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  const timers = new Set();
  runInNewContext(outputText, {
    exports, fetch, AbortController, crypto: { randomUUID: () => requestId },
    setTimeout: (callback) => { timers.add(callback); return callback; },
    clearTimeout: (timer) => timers.delete(timer),
    __env: { VITE_APP_SCRIPT_EXCEL_URL: url },
  });
  return { submit: exports.submitEnquiry, timers };
}

function scriptServer() {
  const rows = [];
  let locked = false;
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (row) => rows.push(Array.from(row)),
    setFrozenRows() {},
    getRange: (start, column, count, width) => ({
      setFontWeight() {},
      getValues: () => rows.slice(start - 1, start - 1 + count).map((row) => row.slice(column - 1, column - 1 + width)),
      createTextFinder: (value) => ({ matchEntireCell: () => ({ findNext: () => rows.slice(start - 1).find((row) => row[column - 1] === value) }) }),
    }),
  };
  const context = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => 'sheet-id' }) },
    SpreadsheetApp: {
      openById: () => ({ getSheetByName: () => sheet }),
      flush() {},
    },
    LockService: { getScriptLock: () => ({
      waitLock: () => { locked = true; },
      hasLock: () => locked,
      releaseLock: () => { locked = false; },
    }) },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
    },
  };
  runInNewContext(readFileSync(new URL('../integrations/google-sheets/Code.gs', import.meta.url), 'utf8'), context);
  return { rows, context, isLocked: () => locked, post: (data) => context.doPost({ postData: { contents: JSON.stringify(data) } }) };
}

test('client and Apps Script save both form sources and acknowledge the matching request', async () => {
  for (const source of ['contact', 'product']) {
    const server = scriptServer();
    const fixture = client(async (url, options) => {
      assert.equal(url, endpoint);
      assert.equal(options.headers['Content-Type'], 'text/plain;charset=UTF-8');
      assert.equal(options.mode, 'cors');
      assert.equal(options.credentials, 'omit');
      return { ok: true, json: async () => server.post(JSON.parse(options.body)) };
    });
    await fixture.submit(enquiry, source);
    assert.equal(server.rows.length, 2);
    assert.equal(server.rows[1][2], source);
    assert.equal(server.rows[1][4], enquiry.email);
    assert.equal(server.rows[1][5], "'" + enquiry.contact);
    assert.equal(server.rows[1][8], 'New');
    assert.equal(server.isLocked(), false);
    assert.equal(fixture.timers.size, 0);
  }
});

test('client rejects failed, opaque, malformed, and mismatched acknowledgements', async () => {
  const responses = [
    { ok: false },
    { ok: true, json: async () => ({ success: false }) },
    { ok: true, json: async () => ({ success: true, requestId: 'other-id' }) },
    { ok: true, json: async () => { throw new SyntaxError('HTML login page'); } },
    { ok: true, json: async () => null },
  ];
  for (const response of responses) {
    const fixture = client(async () => response);
    await assert.rejects(fixture.submit(enquiry));
    assert.equal(fixture.timers.size, 0);
  }
});

test('client rejects missing or incorrect deployment URLs before sending personal data', async () => {
  for (const url of ['', 'https://example.com/exec', 'https://script.google.com/macros/s/test/dev']) {
    let called = false;
    const fixture = client(async () => { called = true; }, url);
    await assert.rejects(fixture.submit(enquiry));
    assert.equal(called, false);
  }
});

test('network and timeout errors propagate and release client timers', async () => {
  const fixture = client(async () => { throw new Error('Network blocked'); });
  await assert.rejects(fixture.submit(enquiry), /Network blocked/);
  assert.equal(fixture.timers.size, 0);
  const timeoutFixture = client((_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('Request timed out')));
  }));
  const pending = timeoutFixture.submit(enquiry);
  for (const callback of timeoutFixture.timers) callback();
  await assert.rejects(pending, /Request timed out/);
  assert.equal(timeoutFixture.timers.size, 0);
});

test('script deduplicates identical request IDs and escapes spreadsheet formulas', () => {
  const server = scriptServer();
  const data = { ...enquiry, name: '=IMPORTXML("url")', message: '@SUM(1)', source: 'contact', requestId };
  assert.equal(server.post(data).success, true);
  assert.equal(server.post(data).success, true);
  assert.equal(server.rows.length, 2);
  assert.equal(server.rows[1][3], "'" + data.name);
  assert.equal(server.rows[1][7], "'" + data.message);
  const health = server.context.doGet();
  assert.equal(health.service, 'VHN Global enquiries');
  assert.equal(JSON.stringify(health).includes(enquiry.email), false);
});

test('script rejects invalid fields and preserves existing rows', () => {
  const server = scriptServer();
  const valid = { ...enquiry, source: 'contact', requestId };
  for (const changes of [{ email: 'invalid' }, { name: ' ' }, { message: 'a'.repeat(5001) }, { source: 'other' }, { requestId: 'bad' }, { name: {} }]) {
    assert.equal(server.post({ ...valid, ...changes }).success, false);
    assert.equal(server.rows.length, 0);
  }
  server.post(valid);
  server.rows[0][0] = 'Wrong header';
  assert.equal(server.post({ ...valid, requestId: 'abcdefab-1234-4123-8123-123456789abc' }).success, false);
  assert.equal(server.rows.length, 2);
  assert.equal(server.isLocked(), false);
});
