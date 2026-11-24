// All-page rendering diagnostics. CSS overrides are restricted to the test tab.
export async function renderingSample(css = '') {
  document.getElementById('vhn-rendering-diagnostic')?.remove();
  const style = document.createElement('style');
  style.id = 'vhn-rendering-diagnostic';
  style.textContent = css;
  document.head.append(style);
  const frame = () => new Promise(requestAnimationFrame);
  await document.fonts.ready;
  const deadline = performance.now() + 12000;
  while (document.querySelector('.home-product-skeleton')) {
    if (performance.now() > deadline) throw new Error('Product loading did not settle');
    await frame();
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  for (let i = 0; i < 12; i++) await frame();
  let shadowCount = 0;
  const filters = [...document.querySelectorAll('body *')].flatMap(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    if (style.boxShadow !== 'none') shadowCount++;
    if (style.backdropFilter === 'none' && style.filter === 'none') return [];
    return [{ element: element.className?.baseVal ?? element.className,
      backdrop: style.backdropFilter, filter: style.filter,
      width: Math.round(rect.width), height: Math.round(rect.height) }];
  });
  const rootBackgrounds = [...document.querySelectorAll('.site-shell, .home-page, .catalog-rich, .contact-rich')]
    .map(element => ({ element: element.className, image: getComputedStyle(element).backgroundImage }));
  const intervals = [];
  let previous = await frame();
  const start = previous;
  const distance = Math.min(document.documentElement.scrollHeight - innerHeight, 2200);
  while (previous - start < 1600) {
    window.scrollTo({ top: distance * (previous - start) / 1600, behavior: 'instant' });
    const now = await frame();
    intervals.push(now - previous);
    previous = now;
  }
  intervals.sort((a, b) => a - b);
  return JSON.stringify({ path: location.pathname, frames: intervals.length,
    p50: intervals[Math.floor(intervals.length * .5)], p95: intervals[Math.floor(intervals.length * .95)],
    over50ms: intervals.filter(value => value > 50).length, filters, shadowCount, rootBackgrounds });
}
