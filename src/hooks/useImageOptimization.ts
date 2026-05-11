import { useCallback, useEffect, useRef, useState } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export const useImageOptimization = () => {
  const [isWebPSupported, setIsWebPSupported] = useState(false);
  const [isAVIFSupported, setIsAVIFSupported] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect WebP support
  useEffect(() => {
    const checkWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      setIsWebPSupported(canvas.toDataURL('image/webp').indexOf('image/webp') === 5);
    };

    const checkAVIF = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      setIsAVIFSupported(canvas.toDataURL('image/avif').indexOf('image/avif') === 5);
    };

    checkWebP();
    checkAVIF();
  }, []);

  const optimizeImageUrl = useCallback((
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): string => {
    if (!originalUrl) return '';

    const { quality = 80, width, height, format } = options;
    const params = new URLSearchParams();

    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());

    // Use Vercel Image Optimization if available
    if (originalUrl.startsWith('/')) {
      return `/_next/image?url=${encodeURIComponent(originalUrl)}&${params.toString()}`;
    }

    return originalUrl;
  }, []);

  const getResponsiveSrcSet = useCallback((baseUrl: string): string => {
    const breakpoints = [320, 640, 1024, 1280, 1920];
    return breakpoints
      .map((width) => {
        const optimized = optimizeImageUrl(baseUrl, { width });
        return `${optimized} ${width}w`;
      })
      .join(', ');
  }, [optimizeImageUrl]);

  const getSizes = useCallback((): string => {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, (max-width: 1280px) 50vw, 33vw';
  }, []);

  const getOptimalFormat = useCallback((fallbackUrl: string): string => {
    if (isAVIFSupported) {
      return fallbackUrl.replace(/\.(jpg|png)$/i, '.avif');
    }
    if (isWebPSupported) {
      return fallbackUrl.replace(/\.(jpg|png)$/i, '.webp');
    }
    return fallbackUrl;
  }, [isWebPSupported, isAVIFSupported]);

  const preloadImage = useCallback((src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  return {
    isWebPSupported,
    isAVIFSupported,
    optimizeImageUrl,
    getResponsiveSrcSet,
    getSizes,
    getOptimalFormat,
    preloadImage,
  };
};
