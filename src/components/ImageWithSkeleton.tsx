import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from './Skeleton';

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  loading?: "lazy" | "eager";
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({ 
  src, 
  alt, 
  className = "", 
  skeletonClassName = "",
  referrerPolicy,
  loading = "lazy"
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 z-10 ${skeletonClassName}`}>
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        referrerPolicy={referrerPolicy}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-[10px] font-bold uppercase p-4 text-center">
          Image Failed
        </div>
      )}
    </div>
  );
};
