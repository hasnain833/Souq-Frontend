import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const HeaderNotificationSkeleton = () => {
    return (
        <div className="space-y-4">
            {[...Array(2)].map((_, index, arr) => (
                <div
                    key={index}
                    className={`flex items-start space-x-3 rtl:space-x-reverse bg-white p-3 ${index !== arr.length - 1 ? 'border-b' : ''
                        }`}
                >
                    {/* User Avatar */}
                    <Skeleton circle height={40} width={40} />

                    {/* Message Content */}
                    <div className="flex-1 space-y-2">
                        <Skeleton height={14} width="75%" />
                        <Skeleton height={14} width="100%" />
                        <Skeleton height={12} width="35%" />
                    </div>

                    {/* Thumbnail + Icon */}
                    <div className="flex flex-col items-end space-y-2">
                        <Skeleton height={40} width={40} />
                        <Skeleton circle height={16} width={16} />
                    </div>
                </div>
            ))}
        </div>
    );
};
