import { useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronRight, Mail, Tag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CategoryPanel from "../components/CategoryPanel";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductEnquiryDialog from "../components/ProductEnquiryDialog";
import ProductGallery from "../components/ProductGallery";
import { useMainCategories, useProduct, useSubCategories } from "../hooks/useProducts";

export default function ProductPage() {
  const { productId = "" } = useParams();
  const { data: productData, isLoading, error, refetch } = useProduct(productId);
  const { data: mainCategories, isLoading: categoriesLoading, error: categoriesError } = useMainCategories();
  const { data: subCategories } = useSubCategories({ page: 0, pageSize: 100, hydrateMainCategory: true });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const product = productData?.data;

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"><div className="glass-panel feature-card min-h-64 flex flex-col items-center justify-center gap-4 p-8"><LoadingSpinner size="lg" /><p className="text-gray-500">Loading product details...</p></div></div>;
  if (error || !product) return <div className="max-w-3xl mx-auto px-4 py-10"><Link to="/products" className="company-text-link mb-5"><ArrowLeft className="w-4 h-4" />Back to products</Link><ErrorMessage message="We couldn't load this product. Please try again or browse our product range." onRetry={() => { void refetch(); }} /></div>;

  const subCategory = product.productSubCategory;
  const mainCategory = subCategory?.productMainCategory;
  const isCocopeat = /coco\s?peat|coir/i.test(`${product.name} ${subCategory?.name ?? ""}`);
  const details = product.longDescription?.trim();

  return (
    <div className="product-detail-page py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="product-breadcrumb mb-6">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li><Link to="/products" className="inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />Products</Link></li>
            {mainCategory && <li className="inline-flex items-center gap-2"><ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" /><Link to={`/products?main=${mainCategory.productMainCategoryId}`}>{mainCategory.name}</Link></li>}
            <li className="inline-flex items-center gap-2"><ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" /><span aria-current="page">{product.name}</span></li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <aside className="product-category-sidebar w-full lg:w-60 shrink-0 min-w-0 order-last lg:order-none" aria-label="Browse product categories">
            <CategoryPanel className="feature-card product-category-panel">
              <Link to="/products" className="product-category-link mb-4">All products</Link>
              {categoriesLoading && <p className="text-sm text-gray-500">Loading categories...</p>}
              {categoriesError && <p className="text-sm text-gray-500">Categories are unavailable. You can still browse all products.</p>}
              <div className="space-y-5">
                {mainCategories?.data?.map((category) => {
                  const children = subCategories?.data?.content.filter((sub) => sub.productMainCategory?.productMainCategoryId === category.productMainCategoryId) ?? [];
                  const expanded = expandedCategory === category.productMainCategoryId;
                  const active = mainCategory?.productMainCategoryId === category.productMainCategoryId;
                  const selectedChild = children.find((sub) => sub.productSubCategoryId === subCategory?.productSubCategoryId);
                  const firstChildren = children.slice(0, 4);
                  const visibleChildren = expanded ? children : selectedChild && !firstChildren.includes(selectedChild) ? [...firstChildren, selectedChild] : firstChildren;
                  return <div key={category.productMainCategoryId}>
                    <Link to={`/products?main=${category.productMainCategoryId}`} className="product-category-link font-semibold" aria-current={active ? "true" : undefined}>{category.name}</Link>
                    <div className="ml-3 mt-2">
                      {visibleChildren.map((sub) => <Link key={sub.productSubCategoryId} to={`/products?main=${category.productMainCategoryId}&sub=${sub.productSubCategoryId}`} className="product-category-link text-sm" aria-current={sub.productSubCategoryId === subCategory?.productSubCategoryId ? "true" : undefined}>{sub.name}</Link>)}
                      {children.length > 4 && <button type="button" className="product-category-link text-sm" aria-expanded={expanded} onClick={() => setExpandedCategory(expanded ? null : category.productMainCategoryId)}>{expanded ? "Show fewer" : "Show all categories"}</button>}
                    </div>
                  </div>;
                })}
              </div>
            </CategoryPanel>
          </aside>

          <article className="product-detail-shell glass-panel feature-card flex-1 min-w-0 w-full" aria-labelledby="product-title">
            <div className="grid xl:grid-cols-2 gap-7 sm:gap-9 items-start">
              <ProductGallery key={product.productId} product={product} />
              <div className="product-description">
                <span className="product-eyebrow mb-3 block">The VHN Global collection</span>
                <h1 id="product-title" className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>
                {subCategory?.name && <span className="product-category-badge mb-6"><Tag className="w-4 h-4 shrink-0" aria-hidden="true" />{subCategory.name}</span>}

                {product.shortDescription && <div className="product-copy-section"><h2 className="product-copy-heading">Product overview</h2><p className="whitespace-pre-line">{product.shortDescription}</p></div>}
                {details && <div className="product-copy-section"><h2 className="product-copy-heading">About this product</h2>{details.split(/\n\s*\n/).map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}</div>}
                {!product.shortDescription && !details && <p className="text-gray-500 leading-relaxed mb-6">Contact our team for product information, availability, and your supply requirements.</p>}
                {isCocopeat && <Link to="/about#technical-specifications" className="company-text-link mb-5">View cocopeat specifications <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" /></Link>}

                <div className="product-enquiry-box">
                  <h2 className="font-semibold text-lg mb-2">Discuss your requirements</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">Share quantities and destination to discuss availability and supply options with our team.</p>
                  <button type="button" className="btn-primary inline-flex w-full" onClick={() => setEnquiryOpen(true)}>Enquire Now <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" /></button>
                  <a href={`mailto:info@vhnglobal.com?subject=${encodeURIComponent(`Product enquiry: ${product.name}`)}`} className="product-email-link"><Mail className="w-4 h-4 shrink-0" aria-hidden="true" />Email our team</a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
      {enquiryOpen && <ProductEnquiryDialog productName={product.name} onClose={() => setEnquiryOpen(false)} />}
    </div>
  );
}
