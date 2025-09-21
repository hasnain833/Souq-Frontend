import Skeleton from "react-loading-skeleton";

const OrderDetailsSkeleton = () => {
    return (
        <div className="space-y-6 container mx-auto mt-5">
            {/* Order Header */}
            <div>
                <Skeleton height={20} width={250} />
                <Skeleton height={14} width={180} />
            </div>

            {/* Product Details + Order Summary + Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Details */}
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <Skeleton height={18} width={140} />
                    <div className="flex space-x-3">
                        <Skeleton height={80} width={80} />
                        <div className="flex-1 space-y-2">
                            <Skeleton height={14} width="80%" />
                            <Skeleton height={14} width="60%" />
                            <Skeleton height={14} width="50%" />
                            <Skeleton height={14} width="40%" />
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                    <Skeleton height={18} width={120} />
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton height={14} width={100} />
                            <Skeleton height={14} width={60} />
                        </div>
                    ))}
                    <div className="flex justify-between font-bold">
                        <Skeleton height={14} width={80} />
                        <Skeleton height={14} width={70} />
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <Skeleton height={18} width={120} />
                    <Skeleton height={14} width={200} />
                    <Skeleton height={40} />
                </div>

                {/* Contact Information */}
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <Skeleton height={18} width={150} />
                    <div className="flex items-center space-x-3">
                        <Skeleton circle height={40} width={40} />
                        <Skeleton height={14} width={120} />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Skeleton circle height={40} width={40} />
                        <Skeleton height={14} width={120} />
                    </div>
                    <div className="space-y-2">
                        <Skeleton height={14} width="90%" />
                        <Skeleton height={14} width="80%" />
                        <Skeleton height={14} width="60%" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsSkeleton;
