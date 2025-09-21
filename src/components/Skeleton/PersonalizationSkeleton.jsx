import Skeleton from 'react-loading-skeleton';

export default function PersonalizationSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      {/* Title */}
      <Skeleton className="h-6 w-64 mb-2" />
      <Skeleton className="h-4 w-72 mb-6" />

      {/* Simulated card list */}
      <div className="border rounded-lg divide-y">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        ))}
      </div>

      {/* Button placeholder */}
      <div className="mt-8">
        <Skeleton className="h-10 w-40 rounded" />
      </div>
    </div>
  );
}
