import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

export const LOTTIE_URLS = {
  aiProcessing: 'https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json', // Futuristic loading/brain
  listening: 'https://assets3.lottiefiles.com/packages/lf20_qp1q7mct.json', // Audio waves
  weather: 'https://assets3.lottiefiles.com/private_files/lf30_jmgekcbq.json', // Sun/Cloud morph
  scanning: 'https://assets1.lottiefiles.com/packages/lf20_pNx6yH.json', // Radar/Scanner
  success: 'https://assets9.lottiefiles.com/packages/lf20_U6OKyK.json', // Checkmark pop
};

interface LottieAnimationProps {
  url?: string;
  animationData?: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const fetchLottieJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load Lottie");
  return res.json();
};

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  url,
  animationData,
  loop = true,
  autoplay = true,
  className,
}) => {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  
  useEffect(() => {
    if (!url || animationData) return;
    
    setFetchedData(null);
    setFetchFailed(false);
    let active = true;

    fetchLottieJson(url)
      .then((json) => {
        if (active) setFetchedData(json);
      })
      .catch((err) => {
        console.error("Error loading Lottie animation from", url, err);
        if (active) setFetchFailed(true);
      });

    return () => {
      active = false;
    };
  }, [url, animationData]);

  const activeAnimationData = animationData || fetchedData;

  // Fallback UI while loading or if it fails
  if (!activeAnimationData) {
    if (fetchFailed) {
      return (
        <div className={`flex items-center justify-center animate-spin rounded-full border-2 border-primary border-t-transparent ${className}`} />
      );
    }
    return <div className={`animate-pulse bg-primary/20 rounded-full ${className}`} />;
  }

  return <Lottie animationData={activeAnimationData} loop={loop} autoplay={autoplay} className={className} />;
};
