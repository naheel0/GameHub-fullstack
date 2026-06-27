import React from 'react';

export const HeroSkeleton = () => (
  <div className="relative w-full h-full bg-gray-900">
    {/* Background Image Placeholder */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
    
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
    
    {/* Content */}
    <div className="relative z-10 flex items-center justify-center h-full px-6 sm:px-4">
      <div className="text-center max-w-2xl">
        <div className="h-16 md:h-12 sm:h-8 bg-gray-800/80 backdrop-blur-sm animate-pulse rounded-lg w-80 sm:w-64 mx-auto mb-4" />
        <div className="h-6 bg-gray-800/60 backdrop-blur-sm animate-pulse rounded-lg w-64 sm:w-48 mx-auto mb-8" />
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-5 bg-gray-800/80 backdrop-blur-sm animate-pulse rounded" />
            ))}
          </div>
          <div className="h-6 bg-gray-800/60 backdrop-blur-sm animate-pulse rounded-lg w-20" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="h-12 bg-gray-800/80 backdrop-blur-sm animate-pulse rounded-lg w-36" />
          <div className="h-12 bg-gray-800/60 backdrop-blur-sm animate-pulse rounded-lg w-36" />
        </div>
      </div>
    </div>
  </div>
);

export const FeatureSkeleton = () => (
  <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
    <div className="w-12 h-12 bg-gray-800/60 animate-pulse rounded-full mx-auto mb-4" />
    <div className="h-6 bg-gray-800/60 animate-pulse rounded-lg w-32 mx-auto mb-2" />
    <div className="h-4 bg-gray-800/40 animate-pulse rounded-lg w-48 mx-auto" />
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
  <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
    {/* Image with Relative Container */}
    <div className="relative">
      <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
      {/* Price Badge */}
      <div className="absolute top-2 right-2 bg-gray-800/80 backdrop-blur-sm animate-pulse rounded px-3 py-1 h-6 w-16" />
    </div>
    
    {/* Content */}
    <div className="p-6">
      <div className="h-6 bg-gray-800/60 animate-pulse rounded-lg mb-2" />
      <div className="h-4 bg-gray-800/40 animate-pulse rounded-lg mb-3 w-3/4" />
      <div className="flex items-center mb-4">
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-4 bg-gray-800/60 animate-pulse rounded" />
          ))}
        </div>
        <div className="h-4 bg-gray-800/40 animate-pulse rounded-lg w-8 ml-2" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-800/60 animate-pulse rounded-lg w-16" />
        <div className="h-9 bg-gray-800/60 animate-pulse rounded-lg w-24" />
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