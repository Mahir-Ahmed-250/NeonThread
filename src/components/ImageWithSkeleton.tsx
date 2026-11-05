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
  loading = "eager"
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (!src) {
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    setIsLoaded(false);
    setHasError(false);

    const img = new Image();
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      img.onload = () => {
        setIsLoaded(true);
      };
      img.onerror = () => {
        // Handled by onError on img
      };
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 z-10 pointer-events-none ${skeletonClassName}`}>
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        </div>
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        referrerPolicy={referrerPolicy}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
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
