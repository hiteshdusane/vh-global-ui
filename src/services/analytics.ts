type AnalyticsParameters = Record<string, string | number | boolean>;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";
const debug = import.meta.env.VITE_GA_DEBUG === "true";
let initialized = false;
let lastPage = "";

function campaignParameters() {
  const query = new URLSearchParams(window.location.search);
  const parameters: AnalyticsParameters = {};
  for (const [queryKey, field] of [
    ["utm_source", "campaign_source"],
    ["utm_medium", "campaign_medium"],
    ["utm_campaign", "campaign_name"],
  ]) {
    const value = query.get(queryKey);
    // Only short campaign slugs; never forward arbitrary query text.
    if (value && /^[a-zA-Z0-9_-]{1,64}$/.test(value)) parameters[field] = value;
  }
  return parameters;
}

function send(...args: unknown[]) {
  // Analytics must never interrupt navigation or an enquiry if blocked.
  try {
    (window as AnalyticsWindow).gtag?.(...args);
  } catch {
    // Browser extensions can block analytics.
  }
}

function referrerOrigin() {
  try {
    return document.referrer ? new URL(document.referrer).origin : "";
  } catch {
    return "";
  }
}

export function initializeAnalytics(): boolean {
  if (initialized) return true;
  if ((!import.meta.env.PROD && !debug) || !/^G-[A-Z0-9]+$/.test(measurementId)) return false;

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.gtag = analyticsWindow.gtag || function () {
    // Match Google's queue format: gtag.js consumes the Arguments object.
    // eslint-disable-next-line prefer-rest-params
    analyticsWindow.dataLayer!.push(arguments);
  };
  send("js", new Date());
  send("config", measurementId, {
    send_page_view: false,
    page_location: `${window.location.origin}${window.location.pathname}`,
    page_referrer: referrerOrigin(),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    ...campaignParameters(),
    ...(debug ? { debug_mode: true } : {}),
  });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  initialized = true;
  return true;
}

export function trackPageView(pathname: string) {
  if (!initializeAnalytics() || pathname === lastPage) return;
  const pageLocation = `${window.location.origin}${pathname}`;
  send("event", "page_view", {
    send_to: measurementId,
    page_location: pageLocation,
    page_referrer: lastPage ? `${window.location.origin}${lastPage}` : referrerOrigin(),
  });
  // Avoid duplicate initial views from React StrictMode and query-only changes.
  lastPage = pathname;
}

export function trackEvent(
  name: "enquiry_open" | "generate_lead" | "contact_click" | "product_view"
    | "enquiry_start" | "enquiry_attempt" | "enquiry_error" | "scroll_depth",
  parameters: AnalyticsParameters,
) {
  if (!initializeAnalytics()) return;
  send("event", name, {
    ...parameters,
    send_to: measurementId,
    page_location: `${window.location.origin}${window.location.pathname}`,
  });
}

// One start per form lifecycle; attempts/errors can repeat when someone retries.
export function createEnquiryAnalytics(formSource: "contact" | "product", productId?: string) {
  let started = false;
  const context = { form_source: formSource, ...(productId ? { product_id: productId } : {}) };
  const start = () => {
    if (started) return;
    started = true;
    trackEvent("enquiry_start", context);
  };
  return {
    start,
    attempt() {
      start();
      trackEvent("enquiry_attempt", context);
    },
    error(errorType: "validation" | "unavailable" | "unconfirmed") {
      start();
      trackEvent("enquiry_error", { ...context, error_type: errorType });
    },
    confirmed() {
      trackEvent("generate_lead", { ...context, delivery_status: "confirmed" });
      started = false;
    },
  };
}

export function startScrollTracking() {
  const recorded = new Set<number>();
  const onScroll = () => {
    if (document.visibilityState === "hidden") return;
    const height = document.documentElement.scrollHeight;
    // Measure viewport-bottom depth only after scrolling a scrollable page.
    if (height <= window.innerHeight || window.scrollY <= 0) return;
    const depth = Math.min(100, ((window.scrollY + window.innerHeight) / height) * 100);
    for (const percent of [25, 50, 75, 90]) {
      if (depth >= percent && !recorded.has(percent)) {
        recorded.add(percent);
        trackEvent("scroll_depth", { percent_scrolled: percent });
      }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}
