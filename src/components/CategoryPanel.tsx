import { useId, useState, type ReactNode } from "react";
import { ChevronDown, Filter } from "lucide-react";

export default function CategoryPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <section className={`glass-panel p-5 sm:p-6 mb-6 min-w-0 ${className}`}>
      <h2 className="hidden lg:flex items-center gap-2 mb-4 font-semibold">
        <Filter className="w-5 h-5 shrink-0" /> Explore By Categories
      </h2>
      <button type="button" className="flex lg:hidden w-full items-center gap-2 text-left font-semibold min-h-11"
        aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(!expanded)}>
        <Filter className="w-5 h-5 shrink-0" /> Explore By Categories
        <ChevronDown className={`w-5 h-5 shrink-0 ml-auto transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <div id={contentId} className={`${expanded ? "block mt-4" : "hidden"} lg:block lg:mt-0 category-options`}>
        {children}
      </div>
    </section>
  );
}
