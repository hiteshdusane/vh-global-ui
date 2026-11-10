import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronRight, Layers, Leaf, Sprout } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useMainCategories, useSubCategories } from "../hooks/useProducts";
import "./ProductMegaMenu.css";

interface ProductMegaMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function ProductMegaMenu({ isVisible, onClose, onMouseEnter, onMouseLeave }: ProductMegaMenuProps) {
  const main = useMainCategories();
  const sub = useSubCategories({ pageSize: 100 });
  const reducedMotion = useReducedMotion();
  const categories = main.data?.data ?? [];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div className="product-menu-positioner" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
          initial={reducedMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }} transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}>
          <nav aria-label="Product collections" className="product-mega-menu">
            <div className="product-menu-heading">
              <div><span className="product-menu-eyebrow"><span /> Rooted in possibility</span><h2>Good things grow from nature.</h2></div>
              <span className="product-menu-note"><Sprout size={16} aria-hidden="true" /> Discover our product collections</span>
            </div>
            <div className="product-menu-grid" aria-busy={main.isPending}>
              {main.isPending && <p className="product-menu-status" role="status">Gathering our collections…</p>}
              {!main.isPending && categories.length === 0 && <p className="product-menu-status" role="status">{main.isError ? "Collections are temporarily unavailable. You can still explore our products below." : "Explore our full collection below."}</p>}
              {categories.map((category, index) => {
                const Icon = /fibre|fiber|rope|coir products/i.test(category.name) ? Layers : Leaf;
                const categoryUrl = `/products?main=${category.productMainCategoryId}`;
                const children = sub.data?.data?.content?.filter(item => item.productMainCategory.productMainCategoryId === category.productMainCategoryId).slice(0, 8) ?? [];
                return (
                  <div key={category.productMainCategoryId} className="product-collection-card">
                    <Link to={categoryUrl} onClick={onClose} className="product-collection-heading">
                      <span className="product-collection-icon"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></span>
                      <span className="product-collection-title"><span>Collection {String(index + 1).padStart(2, "0")}</span><h3>{category.name}</h3></span>
                      <ArrowUpRight className="product-collection-arrow" size={19} aria-hidden="true" />
                    </Link>
                    <ul className="product-collection-links">
                      {children.map(child => (
                        <li key={child.productSubCategoryId}><Link to={`${categoryUrl}&sub=${child.productSubCategoryId}`} onClick={onClose}>
                          <span className="product-link-dot" aria-hidden="true" /><span>{child.name}</span><ChevronRight size={16} aria-hidden="true" />
                        </Link></li>
                      ))}
                    </ul>
                    {sub.isPending && <p className="product-collection-status" role="status">Loading products…</p>}
                    {sub.isError && <p className="product-collection-status">Browse this collection to see its products.</p>}
                    <Link to={categoryUrl} onClick={onClose} className="product-collection-view">View collection <ArrowUpRight size={15} aria-hidden="true" /></Link>
                  </div>
                );
              })}
            </div>
            <div className="product-menu-footer">
              <span>From coconut husk to new possibilities.</span>
              <Link to="/products" onClick={onClose} className="product-menu-explore">Explore all products <span><ArrowUpRight size={18} aria-hidden="true" /></span></Link>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
