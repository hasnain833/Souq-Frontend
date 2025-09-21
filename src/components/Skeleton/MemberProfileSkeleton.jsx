import React from 'react';
import Skeleton from 'react-loading-skeleton';

const MemberProfileSkeleton = () => {
  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <Skeleton circle height={176} width={176} />

        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Skeleton height={24} width={200} />
            <Skeleton height={36} width={140} />
          </div>

          <Skeleton height={24} width={150} />

          <div className="flex items-start gap-12 flex-wrap text-md text-gray-600">
            <div className="space-y-3">
              <Skeleton height={16} width={100} />
              <Skeleton height={16} width={180} />
              <Skeleton height={16} width={200} />
              <Skeleton height={16} width={250} />
            </div>

            <div className="space-y-3">
              <Skeleton height={16} width={120} />
              <Skeleton height={16} width={180} />
              <Skeleton height={16} width={150} />
              <Skeleton height={16} width={150} />
            </div>
          </div>

          <Skeleton count={2} height={16} width="100%" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b flex gap-6 text-sm font-medium text-gray-600">
        {['listings', 'reviews'].map((tab, idx) => (
          <Skeleton key={idx} height={24} width={80} />
        ))}
      </div>

      {/* Tab Content (Product Grid Skeletons) */}
      <div className="mt-4 min-h-[600px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton height={180} className="rounded" />
              <Skeleton height={16} width="80%" />
              <Skeleton height={16} width="60%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberProfileSkeleton;
