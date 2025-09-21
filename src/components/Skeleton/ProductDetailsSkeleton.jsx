import Skeleton from 'react-loading-skeleton';

const ProductDetailsSkeleton = () => {
    return (
        <div className="bg-white min-h-screen p-4 sm:p-6 max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Left: Gallery + Products */}
                <div className="col-span-2 space-y-4 sm:space-y-6">
                    {/* Main Image */}
                    <Skeleton height={300} className="w-full rounded sm:h-[400px]" />

                    {/* Thumbnails */}
                    <div className="flex gap-2 overflow-x-auto sm:overflow-visible">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} width={60} height={60} className="rounded sm:w-[80px] sm:h-[80px]" />
                        ))}
                    </div>

                    {/* Member's items heading */}
                    <div className="mt-2 space-y-2">
                        <Skeleton width="60%" height={14} />
                        <Skeleton width="80%" height={24} />
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton height={120} className="rounded sm:h-[150px]" />
                                <Skeleton height={14} width="80%" />
                                <Skeleton height={14} width="60%" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="border rounded-md shadow-sm sticky top-4 h-fit p-4 space-y-4">
                    <Skeleton height={20} width="80%" />
                    <Skeleton height={14} width="60%" />
                    <Skeleton height={18} width="40%" />
                    <Skeleton height={18} width="60%" />
                    <Skeleton height={14} width="50%" />

                    {/* Key details */}
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton width="40%" height={14} />
                                <Skeleton width="40%" height={14} />
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <Skeleton count={2} height={12} />
                    <Skeleton width="30%" height={12} />

                    {/* Shipping */}
                    <div className="flex justify-between">
                        <Skeleton width="30%" height={14} />
                        <Skeleton width="20%" height={14} />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <Skeleton height={36} />
                        <Skeleton height={36} />
                        <Skeleton height={36} />
                    </div>

                    {/* Seller Card */}
                    <div className="border rounded p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <Skeleton circle width={40} height={40} />
                            <div className="flex-1 space-y-1">
                                <Skeleton height={14} width="60%" />
                                <Skeleton height={12} width="50%" />
                            </div>
                        </div>

                        <Skeleton height={12} width="80%" />
                        <Skeleton height={12} width="70%" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsSkeleton;
