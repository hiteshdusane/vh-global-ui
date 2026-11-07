import { Boxes, Droplets, Filter, Layers, Leaf, Sun, Palmtree } from "lucide-react";

const stages = [
  { title: "Coconut harvesting", icon: Palmtree, image: "harvest", alt: "Illustration of mature coconuts growing among green palm fronds", description: "The journey begins with mature coconuts. After harvesting, their husks become the raw material for coir fibre and cocopeat." },
  { title: "Husk collection", icon: Leaf, image: "husks", alt: "Illustration of collected coconut husks and loose coir pith in a processing shed", description: "Coconut husks are collected and brought together for processing, giving this natural agricultural by-product a new purpose." },
  { title: "Fibre & pith separation", icon: Layers, image: "separation", alt: "Illustration of coir fibres and fine pith separated by processing equipment", description: "Mechanical extraction separates the longer coir fibres from the finer pith. The collected pith forms the basis of cocopeat growing media." },
  { title: "Washing", icon: Droplets, image: "washing", alt: "Illustration of coir pith being rinsed in a shallow washing basin", description: "The pith is washed with water to help reduce soluble salts. Washing requirements depend on the intended product specification." },
  { title: "Drying", icon: Sun, image: "drying", alt: "Illustration of cocopeat spread in shallow beds across a sunlit drying yard", description: "Washed pith is spread across drying areas to reduce moisture and prepare the material for screening and compression." },
  { title: "Screening & grading", icon: Filter, image: "screening", alt: "Illustration of fine coir pith passing through a grading sieve", description: "Dried pith passes through screens to separate coarse material and obtain the required particle size for the selected growing medium." },
  { title: "Block compression", icon: Boxes, image: "blocks", alt: "Illustration of compressed cocopeat blocks beside a hydraulic press", description: "Prepared cocopeat is pressed into compact blocks for easier storage and handling. Adding water later expands the blocks into loose growing media." },
];

export default function CocopeatProduction() {
  return (
    <section id="production-process" className="production-section mb-8" aria-labelledby="production-heading">
      <div className="mb-8 sm:mb-12 mt-10 sm:mt-14">
        <span className="section-label">From coconut to cultivation</span>
        <h2 id="production-heading" className="text-3xl sm:text-4xl font-bold mb-4">Cocopeat Production Process</h2>
        <p className="text-gray-500 leading-relaxed max-w-3xl">From the coconut palm to ready-to-hydrate growing media, explore each stage of the cocopeat production journey.</p>
      </div>

      <ol className="production-timeline" aria-label="Cocopeat production stages">
        {stages.map(({ title, icon: Icon, image, alt, description }, index) => (
          <li key={image} className="production-stage">
            <figure className="glass-panel production-stage-photo">
              <img src={`/images/cocopeat-process-${image}.webp`} width={1536} height={1024} loading="lazy" decoding="async" alt={alt} />
              <figcaption className="production-photo-label">{String(index + 1).padStart(2, "0")} / {title}</figcaption>
            </figure>
            <span className="production-milestone" aria-hidden="true"><Icon className="w-6 h-6" /></span>
            <div className="glass-panel feature-card production-stage-copy">
              <span className="production-stage-label">Step {String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{title}</h3>
              <p className="text-gray-500 leading-relaxed">{description}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs text-gray-500 leading-relaxed mt-6">Production images are illustrative. Process overview based on <a href="https://coirboard.gov.in/wp-content/uploads/2019/11/KRISHNAGIRI-DPR-WRITEUP-2018.pdf" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-emerald-700">Coir Board guidance</a>; processing details depend on the selected product.</p>
    </section>
  );
}
