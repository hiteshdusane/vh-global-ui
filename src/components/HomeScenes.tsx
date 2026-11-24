import { useEffect, useRef, useState } from "react";

type Scene = { image: string; alt: string };

// Keep decoded DOM images mounted and an opaque base under each incoming image.
// React 18 forwards the lowercase fetchpriority attribute without a DOM warning.
export default function HomeScenes({ scenes, selected, reducedMotion }: {
  scenes: readonly Scene[]; selected: number; reducedMotion: boolean;
}) {
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const initialSelected = useRef(selected);
  const [ready, setReady] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [layers, setLayers] = useState<{ displayed: number | null; incoming: number | null }>({ displayed: null, incoming: null });

  useEffect(() => {
    let cancelled = false;
    const cleanups = images.current.map((image, index) => {
      if (!image) return () => {};
      let started = false;
      const fail = () => { if (!cancelled) setFailed(previous => new Set(previous).add(index)); };
      const decode = async () => {
        if (started) return;
        started = true;
        try {
          await image.decode();
          if (!image.naturalWidth) throw new Error("Image unavailable");
          if (!cancelled) setReady(previous => new Set(previous).add(index));
        } catch { fail(); }
      };
      image.addEventListener("load", decode);
      image.addEventListener("error", fail);
      if (image.complete) void decode();
      return () => { image.removeEventListener("load", decode); image.removeEventListener("error", fail); };
    });
    return () => { cancelled = true; cleanups.forEach(cleanup => cleanup()); };
  }, []);

  useEffect(() => {
    if (!ready.has(selected)) return;
    if (!reducedMotion && layers.displayed !== null && layers.displayed !== selected && layers.incoming === null) {
      // Establish a hidden start style when rapidly returning to the base layer.
      const image = images.current[selected];
      if (image) void getComputedStyle(image).opacity;
    }
    setLayers(previous => {
      if (reducedMotion) return previous.displayed === selected && previous.incoming === null ? previous : { displayed: selected, incoming: null };
      if (previous.incoming !== null || previous.displayed === selected) return previous;
      return previous.displayed === null ? { displayed: selected, incoming: null } : { ...previous, incoming: selected };
    });
  }, [selected, ready, reducedMotion, layers.displayed, layers.incoming]);

  return <>
    {scenes.map((scene, index) => <img key={scene.image} ref={image => { images.current[index] = image; }}
      src={`/images/cocopeat-process-${scene.image}.webp`} width={1536} height={1024} alt={scene.alt}
      aria-hidden={(layers.incoming ?? layers.displayed) !== index} decoding="async"
      loading="eager" {...{ fetchpriority: index === initialSelected.current ? "high" : "low" }}
      style={{ opacity: layers.displayed === index || layers.incoming === index ? 1 : 0,
        zIndex: layers.incoming === index ? 1 : 0,
        transition: layers.incoming === index && !reducedMotion ? "opacity 550ms ease-in-out" : "none" }}
      onTransitionEnd={event => {
        if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
        setLayers(previous => previous.incoming === index ? { displayed: index, incoming: null } : previous);
      }} />)}
    {failed.has(selected) && <span className="home-scene-error" role="status">This illustration could not be loaded. Please choose another scene.</span>}
  </>;
}
