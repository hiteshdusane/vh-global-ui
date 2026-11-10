import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Boxes, ChevronDown, Home, Leaf, Menu, MessageCircle, Send, Sprout, X } from "lucide-react";
import ProductMegaMenu from "./ProductMegaMenu";
import "./Header.css";

const mobileLinks = [
  { to: "/", label: "Home", description: "A natural place to begin", icon: Home },
  { to: "/products", label: "Products", description: "Cocopeat, coco chips & coir", icon: Boxes },
  { to: "/about", label: "About & Expertise", description: "Our story, materials & process", icon: Sprout },
  { to: "/contact", label: "Contact", description: "Start your next conversation", icon: MessageCircle },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuVisible, setIsMegaMenuVisible] = useState(false);
  const headerShell = useRef<HTMLDivElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const focusProductLinks = useRef(false);
  const reducedMotion = useReducedMotion();
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
  useEffect(() => {
    if (isMegaMenuVisible && focusProductLinks.current) {
      document.querySelector<HTMLAnchorElement>('#product-menu a')?.focus();
      focusProductLinks.current = false;
    }
  }, [isMegaMenuVisible]);
  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerShell.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuToggle.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setIsMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <header className="site-header rich-header">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div ref={headerShell} className="header-shell" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsMegaMenuVisible(false);
          setIsMenuOpen(false);
        }
      }} onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsMenuOpen(false);
          setIsMegaMenuVisible(false);
        }
      }}>
        <div className="header-bar glass-panel flex items-center justify-between gap-3 px-3 sm:px-5 py-3 lg:px-7">
          <Link to="/" className="header-brand min-w-0" aria-label="VHN Global home" onClick={() => setIsMenuOpen(false)}>
            <img src="/images/logo.webp" alt="VHN Global" className="h-10 sm:h-12 w-auto max-w-full object-contain" />
            <span className="hidden sm:block text-[10px] tracking-[0.12em] text-emerald-900/70 mt-1">Rooted in Nature, Growing Worldwide</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-2">
            <NavLink to="/" className="nav-link">Home</NavLink>
            <div className="flex items-center" onMouseEnter={openProducts} onMouseLeave={closeProducts}>
              <NavLink to="/products" className="nav-link">Products</NavLink>
              <button className="nav-menu-toggle" aria-label="Browse product categories" aria-expanded={isMegaMenuVisible} aria-controls="product-menu" onClick={() => setIsMegaMenuVisible(!isMegaMenuVisible)} onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  if (isMegaMenuVisible) document.querySelector<HTMLAnchorElement>('#product-menu a')?.focus();
                  else { focusProductLinks.current = true; openProducts(); }
                }
              }}>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuVisible ? "rotate-180" : ""}`} />
              </button>
            </div>
            <NavLink to="/about" className="nav-link">About &amp; Expertise</NavLink>
            <NavLink to="/contact" className="nav-link">Contact</NavLink>
          </nav>
          <Link to="/contact" className="btn-primary hidden xl:inline-flex text-sm shrink-0">Let’s talk <ArrowUpRight className="w-4 h-4" /></Link>
          <button ref={menuToggle} type="button" className="nav-menu-toggle mobile-menu-toggle xl:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={isMenuOpen} aria-controls="mobile-navigation">
            <span className="mobile-toggle-label">{isMenuOpen ? "Close" : "Menu"}</span>
            <span className="mobile-toggle-icon">{isMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}</span>
          </button>
        </div>
        <div id="product-menu" className="hidden xl:block" onMouseEnter={openProducts} onMouseLeave={closeProducts}>
          <ProductMegaMenu isVisible={isMegaMenuVisible} onClose={() => setIsMegaMenuVisible(false)} onMouseEnter={openProducts} onMouseLeave={closeProducts} />
        </div>
        {isMenuOpen && (
          <motion.nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-navigation rich-mobile-menu glass-panel xl:hidden"
            initial={reducedMotion ? false : { opacity: 0, y: -8, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}>
            <div className="mobile-menu-heading"><span><span className="mobile-menu-heading-line" aria-hidden="true" />Explore VHN Global</span><Leaf className="w-4 h-4" aria-hidden="true" /></div>
            <ul className="mobile-menu-links">{mobileLinks.map(({ to, label, description, icon: Icon }) => (
              <li key={to}><NavLink to={to} end={to === "/"} onClick={() => setIsMenuOpen(false)} className="mobile-menu-link">
                <span className="mobile-menu-link-icon"><Icon className="w-5 h-5" aria-hidden="true" /></span>
                <span className="mobile-menu-link-copy"><strong>{label}</strong><span>{description}</span></span>
                <span className="mobile-menu-active-dot" aria-hidden="true" /><ArrowUpRight className="mobile-menu-link-arrow" aria-hidden="true" />
              </NavLink></li>
            ))}</ul>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="mobile-menu-invitation"><span className="mobile-menu-send"><Send className="w-4 h-4" aria-hidden="true" /></span><span><small>Have something in mind?</small><strong>Let’s start a conversation</strong></span><ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link>
          </motion.nav>
        )}
      </div>
    </header>
  );
};

export default Header;
