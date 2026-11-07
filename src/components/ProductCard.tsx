import { useState } from "react";
import { ArrowUpRight, ImageOff, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProductResponse } from "../types/api";
import { productApi } from "../services/api";
import ProductEnquiryDialog from "./ProductEnquiryDialog";

interface ProductCardProps {
  product: ProductResponse;
  viewMode?: "grid" | "list";
  onViewDetails?: (product: ProductResponse) => void;
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const url = product.primaryImageUrl;
  const image = url ? (/^https?:\/\//i.test(url) || url.startsWith("/images/") ? url : productApi.getImage(url)) : "";
  const detailUrl = `/products/${product.productId}`;
  return <>
    <article className={`product-card glass-panel glass-card collection-card group ${viewMode === "list" ? "collection-card-list" : ""}`}>
      <Link to={detailUrl} className="collection-card-image" aria-label={`View ${product.name}`}>
        {image && failedImage !== image ? <img src={image} alt={product.name} loading="lazy" decoding="async" onError={() => setFailedImage(image)} />
          : <span className="product-image-placeholder"><ImageOff className="w-8 h-8" aria-hidden="true" /><span>Image coming soon</span></span>}
        <span className="collection-card-arrow"><ArrowUpRight className="w-4 h-4" aria-hidden="true" /></span>
      </Link>
      <div className="collection-card-body">
        {product.productSubCategory?.name && <span className="collection-card-category"><Leaf className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /><span>{product.productSubCategory.name}</span></span>}
        <h3><Link to={detailUrl}>{product.name}</Link></h3>
        <p>{product.shortDescription || "Contact our team for product details, availability, and your specific requirements."}</p>
        <div className="collection-card-actions"><Link to={detailUrl} aria-label={`Explore ${product.name}`}>Explore product <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></Link><button type="button" onClick={() => setEnquiryOpen(true)} aria-label={`Enquire about ${product.name}`}>Enquire</button></div>
      </div>
    </article>
    {enquiryOpen && <ProductEnquiryDialog productName={product.name} onClose={() => setEnquiryOpen(false)} />}
  </>;
}
