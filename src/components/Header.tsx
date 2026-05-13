/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, ShoppingCart } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useMainCategories } from "../hooks/useProducts";
import ProductMegaMenu from "./ProductMegaMenu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuVisible, setIsMegaMenuVisible] = useState(false);
  const [isCategoriesMenuVisible, setIsCategoriesMenuVisible] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [categoriesTimeout, setCategoriesTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // const { data: mainCategoriesData } = useMainCategories();

  const handleMegaMenuEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    setHoverTimeout(null);
    setIsMegaMenuVisible(true);
  };

  const handleMegaMenuLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    const timeoutId = setTimeout(() => {
      setIsMegaMenuVisible(false);
    }, 400); // smoother closing

    setHoverTimeout(timeoutId);
  };

  // const handleCategoriesMenuEnter = () => {
  //   // Clear any existing timeout when user hovers
  //   if (categoriesTimeout) {
  //     clearTimeout(categoriesTimeout);
  //     setCategoriesTimeout(null);
  //   }
  //   setIsCategoriesMenuVisible(true);
  // };

  // const handleCategoriesMenuLeave = () => {
  //   // Set a delay before closing, but store the timeout so we can cancel it if needed
  //   const timeoutId = setTimeout(() => {
  //     setIsCategoriesMenuVisible(false);
  //     setCategoriesTimeout(null);
  //   }, 150);
  //   setCategoriesTimeout(timeoutId);
  // };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (categoriesTimeout) {
        clearTimeout(categoriesTimeout);
      }
    };
  }, [hoverTimeout, categoriesTimeout]);

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-50 backdrop-blur-md">
      {" "}
      {/* Top Bar */}
      {/* <div className="bg-emerald-800 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <span>Professional Aquascaping Solutions</span>
            <span>|</span>
            <span>Free Shipping over €50</span>
          </div>
          <div className="flex space-x-4">
            <span>DE</span>
            <span>EN</span>
            <span>FR</span>
          </div>
        </div>
      </div> */}
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-start justify-start flex-col space-x-2"
          >
            <img
              src="/images/logo.webp"
              alt="VHN Global Logo"
              className="h-16 w-auto ml-1"
              // fetchPriority="high"
            />
            <h5 className="text-gray-600 text-sm mt-1 tracking-wide">
              Growing Green, Connecting Worlds
            </h5>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 md:space-x-16">
            <div
              className="relative"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              <Link
                to="/products"
                className="text-gray-500 hover:text-emerald-700 font-bold transition-colors flex items-center py-2"
              >
                Products
              </Link>
            </div>
            {/* <div
              className="relative"
              onMouseEnter={handleCategoriesMenuEnter}
              onMouseLeave={handleCategoriesMenuLeave}
            >
              <span className="text-gray-500 hover:text-emerald-700 font-bold cursor-pointer transition-colors py-2 block">
                Categories
              </span>
            </div> */}
            <Link
              to="/company"
              className="text-gray-500 hover:text-emerald-700 font-bold cursor-pointer transition-colors py-2 block"
            >
              Company
            </Link>
            <Link
              to="/contact"
              className="text-gray-500 hover:text-emerald-700 font-bold cursor-pointer transition-colors py-2 block"
            >
              Contact
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* <Search className="w-5 h-5 text-gray-500 hover:text-emerald-700 cursor-pointer transition-colors" />
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-500 hover:text-emerald-700 cursor-pointer transition-colors" />
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </div> */}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-500" />
              ) : (
                <Menu className="w-6 h-6 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Product Menu */}
        <ProductMegaMenu
          isVisible={isMegaMenuVisible}
          onClose={() => setIsMegaMenuVisible(false)}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        />

        {/* Categories Menu */}
        {/* <AnimatePresence>
          {isCategoriesMenuVisible && (
            <>
              
              <div
                className="absolute top-0 left-0 w-full h-2 bg-transparent z-40"
                onMouseEnter={handleCategoriesMenuEnter}
                onMouseLeave={handleCategoriesMenuLeave}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 z-40 rounded-b-[40px]"
                onMouseEnter={handleCategoriesMenuEnter}
                onMouseLeave={handleCategoriesMenuLeave}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    className="py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                      Browse by Categories
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                      {mainCategoriesData?.data?.map((category, index) => (
                        <motion.div
                          key={category.productMainCategoryId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Link
                            to={`/products?category=${category.productMainCategoryId}`}
                            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                            onClick={() => setIsCategoriesMenuVisible(false)}
                          >
                            <div className="text-center">
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 transition-colors">
                                <span className="text-emerald-600 text-xl">
                                  🌿
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">
                                {category.name}
                              </h4>
                              {category.shortDescription && (
                                <p className="text-sm text-gray-500 mt-1 group-hover:text-emerald-600 transition-colors">
                                  {category.shortDescription}
                                </p>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence> */}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/products"
                className="text-gray-500 hover:text-emerald-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              {/* <span className="text-gray-500 font-medium">Categories</span>
              <div className="ml-4 space-y-2">
                {mainCategoriesData?.data?.slice(0, 4).map((category) => (
                  <Link
                    key={category.productMainCategoryId}
                    to={`/products?category=${category.productMainCategoryId}`}
                    className="block text-sm text-gray-500 hover:text-emerald-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div> */}
              <Link
                to="/company"
                className="text-gray-500 hover:text-emerald-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Company
              </Link>
              <Link
                to="/contact"
                className="text-gray-500 hover:text-emerald-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
