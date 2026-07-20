import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMainCategories, useSubCategories } from "../hooks/useProducts";

interface ProductMegaMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ProductMegaMenu: React.FC<ProductMegaMenuProps> = ({
  isVisible,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { data: mainCategoriesData } = useMainCategories();
  const { data: subCategoriesData } = useSubCategories({
    pageSize: 100, // Load more subcategories
  });

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <div className="absolute left-0 top-full w-full z-40">
            <div
              className="h-5 w-full bg-transparent"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white shadow-xl border-t border-gray-100 rounded-b-[40px]"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-6 gap-8 mb-8 md:mb-12 lg:mb-16">
                {mainCategoriesData?.data?.map((category, index) => (
                  <motion.div
                    key={category.productMainCategoryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    {/* Main Category Card */}
                    <Link
                      to={`/products?main=${category.productMainCategoryId}`} 
                      onClick={onClose}
                      className="block group"
                    >
                      <div className="bg-white rounded-lg group">
                        <h3 className="font-medium text-gray-800 text-base group-hover:text-emerald-700 transition-colors">
                          {category.name}
                        </h3>
                      </div>
                    </Link>

                    {/* Sub Categories List */}
                    <motion.div
                      className="space-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      {subCategoriesData?.data?.content
                        ?.filter(
                          (sub) =>
                            sub.productMainCategory.productMainCategoryId ===
                            category.productMainCategoryId
                        )
                        ?.slice(0, 8)
                        .map((subCategory) => (
                          <Link
                            key={subCategory.productSubCategoryId}
                            to={`/products?main=${category.productMainCategoryId}&sub=${subCategory.productSubCategoryId}`}
                            onClick={onClose}
                            className="block text-sm text-gray-500 hover:text-emerald-600 transition-colors py-1"
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                      <Link
                        to={`/products?mainCategory=${category.productMainCategoryId}`}
                        onClick={onClose}
                        className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2"
                      >
                        View all
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
                <div className="">
                  <div className="w-full h-[2px] my-4 bg-emerald-600/50" />
                  <Link
                    to={`/products`}
                    onClick={onClose}
                    className="block group"
                  >
                    <div className="bg-white rounded-lg group flex w-full items-center justify-between">
                      <h3 className="font-medium text-gray-800 text-base group-hover:text-emerald-700 transition-colors">
                        Explore All Products
                      </h3>
                      <ChevronRight
                        strokeWidth={2}
                        className="w-4 h-4 text-gray-800 group-hover:text-emerald-700 transition-colors"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductMegaMenu;
