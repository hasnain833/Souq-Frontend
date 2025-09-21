import Skeleton from 'react-loading-skeleton';

const ProfileSkeleton = () => (
    <div className="space-y-6">
        {/* Photo Upload */}
        <div className="bg-white shadow rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
                <Skeleton width={120} height={14} />
                <div className="flex items-center gap-4">
                    <Skeleton circle height={48} width={48} />
                    <Skeleton height={32} width={100} />
                </div>
            </div>

            {/* Username */}
            <div className="border-t p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="w-full md:w-1/3">
                    <Skeleton width={100} height={14} />
                </div>
                <div className="w-full md:w-1/2">
                    <Skeleton className="w-full rounded-md" height={44} />
                </div>
            </div>

            {/* About You */}
            <div className="border-t p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="w-full md:w-1/3">
                    <Skeleton width={100} height={14} />
                </div>
                <div className="w-full md:w-2/3">
                    <Skeleton className="w-full rounded-md" height={80} />
                </div>
            </div>
        </div>

        {/* Country & City */}
        <div className="bg-white shadow rounded-lg">
            <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="w-full md:w-1/3">
                    <Skeleton width={100} height={14} />
                </div>
                <div className="w-full md:w-1/3">
                    <Skeleton className="w-full rounded-md" height={44} />
                </div>
            </div>
            <div className="border-t p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="w-full md:w-1/3">
                    <Skeleton width={100} height={14} />
                </div>
                <div className="w-full md:w-1/3">
                    <Skeleton className="w-full rounded-md" height={44} />
                </div>
            </div>
            <div className="border-t p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="w-full md:w-1/3">
                    <Skeleton width={150} height={14} />
                </div>
                <div className="w-full md:w-auto">
                    <Skeleton width={48} height={28} borderRadius={9999} />
                </div>
            </div>
        </div>

        {/* Language */}
        <div className="bg-white shadow rounded-lg">
            <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="w-full md:w-1/3">
                    <Skeleton width={100} height={14} />
                </div>
                <div className="w-full md:w-1/3">
                    <Skeleton className="w-full rounded-md" height={44} />
                </div>
            </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
            <Skeleton width={140} height={44} className="rounded-md" />
        </div>
    </div>

);

export default ProfileSkeleton;
