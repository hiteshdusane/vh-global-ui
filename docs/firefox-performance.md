# Firefox performance investigation

## Mobile glass follow-up

The user confirmed the Firefox issue is resolved. `GlassEffects` adds brief,
panel-local reflections on first scroll into view, touch, and control activation,
plus stronger static mobile surfaces and selected tabs. It preserves the opaque
Firefox fallback, including zero backdrop filters, ordinary filters, and shadows.
Firefox reflections use a solid translucent band; reduced-motion users receive
static styling. Observers, transient nodes, and timers are cleaned up on navigation.
The investigation below records the earlier troubleshooting and its limitations.

Updated 2026-11-24. Changes are local; nothing has been deployed to vhnglobal.com. The user's repeated report of lag takes precedence over reassuring median frame times from short headless tests. Smooth scrolling in the user's normal Firefox window is not yet established.

## Latest change: opaque Firefox theme

The user confirmed continued lag on localhost, including after the earlier gradient-based fallback. Firefox now uses solid white panels on a plain pale-green background. `src/firefox.css` removes all backdrop filters, ordinary filters, box shadows, and text shadows throughout the application, pseudo-elements, and portaled dialogs. Page-sized gradients and decorative glows/orbits are removed; major panels, captions, fields, navigation, and footer surfaces are opaque. Selected controls keep a green fill and border, and keyboard focus uses an explicit outline. Layout, imagery, carousel behavior, and business functionality remain. Chrome and Edge retain the original glass theme.

The latest four-page audit asserts zero active filters, zero box shadows, and no background images on the page roots. All assertions passed. Warm p95 frame intervals were approximately 16.68 ms on Home, Products, About, and Contact. Initial samples still had roughly 50?67 ms p95 intervals on Home, Products, and Contact, so this is not a claim that every first-load frame is smooth. The new local profile (`C:\Users\hdusa\AppData\Local\Temp\vhn-firefox-profile-1795461288178.json`) recorded approximately 9,880 ms Renderer CPU and 5,547 ms site main-thread CPU. Earlier captures recorded 23,245 ms and 18,063 ms Renderer CPU. These captures include different startup/screenshot work and are indicative rather than normalized benchmarks.

Reviewed flat-theme screenshots in the temporary directory: `vhn-firefox-home-1795461268642.png`, `vhn-firefox-products-1795461275167.png`, `vhn-firefox-about-1795461281523.png`, and `vhn-firefox-contact-1795461288173.png`. Home and Contact were visually checked for readability and layout. The browser smoke scenario additionally checks enquiry dialog open/close and visible selected states on Contact. The normal Firefox window's smoothness remains for user acceptance; the profiler browser is headless and uses software WebRender.

## Confirmed findings

The application uses React 18, Vite, Tailwind, Framer Motion, and TanStack Query. A native Gecko Profiler capture was collected through an isolated Firefox WebDriver BiDi session, using the browser's privileged profiler API. Its sample units confirm that thread CPU deltas are nanoseconds. During the all-page capture, the Renderer thread consumed approximately **23,245 ms of CPU**, compared with **1,860 ms** on the site's isolated content main thread. This identifies rendering as the dominant cost in this test, rather than a general React scripting bottleneck. Native stacks were not symbolicated, so exact native functions have not been attributed.

The test browser explicitly reports `webrender_software`, with hardware compositing blocked because it is headless. That is an important limitation: it does not establish the graphics configuration of the user's normal Firefox window. The requested `about:support` value was unavailable, and browser settings have not been changed.

Computed-style audits confirmed substantial live backdrop filtering beyond the homepage: seven large product cards, full-width catalog panels, About feature/specification panels, and a Contact form measuring approximately **720 × 1,027px** with a 30px blur. Smaller photo overlays and dropdowns added more filters. Diagnostic test-page overrides removing backdrop filters improved many samples, including an initial Contact p95 interval from roughly 417 ms to 17 ms. Warm repeats sometimes also improved without the override, demonstrating caching and timing effects; those numbers are not a statistically controlled guarantee.

Additional code-confirmed costs were animated 650px blurred backgrounds; continuous floating decoration and a perspective hero frame; fading an entire tall page as one surface; per-pointer-event layout reads; a homepage image replacement that faded before decoding; eager loading/decoding of seven below-the-fold production images; width-based progress animation; a 3.11 MB illustration; redundant footer filters; and an icon package excluded from Vite dependency optimization.

A same-session normal/static/normal hero experiment isolated the combination of continuously moving decoration and perspective: median intervals were approximately 183 ms / 17 ms / 133 ms while photo-caption blur stayed enabled. This supported the earlier decorative fallback, but it did not resolve the subsequent report of all-page lag.

No continuous application scroll listeners were found. Route scrolling already uses requestAnimationFrame, reveals use IntersectionObserver or Framer Motion viewport observation, and query results are cached for five minutes. There is no profile evidence supporting broad React memoization or backend changes.

## Final implementation and files

