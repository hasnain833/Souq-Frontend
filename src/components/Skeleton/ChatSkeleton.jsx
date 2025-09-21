import React from 'react';
import Skeleton from 'react-loading-skeleton';

const ChatSkeleton = () => {
    return (
        <div className="flex flex-col md:flex-row mx-auto max-w-[1200px] border border-gray-200 mt-5 mb-5 bg-white min-h-[750px] max-h-[800px] overflow-y-auto rounded-md">
            {/* Sidebar (Always visible) */}
            <div className="w-full md:w-[320px] border-r border-gray-200 p-4 space-y-6">
                {/* Search bar */}
                <Skeleton height={36} className="rounded" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton circle height={40} width={40} />
                        <div className="flex-1 space-y-1">
                            <Skeleton height={12} width={`80%`} />
                            <Skeleton height={10} width={`60%`} />
                            <div className="flex items-center gap-2 mt-1">
                                <Skeleton height={28} width={28} />
                                <div>
                                    <Skeleton height={10} width={100} />
                                    <Skeleton height={10} width={50} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Chat - Hidden on mobile */}
            <div className="hidden md:flex flex-1 flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Skeleton circle height={40} width={40} />
                        <div className="space-y-1">
                            <Skeleton height={12} width={100} />
                            <Skeleton height={10} width={60} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Skeleton height={32} width={90} />
                        <Skeleton height={32} width={80} />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} items-start gap-2`}
                        >
                            {i % 2 === 0 && <Skeleton circle height={32} width={32} />}
                            <div className="p-3 rounded-xl bg-gray-100 max-w-sm w-full space-y-2">
                                <Skeleton height={10} width="80%" />
                                <Skeleton height={10} width="70%" />
                                <Skeleton height={10} width="50%" />
                            </div>
                            {i % 2 !== 0 && <Skeleton circle height={32} width={32} />}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="border-t p-4 flex items-center gap-3">
                    <Skeleton height={40} width={40} borderRadius={6} />
                    <div className="flex-grow">
                        <Skeleton height={40} borderRadius={20} />
                    </div>
                    <Skeleton circle height={40} width={40} />
                </div>
            </div>
        </div>

    );
};

export default ChatSkeleton;
