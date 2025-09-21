// components/OrderDetailsSkeleton.jsx
import React from "react";
import Skeleton from "react-loading-skeleton";

const OrderDetailsSkeleton = () => {
    return (
        <div className="p-4 space-y-6 container mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <Skeleton width={220} height={24} />
                <Skeleton width={60} height={24} />
            </div>
            <Skeleton width={180} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Product Details */}
                    <div className="border rounded-md p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-3">
                            <Skeleton width={150} />
                        </h2>
                        <div className="flex space-x-4">
                            <Skeleton height={100} width={100} />
                            <div className="flex-1 space-y-2">
                                <Skeleton width="80%" />
                                <Skeleton width="60%" />
                                <Skeleton width="50%" />
                                <Skeleton width="40%" />
                                <Skeleton width="30%" />
                            </div>
                        </div>
                    </div>

                    {/* Tracking Information */}
                    <div className="border rounded-md p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-3">
                            <Skeleton width={180} />
                        </h2>
                        <Skeleton count={3} />
                    </div>
                </div>

                {/* Right Section */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="border rounded-md p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-3">
                            <Skeleton width={150} />
                        </h2>
                        <div className="space-y-2">
                            <Skeleton width="80%" />
                            <Skeleton width="70%" />
                            <Skeleton width="60%" />
                            <Skeleton width="50%" />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border rounded-md p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-3">
                            <Skeleton width={200} />
                        </h2>
                        <div className="space-y-2">
                            <Skeleton width="70%" />
                            <Skeleton width="60%" />
                            <Skeleton width="80%" />
                            <Skeleton width="50%" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsSkeleton;
