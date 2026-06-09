import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useMainCategories } from "../hooks/useProducts";

const Footer = () => {
  const { data: mainCategoriesData } = useMainCategories();

  return (
    <footer className="bg-gray-900 text-white rounded-t-[50px] pt-6 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            {/* <div className="bg-white text-center flex items-center justify-center mb-2 py-2 rounded-[50px]"> */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/images/logo-light.png"
                alt="VHN Global Logo"
                className="h-16 w-auto"
                // fetchpriority="high"
              />
            </Link>
            {/* </div> */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              VHN Global sources and exports high-quality agricultural products
              across India and to international markets. We focus on quality,
              packaging, and logistics to ensure products arrive fresh and
              market-ready for buyers worldwide.
            </p>
            <div className="flex space-x-4"></div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Products</h4>
            <ul className="space-y-3">
              {mainCategoriesData?.data?.map((category) => (
                <li key={category.productMainCategoryId}>
                  <Link
                    to={`/products?main=${category.productMainCategoryId}`}
                    className="text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Shewalewadi, Pune, India
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+91-7276800399</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a
                  href="mailto:vhnglobaltrader@gmail.com?subject=Business Inquiry&body=Hello VHN Global Team,"
                  className="text-gray-300 text-sm hover:underline"
                >
                  vhnglobaltrader@gmail.com
                </a>
              </div>
            </div>

            {/* <div className="mt-8">
              <h5 className="font-semibold mb-3">Newsletter</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
                />
                <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-r-lg transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} VHN Global. All rights reserved.
          </p>
          {/* <div className="flex space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-400 hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-emerald-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-emerald-400 transition-colors"
            >
              Imprint
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
