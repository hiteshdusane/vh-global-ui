import { ArrowUp, ArrowUpRight, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useMainCategories } from "../hooks/useProducts";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "About & Expertise", to: "/about" },
  { label: "Cocopeat specifications", to: "/about#technical-specifications" },
  { label: "Production process", to: "/about#production-process" },
  { label: "Contact us", to: "/contact" },
];

export default function Footer() {
  const { data: mainCategoriesData } = useMainCategories();

  return (
    <footer className="site-footer" aria-label="VHN Global footer">
      <div className="footer-inner">
        <section className="footer-invitation" aria-labelledby="footer-heading">
          <div>
            <p className="footer-label mb-3">Rooted in Nature, Growing Worldwide</p>
            <h2 id="footer-heading" className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3">Your next connection starts here.</h2>
            <p className="footer-muted leading-relaxed">Fresh fruits, vegetables, or cocopeat. Tell us what you’re sourcing.</p>
          </div>
          <Link to="/contact" className="btn-primary inline-flex shrink-0">Start a conversation <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" /></Link>
        </section>

        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="inline-flex mb-5" aria-label="VHN Global home"><img src="/images/logo.webp" width={144} height={64} alt="VHN Global" className="h-14 w-auto max-w-full object-contain" loading="lazy" decoding="async" /></Link>
            <p className="footer-muted text-sm leading-7">VHN Global connects buyers with fresh fruits, vegetables, and cocopeat from India. Explore agricultural products for your market and growing needs.</p>
            <p className="footer-origin"><Globe className="w-4 h-4 shrink-0" aria-hidden="true" />From India to your market</p>
          </div>

          <nav aria-labelledby="footer-explore-heading">
            <h3 id="footer-explore-heading" className="footer-label mb-3">Explore</h3>
            <ul>{exploreLinks.map(({ label, to }) => <li key={to}><Link to={to} className="footer-link">{label}</Link></li>)}</ul>
          </nav>

          <nav aria-labelledby="footer-products-heading">
            <h3 id="footer-products-heading" className="footer-label mb-3">Our products</h3>
            <ul>
              <li><Link to="/products" className="footer-link">All products <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /></Link></li>
              {mainCategoriesData?.data?.map((category) => (
                <li key={category.productMainCategoryId}><Link to={`/products?main=${category.productMainCategoryId}`} className="footer-link">{category.name}</Link></li>
              ))}
            </ul>
          </nav>

          <div aria-labelledby="footer-contact-heading">
            <h3 id="footer-contact-heading" className="footer-label mb-4">Let’s stay connected</h3>
            <div className="grid gap-3">
              <a href="mailto:info@vhnglobal.com" className="footer-contact-link"><span className="footer-contact-icon"><Mail className="w-4 h-4" aria-hidden="true" /></span><span><span className="footer-contact-label">Email our team</span><span className="footer-contact-value">info@vhnglobal.com</span></span></a>
              <a href="tel:+917276800399" className="footer-contact-link"><span className="footer-contact-icon"><Phone className="w-4 h-4" aria-hidden="true" /></span><span><span className="footer-contact-label">Give us a call</span><span className="footer-contact-value">+91 72768 00399</span></span></a>
              <a href="https://www.google.com/maps/search/?api=1&query=Pune%2C+India" target="_blank" rel="noreferrer" className="footer-contact-link"><span className="footer-contact-icon"><MapPin className="w-4 h-4" aria-hidden="true" /></span><span><span className="footer-contact-label">Find us</span><span className="footer-contact-value">Pune, India</span></span><ArrowUpRight className="w-3.5 h-3.5 shrink-0 ml-auto" aria-hidden="true" /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} VHN Global. All rights reserved.</p>
          <button type="button" className="footer-back-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top <ArrowUp className="w-4 h-4" aria-hidden="true" /></button>
        </div>
      </div>
    </footer>
  );
}
