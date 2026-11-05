import React, { useState, useEffect } from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] ${className || ''}`} />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl flex flex-col border border-gray-100 dark:border-gray-800">
      <Skeleton className="aspect-square rounded-xl mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  loading?: "lazy" | "eager";
  dark?: boolean;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  className = '',
  imageClassName = '',
  onClick,
  loading = 'lazy',
  dark = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {(!isLoaded && !hasError && !!src) && (
        <div className={`absolute inset-0 animate-pulse z-10 flex items-center justify-center ${dark ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800'}`}>
          <div className="w-full h-full bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}
      {hasError || !src ? (
        <div className={`w-full h-full min-h-[80px] flex items-center justify-center text-xs font-mono p-2 text-center ${dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
          {alt || 'Image'}
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${imageClassName || 'w-full h-full object-cover'} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};
