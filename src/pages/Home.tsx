/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArrowRight,
  Leaf,
  Droplets,
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

  const getCategoryImageUrl = (categoryName: string) => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const fileName = categoryName
      .toLowerCase()
      .replace(/ & /g, "_")
      .replace(/ /g, "_");
    return `${backendUrl}/api/v1/products/get-image/${fileName}.jpg`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <img className="hero-image" src="/images/cocopeat-drying-yard.png" alt="Cocopeat drying yard concept with compressed blocks and coconut palms" fetchPriority="high" />
        <div className="hero-shade" aria-hidden="true" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="hero-copy glass-dark">
            <span className="hero-pill"><Leaf className="w-3 h-3" /> Fruits, vegetables &amp; cocopeat</span>
            <p className="text-sm font-medium text-white/80 mb-3 tracking-wide">
              Rooted in Nature, Growing Worldwide
            </p>
            <h1 className="font-bold mb-5">
              Global Exporters of
              <span className="text-cyan-300 block">Fruits, Vegetables &amp; Cocopeat</span>
            </h1>
            <p className="text-base sm:text-lg mb-8 text-gray-200 leading-relaxed">
              From fresh fruits and vegetables to coconut-based growing media,
              VHN Global connects India's agricultural products with growers,
              distributors, and buyers worldwide.
            </p>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center group"
              >
                Explore Products
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="btn-secondary">Discuss your requirements <ArrowRight className="w-4 h-4" /></Link>
              {/* <button className="border-2 border-white hover:bg-white hover:text-emerald-800 px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                Watch Tutorial
              </button> */}
            </div>
            <div className="hero-footnote">
              <span>01 / Fresh fruits</span>
              <span>02 / Vegetables</span>
              <span>03 / Cocopeat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="feature-section py-12 sm:py-20" aria-labelledby="why-choose-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-reveal>
            <span className="section-label">A better foundation for growth</span>
            <h2 id="why-choose-heading" className="text-3xl sm:text-4xl font-heading font-black text-gray-900 mb-3">
              Why Choose VHN Global
            </h2>
            <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Fresh fruits, vegetables, and cocopeat, with thoughtful sourcing
              and export support for buyers worldwide.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: <Leaf className="w-8 h-8 text-emerald-600" />,
                title: "Fresh Produce & Cocopeat",
                desc: "Explore fresh fruits and vegetables for your market, alongside coconut-based growing media for nurseries, horticulture, and modern agriculture.",
              },
              {
                icon: <Droplets className="w-8 h-8 text-cyan-600" />,
                title: "Your Requirements First",
                desc: "From produce sourcing to cocopeat supply, share your product specifications, quantities, and destination so we can help you explore suitable options.",
              },
              {
                icon: <Globe className="w-8 h-8 text-emerald-700" />,
                title: "From India to Your Market",
                desc: "Planning an international order? Connect with our team to discuss product availability, packaging, and shipment requirements for your destination.",
              },
            ].map((feature) => (
              <article
                key={feature.title}
                className="glass-panel feature-card p-6 sm:p-8"
                data-reveal
              >
                <div className="feature-icon w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-6" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Excellence Section */}
      <section className="feature-section py-12 sm:py-20" aria-labelledby="sourcing-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel feature-card sourcing-card p-6 sm:p-12 max-w-5xl mx-auto text-center" data-reveal>
            <span className="section-label">From Indian farms to global markets</span>
            <div>
              <h2 id="sourcing-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Naturally sourced.
                <span className="text-emerald-700 block">Globally connected.</span>
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                VHN Global sources and exports fresh fruits, vegetables, and
                cocopeat from India, connecting agricultural producers with
                buyers worldwide. From produce for your market to coconut-based
                growing media for your crops, we help you explore product,
                packaging, and shipment options for your requirements.
              </p>
            </div>

            <ul className="flex flex-wrap justify-center gap-3 mb-8" aria-label="Our product focus">
              {['Fresh fruits', 'Vegetables', 'Cocopeat'].map((category) => (
                <li key={category} className="sourcing-pill">
                  <span aria-hidden="true" />{category}
                </li>
              ))}
            </ul>

            <div className="flex justify-center">
              <Link
                to="/about"
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
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900 mb-3">
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
