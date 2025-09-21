import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PriceBreakdownModal from './PriceBreakDownModal'; // Make sure the path is correct
import { addFevProduct, bumpProduct, reactivateProduct } from '../../api/ProductService';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { addPersonalizationFromLikedProduct } from '../../api/Personalization';

const ProductCard = ({ product, user, apiRefresh, setApiRefresh }) => {
  const navigate = useNavigate();
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false);
  // const baseURL = import.meta.env.VITE_API_BASE_URL;
  // const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  const authUser = JSON.parse(localStorage.getItem("user"));

  const {
    setIsAuthModalOpen,
    setAuthMode,
  } = useAppContext();

  const addFavorites = async (id) => {
    if (authUser) {
      try {
        // Add to favorites
        await addFevProduct(id);

        // Add to personalization
        await addPersonalizationFromLikedProduct(id);

        // Refresh UI
        setApiRefresh(!apiRefresh);
      } catch (error) {
        console.error("Error adding favorite or personalization:", error);
      }
    } else {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const handleBumpProduct = async (e) => {
    e.stopPropagation(); // Prevent card click navigation

    try {
      const response = await bumpProduct(product?.id);
      const resData = response;

      if (resData?.success) {
        toast.success(resData?.data?.message || "Product bumped successfully!");
        if (setApiRefresh) {
          setApiRefresh(prev => prev + 1);
        }
      } else {
        // Show error if success is false
        toast.error(resData?.error || "Failed to bump product. Please try again.");
      }
    } catch (error) {
      console.error("Bump failed:", error);
      toast.error(
        error?.response?.data?.error || "Something went wrong. Please try again."
      );
    }
  };

  const handleProductClick = async (productId) => {
    // Save to personalization
    if (authUser) {
      try {
        await addPersonalizationFromLikedProduct(productId);
      } catch (error) {
        console.error("Personalization tracking failed", error);
      }
    }
    navigate(`/product-details/${productId}`);
  };



  // const handleReactivateProduct = async (e) => {
  //   e.stopPropagation(); // Prevent card click navigation
  //   try {
  //     const response = await reactivateProduct(product?.id);
  //     toast.success(response?.data?.message || "Product marked as available!");
  //     if (setApiRefresh) {
  //       setApiRefresh(prev => prev + 1);
  //     }
  //   } catch (error) {
  //     console.error("Reactivate failed:", error);
  //     toast.error(error?.response?.data?.error || "Failed to reactivate product. Please try again.");
  //   }
  // }

  return (
    <>
      <div className="group rounded-lg overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-shadow duration-300">
        <div className="relative pb-[125%] overflow-hidden group">
          <img
            // src={`${normalizedBaseURL}${product?.product_photos?.[0]}`}
            src={product?.product_photos?.[0]}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            onClick={() => handleProductClick(product.id)}
          />

          {/* Favorite Button */}
          {(!authUser?.id || !user?.id || authUser?.id !== user?.id) && (
            <button
              className="absolute top-3 ltr:right-3 rtl:left-3 w-12 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-red-500 transition-colors duration-200"
              onClick={() => addFavorites(product.id)}
            >
              <span className="sr-only">Add to favorites</span>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Heart size={18} />
                {product.favoriteCount > 0 && (
                  <span>{product.favoriteCount}</span>
                )}
              </div>
            </button>
          )}

          {/* Hidden label overlay */}
          {product?.hide && (
            <div className="absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-75 text-white text-center py-1 text-sm font-semibold">
              {t("hidden")}
            </div>
          )}
          {product.status !== 'active' && (
            <div
              className={`absolute bottom-0 left-0 w-full text-center py-1 text-sm font-semibold
    ${product.status === 'sold'
                  ? 'bg-teal-600 text-white'
                  : product.status === 'reserved'
                    ? 'bg-yellow-400 text-black'
                    : product.status === 'rejected'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 bg-opacity-75 text-white'
                }`}
            >
              {product.status === 'sold'
                ? t('sold')
                : product.status === 'reserved'
                  ? t('reserved')
                  : product.status === 'rejected'
                    ? t('rejected')
                    : ''}
            </div>
          )}

        </div>

        <div className="p-3">
          <div className="space-y-1 text-sm text-gray-700">
            {authUser?.id && authUser.id === user?.id && location.pathname !== "/" ? (
              <>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{product?.views} {t("views")}</span>
                  <span>{product?.favoriteCount} {t("favorites")}</span>
                </div>
                <div className="text-base text-gray-500">
                  ${product?.price?.toFixed(2)}
                </div>
                {/* <button className="w-full border border-teal-600 text-teal-700 rounded-md py-1 text-sm font-medium hover:bg-teal-50 transition">
                  {t("bump")}
                </button> */}
                {/* {product?.status && product.status !== 'active' && (
                  <div className={`text-xs px-2 py-1 rounded-full text-center font-medium mb-1 ${product.status === 'sold' ? 'bg-red-100 text-red-700' :
                      product.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {product.status === 'sold' ? 'SOLD' :
                      product.status === 'reserved' ? 'RESERVED' :
                        product.status.toUpperCase()}
                  </div>
                )} */}
                {/* Action buttons based on product status */}
                {/* {(!product?.status || product.status === 'active') ? (
           
                  <button
                    className="w-full border border-teal-600 text-teal-700 rounded-md py-1 text-sm font-medium hover:bg-teal-50 transition"
                    onClick={handleBumpProduct}
                  >
                    Bump
                  </button>
                ) : (
               
                  <button
                    className="w-full border border-green-600 text-green-700 rounded-md py-1 text-sm font-medium hover:bg-green-50 transition"
                    onClick={handleReactivateProduct}
                  >
                    {product.status === 'sold' ? 'Mark as Unsold' :
                      product.status === 'reserved' ? 'Mark as Unreserved' :
                        'Mark as Available'}
                  </button>
              
                )} */}

                <button
                  className={`w-full border border-teal-600 text-teal-700 rounded-md py-1 text-sm font-medium transition
    ${product.status !== 'active' || product?.hide ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-50'}`}
                  onClick={handleBumpProduct}
                  disabled={product.status !== 'active' || product?.hide}
                >
                  {t("bump")}
                </button>

              </>
            ) : (
              <>
                <div className="flex justify-between text-xs text-gray-500">
                  <h3 className="text-base font-semibold text-gray-900 truncate w-full">
                    {product?.title}
                  </h3>
                  <span
                    className="block text-base text-gray-400"
                  // onClick={() => setShowModal(true)}
                  >
                    ${product?.price?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className='flex items-center text-xs text-gray-400 space-x-2 rtl:space-x-reverse'>
                    <span>{product?.size}</span>
                    <span>•</span>
                    <span>{product?.brand}</span>
                  </div>
                  <span
                    className="block text-base text-teal-700 cursor-pointer hover:underline"
                    onClick={() => setShowModal(true)}
                  >
                    ${(product.price * 1.05).toFixed(2)} {t("incl")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price Breakdown Modal */}
      <PriceBreakdownModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        itemPrice={product.price}
        protectionFee={Number((product.price * 0.05).toFixed(2))}
      />

    </>
  );
};

export default ProductCard;
