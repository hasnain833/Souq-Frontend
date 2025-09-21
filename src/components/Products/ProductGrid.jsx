import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Helper function to group products by seller
// const groupProductsBySeller = (products) => {
//   const sellersMap = {};
//   products.forEach((product) => {
//     const sellerId = product.seller.id;
//     if (!sellersMap[sellerId]) {
//       sellersMap[sellerId] = {
//         userId: sellerId,
//         userName: product.seller.name,
//         userImage: `https://ui-avatars.com/api/?name=${product.seller.name}`,
//         rating: product.seller.rating,
//         products: [],
//       };
//     }
//     sellersMap[sellerId].products.push(product);
//   });
//   return Object.values(sellersMap);
// };

const ProductGrid = ({ products, user, apiRefresh, setApiRefresh }) => {
  const navigate = useNavigate()
  const location = useLocation();
  const { t } = useTranslation();

  // const userProducts = groupProductsBySeller(products);
  // const [visibleCount, setVisibleCount] = useState(2); // Show 2 sellers initially

  // const handleSeeMore = () => {
  //   setVisibleCount((prev) => prev + 5); // Load 5 more sellers
  // };

  return (
    <div className="space-y-10">
      {/* Newsfeed */}
      <div>
        {/* {location.pathname === "/" &&
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('newsfeed')}</h2>} */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 ${location.pathname.includes("product-details")
          ? "lg:grid-cols-3"
          : "lg:grid-cols-5"
          } gap-4`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} user={user} apiRefresh={apiRefresh} setApiRefresh={setApiRefresh} />
          ))}
        </div>
      </div>

      {/*  */}


    </div>
  );
};

export default ProductGrid;
