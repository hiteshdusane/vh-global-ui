import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export default function PageLayout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  const content = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = content.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    root.querySelectorAll("[data-reveal]").forEach((element) => {
      element.classList.add("reveal-ready");
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return <main ref={content} id="main-content" className="page-content" key={pathname} tabIndex={-1}>{children}</main>;
}
