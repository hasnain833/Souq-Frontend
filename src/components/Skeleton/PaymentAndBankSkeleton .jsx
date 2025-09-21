import Skeleton from 'react-loading-skeleton'

const PaymentAndBankSkeleton = () => {
    return (
        <div className="p-4 container mx-auto space-y-6">
            {/* Payment Cards Skeleton */}
            <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <Skeleton width={140} height={16} />
                    <Skeleton width={120} height={36} />
                </div>

                {/* Card Items */}
                <div className="space-y-4">
                    {[1, 2].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4 bg-white shadow-sm">
                            <div className="flex items-start gap-3">
                                <Skeleton width={32} height={32} />
                                <div className="space-y-2">
                                    <Skeleton width={120} height={14} />
                                    <Skeleton width={180} height={12} />
                                    <Skeleton width={100} height={10} />
                                    <Skeleton width={70} height={10} />
                                </div>
                            </div>
                            <div className="flex gap-2 self-start sm:self-center">
                                <Skeleton width={36} height={36} borderRadius={8} />
                                <Skeleton width={36} height={36} borderRadius={8} />
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Bank Accounts Skeleton */}
            <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <Skeleton width={140} height={16} />
                    <Skeleton width={160} height={36} />
                </div>

                {/* Bank Account Items */}
                <div className="space-y-4">
                    {[1, 2].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4 bg-white shadow-sm">
                            <div className="flex items-start gap-3">
                                <Skeleton width={32} height={32} />
                                <div className="space-y-2">
                                    <Skeleton width={100} height={14} />
                                    <Skeleton width={180} height={12} />
                                    <Skeleton width={140} height={10} />
                                    <Skeleton width={80} height={10} />
                                </div>
                            </div>
                            <div className="flex gap-2 self-start sm:self-center">
                                <Skeleton width={36} height={36} borderRadius={8} />
                                <Skeleton width={36} height={36} borderRadius={8} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentAndBankSkeleton;
