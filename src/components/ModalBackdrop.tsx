import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function ModalBackdrop({ children, onClose, className = "" }: { children: ReactNode; onClose: () => void; className?: string }) {
  const backdrop = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(backdrop.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
    ) ?? []).filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div ref={backdrop} className={`modal-backdrop fixed inset-0 flex items-center justify-center ${className}`} onClick={(event) => {
      if (event.target === event.currentTarget) close.current();
    }}>
      {children}
    </div>, document.body,
  );
}
