import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import ProductMegaMenu from "./ProductMegaMenu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuVisible, setIsMegaMenuVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const openProducts = () => {
    clearTimeout(timeout.current);
    setIsMegaMenuVisible(true);
  };
  const closeProducts = () => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setIsMegaMenuVisible(false), 180);
  };
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMegaMenuVisible(false);
    clearTimeout(timeout.current);
  }, [location]);
  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="header-shell" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsMegaMenuVisible(false);
        }
      }} onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsMenuOpen(false);
          setIsMegaMenuVisible(false);
        }
      }}>
        <div className="header-bar glass-panel flex items-center justify-between gap-3 px-3 sm:px-5 py-3 lg:px-7">
          <Link to="/" className="min-w-0" aria-label="VHN Global home">
            <img src="/images/logo.webp" alt="VHN Global" className="h-10 sm:h-12 w-auto max-w-full object-contain" />
            <span className="hidden sm:block text-[10px] tracking-[0.12em] text-emerald-900/70 mt-1">Rooted in Nature, Growing Worldwide</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-2">
            <NavLink to="/" className="nav-link">Home</NavLink>
            <div className="flex items-center" onMouseEnter={openProducts} onMouseLeave={closeProducts}>
              <NavLink to="/products" className="nav-link">Products</NavLink>
              <button className="nav-menu-toggle" aria-label="Browse product categories" aria-expanded={isMegaMenuVisible} aria-controls="product-menu" onClick={() => setIsMegaMenuVisible(!isMegaMenuVisible)}>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuVisible ? "rotate-180" : ""}`} />
              </button>
            </div>
            <NavLink to="/about" className="nav-link">About &amp; Expertise</NavLink>
            <NavLink to="/contact" className="nav-link">Contact</NavLink>
          </nav>
          <Link to="/contact" className="btn-primary hidden xl:inline-flex text-sm shrink-0">Let’s talk <ArrowUpRight className="w-4 h-4" /></Link>
          <button className="nav-menu-toggle xl:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={isMenuOpen} aria-controls="mobile-navigation">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <div id="product-menu" className="hidden xl:block" onMouseEnter={openProducts} onMouseLeave={closeProducts}>
          <ProductMegaMenu isVisible={isMegaMenuVisible} onClose={() => setIsMegaMenuVisible(false)} onMouseEnter={openProducts} onMouseLeave={closeProducts} />
        </div>
        {isMenuOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-navigation glass-panel grid gap-2 p-4 xl:hidden">
            <NavLink to="/" className="nav-link">Home</NavLink>
            <NavLink to="/products" className="nav-link">Products</NavLink>
            <NavLink to="/about" className="nav-link">About &amp; Expertise</NavLink>
            <NavLink to="/contact" className="nav-link">Contact</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
