/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Package, Tag, Filter } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductResponse } from "../types/api";
import {
  productApi,
  productMainCategoryApi,
  productSubCategoryApi,
} from "../services/api";

const ProductPage: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  /* Sidebar states */
  const [mainCategoriesData, setMainCategoriesData] = useState<any>(null);
  const [subCategoriesData, setSubCategoriesData] = useState<any>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<any>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>("all");
  const [expandedMainCat, setExpandedMainCat] = useState<any>(null);

  /* Form states */

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    subject: "",
    message: "",
  });

  const appsScriptUrl = import.meta.env.VITE_APP_SCRIPT_EXCEL_URL || "";

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

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "/images/nursary-product.png";

    if (imageUrl.startsWith("http")) return imageUrl;

    return productApi.getImage(imageUrl);
  };

  /* Fetch Product */

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const response = await productApi.getById(productId);
        const data = response.data;

        setProduct(data);

        const primary = getImageUrl(data.primaryImageUrl);
        const additional = (data.additionalImageUrls || []).map(getImageUrl);

        setMainImage(primary);
        setThumbnails(additional);

        setFormData((prev) => ({
          ...prev,
          subject: `Inquiry about ${data.name}`,
        }));
      } catch (error) {
        console.error("Error fetching product", error);
      }
    };

    fetchProduct();
  }, [productId]);

  /* Fetch Categories */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const mainCategories = await productMainCategoryApi.getAll();
        const subCategories = await productSubCategoryApi.getAll({ page: 0 });

        setMainCategoriesData(mainCategories);
        setSubCategoriesData(subCategories);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategories();
  }, []);

  const handleThumbnailClick = (clickedImage: string) => {
    if (clickedImage === mainImage) return;

    setThumbnails((prev) => {
      const updated = prev.filter((img) => img !== clickedImage);
      return [mainImage, ...updated];
    });

    setMainImage(clickedImage);
  };

  /* Form handlers */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

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
        subject: `Inquiry about ${product?.name}`,
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

  if (!product) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
    </div>
  );
}

  return (
    <div className="max-w-7xl mx-auto p-6 pt-[160px]">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}

        <div className="lg:w-64">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-900">
                Explore By Categories
              </h3>
            </div>

            <button
              onClick={() => navigate("/products")}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium mb-4 ${
                  selectedMainCategory === "all"
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
              All Products
            </button>

            <div className="space-y-6">
              {mainCategoriesData?.data?.map((mainCat: any) => {
                const subCats =
                  subCategoriesData?.data?.content.filter(
                    (sub: any) =>
                      sub.productMainCategory.productMainCategoryId ===
                      mainCat.productMainCategoryId,
                  ) || [];

                const isExpanded =
                  expandedMainCat === mainCat.productMainCategoryId;

                const visibleSubCats = isExpanded
                  ? subCats
                  : subCats.slice(0, 4);

                return (
                  <div key={mainCat.productMainCategoryId}>
                    {/* MAIN CATEGORY */}
                    <button
                      onClick={() => {
                        navigate(
                          `/products?main=${mainCat.productMainCategoryId}`,
                        );
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium ${
                          selectedMainCategory === mainCat.productMainCategoryId
                            ? "bg-emerald-100 text-emerald-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {mainCat.name}
                    </button>

                    {/* SUB CATEGORIES */}
                    <div className="ml-3 mt-2 space-y-1">
                      {visibleSubCats.map((sub: any) => (
                        <button
                          key={sub.productSubCategoryId}
                          onClick={() => {
                            navigate(
                              `/products?main=${mainCat.productMainCategoryId}&sub=${sub.productSubCategoryId}`,
                            );
                          }}
                          className={`w-full text-left px-3 py-1 rounded-lg transition-colors text-md ${
                              selectedSubCategory === sub.productSubCategoryId
                                ? "bg-cyan-100 text-cyan-700 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {sub.name}
                        </button>
                      ))}

                      {/* SEE ALL / LESS */}
                      {subCats.length > 4 && (
                        <button
                          onClick={() =>
                            setExpandedMainCat(
                              isExpanded ? null : mainCat.productMainCategoryId,
                            )
                          }
                          className="w-full text-left px-3 py-1 text-sm text-emerald-600 hover:underline"
                        >
                          {isExpanded ? "See Less" : "See All"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Section */}

        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 grid lg:grid-cols-2 gap-8">
            {/* Images */}

            <div>
              <div className="mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-h-96 object-contain rounded-xl"
                />
              </div>

              {thumbnails.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {thumbnails.map((thumb, idx) => (
                    <img
                      key={idx}
                      src={thumb}
                      alt="thumbnail"
                      onClick={() => handleThumbnailClick(thumb)}
                      className="h-20 w-full object-cover rounded-lg cursor-pointer hover:opacity-80"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <Tag className="w-4 h-4 text-emerald-600" />
                {product.productSubCategory.productMainCategory.name} →
                {product.productSubCategory.name}
              </div>

              {/* Price and minimum quantity hidden by request */}

              {product.shortDescription && (
                <p className="text-gray-600 mb-4">{product.shortDescription}</p>
              )}

              {product.longDescription && (
                <p className="text-gray-600 leading-relaxed">
                  {product.longDescription}
                </p>
              )}

              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition mx-auto block"
              >
                Enquire Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}

      {isEnquiryOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsEnquiryOpen(false)}
              className="absolute top-3 right-3 text-gray-500"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Enquire about {product.name}
            </h2>

            {status && (
              <div
                className={`mb-4 text-sm ${
                  status.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded-lg"
              />

              <input
                name="email"
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded-lg"
              />

              <input
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded-lg"
              />

              <textarea
                name="message"
                placeholder="Message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded-lg"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
              >
                {isLoading ? "Sending..." : "Submit Enquiry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
