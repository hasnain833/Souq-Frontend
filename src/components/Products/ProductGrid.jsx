import React from 'react';
import ProductCard from './ProductCard';
import { useLocation } from 'react-router-dom';

const ProductGrid = ({ products, user, apiRefresh, setApiRefresh }) => {
  const location = useLocation();

  const gridCols = location.pathname.includes('product-details')
    ? 'lg:grid-cols-3'
    : 'lg:grid-cols-5';

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 ${gridCols} gap-4`}>
        {products.map((p) => (
          <ProductCard
            key={p.id || p._id}
            product={p}
            user={user}
            apiRefresh={apiRefresh}
            setApiRefresh={setApiRefresh}
          />)
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
