import React from 'react';
import Skeleton from 'react-loading-skeleton';

const ConnectionCardSkeleton = () => {
    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
                {/* Profile Picture */}
                <Skeleton circle height={64} width={64} />

                {/* Name, Stars, Location, Last Seen */}
                <div className="flex flex-col space-y-2 flex-grow">
                    <Skeleton height={16} width={120} />
                    <div className="flex items-center gap-3">
                        <Skeleton height={12} width={100} />
                        <Skeleton height={12} width={100} />
                    </div>
                    <Skeleton height={14} width={100} />
                </div>
            </div>

            {/* Title Skeleton - e.g. "John Doe Following" */}
            <Skeleton height={20} width={180} />

            {/* Followers List Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between bg-white border rounded-md px-3 py-2 shadow hover:shadow-md transition w-full"
                    >
                        {/* Left Side - Image & Info */}
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <Skeleton circle height={40} width={40} />

                            <div className="flex flex-col text-sm space-y-1">
                                <Skeleton height={12} width={100} />
                                <Skeleton height={10} width={60} />
                                <Skeleton height={10} width={80} />
                            </div>
                        </div>

                        {/* Right Side - Follow Button */}
                        <Skeleton height={28} width={60} borderRadius={6} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConnectionCardSkeleton;
