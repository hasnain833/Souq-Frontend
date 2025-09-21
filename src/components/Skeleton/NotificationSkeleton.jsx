import Skeleton from 'react-loading-skeleton';

const NotificationSkeleton = () => {
    return (
        <div className="space-y-6 px-4 pt-6 pb-10 container mx-auto">
            {/* Sticky Header Skeleton */}
            <div className="sticky top-0 z-10 bg-white border-b py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* <Skeleton className="w-10 h-10 rounded-full" /> */}
                        <div className="space-y-2">
                            <Skeleton className="w-28 h-4 rounded" />
                            <Skeleton className="w-20 h-3 rounded" />
                        </div>
                    </div>
                    <Skeleton className="w-24 h-8 rounded" />
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="w-24 h-8 rounded-full" />
                ))}
            </div>

            {/* Notification Cards */}
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="w-3/4 h-4 rounded" />
                            <Skeleton className="w-2/3 h-3 rounded" />
                        </div>
                    </div>
                    <Skeleton className="w-1/4 h-3 ml-14 rounded" />
                </div>
            ))}
        </div>
    );
};


export default NotificationSkeleton;
