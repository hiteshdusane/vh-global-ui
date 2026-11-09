import { ArrowRight, ArrowUpRight, CheckCircle2, Globe, Handshake, Layers, Leaf, Link2, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import CocopeatExpertise from "../components/CocopeatExpertise";

const productAreas = [
  { title: "Cocopeat", icon: Leaf, label: "For your growing needs", description: "Explore cocopeat blocks, bricks, grow bags, and loose cocopeat. Discuss the product format, specifications, and quantities that suit your growing setup." },
  { title: "Coco chips", icon: Layers, label: "For your growing media", description: "Explore coconut husk chips for your growing media requirements. Share your application, preferred specifications, and quantities with our team." },
  { title: "Coir ropes", icon: Link2, label: "For your supply needs", description: "Natural coconut coir ropes available in different diameters. Discuss your required size, quantity, packaging, and destination." },
];

const values = [
  { title: "Product fit", icon: CheckCircle2, description: "We start with the details that matter to your business, from cocopeat formats and growing applications to coir rope sizes and quantities." },
  { title: "Clear communication", icon: MessageCircle, description: "We keep enquiries focused on product availability, requirements, and the next steps, so buyers can make informed sourcing decisions." },
  { title: "Lasting relationships", icon: Handshake, description: "We aim to build ongoing relationships with producers and buyers through practical support, transparent discussions, and attention to each enquiry." },
];

export default function About() {
  return (
    <div className="company-page py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        <section className="glass-panel feature-card company-hero p-6 sm:p-10 lg:p-12" aria-labelledby="company-heading">
          <div className="grid lg:grid-cols-2 items-center gap-8 lg:gap-12">
            <div>
              <span className="section-label">About &amp; expertise</span>
              <h1 id="company-heading" className="text-3xl sm:text-5xl font-bold leading-tight mb-6">Rooted in nature.<br /><span className="text-emerald-700">Connected to your market.</span></h1>
              <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-6">VHN Global sources and exports cocopeat, coco chips, and coir ropes from India, connecting suppliers with buyers worldwide.</p>
              <div className="flex flex-wrap gap-2 mb-8" aria-label="Our product focus">
                {productAreas.map(({ title }) => <span key={title} className="sourcing-pill"><span aria-hidden="true" />{title}</span>)}
              </div>
              <Link to="/products" className="btn-primary inline-flex">Explore our products <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" /></Link>
            </div>
            <figure className="company-visual glass-panel">
              <img src="/images/cocopeat-process-blocks.webp" width={1536} height={1024} fetchPriority="high" alt="Illustration of compressed cocopeat blocks during production" />
              <figcaption className="company-visual-caption glass-dark"><span className="text-xs uppercase tracking-widest text-emerald-100">Rooted in Nature, Growing Worldwide</span><p className="font-semibold text-lg mt-2">Coconut-based products. Worldwide connections.</p><span className="block mt-2 text-[10px] text-white/70">Product illustration</span></figcaption>
            </figure>
          </div>
        </section>

        <nav className="specs-section-nav flex flex-wrap gap-3" aria-label="About and expertise sections">
          <a href="#our-company" className="sourcing-pill">Our company</a>
          <a href="#our-products" className="sourcing-pill">What we supply</a>
          <a href="#our-values" className="sourcing-pill">How we work</a>
          <a href="#cocopeat-expertise" className="sourcing-pill">Cocopeat expertise</a>
          <a href="#production-process" className="sourcing-pill">Production process</a>
        </nav>

        <section id="our-company" className="grid lg:grid-cols-[1.3fr_1fr] gap-6" aria-labelledby="company-story-heading">
          <div className="glass-panel feature-card p-6 sm:p-9">
            <span className="section-label">Who we are</span>
            <h2 id="company-story-heading" className="text-2xl sm:text-3xl font-bold mb-5">A connection between producers and buyers.</h2>
            <div className="space-y-4 text-gray-500 leading-relaxed">
              <p>Based in Pune, India, VHN Global focuses on coconut-based growing media and natural coir products for buyers worldwide.</p>
              <p>We work with buyers to understand what they need, whether that means cocopeat and coco chips for growing applications or coir ropes for their supply requirements.</p>
              <p>Every enquiry starts with your requirements. Product selection, availability, packaging, and shipment details are discussed for your quantity, application, and destination.</p>
            </div>
          </div>
          <aside className="glass-panel feature-card company-mission p-6 sm:p-9" aria-labelledby="company-mission-heading">
            <Globe className="w-9 h-9 text-emerald-700 mb-6" aria-hidden="true" />
            <span className="section-label">Our purpose</span>
            <h2 id="company-mission-heading" className="text-2xl sm:text-3xl font-bold mb-5">Make cocopeat and coir sourcing more straightforward.</h2>
            <p className="text-gray-500 leading-relaxed">Our aim is to connect buyers with products that suit their markets and growing needs, supported by clear communication from the first enquiry.</p>
            <p className="company-location mt-6"><span aria-hidden="true" />Pune, India | Serving buyers worldwide</p>
          </aside>
        </section>

        <section id="our-products" aria-labelledby="company-products-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
            <div><span className="section-label">What we supply</span><h2 id="company-products-heading" className="text-3xl sm:text-4xl font-bold">Cocopeat, coco chips &amp; coir ropes.</h2></div>
            <Link to="/products" className="company-text-link">View products <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" /></Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {productAreas.map(({ title, icon: Icon, label, description }) => (
              <article key={title} className="glass-panel feature-card p-6 sm:p-8 flex flex-col">
                <span className="feature-icon w-14 h-14 flex items-center justify-center mb-6"><Icon className="w-7 h-7 text-emerald-700" aria-hidden="true" /></span>
                <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-3">{label}</p>
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
                {title === 'Cocopeat' && <Link to="/about#technical-specifications" className="company-text-link mt-5">Cocopeat specifications <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" /></Link>}
              </article>
            ))}
          </div>
        </section>

        <section id="our-values" aria-labelledby="company-values-heading">
          <div className="mb-6"><span className="section-label">How we work</span><h2 id="company-values-heading" className="text-3xl sm:text-4xl font-bold">Practical values. Personal attention.</h2></div>
          <div className="grid lg:grid-cols-3 gap-6">
            {values.map(({ title, icon: Icon, description }) => (
              <article key={title} className="glass-panel feature-card p-6 sm:p-8">
                <Icon className="w-7 h-7 text-emerald-700 mb-5" aria-hidden="true" />
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <CocopeatExpertise />

        <section className="glass-panel feature-card sourcing-card p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6" aria-labelledby="company-contact-heading">
          <div><span className="section-label">Let's start a conversation</span><h2 id="company-contact-heading" className="text-2xl sm:text-3xl font-bold mb-3">Tell us what your business needs.</h2><p className="text-gray-500 leading-relaxed max-w-2xl">Share your product, quantity, and destination. Our team can help you explore cocopeat, coco chips, and coir rope supply options.</p></div>
          <Link to="/contact" className="btn-primary inline-flex shrink-0">Talk to our team <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" /></Link>
        </section>
      </div>
    </div>
  );
}
