import React from 'react';
import Skeleton from 'react-loading-skeleton';

const AccountDetailsSkeleton = () => {
    return (
        <div className="container space-y-6 px-4 md:px-8 py-6 mx-auto">
            {/* Email */}
            <div className="bg-white rounded-xl shadow p-4 space-y-2">
                <div className="flex justify-between items-center">
                    <Skeleton width="60%" height={18} />
                    <Skeleton width={80} height={30} />
                </div>
                <Skeleton width={100} height={14} />
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl shadow p-4 space-y-2">
                <div className="flex justify-between items-center">
                    <Skeleton width="50%" height={18} />
                    <Skeleton width={80} height={30} />
                </div>
                <Skeleton width="70%" height={12} />
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow p-4 space-y-6">
                <Skeleton width="40%" height={18} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Skeleton height={14} width="30%" />
                        <Skeleton height={40} className="mt-1" />
                    </div>
                    <div>
                        <Skeleton height={14} width="30%" />
                        <Skeleton height={40} className="mt-1" />
                    </div>
                    <div className="md:col-span-4">
                        <Skeleton height={14} width="30%" />
                        <Skeleton height={40} className="mt-1" />
                    </div>
                </div>
            </div>

            {/* Vacation Mode */}
            <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                <Skeleton width={150} height={18} />
                <Skeleton width={40} height={24} />
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton width={100} height={18} />
                    <Skeleton width={80} height={30} />
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton width={100} height={18} />
                    <Skeleton width={80} height={30} />
                </div>
                <Skeleton width="60%" height={12} />
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                <Skeleton width={150} height={18} />
                <Skeleton width={80} height={30} />
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                <Skeleton width={150} height={18} />
                <Skeleton circle height={20} width={20} />
            </div>

            {/* Submit Button */}
            <div className="text-right space-x-2 rtl:text-left">
                <Skeleton width={100} height={40} />
            </div>
        </div>
    );
};

export default AccountDetailsSkeleton;
