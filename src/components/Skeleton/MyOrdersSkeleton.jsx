import Skeleton from 'react-loading-skeleton';

const MyOrdersSkeleton = () => {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="space-y-1">
                    <Skeleton width={140} height={20} />
                    <Skeleton width={220} height={14} />
                </div>
                <Skeleton width={80} height={36} />
            </div>

            {/* Tabs */}
            <div className="flex gap-4">
                <Skeleton width={120} height={36} />
                <Skeleton width={120} height={36} />
            </div>

            {/* Filter & order count */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-3 items-center">
                    <Skeleton width={24} height={24} />
                    <Skeleton width={120} height={32} />
                </div>
                <Skeleton width={100} height={14} />
            </div>

            {/* Orders List */}
            {[1, 2].map((_, i) => (
                <div
                    key={i}
                    className="bg-white border rounded-lg p-4 space-y-4 shadow-sm"
                >
                    {/* Order Header */}
                    <div className="flex justify-between flex-wrap gap-3">
                        <Skeleton width={250} height={16} />
                        <div className="flex gap-2">
                            <Skeleton width={100} height={24} />
                            <Skeleton width={60} height={24} />
                        </div>
                    </div>

                    <Skeleton width={200} height={12} />

                    {/* Order Content */}
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        {/* Item Info */}
                        <div className="flex gap-3">
                            <Skeleton width={60} height={60} className="rounded" />
                            <div className="space-y-2">
                                <Skeleton width={180} height={14} />
                                <Skeleton width={100} height={12} />
                                <Skeleton width={80} height={10} />
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="space-y-1">
                            <Skeleton width={80} height={14} />
                            <Skeleton width={100} height={12} />
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-2">
                            <Skeleton width={120} height={14} />
                            <Skeleton width={140} height={12} />
                            <Skeleton width={100} height={12} />
                            <Skeleton width={80} height={14} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


export default MyOrdersSkeleton