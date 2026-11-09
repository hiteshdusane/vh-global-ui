import { useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownAZ, ArrowUpAZ, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Grid, Layers, Leaf, List, Package, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ErrorMessage from "../components/ErrorMessage";
import { useMainCategories, useSubCategories, useProducts } from "../hooks/useProducts";
import "./Products.css";

const PAGE_SIZE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reducedMotion = useReducedMotion();
  const resultsHeading = useRef<HTMLDivElement>(null);
  const viewMode = searchParams.get("view") === "list" ? "list" : "grid";
  const selectedMain = searchParams.get("main") || "all";
  const selectedSub = searchParams.get("sub") || "all";
  const searchTerm = searchParams.get("q") || "";
  const sortDescending = searchParams.get("sort") === "name-desc";
  const requestedPage = Number(searchParams.get("page") || 1);
  const mainQuery = useMainCategories();
  const subQuery = useSubCategories({ page: 0, pageSize: 100, hydrateMainCategory: true });
  const productsQuery = useProducts({ page: 0, pageSize: 10000, sortBy: "name", sortDi: "asc" });
  const products = productsQuery.data?.data?.content;
  const mainCategories = mainQuery.data?.data || [];
  const subCategories = subQuery.data?.data?.content || [];
  const activeSub = subCategories.find((sub) => sub.productSubCategoryId === selectedSub);
  const displayMain = selectedMain !== "all" ? selectedMain : activeSub?.productMainCategory?.productMainCategoryId ?? "all";
  const activeMain = mainCategories.find((main) => main.productMainCategoryId === displayMain);
  const visibleSubCategories = subCategories.filter((sub) => displayMain === "all" || sub.productMainCategory?.productMainCategoryId === displayMain);

  const updateFilters = (values: Record<string, string>, replace = false) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("page");
      Object.entries(values).forEach(([key, value]) => {
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
      });
      return next;
    }, { replace, preventScrollReset: true });
  };
  const resetFilters = () => updateFilters({ main: "all", sub: "all", q: "" });
  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (products || []).filter((product) => {
      const sub = product.productSubCategory;
      return (selectedMain === "all" || sub?.productMainCategory?.productMainCategoryId === selectedMain)
        && (selectedSub === "all" || sub?.productSubCategoryId === selectedSub)
        && (!query || [product.name, product.shortDescription, sub?.name, sub?.productMainCategory?.name]
          .some((value) => value?.toLowerCase().includes(query)));
    }).sort((first, second) => sortDescending ? second.name.localeCompare(first.name) : first.name.localeCompare(second.name));
  }, [products, selectedMain, selectedSub, searchTerm, sortDescending]);
  const mainCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products?.forEach((product) => {
      const id = product.productSubCategory?.productMainCategory?.productMainCategoryId;
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
  }, [products]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(totalPages, Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = filteredProducts.slice(pageStart, pageStart + PAGE_SIZE);
  const hasFilters = selectedMain !== "all" || selectedSub !== "all" || !!searchTerm.trim();
  const activeCategory = activeSub?.name || activeMain?.name;
  const isLoading = mainQuery.isLoading || subQuery.isLoading || productsQuery.isLoading;
  const hasError = mainQuery.isError || subQuery.isError || productsQuery.isError
    || mainQuery.data?.success === false || subQuery.data?.success === false || productsQuery.data?.success === false;
  const retry = () => { void mainQuery.refetch(); void subQuery.refetch(); void productsQuery.refetch(); };
  const changePage = (page: number) => {
    updateFilters({ page: String(page) });
    requestAnimationFrame(() => resultsHeading.current?.scrollIntoView({ block: "start", behavior: reducedMotion ? "instant" : "smooth" }));
  };

  return (
    <div className="catalog-page catalog-rich">
      <div className="catalog-orb catalog-orb-green" aria-hidden="true" /><div className="catalog-orb catalog-orb-sand" aria-hidden="true" />
      <div className="catalog-rich-container">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">The collection</span></nav>
        <motion.header className="catalog-hero glass-panel" initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.5 }}>
          <div className="catalog-hero-copy"><span className="section-label">The VHN collection</span><h1>Find your next<br /><span>natural material.</span></h1><p>From cocopeat and coco chips to natural coir ropes. Explore the range, find your fit, and start a conversation.</p><div className="catalog-hero-points"><span><Leaf className="w-3.5 h-3.5" aria-hidden="true" /> Coconut-based materials</span><span><Package className="w-3.5 h-3.5" aria-hidden="true" /> Product &amp; bulk enquiries</span></div></div>
          <Link to="/about#production-process" className="catalog-hero-visual" aria-label="Explore our cocopeat production process"><img src="/images/cocopeat-process-blocks.webp" width={1536} height={1024} alt="Illustration of compressed cocopeat blocks during production" fetchPriority="high" /><span className="catalog-hero-image-label"><span><Layers className="w-4 h-4" aria-hidden="true" /><span>Natural origins.<strong>New possibilities.</strong></span></span><ArrowUpRight className="w-4 h-4" aria-hidden="true" /></span></Link>
        </motion.header>

        <section className="catalog-discovery glass-panel" aria-label="Find and filter products">
          <div className="catalog-discovery-top"><div className="catalog-search" role="search" aria-label="Search the product collection"><Search className="w-5 h-5 shrink-0" aria-hidden="true" /><input type="search" aria-label="Search products" placeholder="Search the collection…" value={searchTerm} onChange={(event) => updateFilters({ q: event.target.value }, true)} />{searchTerm && <button type="button" onClick={() => updateFilters({ q: "" }, true)} aria-label="Clear search"><X className="w-4 h-4" aria-hidden="true" /></button>}</div><Link to="/contact" className="catalog-advice-link">Need a hand choosing? <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link></div>
          {!isLoading && !hasError && <>
            <div className="catalog-main-filters" role="group" aria-label="Filter by product category"><button type="button" aria-pressed={displayMain === "all" && selectedSub === "all"} onClick={() => updateFilters({ main: "all", sub: "all" })}><span className="catalog-filter-icon"><Grid className="w-4 h-4" aria-hidden="true" /></span><span>All products</span><span className="catalog-filter-count">{products?.length || 0}</span></button>{mainCategories.map((main) => <button type="button" key={main.productMainCategoryId} aria-pressed={displayMain === main.productMainCategoryId} onClick={() => updateFilters({ main: main.productMainCategoryId, sub: "all" })}><span className="catalog-filter-icon"><Leaf className="w-4 h-4" aria-hidden="true" /></span><span>{main.name}</span><span className="catalog-filter-count">{mainCounts.get(main.productMainCategoryId) || 0}</span></button>)}</div>
            {visibleSubCategories.length > 0 && <div className="catalog-sub-filters"><span>Refine by</span><div role="group" aria-label="Filter by product type">{visibleSubCategories.map((sub) => <button type="button" key={sub.productSubCategoryId} aria-pressed={selectedSub === sub.productSubCategoryId} onClick={() => updateFilters({ main: sub.productMainCategory.productMainCategoryId, sub: selectedSub === sub.productSubCategoryId ? "all" : sub.productSubCategoryId })}>{sub.name}{selectedSub === sub.productSubCategoryId ? <X className="w-3 h-3" aria-hidden="true" /> : <ArrowUpRight className="w-3 h-3" aria-hidden="true" />}</button>)}</div></div>}
          </>}
        </section>

        {isLoading ? <div className="catalog-loading-grid" role="status" aria-label="Loading the product collection">{[0, 1, 2].map((item) => <div key={item} className="catalog-loading-card"><span /><span /><span /></div>)}</div>
          : hasError ? <div className="catalog-status glass-panel"><ErrorMessage message="We couldn’t load the collection. Please try again." onRetry={retry} /></div>
            : <section className="catalog-results" aria-labelledby="catalog-results-heading">
              <div className="catalog-results-toolbar" ref={resultsHeading}><div><span className="catalog-results-eyebrow">Explore the range</span><h2 id="catalog-results-heading">{activeCategory || "Our products"}</h2><p role="status" aria-live="polite">{filteredProducts.length ? totalPages > 1 ? `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, filteredProducts.length)} of ${filteredProducts.length} products` : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} to explore` : "No matching products"}</p></div><div className="catalog-display-controls"><button type="button" className="catalog-sort-button" onClick={() => updateFilters({ sort: sortDescending ? "" : "name-desc" })} aria-label={`Sort by name: ${sortDescending ? "Z to A. Switch to A to Z" : "A to Z. Switch to Z to A"}`}>{sortDescending ? <ArrowUpAZ className="w-4 h-4" aria-hidden="true" /> : <ArrowDownAZ className="w-4 h-4" aria-hidden="true" />}<span>Name: {sortDescending ? "Z–A" : "A–Z"}</span></button><div className="catalog-views" role="group" aria-label="Product view"><button type="button" onClick={() => updateFilters({ view: "" })} aria-label="Grid view" aria-pressed={viewMode === "grid"}><Grid className="w-4 h-4" aria-hidden="true" /></button><button type="button" onClick={() => updateFilters({ view: "list" })} aria-label="List view" aria-pressed={viewMode === "list"}><List className="w-4 h-4" aria-hidden="true" /></button></div></div></div>
              {hasFilters && <div className="catalog-filter-summary"><div>{selectedMain !== "all" && <button type="button" onClick={() => updateFilters({ main: "all", sub: "all" })} aria-label="Remove category filter">{activeMain?.name || "Selected category"}<X className="w-3 h-3" aria-hidden="true" /></button>}{selectedSub !== "all" && <button type="button" onClick={() => updateFilters({ sub: "all" })} aria-label="Remove product type filter">{activeSub?.name || "Selected product type"}<X className="w-3 h-3" aria-hidden="true" /></button>}{searchTerm.trim() && <button type="button" onClick={() => updateFilters({ q: "" }, true)} aria-label="Remove search filter">Search: {searchTerm.trim()}<X className="w-3 h-3" aria-hidden="true" /></button>}</div><button type="button" className="catalog-reset" onClick={resetFilters}>Clear all <X className="w-3 h-3" aria-hidden="true" /></button></div>}
              {visibleProducts.length ? <>
                <motion.div layout={!reducedMotion} className={`catalog-products ${viewMode === "list" ? "catalog-products-list" : ""}`}><AnimatePresence mode="popLayout">{visibleProducts.map((product) => <motion.div layout={!reducedMotion} key={product.productId} initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }} whileHover={reducedMotion ? undefined : { y: -4 }}><ProductCard product={product} viewMode={viewMode} /></motion.div>)}</AnimatePresence></motion.div>
                {totalPages > 1 && <nav className="catalog-pagination" aria-label="Product pages"><button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" aria-hidden="true" />Previous</button><span aria-live="polite">Page <strong>{currentPage}</strong> of {totalPages}</span><button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>Next<ChevronRight className="w-4 h-4" aria-hidden="true" /></button></nav>}
              </> : <div className="catalog-status glass-panel"><span className="catalog-empty-icon"><Search className="w-7 h-7" aria-hidden="true" /></span><h3>{hasFilters ? "Let’s try another direction." : "Let’s find what you need."}</h3><p>{hasFilters ? "Try a different search or remove a filter to see more of the collection." : "Contact our team for the current product range and availability."}</p>{hasFilters ? <button type="button" className="btn-primary" onClick={resetFilters}>Show all products <ArrowRight className="w-4 h-4" aria-hidden="true" /></button> : <Link to="/contact" className="catalog-help-action">Talk to our team <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link>}</div>}
            </section>}
        <div className="catalog-guidance glass-panel"><span className="catalog-guidance-icon"><Leaf className="w-6 h-6" aria-hidden="true" /></span><div><h2>A specific format or quantity in mind?</h2><p>Share your application, specifications, and destination. We’ll help you explore the options.</p></div><Link to="/contact">Let’s talk <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link></div>
      </div>
    </div>
  );
}
