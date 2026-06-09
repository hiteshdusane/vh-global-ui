/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Eye, X } from "lucide-react";
import { ProductResponse } from "../types/api";
import { productApi } from "../services/api";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: ProductResponse;
  viewMode?: "grid" | "list";
  onViewDetails?: (product: ProductResponse) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = "grid",
  onViewDetails,
}) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    subject: `Inquiry about ${product.name}`,
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  const navigate = useNavigate();

  /* ---------------- Currency ---------------- */
  const getCurrencyFromTimeZone = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (
      timeZone.startsWith("Asia/Kolkata") ||
      timeZone.startsWith("Asia/Calcutta")
    )
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

  /* ---------------- Image Handling ---------------- */
  const fixImageUrl = (url: string): string => {
    if (!url) return "";

    if (url.includes("/images/uploads/images/")) {
      const filename = url.split("/").pop()?.replace(".png", ".webp") || "";
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
      return `${backendUrl}/images/${filename}`;
    }
    return url;
  };

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl?.startsWith("http")) {
      return fixImageUrl(imageUrl);
    }
    return imageUrl
      ? productApi.getImage(imageUrl)
      : "https://images.pexels.com/photos/1078736/pexels-photo-1078736.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop";
  };

  /* ---------------- Contact Form ---------------- */
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus({
        type: "error",
        message: "⚠️ Please enter a valid email address",
      });
      setIsLoading(false);
      return;
    }

    if (formData.message.length > 1000) {
      setStatus({
        type: "error",
        message: "⚠️ Message cannot exceed 1000 characters",
      });
      setIsLoading(false);
      return;
    }

    const appsScriptUrl = import.meta.env.VITE_APP_SCRIPT_EXCEL_URL || "";

    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        mode: "no-cors",
      });

      setStatus({
        type: "success",
        message: "✅ Your message has been sent successfully!",
      });
      setFormData({
        name: "",
        email: "",
        contact: "",
        subject: `Inquiry about ${product.name}`,
        message: "",
      });

      setTimeout(() => setStatus(null), 5000);
    } catch {
      setStatus({
        type: "error",
        message: "❌ There was an error sending your message",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ---------------- Image Gallery ---------------- */
  const [mainImage, setMainImage] = useState<string>(
    getImageUrl(product.primaryImageUrl),
  );
  const [thumbnails, setThumbnails] = useState<string[]>(
    (product.additionalImageUrls || []).map(getImageUrl),
  );

  const handleThumbnailClick = (clickedImage: string) => {
    if (clickedImage === mainImage) return;

    setThumbnails((prev) => {
      const updated = prev.filter((img) => img !== clickedImage);
      return [mainImage, ...updated];
    });

    setMainImage(clickedImage);
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <div
        className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 group ${
          viewMode === "list" ? "flex" : ""
        }`}
      >
        <div
          className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}
        >
          <div className="w-full h-56 flex items-center justify-center bg-gray-50 overflow-hidden">
            <img
              src={getImageUrl(product.primaryImageUrl)}
              alt={product.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => navigate(`/products/${product.productId}`)}
              className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg"
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3
              onClick={() => navigate(`/products/${product.productId}`)}
              className="font-bold text-lg text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
            >
              {product.name}
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              {product.productSubCategory.name}
            </span>
          </div>

          {product.shortDescription && (
            <p className="text-gray-500 mb-4 text-sm">
              {product.shortDescription}
            </p>
          )}

          <div className="text-xs text-gray-500 mb-4">
            Min. Quantity: {product.minimumQuantity}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-emerald-600 font-bold text-xl">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
            >
              Enquire Now
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Contact Modal ---------------- */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-4">Enquire Now</h2>

            {status && (
              <div
                className={`p-2 rounded-md ${
                  status.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleContactChange}
                  placeholder="Name"
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleContactChange}
                  placeholder="Email"
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <input
                  name="contact"
                  value={formData.contact}
                  onChange={handleContactChange}
                  placeholder="Contact Number"
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleContactChange}
                  placeholder="Subject"
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleContactChange}
                placeholder="Message"
                className="border rounded-lg px-3 py-2 w-full h-28"
              />

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Product Details Modal ---------------- */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg relative overflow-hidden">
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <div className="w-full h-72 bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden mb-4">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {thumbnails.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {thumbnails.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleThumbnailClick(img)}
                        className="w-16 h-16 border rounded-lg overflow-hidden hover:ring-2 ring-emerald-500"
                      >
                        <img
                          src={img}
                          alt="thumb"
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {product.name}
                </h2>

                <span className="text-sm text-emerald-600 mb-3">
                  {product.productSubCategory?.name}
                </span>

                {/* ====== ADDED DETAILS ====== */}
                {product.shortDescription && (
                  <p className="text-gray-500 mb-4 text-sm">
                    {product.shortDescription}
                  </p>
                )}

                {product.longDescription && (
                  <p className="text-gray-500 mb-4 text-sm">
                    {product.longDescription}
                  </p>
                )}

                <div className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-800">
                    Type of Plant:
                  </span>{" "}
                  {product.productSubCategory?.productMainCategory?.name}
                </div>
                {/* ========================== */}

                <div className="text-sm text-gray-500 mb-4">
                  Minimum Order Quantity:{" "}
                  <span className="font-medium text-gray-800">
                    {product.minimumQuantity}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-emerald-600 font-bold text-2xl">
                    {formatPrice(product.price)}
                  </span>

                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setIsContactModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg"
                  >
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
