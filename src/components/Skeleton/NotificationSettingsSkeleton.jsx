import Skeleton from 'react-loading-skeleton';

export default function NotificationSettingsSkeleton() {
    return (
        <div className="space-y-8">
            {/* Toggle Master */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            {/* Sections */}
            {Array.from({ length: 4 }).map((_, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                    <Skeleton className="h-4 w-40" /> {/* Section title */}
                    {Array.from({ length: 3 }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex justify-between items-center p-4 border rounded-lg">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
