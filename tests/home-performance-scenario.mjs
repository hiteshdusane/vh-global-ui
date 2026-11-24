export async function homeScenario(width, scrollOnly = false, disableBackdrop = false, headerOnly = false) {
    if (disableBackdrop) {
      // Diagnostic ablation only; never changes production CSS.
      const style = document.createElement('style');
      const selector = headerOnly === 'details'
        ? '.home-photo-tag, .home-image-caption, .home-floating-note, .home-story-image-label, .home-contact-button'
        : headerOnly === 'panels'
        ? '.rich-header .header-bar, .home-image-frame, .home-collection-toolbar, .home-page .collection-card.glass-panel, .home-story-glass, .home-benefit-card, .home-contact-glass, .site-footer.footer-rich, .footer-nav-panel, .footer-rich .footer-contact-link'
        : headerOnly ? '.rich-header .header-bar' : '*, *::before, *::after';
      style.textContent = selector + ' { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }';
      if (['decor', 'animation', 'perspective'].includes(headerOnly)) {
        style.id = 'vhn-static-decor-test';
        style.textContent = (headerOnly !== 'perspective' ? '.home-ambient, .home-floating-note, .home-contact-orbit { animation: none !important; }' : '') +
          (headerOnly !== 'animation' ? '.home-hero-visual { perspective: none !important; } .home-image-frame { transform: none !important; }' : '');
      }
      document.head.append(style);
    }
    const frame = () => new Promise(requestAnimationFrame);
    const deadline = performance.now() + 15000;
    while (!document.querySelector('.home-hero-photo img')?.naturalWidth) {
      if (performance.now() > deadline) throw new Error('Hero did not load');
      await frame();
    }
    await document.fonts.ready;
    while (document.querySelector('.home-product-skeleton')) {
      if (performance.now() > deadline) throw new Error('Product request did not settle');
      await frame();
    }
    for (let i = 0; i < 60; i++) await frame();
    const intervals = [];
    let previous = await frame();
    const start = previous;
    while (previous - start < 2500) {
      window.scrollTo({ top: (previous - start) * 0.8, behavior: 'instant' });
      const now = await frame();
      intervals.push(now - previous);
      previous = now;
    }
    intervals.sort((a, b) => a - b);
    const overflow = document.documentElement.scrollWidth > innerWidth;
    const products = document.querySelectorAll('.collection-card').length;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const navigation = document.querySelector('[aria-controls="mobile-navigation"]');
    if (navigation && getComputedStyle(navigation).display !== 'none' && width < 640) {
      navigation.click();
      for (let i = 0; i < 30; i++) await frame();
      if (!document.querySelector('#mobile-navigation')) throw new Error('Mobile menu did not open');
      navigation.click();
    }
    const images = [...document.querySelectorAll('.home-hero-photo img')];
    let transitionFrames = 0;
    for (const index of scrollOnly ? [] : [0, 1, 2, 0, 2]) {
      document.querySelectorAll('.home-scene-selector button')[index].click();
      for (let i = 0; i < 45; i++) {
        await frame();
        transitionFrames++;
        if (![...document.querySelectorAll('.home-hero-photo img')].some(image => image.naturalWidth && +getComputedStyle(image).opacity > 0.99)) throw new Error('Uncovered transition frame');
      }
      if (![...document.querySelectorAll('.home-hero-photo img')].some(image => image.naturalWidth && +getComputedStyle(image).opacity > 0.99)) throw new Error('No opaque hero image');
    }
    if (images.some((image, index) => image !== document.querySelectorAll('.home-hero-photo img')[index])) throw new Error('Hero image nodes changed');
    const glass = Object.fromEntries(['.home-image-frame', '.home-image-caption', '.header-bar'].map(selector => [selector, getComputedStyle(document.querySelector(selector)).backdropFilter]));
    const routes = [];
    if (!scrollOnly) {
      const enquire = document.querySelector('.collection-card-actions button');
      if (enquire) {
        enquire.click();
        const dialogDeadline = performance.now() + 5000;
        while (!document.querySelector('.product-enquiry-dialog')) {
          if (performance.now() > dialogDeadline) throw new Error('Enquiry dialog did not open');
          await frame();
        }
        if (CSS.supports('-moz-appearance', 'none')) {
          for (const element of document.querySelectorAll('.modal-backdrop, .modal-panel')) {
            const style = getComputedStyle(element);
            if (style.backdropFilter !== 'none' || style.boxShadow !== 'none') throw new Error('Firefox dialog retained glass effects');
          }
        }
        document.querySelector('[aria-label="Close enquiry"]').click();
        await frame();
        if (document.querySelector('.product-enquiry-dialog')) throw new Error('Enquiry dialog did not close');
      }
      for (const [path, selector] of [['/products', '.catalog-rich'], ['/about', '.company-page'], ['/contact', '.contact-rich']]) {
        document.querySelector('a[href="' + path + '"]').click();
        const routeDeadline = performance.now() + 5000;
        while (location.pathname !== path || !document.querySelector(selector)) {
          if (performance.now() > routeDeadline) throw new Error('Navigation failed: ' + path);
          await frame();
        }
        for (let i = 0; i < 20; i++) await frame();
        if (document.documentElement.scrollWidth > innerWidth) throw new Error('Horizontal overflow: ' + path);
        routes.push(path);
      }
      const topics = document.querySelectorAll('.contact-topic-picker button');
      topics[1].click();
      await frame();
      if (topics[1].getAttribute('aria-pressed') !== 'true' || topics[0].getAttribute('aria-pressed') !== 'false') throw new Error('Contact topic selection failed');
      if (getComputedStyle(topics[1]).backgroundColor === getComputedStyle(topics[0]).backgroundColor) throw new Error('Contact selected state is not visually distinct');
    }
    return JSON.stringify({ viewport: innerWidth, products, overflow, glass, routes, transitionFrames, frames: intervals.length, p50: intervals[Math.floor(intervals.length * .5)], p95: intervals[Math.floor(intervals.length * .95)], over33ms: intervals.filter(value => value > 33.4).length });
}
