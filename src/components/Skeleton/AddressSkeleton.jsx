import Skeleton from 'react-loading-skeleton'; // if you're using react-loading-skeleton

const AddressSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Skeleton width={140} height={24} />
                <Skeleton width={130} height={36} />
            </div>

            {/* Simulated address blocks */}
            {[1, 2].map((_, i) => (
                <div
                    key={i}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        {/* Left: Address info */}
                        <div className="flex-1 space-y-2">
                            {/* Name + badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Skeleton width={100} height={16} />
                                <Skeleton width={60} height={20} />
                                <Skeleton width={60} height={20} />
                            </div>

                            {/* Address lines */}
                            <Skeleton width="80%" height={12} />
                            <Skeleton width="60%" height={12} />
                            <Skeleton width="70%" height={12} />
                            <Skeleton width="40%" height={12} />
                            <Skeleton width="50%" height={12} />
                        </div>

                        {/* Right: Actions */}
                        <div className="flex gap-2 sm:ml-4">
                            <Skeleton width={36} height={36} borderRadius={8} />
                            <Skeleton width={36} height={36} borderRadius={8} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AddressSkeleton;
