import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Package,
  Tag,
  Star,
} from "lucide-react";
import { useProduct } from "../hooks/useProducts";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { productApi } from "../services/api";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useProduct(productId!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !productData?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage
          message="Failed to load product details."
          onRetry={refetch}
        />
      </div>
    );
  }

  const product = productData.data;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const fixImageUrl = (url: string): string => {
    if (!url) return "";

    // Fix incorrect URLs from backend that have double path
    // Convert: http://localhost:8080/images/uploads/images/filename.png
    // To: http://localhost:8080/images/filename.webp
    if (url.includes("/images/uploads/images/")) {
      const filename = url.split("/").pop()?.replace(".png", ".webp") || "";
      return `${import.meta.env.VITE_API_URL}/images/${filename}`;
    }

    return url;
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) {
      // If primaryImageUrl is null, try to use the first additional image
      if (
        product?.additionalImageUrls &&
        product.additionalImageUrls.length > 0
      ) {
        const additionalImageUrl = fixImageUrl(product.additionalImageUrls[0]);
        console.log(
          "Using additional image URL as fallback:",
          additionalImageUrl
        );
        return additionalImageUrl;
      }
      console.warn(
        "Image URL is null or undefined and no additional images available"
      );
      return "/images/nursary-product.png"; // fallback image
    }

    // If it's already a complete URL (from backend), use it directly
    if (imageUrl.startsWith("http")) {
      return fixImageUrl(imageUrl);
    }

    // Fallback: construct URL if we only have filename
    return productApi.getImage(imageUrl);
  };

  const allImages = [
    product.primaryImageUrl,
    ...(product.additionalImageUrls || []),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8 text-sm">
          <Link
            to="/"
            className="text-gray-500 hover:text-emerald-600 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            to="/products"
            className="text-gray-500 hover:text-emerald-600 transition-colors"
          >
            Products
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">
            {product.productSubCategory.productMainCategory.name}
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">
            {product.productSubCategory.name}
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center text-gray-500 hover:text-emerald-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              <div className="mb-4">
                <img
                  src={getImageUrl(allImages[selectedImageIndex])}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-xl"
                />
              </div>

              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative rounded-lg overflow-hidden ${
                        selectedImageIndex === index
                          ? "ring-2 ring-emerald-500"
                          : ""
                      }`}
                    >
                      <img
                        src={getImageUrl(imageUrl)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover hover:opacity-80 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-gray-500">
                    {product.productSubCategory.productMainCategory.name} →{" "}
                    {product.productSubCategory.name}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">
                      (4.8) 124 reviews
                    </span>
                  </div>
                </div>

                {/* Price and minimum quantity hidden by request */}
              </div>

              {product.shortDescription && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                  <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.max(product.minimumQuantity, quantity - 1)
                        )
                      }
                      className="px-3 py-2 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {/* Total price hidden by request */}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 group">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="border border-gray-300 hover:border-emerald-600 text-gray-700 hover:text-emerald-600 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Wishlist</span>
                  </button>
                  <button className="border border-gray-300 hover:border-emerald-600 text-gray-700 hover:text-emerald-600 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          {product.longDescription && (
            <div className="border-t border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Detailed Information
              </h3>
              <div className="prose max-w-none text-gray-500 leading-relaxed">
                <p>{product.longDescription}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
