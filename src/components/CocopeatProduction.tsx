import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Boxes, Droplets, Filter, Layers, Leaf, Maximize2, Sun, Palmtree, X } from "lucide-react";
import ModalBackdrop from "./ModalBackdrop";

const stages = [
  { title: "Coconut harvesting", icon: Palmtree, image: "harvest", alt: "Illustration of mature coconuts growing among green palm fronds", description: "The journey begins with mature coconuts. After harvesting, their husks become the raw material for coir fibre and cocopeat." },
  { title: "Husk collection", icon: Leaf, image: "husks", alt: "Illustration of collected coconut husks and loose coir pith in a processing shed", description: "Coconut husks are collected and brought together for processing into coir fibre and growing media." },
  { title: "Fibre & pith separation", icon: Layers, image: "separation", alt: "Illustration of coir fibres and fine pith separated by processing equipment", description: "Mechanical extraction separates the longer coir fibres from the finer pith. The collected pith forms the basis of cocopeat growing media." },
  { title: "Washing", icon: Droplets, image: "washing", alt: "Illustration of coir pith being rinsed in a shallow washing basin", description: "The pith is washed with water to help reduce soluble salts. Washing requirements depend on the intended product specification." },
  { title: "Drying", icon: Sun, image: "drying", alt: "Illustration of cocopeat spread in shallow beds across a sunlit drying yard", description: "Washed pith is spread across drying areas to reduce moisture and prepare the material for screening and compression." },
  { title: "Screening & grading", icon: Filter, image: "screening", alt: "Illustration of fine coir pith passing through a grading sieve", description: "Dried pith passes through screens to separate coarse material and obtain the required particle size for the selected growing medium." },
  { title: "Block compression", icon: Boxes, image: "blocks", alt: "Illustration of compressed cocopeat blocks beside a hydraulic press", description: "Prepared cocopeat is pressed into compact blocks for easier storage and handling. Adding water later expands the blocks into loose growing media." },
];

const outcomes = [
  "Coconut husks begin their next chapter.",
  "Collected husks become the starting material.",
  "Coir fibre and cocopeat pith take separate paths.",
  "Washing prepares the pith for the selected specification.",
  "Reduced moisture prepares the material for the next stage.",
  "Screened material is selected for the growing medium.",
  "Compact blocks are ready for storage and hydration.",
];

function ProductionImages({ step, preview = false }: { step: number; preview?: boolean }) {
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const [ready, setReady] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [layers, setLayers] = useState<{ displayed: number | null; incoming: number | null }>({ displayed: null, incoming: null });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    const cleanups = images.current.map((image, index) => {
      if (!image) return () => {};
      let started = false;
      const fail = () => {
        if (!cancelled) setFailed((previous) => new Set(previous).add(index));
      };
      const decode = async () => {
        if (started) return;
        started = true;
        try {
          // Decode the persistent DOM image itself, rather than a detached copy
          // whose replacement would still need to be painted after mounting.
          if (typeof image.decode === "function") await image.decode();
          if (!image.naturalWidth) throw new Error("Image unavailable");
          if (!cancelled) setReady((previous) => new Set(previous).add(index));
        } catch {
          fail();
        }
      };
      image.addEventListener("load", decode);
      image.addEventListener("error", fail);
      if (image.complete) void decode();
      return () => {
        image.removeEventListener("load", decode);
        image.removeEventListener("error", fail);
      };
    });
    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    if (!ready.has(step)) return;
    if (layers.incoming === null && layers.displayed !== null && layers.displayed !== step && !reducedMotion) {
      const layer = images.current[step]?.parentElement;
      // A rapid return to the outgoing image can hide and reveal it within one
      // browser frame. Commit its hidden style before revealing it, otherwise
      // no CSS transition (and therefore no transitionend) would be generated.
      if (layer) void window.getComputedStyle(layer).opacity;
    }
    setLayers((previous) => {
      // Finish the current blend before starting the latest requested step.
      // Intermediate selections never queue up or overwrite a newer request.
      if (reducedMotion) return previous.displayed === step && previous.incoming === null ? previous : { displayed: step, incoming: null };
      if (previous.incoming !== null || previous.displayed === step) return previous;
      if (previous.displayed === null) return { displayed: step, incoming: null };
      return { ...previous, incoming: step };
    });
  }, [step, ready, reducedMotion, layers.incoming, layers.displayed]);

  const visibleStep = layers.incoming ?? layers.displayed;
  return (
    <span className={preview ? "production-preview-image production-image-layers" : "production-image-layers"}>
      {stages.map((stage, index) => {
        const incoming = layers.incoming === index;
        const displayed = layers.displayed === index;
        return (
          <span key={stage.image} className="production-feature-image"
            aria-hidden={visibleStep !== index}
            // Keep stacking and opacity in the same DOM commit. A motion value
            // updates opacity on a later frame and can expose the outgoing layer
            // when React resets the completed incoming layer's z-index first.
            style={{ opacity: incoming || displayed ? 1 : 0, zIndex: incoming ? 1 : 0,
              transition: incoming && !reducedMotion ? "opacity 400ms ease-in-out" : "none" }}
            onTransitionEnd={(event) => {
              if (!incoming || event.target !== event.currentTarget || event.propertyName !== "opacity") return;
              setLayers((previous) => previous.incoming === index ? { displayed: index, incoming: null } : previous);
            }}>
            <img ref={(image) => { images.current[index] = image; }}
              src={`/images/cocopeat-process-${stage.image}.webp`} width={1536} height={1024}
              alt={stage.alt} loading="eager" decoding="async" />
          </span>
        );
      })}
      {failed.has(step) && <span className="production-image-error" role="status">This illustration could not be loaded.{visibleStep !== null ? " Showing the previous illustration." : " Please choose another step."}</span>}
    </span>
  );
}

