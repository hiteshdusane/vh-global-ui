/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArrowRight,
  Leaf,
  Droplets,
  Zap,
  Award,
  Users,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMainCategories, useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";

const Home = () => {
  const { data: mainCategoriesData } = useMainCategories();
  const { data: featuredProductsData } = useProducts({ page: 0, pageSize: 8 });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-cyan-900 flex items-center pt-[98px]">
        <div className="absolute inset-0 bg-black/30"></div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/farming_products.webp')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/70 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-white/80 mb-1 tracking-wide">
              Connecting Markets, Delivering Freshness
            </h3>
            <h1 className="text-5xl lg:text-7xl font-bold mb-4 leading-tight tracking-tight">
              Global Exporters of
              <span className="text-cyan-300 block">Fresh Produce</span>
            </h1>
            <p className="text-lg mb-8 text-gray-200 leading-relaxed">
              At VHN Global, we connect growers and buyers worldwide—supplying
              export-quality fruits, vegetables, pulses, and more with
              reliability, compliance, and a focus on freshness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center group"
              >
                Explore Products
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {/* <button className="border-2 border-white hover:bg-white hover:text-emerald-800 px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                Watch Tutorial
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-black text-gray-900 mb-3">
              Why Choose VHN Global
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Decades of experience delivering export-quality agricultural
              products with global reach and trusted logistics
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf className="w-8 h-8 text-emerald-600" />,
                bg: "bg-emerald-100",
                title: "Quality & Compliance",
                desc: "We ensure export-grade quality with strict sorting, packing, and phytosanitary compliance so your products arrive fresh and market-ready.",
              },
              {
                icon: <Droplets className="w-8 h-8 text-cyan-600" />,
                bg: "bg-cyan-100",
                title: "Wide Product Range",
                desc: "From fresh fruits and vegetables to pulses and specialty crops, our catalog is curated for international buyers and bulk traders.",
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-600" />,
                bg: "bg-yellow-100",
                title: "Global Logistics",
                desc: "Our export logistics and partner networks ensure timely shipments with traceability and cold-chain support where required.",
              },
            ].map((feature, idx) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div
                  className={`w-16 h-16 ${feature.bg} rounded-lg flex items-center justify-center mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-extrabold text-gray-900 mb-3">
              Product Categories
            </h2>
            <p className="text-xl text-gray-500">
              High-quality products ready for export — fruits, vegetables, pulses, grains, and more
            </p>
          </div>

          {mainCategoriesData?.data ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mainCategoriesData.data.slice(0, 6).map((category) => (
                <Link
                  to={`/products?main=${category.productMainCategoryId}`} 
                  key={category.productMainCategoryId}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden mx-auto rounded-xl mb-4 w-[90%]">
                    <img
                      src={`/images/${category.name
                        .toLowerCase()
                        .replace(/ & /g, "_")
                        .replace(/ /g, "_")}.webp`}
                      alt={category.name}
                      className="w-full h-[370px] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {category.shortDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      </section>

      {/* Excellence Section */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center lg:text-left">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                From Farms
                <span className="text-emerald-700 block">to Global Markets</span>
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                VHN Global sources and exports fresh, high-quality produce—connecting growers with international buyers. We focus on quality control, packaging, and logistics to deliver products that meet global market standards.
              </p>
            </div>

            <div className="flex justify-center">
              <Link
                to="/company"
                className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors group"
              >
                Learn More
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-3">
              Featured Products
            </h2>
            <p className="text-xl text-gray-500">
              Top export-ready products and popular listings
            </p>
          </div>

          {featuredProductsData?.data?.content ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProductsData.data.content.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors group"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      {/* <section className="py-16 bg-emerald-800 pb-32 -mb-[50px] relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Get the latest aquascaping tips, product updates, and exclusive
            offers delivered to your inbox.
          </p>

          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
