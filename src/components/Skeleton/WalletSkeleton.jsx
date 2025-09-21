import Skeleton from 'react-loading-skeleton';

const WalletSkeleton = () => {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton width={140} height={20} />
          <Skeleton width={220} height={14} />
        </div>
       <Skeleton width={80} height={36} />
      </div>

      {/* Currency Toggle */}
      <div className="flex flex-wrap justify-end gap-2">
        {[1, 2, 3, 4].map((_, i) => (
          <Skeleton key={i} width={50} height={30} />
        ))}
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((_, i) => (
          <div key={i} className="p-4 rounded-lg shadow bg-white space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={20} />
            <Skeleton width="30%" height={12} />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((_, i) => (
          <Skeleton key={i} width={150} height={40} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b pb-2">
        {[1, 2, 3, 4].map((_, i) => (
          <Skeleton key={i} width={100} height={14} />
        ))}
      </div>

      {/* Currency Balances */}
      <div className="p-4 border rounded-lg space-y-4 bg-white">
        <Skeleton width={180} height={18} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton width={80} height={12} />
              <Skeleton width={60} height={18} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-4 border rounded-lg space-y-4 bg-white">
        <div className="flex justify-between items-center">
          <Skeleton width={160} height={18} />
          <Skeleton width={60} height={12} />
        </div>
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="flex justify-between items-start gap-4 border-t pt-3">
            <div className="flex items-start gap-3">
              <Skeleton width={32} height={32} />
              <div className="space-y-1">
                <Skeleton width={140} height={12} />
                <Skeleton width={180} height={10} />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton width={50} height={12} />
              <Skeleton width={80} height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletSkeleton