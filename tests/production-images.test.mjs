import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Exercise the component's real effects and animation callbacks with controlled
// image loads/decodes. No network timing or animation timers are involved.
function setup({ reducedMotion = false, cached = false } = {}) {
  let cursor = 0;
  let dirty = true;
  let tree;
  let step = 0;
  const hooks = [];
  const effects = [];
  const images = Array.from({ length: 7 }, () => {
    const listeners = new Map();
    let resolveDecode;
    let rejectDecode;
    const decoded = new Promise((resolve, reject) => {
      resolveDecode = resolve;
      rejectDecode = reject;
    });
    // Cached images resolve only when the test explicitly allows decoding.
    return {
      complete: cached, naturalWidth: 1536,
      addEventListener: (name, handler) => listeners.set(name, handler),
      removeEventListener: (name) => listeners.delete(name),
      decode: () => decoded,
      load: () => listeners.get('load')?.(),
      error: () => listeners.get('error')?.(),
      resolveDecode, rejectDecode,
    };
  });
  const react = {
    useRef(value) {
      const index = cursor++;
      return hooks[index] ??= { current: value };
    },
    useState(value) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = typeof value === 'function' ? value() : value;
      return [hooks[index], (update) => {
        const next = typeof update === 'function' ? update(hooks[index]) : update;
        if (!Object.is(next, hooks[index])) { hooks[index] = next; dirty = true; }
      }];
    },
    useEffect(callback, deps) {
      const index = cursor++;
      const old = hooks[index];
      if (!old || deps.some((dep, i) => !Object.is(dep, old.deps[i]))) {
        effects.push(() => {
          old?.cleanup?.();
          hooks[index] = { deps, cleanup: callback() };
        });
      }
    },
  };
  const jsx = (type, props, key) => ({ type, props, key });
  const exports = {};
  const source = readFileSync(new URL('../src/components/CocopeatProduction.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(`${source}\nexport { ProductionImages };`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  runInNewContext(outputText, {
    exports,
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'framer-motion') return { motion: { span: 'motion.span' }, useReducedMotion: () => reducedMotion };
      return {};
    },
  });
  function flush() {
    for (let count = 0; dirty; count++) {
      assert.ok(count < 20, 'effects should settle');
      cursor = 0;
      dirty = false;
      tree = exports.ProductionImages({ step });
      tree.props.children[0].forEach((layer, i) => layer.props.children.props.ref(images[i]));
      effects.splice(0).forEach((effect) => effect());
    }
  }
  flush();
  return {
    images,
    layers: () => tree.props.children[0],
    error: () => tree.props.children[1],
    select(index) { step = index; dirty = true; flush(); },
    finish(index) { const layer = tree.props.children[0][index]; layer.props.onTransitionEnd({ target: layer, currentTarget: layer, propertyName: 'opacity' }); flush(); },
    async decode(index) {
      images[index].load();
      images[index].resolveDecode();
      await new Promise(setImmediate);
      flush();
    },
    async reject(index) {
      images[index].load();
      images[index].rejectDecode(new Error('decode failed'));
      await new Promise(setImmediate);
      flush();
    },
    fail(index) { images[index].error(); flush(); },
    unmount() { hooks.forEach((hook) => hook?.cleanup?.()); },
  };
}

test('waits for decoding, keeps an opaque base, and blends for 400ms without changing keys or sources', async () => {
  const fixture = setup();
  const identities = fixture.layers().map((layer) => [layer.key, layer.props.children.props.src]);
  await fixture.decode(0);
  fixture.select(1);
  fixture.images[1].load();
  assert.equal(fixture.layers()[0].props.style.opacity, 1);
  assert.equal(fixture.layers()[1].props.style.opacity, 0);
  await fixture.decode(1);
  assert.equal(fixture.layers()[0].props.style.opacity, 1);
  assert.equal(fixture.layers()[1].props.style.opacity, 1);
  assert.equal(fixture.layers()[1].props.style.zIndex, 1);
  assert.equal(fixture.layers()[1].props.style.transition, 'opacity 400ms ease-in-out');
  fixture.finish(1);
  assert.equal(fixture.layers()[0].props.style.opacity, 0);
  assert.equal(fixture.layers()[1].props.style.opacity, 1);
  assert.deepEqual(fixture.layers().map((layer) => [layer.key, layer.props.children.props.src]), identities);
});

test('ignores out-of-order decodes and uses the latest selection after an in-flight blend', async () => {
  const fixture = setup();
  await fixture.decode(0);
  fixture.select(1);
  fixture.select(2);
  await fixture.decode(1);
  assert.equal(fixture.layers()[1].props.style.opacity, 0);
  await fixture.decode(2);
  fixture.select(3);
  await fixture.decode(3);
  fixture.select(0);
  fixture.finish(2);
  assert.equal(fixture.layers()[0].props.style.zIndex, 1);
  assert.equal(fixture.layers()[3].props.style.opacity, 0);
  fixture.finish(0);
  assert.equal(fixture.layers()[0].props.style.opacity, 1);
  assert.equal(fixture.layers()[2].props.style.opacity, 0);
});

test('load and decode failures retain the last usable image and allow later navigation', async () => {
  const fixture = setup();
  await fixture.decode(0);
  fixture.select(1);
  fixture.fail(1);
  assert.equal(fixture.layers()[0].props.style.opacity, 1);
  assert.equal(fixture.error().props.role, 'status');
  fixture.select(2);
  await fixture.reject(2);
  assert.equal(fixture.layers()[0].props.style.opacity, 1);
  fixture.select(3);
  await fixture.decode(3);
  fixture.finish(3);
  assert.equal(fixture.layers()[3].props.style.opacity, 1);
  assert.equal(fixture.error(), false);
});

test('cached images still wait for decoding and reduced motion switches immediately', async () => {
  const fixture = setup({ cached: true, reducedMotion: true });
  assert.equal(fixture.layers()[0].props.style.opacity, 0);
  await fixture.decode(0);
  await fixture.decode(1);
  fixture.select(1);
  assert.equal(fixture.layers()[0].props.style.opacity, 0);
  assert.equal(fixture.layers()[1].props.style.opacity, 1);
  assert.equal(fixture.layers()[1].props.style.transition, 'none');
});

test('unmount removes load listeners and ignores a pending decode', async () => {
  const fixture = setup();
  fixture.images[0].load();
  fixture.unmount();
  await fixture.decode(0);
  assert.equal(fixture.layers()[0].props.style.opacity, 0);
});