export default function CocopeatProduction() {
  const [activeStep, setActiveStep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const stage = stages[activeStep];
  const Icon = stage.icon;
  const stepNumber = String(activeStep + 1).padStart(2, "0");
  const controls = (
    <div className="production-controls">
      <button type="button" className="production-arrow" disabled={activeStep === 0} onClick={() => setActiveStep((step) => step - 1)} aria-label="Previous production step"><ArrowLeft className="w-5 h-5" aria-hidden="true" /></button>
      <span>Step <strong>{stepNumber}</strong> / {String(stages.length).padStart(2, "0")}</span>
      <button type="button" className="production-arrow" disabled={activeStep === stages.length - 1} onClick={() => setActiveStep((step) => step + 1)} aria-label="Next production step"><ArrowRight className="w-5 h-5" aria-hidden="true" /></button>
    </div>
  );

  return (
    <section id="production-process" className="production-section mb-8" aria-labelledby="production-heading">
      <div className="mb-8 sm:mb-12 mt-10 sm:mt-14">
        <span className="section-label">From coconut to cultivation</span>
        <h2 id="production-heading" className="text-3xl sm:text-4xl font-bold mb-4">Cocopeat Production Process</h2>
        <p className="text-gray-500 leading-relaxed max-w-3xl">Follow the journey from coconut palm to ready-to-hydrate growing media. Choose a step to explore the process, or open an image for a closer look.</p>
      </div>

      <div className="production-explorer glass-panel">
        <div className="production-glow production-glow-green" aria-hidden="true" />
        <div className="production-glow production-glow-gold" aria-hidden="true" />
        <div className="production-feature">
          <button type="button" className="production-image-surface" onClick={() => setPreviewOpen(true)} aria-label={`Enlarge illustration: ${stage.title}`}>
            <ProductionImages step={activeStep} />
            <span className="production-image-topline"><span className="production-image-pill"><Leaf className="w-3.5 h-3.5" aria-hidden="true" /> A natural transformation</span><span className="production-zoom"><Maximize2 className="w-4 h-4" aria-hidden="true" /></span></span>
            <span className="production-image-caption"><span className="production-image-number">{stepNumber}</span><span><span className="production-image-eyebrow">Explore the process</span><strong>{stage.title}</strong></span><ArrowRight className="w-5 h-5" aria-hidden="true" /></span>
          </button>

          <div id="production-stage-details" className="production-detail">
            <div className="production-detail-top"><span className="production-stage-label">The making of cocopeat</span><span className="production-step-count">{stepNumber} <span>/ 07</span></span></div>
            <div className="production-detail-content" aria-live="polite" aria-atomic="true">
              <motion.div key={stage.image} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.3 }}>
                <span className="production-detail-icon"><Icon className="w-7 h-7" aria-hidden="true" /></span>
                <h3>{stage.title}</h3>
                <p className="production-description">{stage.description}</p>
                <div className="production-outcome"><span aria-hidden="true" /><p>{outcomes[activeStep]}</p></div>
              </motion.div>
            </div>
            <div className="production-detail-footer">
              <div className="production-progress" aria-hidden="true"><motion.span animate={{ width: `${((activeStep + 1) / stages.length) * 100}%` }} transition={{ duration: reducedMotion ? 0 : 0.35 }} /></div>
              {controls}
            </div>
          </div>
        </div>

        <div className="production-steps-heading"><span className="production-stage-label">Seven steps, one journey</span><span>Select a stage below</span></div>
        <ol className="production-step-picker" aria-label="Choose a cocopeat production stage">
          {stages.map(({ title, image }, index) => (
            <li key={image}>
              <motion.button type="button" className="production-step-button" aria-pressed={activeStep === index} aria-controls="production-stage-details"
                onClick={() => setActiveStep(index)} whileHover={reducedMotion ? undefined : { y: -4 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
                <span className="production-step-thumbnail"><img src={`/images/cocopeat-process-${image}.webp`} width={1536} height={1024} alt="" loading="lazy" decoding="async" /><span>{String(index + 1).padStart(2, "0")}</span></span>
                <span className="production-step-title">{title}</span>
                <span className="production-step-indicator" aria-hidden="true" />
              </motion.button>
            </li>
          ))}
        </ol>
      </div>

      {previewOpen && <ModalBackdrop onClose={() => setPreviewOpen(false)} className="production-preview-backdrop">
        <div role="dialog" aria-modal="true" aria-labelledby="production-preview-heading" className="glass-panel modal-panel production-preview">
          <div className="production-preview-heading"><div><span className="production-stage-label">A closer look · Step {stepNumber}</span><h3 id="production-preview-heading">{stage.title}</h3></div><button type="button" className="production-arrow" onClick={() => setPreviewOpen(false)} aria-label="Close production image preview"><X className="w-5 h-5" /></button></div>
          <ProductionImages step={activeStep} preview />
          <p className="production-preview-description" aria-live="polite">{stage.description}</p>
          {controls}
        </div>
      </ModalBackdrop>}

      <p className="text-xs text-gray-500 leading-relaxed mt-6">Production images are illustrative. Process overview based on <a href="https://coirboard.gov.in/wp-content/uploads/2019/11/KRISHNAGIRI-DPR-WRITEUP-2018.pdf" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-emerald-700">Coir Board guidance</a>; processing details depend on the selected product.</p>
    </section>
  );
}
