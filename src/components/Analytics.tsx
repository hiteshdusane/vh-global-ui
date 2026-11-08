import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent, trackPageView } from "../services/analytics";

const redirects = new Set(["/company", "/cocopeat-spec", "/cocopeat-specs"]);

export default function Analytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!redirects.has(pathname)) trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const trackContactClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const href = event.target.closest("a")?.getAttribute("href");
      if (href?.startsWith("mailto:") || href?.startsWith("tel:")) {
        trackEvent("contact_click", { contact_method: href.startsWith("mailto:") ? "email" : "phone" });
      }
    };
    document.addEventListener("click", trackContactClick);
    return () => document.removeEventListener("click", trackContactClick);
  }, []);

  return null;
}
