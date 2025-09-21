import Skeleton from 'react-loading-skeleton';

export default function DeliverySettingsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Skeleton width={180} height={24} />
                <Skeleton width={300} height={14} className="mt-2" />
            </div>

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0 border-b pb-2">
                <div className="flex items-center gap-2">
                    <Skeleton width={16} height={16} />
                    <Skeleton width={120} height={14} />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton width={16} height={16} />
                    <Skeleton width={100} height={14} />
                </div>
            </div>

            {/* Add Button */}
            <div className="flex justify-end">
                <Skeleton width={160} height={36} />
            </div>

            {/* Delivery Option Cards */}
            {[1, 2].map((_, i) => (
                <div
                    key={i}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center flex-wrap gap-2">
                                <Skeleton width={120} height={14} />
                                <Skeleton width={60} height={18} />
                            </div>
                            <Skeleton width={180} height={12} />
                            <div className="flex flex-wrap gap-3">
                                <Skeleton width={80} height={10} />
                                <Skeleton width={100} height={10} />
                                <Skeleton width={120} height={10} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton width={36} height={36} borderRadius={8} />
                            <Skeleton width={36} height={36} borderRadius={8} />
                            <Skeleton width={36} height={36} borderRadius={8} />
                        </div>
                    </div>
                </div>
            ))}

            {/* Available Providers Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <Skeleton width={200} height={18} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="bg-white p-4 border rounded-md space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton width={16} height={16} />
                                <Skeleton width={100} height={12} />
                            </div>
                            <Skeleton width={140} height={10} />
                            <Skeleton width={100} height={10} />
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
}
