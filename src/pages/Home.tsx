import { useState, useSyncExternalStore, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, Boxes, Check, Globe2, Layers, Leaf, Play, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import ErrorMessage from "../components/ErrorMessage";
import "./Home.css";

const motionPreference = "(prefers-reduced-motion: reduce)";
const getMotionPreference = () => window.matchMedia(motionPreference).matches;
const subscribeToMotionPreference = (notify: () => void) => {
  const query = window.matchMedia(motionPreference);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

const scenes = [
  { label: "The origin", title: "It starts with a coconut.", image: "harvest", alt: "Illustration of mature coconuts growing on a palm", note: "Rooted in nature", icon: Leaf },
  { label: "The process", title: "A new purpose for every husk.", image: "separation", alt: "Illustration of coconut husks being separated into coir fibre and pith", note: "Shaped with purpose", icon: Layers },
  { label: "The product", title: "Ready for what comes next.", image: "blocks", alt: "Illustration of compressed cocopeat blocks beside a hydraulic press", note: "Made for possibility", icon: Boxes },
];
const benefits = [
  { icon: Sprout, number: "01", title: "A format for your needs.", text: "Cocopeat blocks, bricks, grow bags, loose cocopeat, coco chips, and natural coir ropes. Explore the range that fits your application." },
  { icon: Layers, number: "02", title: "Details before decisions.", text: "From product specifications to packaging and quantities, start with the information that matters to your business." },
  { icon: Globe2, number: "03", title: "From India. To your market.", text: "Tell us your destination and requirements. Our team will help you explore availability and shipment options." },
];

export default function Home() {
  const [sceneIndex, setSceneIndex] = useState(2);
  const [category, setCategory] = useState("all");
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, () => true);
  const motionEnabled = !reducedMotion;
  const { data, isLoading, isError, refetch } = useProducts({ page: 0, pageSize: 100, sortBy: "name", sortDi: "asc" });
  const collectionFailed = isError || data?.success === false;
  const products = data?.data?.content ?? [];
  const categories = [...new Map(products.flatMap((product) => {
    const main = product.productSubCategory?.productMainCategory;
    return main ? [[main.productMainCategoryId, main] as const] : [];
  })).values()];
  const selectedCategory = categories.some((item) => item.productMainCategoryId === category) ? category : "all";
  const visibleProducts = products.filter((product) => selectedCategory === "all" || product.productSubCategory?.productMainCategory?.productMainCategoryId === selectedCategory).slice(0, 8);
  const scene = scenes[sceneIndex];
  const SceneIcon = scene.icon;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 100, damping: 22 });
  const springY = useSpring(pointerY, { stiffness: 100, damping: 22 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [-3, 3]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [3, -3]);
  const moveImage = (event: PointerEvent<HTMLDivElement>) => {
    if (!motionEnabled || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };
  const resetImage = () => { pointerX.set(0); pointerY.set(0); };
  const reveal = {
    initial: motionEnabled ? { opacity: 0, y: 24 } : false as const,
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: motionEnabled ? 0.6 : 0 },
  };

  return (
    <div className="home-page" data-motion={motionEnabled ? "on" : "off"}>
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="home-ambient home-ambient-sage" aria-hidden="true" />
        <div className="home-ambient home-ambient-sand" aria-hidden="true" />
        <div className="home-container">
          <div className="home-topline">
            <span><span className="home-status-dot" /> Rooted in Nature, Growing Worldwide</span>
          </div>
          <div className="home-hero-grid">
            <motion.div className="home-hero-copy" initial={motionEnabled ? { opacity: 0, y: 22 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionEnabled ? 0.7 : 0 }}>
              <span className="home-eyebrow"><Leaf className="w-3.5 h-3.5" aria-hidden="true" /> Coconut-based. Possibility-filled.</span>
              <h1 id="home-heading">Naturally rooted.<br /><span>Globally<br className="home-heading-break" /> connected.</span></h1>
              <p className="home-hero-intro">Cocopeat &amp; coir, from India.</p>
              <p className="home-hero-description">A new life for the coconut husk. Explore growing media and natural coir products, thoughtfully sourced for your business and the world you grow.</p>
              <div className="home-hero-actions">
                <Link to="/products" className="home-primary">Explore the collection <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link>
                <Link to="/about#production-process" className="home-text-link">See how it’s made <span className="home-play-icon"><Play className="w-3 h-3" aria-hidden="true" /></span></Link>
              </div>
              <div className="home-hero-footnote"><span className="home-origin-icon"><Globe2 className="w-5 h-5" aria-hidden="true" /></span><p>From Pune, India.<br /><strong>Open to a world of connections.</strong></p><a href="#home-collection" className="home-scroll-link" aria-label="Scroll to our product collection"><ArrowDown className="w-4 h-4" aria-hidden="true" /></a></div>
            </motion.div>
            <div className="home-hero-visual" onPointerMove={moveImage} onPointerLeave={resetImage}>
              <div className="home-orbit home-orbit-one" aria-hidden="true" /><div className="home-orbit home-orbit-two" aria-hidden="true" />
              <motion.div className="home-image-frame" style={{ rotateX: motionEnabled ? rotateX : 0, rotateY: motionEnabled ? rotateY : 0 }}>
                <div className="home-hero-photo">
                  <AnimatePresence initial={false}>
                    <motion.img key={scene.image} src={`/images/cocopeat-process-${scene.image}.webp`} width={1536} height={1024} alt={scene.alt} fetchPriority="high" decoding="async" initial={{ opacity: motionEnabled ? 0 : 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: motionEnabled ? 0.55 : 0 }} />
                  </AnimatePresence>
                  <span className="home-photo-tag"><span /> Explore our story</span>
                  <div className="home-image-caption" aria-live="polite"><span className="home-caption-icon"><SceneIcon className="w-5 h-5" aria-hidden="true" /></span><div><span>{scene.note}</span><strong>{scene.title}</strong></div><span className="home-caption-index">0{sceneIndex + 1}</span></div>
                </div>
                <div className="home-scene-selector" role="group" aria-label="Explore the coconut journey">{scenes.map((item, index) => <button type="button" key={item.image} onClick={() => setSceneIndex(index)} aria-pressed={sceneIndex === index}><span>0{index + 1}</span>{item.label}<span className="home-scene-dot" aria-hidden="true" /></button>)}</div>
              </motion.div>
              <div className="home-floating-note home-floating-leaf"><span><Leaf className="w-5 h-5" aria-hidden="true" /></span><div><strong>Nature, reimagined.</strong><small>Coconut husk. New possibilities.</small></div></div>
              <Link to="/about#technical-specifications" className="home-floating-note home-floating-spec"><Layers className="w-5 h-5" aria-hidden="true" /><span>Know your cocopeat</span><ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="home-material-strip"><span>One natural source.<br /><strong>So many possibilities.</strong></span><div>{["Cocopeat", "Coco chips", "Coir ropes"].map((name) => <span key={name}><Leaf className="w-3.5 h-3.5" aria-hidden="true" />{name}</span>)}</div><span className="home-strip-end">Discover your next material <ArrowDown className="w-4 h-4" aria-hidden="true" /></span></div>
        </div>
      </section>

      <motion.section {...reveal} id="home-collection" className="home-container home-collection" aria-labelledby="home-collection-heading">
        <div className="home-section-heading"><div><span className="section-label">The VHN collection</span><h2 id="home-collection-heading">Natural materials.<br /><span>Real possibilities.</span></h2></div><div><p>Find the right starting point for your growing setup, supply needs, or next business connection.</p><Link to="/products" className="home-text-link">Explore all products <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link></div></div>
        {!isLoading && !collectionFailed && products.length > 0 && <div className="home-collection-toolbar"><div className="home-category-picker" role="group" aria-label="Filter homepage products by category"><button type="button" aria-pressed={selectedCategory === "all"} onClick={() => setCategory("all")}>All products <span>{products.length}</span></button>{categories.map((item) => <button type="button" key={item.productMainCategoryId} aria-pressed={selectedCategory === item.productMainCategoryId} onClick={() => setCategory(item.productMainCategoryId)}>{item.name}</button>)}</div><span className="home-result-count" role="status">{visibleProducts.length} products to explore</span></div>}
        {isLoading ? <div className="home-product-grid" role="status" aria-label="Loading products">{[0, 1, 2, 3].map((index) => <div className="home-product-skeleton" key={index}><span /><span /><span /></div>)}</div>
          : collectionFailed ? <div className="home-collection-message"><ErrorMessage message="We couldn’t load the collection. Please try again." onRetry={() => { void refetch(); }} /></div>
            : products.length === 0 ? <div className="home-collection-message"><Leaf className="w-8 h-8" aria-hidden="true" /><h3>Let’s find what you need.</h3><p>Contact our team for the current product range and availability.</p><Link to="/contact" className="home-text-link">Discuss your requirements <ArrowRight className="w-4 h-4" /></Link></div>
              : <motion.div layout={motionEnabled} className="home-product-grid"><AnimatePresence mode="popLayout">{visibleProducts.map((product) => <motion.div layout={motionEnabled} key={product.productId} initial={motionEnabled ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: motionEnabled ? 0.3 : 0 }} whileHover={motionEnabled ? { y: -6 } : undefined}><ProductCard product={product} /></motion.div>)}</AnimatePresence></motion.div>}
      </motion.section>

      <motion.section {...reveal} className="home-container home-story" aria-labelledby="home-story-heading">
        <div className="home-story-glass">
          <Link to="/about#production-process" className="home-story-image" aria-label="Explore the seven-stage cocopeat production process"><img src="/images/cocopeat-drying-yard.png" width={1536} height={1024} loading="lazy" decoding="async" alt="Illustration of a cocopeat drying yard surrounded by coconut palms" /><span className="home-story-image-label"><span className="home-story-play"><Play className="w-5 h-5" aria-hidden="true" /></span><span>Follow the transformation<small>Explore the production journey</small></span><ArrowUpRight className="w-5 h-5" aria-hidden="true" /></span></Link>
          <div className="home-story-copy"><span className="section-label">A closer look</span><h2 id="home-story-heading">From husk.<br />To new <span>beginnings.</span></h2><p>There’s a story behind every block. Follow the coconut husk through separation, washing, drying, and compression to discover how cocopeat takes shape.</p><ol className="home-journey-stops"><li><Leaf aria-hidden="true" /><span>Natural origins</span></li><li><Layers aria-hidden="true" /><span>A considered process</span></li><li><Sprout aria-hidden="true" /><span>New growing possibilities</span></li></ol><Link to="/about#production-process" className="home-primary">Explore the 7 stages <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link></div>
        </div>
      </motion.section>

      <motion.section {...reveal} className="home-container home-benefits" aria-labelledby="home-benefits-heading">
        <div className="home-section-heading"><div><span className="section-label">The way we work</span><h2 id="home-benefits-heading">Good materials.<br /><span>Better conversations.</span></h2></div><p>Thoughtful sourcing starts with understanding what matters to you.</p></div>
        <div className="home-benefit-grid">{benefits.map(({ icon: Icon, number, title, text }) => <motion.article key={number} className="home-benefit-card" whileHover={motionEnabled ? { y: -6 } : undefined} transition={{ duration: 0.25 }}><div><span className="home-benefit-icon"><Icon className="w-6 h-6" aria-hidden="true" /></span><span className="home-benefit-number">{number}</span></div><h3>{title}</h3><p>{text}</p><span className="home-benefit-line" aria-hidden="true" /></motion.article>)}</div>
      </motion.section>
      <motion.section {...reveal} className="home-container home-contact" aria-labelledby="home-contact-heading">
        <div className="home-contact-glass"><div className="home-contact-orbit" aria-hidden="true"><Globe2 /></div><div className="home-contact-copy"><span className="section-label">Your next connection starts here</span><h2 id="home-contact-heading">Let’s grow<br />something <span>together.</span></h2><p>Tell us what you need, where it’s going, and what matters most. We’ll take the next step with you.</p><div className="home-contact-points"><span><Check className="w-3.5 h-3.5" aria-hidden="true" /> Product enquiries</span><span><Check className="w-3.5 h-3.5" aria-hidden="true" /> Bulk requirements</span><span><Check className="w-3.5 h-3.5" aria-hidden="true" /> Export conversations</span></div></div><Link to="/contact" className="home-contact-button"><span>Start a <br />conversation</span><ArrowUpRight aria-hidden="true" /></Link></div>
      </motion.section>
    </div>
  );
}
