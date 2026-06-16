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

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  url,
  animationData,
  loop = true,
  autoplay = true,
  className,
}) => {
  const [data, setData] = useState<any>(animationData);
  
  useEffect(() => {
    if (url && !animationData) {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load Lottie");
          return res.json();
        })
        .then((json) => setData(json))
        .catch((err) => {
          console.error("Error loading Lottie animation from", url, err);
          // Set to a boolean false so we know it failed
          setData(false); 
        });
    }
  }, [url, animationData]);

  // Fallback UI while loading or if it fails
  if (data === undefined) {
    return <div className={`animate-pulse bg-primary/20 rounded-full ${className}`} />;
  }
  
  // If fetch fails, return a generic spinner
  if (data === false) {
    return (
      <div className={`flex items-center justify-center animate-spin rounded-full border-2 border-primary border-t-transparent ${className}`} />
    );
  }

  return <Lottie animationData={data} loop={loop} autoplay={autoplay} className={className} />;
};
