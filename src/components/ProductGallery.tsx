import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X } from "lucide-react";
import { productApi } from "../services/api";
import type { ProductResponse } from "../types/api";
import ModalBackdrop from "./ModalBackdrop";

export default function ProductGallery({ product }: { product: ProductResponse }) {
  const images = useMemo(() => [...new Set([product.primaryImageUrl, ...(product.additionalImageUrls || [])]
    .filter(Boolean).map((url) => /^https?:\/\//i.test(url) || url.startsWith("/images/") ? url : productApi.getImage(url)))], [product]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);
  const currentImage = images[selectedImage];
  const hasImage = currentImage && !failedImages.has(currentImage);
  const markFailed = (url: string) => setFailedImages((previous) => previous.has(url) ? previous : new Set([...previous, url]));
  const placeholder = <span className="product-image-placeholder"><ImageOff className="w-9 h-9" aria-hidden="true" /><span>No image available</span></span>;

  return (
    <div className="product-gallery">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="product-eyebrow">Product gallery</span>
        {images.length > 0 && <span className="text-xs text-gray-500" aria-live="polite">{selectedImage + 1} / {images.length}</span>}
      </div>
      <button type="button" className="product-image-stage" disabled={!hasImage} onClick={() => setPreviewOpen(true)} aria-label={`View larger image of ${product.name}`}>
        {hasImage ? <><img src={currentImage} alt={product.name} onError={() => markFailed(currentImage)} /><span className="product-zoom-badge"><Maximize2 className="w-4 h-4" aria-hidden="true" /><span className="sr-only">Enlarge</span></span></> : placeholder}
      </button>
      {images.length > 1 && <div className="product-thumbnails mt-3" aria-label="Product images">
        {images.map((image, index) => <button key={image} type="button" className="product-thumbnail" aria-label={`View image ${index + 1} of ${product.name}`} aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)}>
          {failedImages.has(image) ? <ImageOff className="w-5 h-5 mx-auto text-gray-500" aria-hidden="true" /> : <img src={image} alt="" loading="lazy" onError={() => markFailed(image)} />}
        </button>)}
      </div>}
      <p className="text-xs text-gray-500 leading-relaxed mt-4">{hasImage ? "Select an image to view its details." : "Contact our team for product images and details."}</p>

      {previewOpen && <ModalBackdrop onClose={() => setPreviewOpen(false)}>
        <div role="dialog" aria-modal="true" aria-labelledby="product-preview-title" className="modal-panel glass-panel product-lightbox w-full max-w-5xl p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4"><h2 id="product-preview-title" className="text-lg sm:text-xl font-semibold break-words">{product.name}</h2><button type="button" className="product-icon-button shrink-0" onClick={() => setPreviewOpen(false)} aria-label="Close image preview"><X className="w-5 h-5" /></button></div>
          <div className="product-lightbox-image">{hasImage ? <img src={currentImage} alt={product.name} onError={() => markFailed(currentImage)} /> : placeholder}</div>
          {images.length > 1 && <div className="flex items-center justify-center gap-4 mt-4">
            <button type="button" className="product-icon-button" onClick={() => setSelectedImage((index) => (index - 1 + images.length) % images.length)} aria-label="Previous image"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-sm" aria-live="polite">{selectedImage + 1} / {images.length}</span>
            <button type="button" className="product-icon-button" onClick={() => setSelectedImage((index) => (index + 1) % images.length)} aria-label="Next image"><ChevronRight className="w-5 h-5" /></button>
          </div>}
        </div>
      </ModalBackdrop>}
    </div>
  );
}
