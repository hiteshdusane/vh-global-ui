import ModalBackdrop from "./ModalBackdrop";
import React, { useEffect, useState } from "react";
import { X, Package, Tag } from "lucide-react";
import { ProductResponse } from "../types/api";
import { productApi } from "../services/api";

interface ProductModalProps {
  product: ProductResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  /* ---------------- STATE ---------------- */
  const [mainImage, setMainImage] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  /* ---------------- HELPERS ---------------- */
  const getCurrencyFromTimeZone = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timeZone.startsWith("Asia/Kolkata") || timeZone.startsWith("Asia/Calcutta"))
      return { locale: "en-IN", currency: "INR" };

    if (timeZone.startsWith("America"))
      return { locale: "en-US", currency: "USD" };

    if (timeZone.startsWith("Europe"))
      return { locale: "de-DE", currency: "EUR" };

    return { locale: "en-US", currency: "USD" };
  };

  const formatPrice = (price: number) => {
    const { locale, currency } = getCurrencyFromTimeZone();
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(price);
  };

  const fixImageUrl = (url: string): string => {
    if (!url) return "";
    if (url.includes("/images/uploads/images/")) {
      const filename = url.split("/").pop()?.replace(".png", ".webp") || "";
      return `${import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL}/images/${filename}`;
    }
    return url;
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "/images/nursary-product.png";
    if (imageUrl.startsWith("http")) return fixImageUrl(imageUrl);
    return productApi.getImage(imageUrl);
  };

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (!product) return;

    const primary = getImageUrl(product.primaryImageUrl);
    const additional = (product.additionalImageUrls || []).map(getImageUrl);

    setMainImage(primary);
    setThumbnails(additional);
  }, [product]);

  /* ---------------- ACTIONS ---------------- */
  const handleThumbnailClick = (clickedImage: string) => {
    if (clickedImage === mainImage) return;

    setThumbnails((prev) => {
      const updated = prev.filter((img) => img !== clickedImage);
      return [mainImage, ...updated];
    });

    setMainImage(clickedImage);
  };

  /* ---------------- GUARD ---------------- */
  if (!isOpen || !product) return null;

  /* ---------------- UI ---------------- */
  return (
    <ModalBackdrop onClose={onClose}>
      <div role="dialog" aria-modal="true" aria-label={product.name} className="modal-panel glass-panel rounded-2xl max-w-4xl w-full ">
        {/* Header */}
        <div className="flex justify-between items-center gap-3 p-5 sm:p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            aria-label="Close product details" className="p-3 shrink-0 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-5 sm:p-6 grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full max-h-72 sm:max-h-96 object-contain rounded-xl"
              />
            </div>

            {thumbnails.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {thumbnails.map((thumb, idx) => (
                  <img
                    key={idx}
                    src={thumb}
                    onClick={() => handleThumbnailClick(thumb)}
                    className={`h-20 w-full object-cover rounded-lg cursor-pointer ${
                      mainImage === thumb
                        ? "ring-2 ring-emerald-500"
                        : "hover:opacity-80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-gray-500">
              <Tag className="w-4 h-4 text-emerald-600" />
              {product.productSubCategory.productMainCategory.name} →{" "}
              {product.productSubCategory.name}
            </div>

            {/* Price and minimum quantity hidden by request */}

            {product.shortDescription && (
              <p className="text-gray-600 mb-4">
                {product.shortDescription}
              </p>
            )}

            {product.longDescription && (
              <p className="text-gray-600 leading-relaxed">
                {product.longDescription}
              </p>
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default ProductModal;
