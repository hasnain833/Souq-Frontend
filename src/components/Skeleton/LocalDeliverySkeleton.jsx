import Skeleton from 'react-loading-skeleton';
import { MapPin, Clock } from "lucide-react";

export default function LocalDeliverySkeleton() {
    return (
        <div className="space-y-8 mt-4">
            {/* Pickup Locations */}
            <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <div className="space-y-1">
                        <Skeleton width={160} height={18} />
                        <Skeleton width={250} height={12} />
                    </div>
                    <Skeleton width={180} height={36} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 bg-white space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                <Skeleton width={120} height={14} />
                                <div className="flex gap-2">
                                    <Skeleton width={28} height={28} borderRadius={8} />
                                    <Skeleton width={28} height={28} borderRadius={8} />
                                </div>
                            </div>
                            <Skeleton width="80%" height={12} />
                            <Skeleton width="60%" height={12} />
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <Skeleton width={100} height={10} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Drop-off Locations */}
            <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <div className="space-y-1">
                        <Skeleton width={180} height={18} />
                        <Skeleton width={260} height={12} />
                    </div>
                    <Skeleton width={180} height={36} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 bg-white space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                <Skeleton width={120} height={14} />
                                <div className="flex gap-2">
                                    <Skeleton width={28} height={28} borderRadius={8} />
                                    <Skeleton width={28} height={28} borderRadius={8} />
                                </div>
                            </div>
                            <Skeleton width="75%" height={12} />
                            <Skeleton width="60%" height={12} />
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <Skeleton width={120} height={10} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
