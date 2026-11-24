export async function glassScenario(width, navigationTheme = false) {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const until = async predicate => {
    const deadline = performance.now() + 10000;
    while (!predicate()) {
      check(performance.now() < deadline, 'Timed out waiting for glass interaction');
      await wait(50);
    }
  };
  await until(() => document.querySelector('.home-scene-selector button'));
  await wait(1000);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = document.querySelectorAll('.home-scene-selector button');
  scenes[1].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', isPrimary: true, button: 0 }));
  check(!!scenes[1].querySelector('.glass-reflection') === !reduced, 'Touch reflection must respect motion preference');
  scenes[1].click();
  await until(() => scenes[1].getAttribute('aria-pressed') === 'true');
  check(scenes[1].getAttribute('aria-pressed') === 'true', 'Scene selection must remain functional');
  await wait(1000);
  check(!document.querySelector('.glass-reflection'), 'Transient reflections must clean up');
  scenes[2].click();
  check(!!scenes[2].querySelector('.glass-reflection') === !reduced, 'Keyboard/programmatic activation also gets feedback');
  await wait(1000);
  const benefit = document.querySelector('.home-benefit-card');
  benefit.scrollIntoView({ block: 'center', behavior: 'instant' });
  await wait(150);
  check(!!benefit.querySelector('.glass-reflection') === !reduced, 'Scroll must reveal a reflection without hover');
  const reflectionStyle = benefit.querySelector('.glass-reflection') ? getComputedStyle(benefit.querySelector('.glass-reflection'), '::after').animationName : 'none';
  check(reduced || reflectionStyle === 'glass-reflect', 'Reflection animation must be styled');
  await wait(1000);
  window.scrollTo({ top: 0, behavior: 'instant' });
  const menu = document.querySelector('[aria-controls="mobile-navigation"]');
  if (width < 640) {
    menu.click();
    await until(() => document.querySelector('#mobile-navigation .mobile-menu-link'));
    await wait(100);
    check(!!document.querySelector('#mobile-navigation .glass-reflection') === !reduced, 'Dynamically mounted mobile menu gets a reflection');
    document.querySelector('#mobile-navigation a[href="/products"]').click();
  } else document.querySelector('nav[aria-label="Main navigation"] a[href="/products"]').click();
  await until(() => document.querySelector('.catalog-discovery'));
  await wait(1000);
  check(!document.querySelector('#mobile-navigation'), 'Navigation must close the menu');
  const category = document.querySelector('.catalog-main-filters button');
  if (category) {
    category.click();
    check(!!category.querySelector('.glass-reflection') === !reduced, 'Filter tabs get feedback after route navigation');
  }
  // Contact topics exercise the same selected-control treatment even when
  // the separately hosted catalog API is unavailable in a local preview.
  document.querySelector('.catalog-advice-link').click();
  await until(() => document.querySelector('.contact-topic-picker button'));
  await wait(1000);
  const topic = document.querySelectorAll('.contact-topic-picker button')[1];
  topic.click();
  check(!!topic.querySelector('.glass-reflection') === !reduced, 'Topic tabs get feedback after route navigation');
  await until(() => topic.getAttribute('aria-pressed') === 'true');
  if (navigationTheme) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector(width < 640 ? '[aria-controls="mobile-navigation"]' : '[aria-controls="product-menu"]').click();
    await until(() => document.querySelector(width < 640 ? '#mobile-navigation' : '.product-mega-menu'));
    await wait(1000);
  }
  const firefox = CSS.supports('-moz-appearance', 'none');
  const filtered = [...document.querySelectorAll('.site-shell, .site-shell *')].filter(element => {
    const style = getComputedStyle(element);
    return style.backdropFilter && style.backdropFilter !== 'none' || style.filter !== 'none' || style.boxShadow !== 'none';
  });
  if (firefox) check(filtered.length === 0, 'Firefox must retain its zero-filter, zero-shadow fallback');
  check(document.documentElement.scrollWidth <= innerWidth, 'No horizontal overflow');
  return JSON.stringify({ width, reduced, firefox, touch: true, selection: true, scrollReflection: true, mobileNavigation: width < 640, routeTopics: true, productFiltersAvailable: !!category, navigationMenu: navigationTheme, firefoxFallback: firefox ? filtered.length === 0 : null });
}
