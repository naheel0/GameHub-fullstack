import React from 'react';

export const HeroSkeleton = () => (
  <div className="relative w-full h-full flex items-center justify-center text-center text-white">
    <div className="h-12 bg-gray-800 animate-pulse rounded-lg w-96 mb-6" />
    <div className="h-6 bg-gray-800 animate-pulse rounded-lg w-64 mb-8" />
    <div className="flex items-center justify-center space-x-4 mb-8">
      <div className="h-10 bg-gray-800 animate-pulse rounded-lg w-32" />
      <div className="h-10 bg-gray-800 animate-pulse rounded-lg w-32" />
    </div>
  </div>
);

export const FeatureSkeleton = () => (
  <div className="text-center p-6 bg-gray-800 rounded-lg">
    <div className="w-12 h-12 bg-gray-800 animate-pulse rounded-full mx-auto mb-4" />
    <div className="h-6 bg-gray-800 animate-pulse rounded-lg w-32 mx-auto mb-2" />
    <div className="h-4 bg-gray-800 animate-pulse rounded-lg w-48 mx-auto" />
  </div>
);

export const Skeleton = ({ className = '', count = 1 }) => {
  const baseClass = 'animate-pulse bg-gray-800/60 rounded';
  
  if (count > 1) {
    return (
      <div className="grid gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseClass} ${className}`} />
        ))}
      </div>
    );
  }
  
  return <div className={`${baseClass} ${className}`} />;
};

export const GameCardSkeleton = () => (
  <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-800">
    <div className="h-48 bg-gray-800 animate-pulse" />
    <div className="p-4">
      <div className="h-5 bg-gray-800 animate-pulse rounded mb-2" />
      <div className="h-4 bg-gray-800 animate-pulse rounded mb-2 w-3/4" />
      <div className="h-3 bg-gray-800 animate-pulse rounded mb-3 w-1/2" />
      <div className="flex items-center mb-3">
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-4 bg-gray-800 animate-pulse rounded" />
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-800 animate-pulse rounded w-16" />
        <div className="h-9 bg-gray-800 animate-pulse rounded w-28" />
      </div>
    </div>
  </div>
);

export const CartItemSkeleton = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="shrink-0">
        <div className="w-24 h-32 bg-gray-800 animate-pulse rounded-lg" />
      </div>
      <div className="grow">
        <div className="h-5 bg-gray-800 animate-pulse rounded mb-2" />
        <div className="h-4 bg-gray-800 animate-pulse rounded mb-3 w-3/4" />
        <div className="h-3 bg-gray-800 animate-pulse rounded mb-3 w-1/2" />
      </div>
      <div className="flex flex-col items-end justify-between">
        <div className="h-9 bg-gray-800 animate-pulse rounded w-24 mb-4" />
        <div className="text-right">
          <div className="h-5 bg-gray-800 animate-pulse rounded w-16 mb-1" />
          <div className="h-4 bg-gray-800 animate-pulse rounded w-12" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;