- **`src/firefox.css`**, imported last by **`src/main.tsx`**: apply the opaque Firefox theme described above, including dialogs, while preserving dimensions, controls, focus outlines, and selected states. Remove the whole-page fade and large decorative surfaces. Ordinary browser behavior, dimensions, and page structure are preserved. Chrome and Edge retain their live glass effects.
- **`src/pages/Home.css`**, **`src/pages/Home.tsx`**: remove the redundant ambient filter and permanent layer hint; make continuous decoration static and the hero frame flat in Firefox; preserve section reveals, hover behavior, and carousel crossfades. Batch pointer reads/updates to one animation frame in browsers that retain tilt, and cancel pending work on leave/unmount.
- **`src/components/HomeScenes.tsx`**: keep persistent decoded image nodes and an opaque outgoing layer; handle rapid selections, failures, cached images, and reduced motion without exposing an empty carousel frame.
- **`src/components/CocopeatProduction.tsx`**: use scaleX for progress; lazily load inline carousel images near the viewport, while modal preview images remain eager. Preserve the existing decoded-image layering and its transition-start computed-style read.
- **`src/components/Header.css`**, **`src/components/Footer.css`**: Firefox structural fallbacks, plus removal of filters hidden behind opaque footer fills.
- **`src/pages/About.tsx`**, **`src/pages/Products.tsx`**, **`src/pages/Contact.tsx`**, **`HomeScenes.tsx`**: forward the lowercase `fetchpriority` attribute that React 18 accepts, removing the console warning shown in the screenshot.
- **`public/images/cocopeat-drying-yard.webp`**, **Home/Contact image references**: use a quality-88 WebP at the original 1536 × 1024 dimensions, reduced from **3,106,901 to 426,600 bytes (86.3%)**. The original PNG remains available.
- **`vite.config.ts`**: prebundle `lucide-react`. This fixes the development blank page caused by an individual icon module failing to load and avoids serving the icon barrel as a large graph of separate modules.
- **`Caddyfile`**: immutable one-year caching for hashed Vite assets and one-day caching for unversioned images. These headers apply only when hosting uses this configuration; use a new image filename for immediate cache invalidation.
- **`tests/home-scenes.test.mjs`**, **`tests/firefox-performance.browser.mjs`**, **`tests/firefox-rendering-scenario.mjs`**, **`tests/chromium-performance.browser.mjs`**, **`tests/home-performance-scenario.mjs`**: decode/failure/selection coverage, native profile capture, all-page rendering diagnostics, console checks, screenshots, and browser regression checks without additional dependencies.

The broad Firefox fallback is justified by the all-page rendering profile and ablation tests after narrower changes failed to resolve the user's report. It changes live blur computation in Firefox, not the site layout or business logic. The latest Firefox appearance is deliberately flat and opaque rather than pixel-identical to the glass theme.

## Validation and practical limits

The bundled local preview uses production React with the working local API configuration (`vite build --mode development`); it renders seven products. A separate normal production build is also checked. Repository environment files were not changed; the user's pre-existing `.env.local` modifications remain intact.

All **21 unit tests** pass. Changed-file ESLint and whitespace checks pass. Full-project lint still has eight pre-existing errors and one warning in `src/api/client.ts`, `ProductModal.tsx`, and `ProductDetail.tsx`; the separate TypeScript check previously reported six pre-existing unused declarations. Browserslist reports an outdated dataset.

Firefox desktop/mobile checks passed navigation, no horizontal overflow, persistent image identities, and coverage on all **225 sampled hero transition frames**. After inline production images became lazy, the existing Chrome production-preview carousel check passed with **162 sampled frames**, no failures, and stable nodes. Chrome mobile and Edge desktop checks passed with their original glass effects retained. Home, Products, About, and Contact screenshots were visually reviewed in Firefox; the frosted gradients, photo captions, readable text, and layouts remain intact.

The first all-page fallback capture reduced Renderer CPU to approximately **18,063 ms**, with site main-thread CPU around **2,667 ms**. These captures include diagnostic stages and browser startup work and are not normalized benchmarks. Later follow-ups removed the parent fade and deferred production images.

Some warm samples approach 16.7 ms intervals; **cold-load and first-scroll outliers above 200 ms still occurred in headless tests even with page filters removed**. The final screenshot run also showed a slow initial Contact sample followed by fast warm repeats. These results do not prove stutter-free real-device performance. They are requestAnimationFrame callback samples, not physical frame-drop or input-latency measurements. The real user's report remains the final acceptance criterion.

Local evidence files, not uploaded:

- Before capture: `C:\Users\hdusa\AppData\Local\Temp\vhn-firefox-profile-1795374802835.json`
- Initial all-page fallback capture: `C:\Users\hdusa\AppData\Local\Temp\vhn-firefox-profile-1795374963244.json`
- Reviewed screenshots: `vhn-firefox-home-1795375170903.png`, `vhn-firefox-products-1795375179381.png`, `vhn-firefox-about-1795375187028.png`, and `vhn-firefox-contact-1795375195683.png` in the same temporary directory.

## Reproduction

Use the existing dev server at `http://localhost:5173`, or the bundled preview at `http://localhost:5175` while its process is running. The preview avoids React development/HMR overhead. Set `TEST_URL` to the selected URL, then run:

```text
node --test tests/*.test.mjs
node tests/firefox-performance.browser.mjs
node tests/firefox-performance.browser.mjs --mobile
node tests/firefox-performance.browser.mjs --render-audit --profile
node tests/firefox-performance.browser.mjs --render-audit --screenshots
node tests/chromium-performance.browser.mjs --mobile
```

`CHROME_PATH` can select Edge; `FIREFOX_PATH` selects Firefox. Temporary overrides such as `--disable-backdrop` are diagnostic only. `--compare-decor` and `--isolate-decor` compare against current application styles, which already include the fallback. The profiler API follows Mozilla's [nsIProfiler interface](https://raw.githubusercontent.com/mozilla-firefox/firefox/main/tools/profiler/gecko/nsIProfiler.idl); privileged automation follows Mozilla's [WebDriver BiDi chrome-context documentation](https://fxdx.dev/firefox-webdriver-newsletter-148/). Native traces stay local.

If the normal Firefox window remains slow, compare the bundled preview with DevTools closed, then capture a normal-window Firefox Graphics profile while reproducing the exact scroll/menu/form interaction. The hardware rendering path, extensions, and cold image decoding remain possible contributors; none has been confirmed for the user's window. Forms were not submitted during browser testing, and live backend workflows are not exhaustively covered.
