import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Grid, Leaf, List, Package, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import CategoryPanel from "../components/CategoryPanel";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { useMainCategories, useSubCategories, useProducts } from "../hooks/useProducts";

const PAGE_SIZE = 6;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const selectedMain = searchParams.get("main") || "all";
  const selectedSub = searchParams.get("sub") || "all";
  const searchTerm = searchParams.get("q") || "";
  const requestedPage = Number(searchParams.get("page") || 1);
  const mainQuery = useMainCategories();
  const subQuery = useSubCategories({ page: 0, pageSize: 100, hydrateMainCategory: true });
  const productsQuery = useProducts({ page: 0, pageSize: 10000, sortBy: "name", sortDi: "asc" });
  const products = productsQuery.data?.data?.content;
  const mainCategories = mainQuery.data?.data || [];
  const subCategories = subQuery.data?.data?.content || [];

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
    });
  }, [products, selectedMain, selectedSub, searchTerm]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(totalPages, Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = filteredProducts.slice(pageStart, pageStart + PAGE_SIZE);
  const hasFilters = selectedMain !== "all" || selectedSub !== "all" || !!searchTerm;
  const activeCategory = subCategories.find((sub) => sub.productSubCategoryId === selectedSub)?.name
    || mainCategories.find((main) => main.productMainCategoryId === selectedMain)?.name;
  const isLoading = mainQuery.isLoading || subQuery.isLoading || productsQuery.isLoading;
  const hasError = mainQuery.isError || subQuery.isError || productsQuery.isError;
  const retry = () => {
    void mainQuery.refetch();
    void subQuery.refetch();
    void productsQuery.refetch();
  };

  return (
    <div className="catalog-page">
      <div className="catalog-orb catalog-orb-green" aria-hidden="true" />
      <div className="catalog-orb catalog-orb-sand" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Our products</span></nav>
        <header className="catalog-hero glass-panel">
          <div className="catalog-hero-copy">
            <span className="section-label">The VHN collection</span>
            <h1>Rooted in nature.<br /><span>Selected for you.</span></h1>
            <p>Explore fresh produce, growing media, and horticulture essentials. Find the right products for your business.</p>
            <label className="catalog-search">
              <Search className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="sr-only">Search products</span>
              <input type="search" placeholder="Search products or categories…" value={searchTerm} onChange={(event) => updateFilters({ q: event.target.value }, true)} />
              {searchTerm && <button type="button" onClick={() => updateFilters({ q: "" }, true)} aria-label="Clear search"><X className="w-4 h-4" /></button>}
            </label>
          </div>
          <div className="catalog-hero-note">
            <span className="catalog-leaf"><Leaf className="w-7 h-7" strokeWidth={1.4} aria-hidden="true" /></span>
            <p>From the earth.<br /><strong>To your business.</strong></p>
            <Link to="/contact">Talk to our team <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link>
          </div>
        </header>
        {isLoading ? <div className="catalog-status glass-panel" role="status"><LoadingSpinner size="lg" /><p>Loading our collection…</p></div>
          : hasError ? <div className="catalog-status glass-panel"><ErrorMessage message="We couldn’t load the collection. Please try again." onRetry={retry} /></div>
          : <div className="catalog-layout">
            <aside className="catalog-sidebar">
              <CategoryPanel className="catalog-categories">
                <button type="button" className="catalog-category catalog-all" aria-pressed={selectedMain === "all" && selectedSub === "all"} onClick={() => updateFilters({ main: "all", sub: "all" })}>
                  <span>All products</span><span className="catalog-count">{products?.length || 0}</span>
                </button>
                <div className="catalog-category-groups">
                  {mainCategories.map((main) => {
                    const id = main.productMainCategoryId;
                    const subs = subCategories.filter((sub) => sub.productMainCategory?.productMainCategoryId === id);
                    const expanded = expandedCategories.includes(id);
                    const visibleSubs = expanded ? subs : subs.filter((sub, index) => index < 4 || sub.productSubCategoryId === selectedSub);
                    return <div key={id}>
                      <button type="button" className="catalog-category" aria-pressed={selectedMain === id && selectedSub === "all"} onClick={() => updateFilters({ main: id, sub: "all" })}>{main.name}</button>
                      <div className="catalog-subcategories">
                        {visibleSubs.map((sub) => <button type="button" key={sub.productSubCategoryId} className="catalog-subcategory" aria-pressed={selectedSub === sub.productSubCategoryId} onClick={() => updateFilters({ main: id, sub: sub.productSubCategoryId })}><span className="catalog-category-dot" aria-hidden="true" />{sub.name}</button>)}
                        {subs.length > 4 && <button type="button" className="catalog-see-all" aria-expanded={expanded} onClick={() => setExpandedCategories((previous) => expanded ? previous.filter((value) => value !== id) : [...previous, id])}>{expanded ? "Show fewer" : `View all ${subs.length}`}</button>}
                      </div>
                    </div>;
                  })}
                </div>
                <div className="catalog-help"><Leaf className="w-5 h-5 mb-3" aria-hidden="true" /><p>Looking for something specific?</p><Link to="/contact">Let’s find it together <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link></div>
              </CategoryPanel>
            </aside>
            <section className="min-w-0" aria-label="Product collection">
              <div className="catalog-toolbar glass-panel">
                <div><h2>{activeCategory || "Explore products"}</h2><p role="status">{filteredProducts.length ? `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, filteredProducts.length)} of ${filteredProducts.length} products` : "0 products"}</p></div>
                <div className="catalog-views" role="group" aria-label="Product view">
                  <button type="button" onClick={() => setViewMode("grid")} aria-label="Grid view" aria-pressed={viewMode === "grid"}><Grid className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setViewMode("list")} aria-label="List view" aria-pressed={viewMode === "list"}><List className="w-4 h-4" /></button>
                </div>
              </div>
              {hasFilters && <div className="catalog-active-filters"><span>{activeCategory || "All products"}{searchTerm.trim() && ` · “${searchTerm.trim()}”`}</span><button type="button" onClick={resetFilters}>Clear filters <X className="w-3 h-3" aria-hidden="true" /></button></div>}
              {visibleProducts.length ? <>
                <div className={`catalog-products ${viewMode === "list" ? "catalog-products-list" : ""}`}>
                  {visibleProducts.map((product) => <ProductCard key={product.productId} product={product} viewMode={viewMode} />)}
                </div>
                {totalPages > 1 && <nav className="catalog-pagination" aria-label="Product pages">
                  <button type="button" onClick={() => updateFilters({ page: String(currentPage - 1) })} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" aria-hidden="true" />Previous</button>
                  <span aria-live="polite">Page <strong>{currentPage}</strong> of {totalPages}</span>
                  <button type="button" onClick={() => updateFilters({ page: String(currentPage + 1) })} disabled={currentPage === totalPages}>Next<ChevronRight className="w-4 h-4" aria-hidden="true" /></button>
                </nav>}
              </> : <div className="catalog-status glass-panel"><Package className="w-10 h-10 text-emerald-700" aria-hidden="true" /><h3>No products found</h3><p>Try another search or clear your filters to explore the collection.</p>{hasFilters && <button type="button" className="btn-primary" onClick={resetFilters}>Clear all filters</button>}</div>}
            </section>
          </div>}
      </div>
    </div>
  );
}
