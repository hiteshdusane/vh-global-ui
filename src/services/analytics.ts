type AnalyticsParameters = Record<string, string | number | boolean>;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";
const debug = import.meta.env.VITE_GA_DEBUG === "true";
let initialized = false;
let lastPage = "";

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
  name: "enquiry_open" | "enquiry_submitted" | "contact_click",
  parameters: AnalyticsParameters,
) {
  if (!initializeAnalytics()) return;
  send("event", name, {
    ...parameters,
    send_to: measurementId,
    page_location: `${window.location.origin}${window.location.pathname}`,
  });
}
