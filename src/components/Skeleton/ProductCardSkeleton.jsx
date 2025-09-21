import Skeleton from 'react-loading-skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="group rounded-lg overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-shadow duration-300">
      {/* Image Skeleton */}
      <div className="relative pb-[125%] overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton width="60%" height={10} />
          <Skeleton width="10%" height={10} />
        </div>

        <Skeleton height={32} />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
