import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUp, ArrowUpRight, Globe2, Grid, Leaf, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useMainCategories } from "../hooks/useProducts";
import "./Footer.css";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "About & Expertise", to: "/about" },
  { label: "Cocopeat specifications", to: "/about#technical-specifications" },
  { label: "Production process", to: "/about#production-process" },
  { label: "Contact us", to: "/contact" },
];

export default function Footer() {
  const { data: mainCategoriesData } = useMainCategories();
  const reducedMotion = useReducedMotion();
  const categories = mainCategoriesData?.success ? mainCategoriesData.data : [];

  return (
    <motion.footer className="site-footer footer-rich" aria-label="VHN Global footer" initial={reducedMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: reducedMotion ? 0 : 0.5 }}>
      <div className="footer-rich-orbit" aria-hidden="true"><Globe2 /></div>
      <div className="footer-inner">
        <section className="footer-invitation" aria-labelledby="footer-heading">
          <div><span className="footer-invitation-eyebrow"><Leaf className="w-3.5 h-3.5" aria-hidden="true" /> A natural place to connect</span><h2 id="footer-heading">Rooted in nature.<br /><span>Ready for your next chapter.</span></h2><p className="footer-muted">Cocopeat, coco chips, or coir ropes. Tell us what you’re sourcing.</p></div>
          <Link to="/contact" className="footer-conversation"><span>Tell us what <br />you need</span><span className="footer-conversation-arrow"><ArrowUpRight className="w-6 h-6" aria-hidden="true" /></span></Link>
        </section>

        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-brand-logo" aria-label="VHN Global home"><img src="/images/logo.webp" width={144} height={64} alt="VHN Global" loading="lazy" decoding="async" /></Link>
            <p className="footer-brand-tagline">Rooted in Nature,<br />Growing Worldwide.</p>
            <p className="footer-muted">Coconut-based growing media and natural coir products from India, connecting your business with new possibilities.</p>
            <span className="footer-origin"><Globe2 className="w-4 h-4" aria-hidden="true" /><span>From India to your market</span></span>
          </div>

          <nav aria-labelledby="footer-explore-heading" className="footer-nav-panel"><h3 id="footer-explore-heading" className="footer-label">Explore<span aria-hidden="true" /></h3><ul>{exploreLinks.map(({ label, to }) => <li key={to}><Link to={to} className="footer-link"><span>{label}</span><ArrowUpRight className="footer-link-arrow" aria-hidden="true" /></Link></li>)}</ul></nav>

          <nav aria-labelledby="footer-products-heading" className="footer-nav-panel"><h3 id="footer-products-heading" className="footer-label">The collection<span aria-hidden="true" /></h3><ul><li><Link to="/products" className="footer-link footer-all-products"><Grid className="w-3.5 h-3.5" aria-hidden="true" /><span>All products</span><ArrowUpRight className="footer-link-arrow" aria-hidden="true" /></Link></li>{categories?.map((category) => <li key={category.productMainCategoryId}><Link to={`/products?main=${category.productMainCategoryId}`} className="footer-link"><span>{category.name}</span><ArrowUpRight className="footer-link-arrow" aria-hidden="true" /></Link></li>)}</ul><Link to="/about#production-process" className="footer-process-link"><span className="footer-process-icon"><Leaf className="w-4 h-4" aria-hidden="true" /></span><span>From husk to possibility<small>Explore the process</small></span><ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /></Link></nav>

          <div className="footer-connection" aria-labelledby="footer-contact-heading"><h3 id="footer-contact-heading" className="footer-label">A direct connection<span aria-hidden="true" /></h3><div className="footer-contact-cards">
            <a href="mailto:info@vhnglobal.com" className="footer-contact-link"><span className="footer-contact-icon"><Mail className="w-4 h-4" aria-hidden="true" /></span><span><span className="footer-contact-label">Write to us</span><span className="footer-contact-value">info@vhnglobal.com</span></span><ArrowUpRight className="footer-contact-arrow" aria-hidden="true" /></a>
            <a href="tel:+917276800399" className="footer-contact-link"><span className="footer-contact-icon"><Phone className="w-4 h-4" aria-hidden="true" /></span><span><span className="footer-contact-label">Give us a call</span><span className="footer-contact-value">+91 72768 00399</span></span><ArrowUpRight className="footer-contact-arrow" aria-hidden="true" /></a>
            <a href="https://www.google.com/maps/search/?api=1&query=Pune%2C+India" target="_blank" rel="noreferrer" className="footer-contact-link"><span className="footer-contact-icon"><MapPin className="w-4 h-4" aria-hidden="true" /></span><span><span className="footer-contact-label">Our roots</span><span className="footer-contact-value">Pune, India</span></span><ArrowUpRight className="footer-contact-arrow" aria-hidden="true" /></a>
          </div></div>
        </div>

        <div className="footer-bottom"><p>© {new Date().getFullYear()} VHN Global. All rights reserved.</p><span className="footer-material-note"><Leaf className="w-3.5 h-3.5" aria-hidden="true" /> Natural materials. New possibilities.</span><button type="button" className="footer-back-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}><span>Back to top</span><span className="footer-back-top-icon"><ArrowUp className="w-4 h-4" aria-hidden="true" /></span></button></div>
      </div>
    </motion.footer>
  );
}