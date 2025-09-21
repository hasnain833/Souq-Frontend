import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const MemberListSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="bg-white shadow-sm rounded-lg p-3 border"
        >
          <div className="flex items-center gap-4">
            <Skeleton circle height={40} width={40} />
            <div className="flex-1">
              <Skeleton height={14} width="80%" />
              <Skeleton height={12} width="60%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
