import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  title,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Validate alt text
  if (!alt || alt.trim().length === 0) {
    console.warn('[SEO] Image missing alt text:', src);
  }

  useEffect(() => {
    if (!priority || !imageRef.current) return;

    // Preload high-priority images
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = src;
    document.head.appendChild(preloadLink);

    return () => {
      document.head.removeChild(preloadLink);
    };
  }, [src, priority]);

  // Generate responsive image srcset for common breakpoints
  const generateSrcSet = (baseSrc: string): string => {
    const breakpoints = [640, 1024, 1280, 1920];
    return breakpoints
      .map((bp) => {
        const newSrc = baseSrc.replace(/\.(jpg|png|webp)$/i, `_${bp}.$1`);
        return `${newSrc} ${bp}w`;
      })
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    console.error('[SEO] Image failed to load:', src);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        title={title || alt}
        width={width}
        height={height}
        sizes={sizes || '100vw'}
        srcSet={generateSrcSet(src)}
        loading={priority ? 'eager' : 'lazy'}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
