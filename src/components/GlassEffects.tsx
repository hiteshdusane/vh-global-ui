import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './GlassEffects.css';

const surfaces = '.home-image-frame, .collection-card, .home-benefit-card, .feature-card, .catalog-hero, .catalog-discovery, .contact-form-panel, .contact-next-card, .rich-mobile-menu, .company-visual, .production-explorer, .home-story-glass, .home-contact-glass';
const controls = '.home-scene-selector button, .home-category-picker button, .catalog-main-filters button, .catalog-sub-filters button, .catalog-views button, .contact-topic-picker button, .production-step-button, .mobile-menu-link, .mobile-menu-toggle, .btn-primary, .btn-secondary, .home-primary';

// Short, local reflections also work on touchscreens. Never animate live blur
// or the entire page, particularly with Firefox's performance fallback.
export default function GlassEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.querySelector('.site-shell');
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const decorated = new Set<HTMLElement>();
    const reflections = new Map<HTMLElement, { light: HTMLSpanElement; timer: number }>();
    const observed = new WeakSet<Element>();

    const clear = (element: HTMLElement) => {
      const reflection = reflections.get(element);
      if (!reflection) return;
      window.clearTimeout(reflection.timer);
      reflection.light.remove();
      reflections.delete(element);
    };
    const reflect = (element: HTMLElement) => {
      if (preference.matches || document.hidden || reflections.has(element)) return;
      element.classList.add('glass-effect-surface');
      decorated.add(element);
      const light = document.createElement('span');
      light.className = 'glass-reflection';
      light.setAttribute('aria-hidden', 'true');
      element.append(light);
      reflections.set(element, { light, timer: window.setTimeout(() => clear(element), 850) });
    };
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reflect(entry.target as HTMLElement);
        observer?.unobserve(entry.target);
      });
    }, { threshold: 0.18 }) : null;

    const register = (node: Element) => {
      const candidates = [...node.querySelectorAll<HTMLElement>(surfaces)];
      if (node.matches(surfaces)) candidates.push(node as HTMLElement);
      candidates.forEach(element => {
        if (observed.has(element)) return;
        observed.add(element);
        observer?.observe(element);
      });
    };
    register(root);
    // Product results and the mobile menu mount after the route has rendered.
    const mutations = new MutationObserver(records => records.forEach(record => {
      record.addedNodes.forEach(node => { if (node instanceof Element) register(node); });
    }));
    mutations.observe(root, { childList: true, subtree: true });

    const onPress = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(controls);
      if (target && !target.matches(':disabled, [aria-disabled="true"]')) reflect(target);
    };
    const onSelection = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(controls);
      if (target && !target.matches(':disabled, [aria-disabled="true"]')) reflect(target);
    };
    const onPreference = () => {
      if (preference.matches) [...reflections.keys()].forEach(clear);
    };
    root.addEventListener('pointerdown', onPress as EventListener);
    root.addEventListener('click', onSelection);
    preference.addEventListener('change', onPreference);
    return () => {
      observer?.disconnect();
      mutations.disconnect();
      root.removeEventListener('pointerdown', onPress as EventListener);
      root.removeEventListener('click', onSelection);
      preference.removeEventListener('change', onPreference);
      [...reflections.keys()].forEach(clear);
      decorated.forEach(element => element.classList.remove('glass-effect-surface'));
    };
  }, [pathname]);

  return null;
}
