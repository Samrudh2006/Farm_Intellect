import React, { useEffect, useState } from 'react';
import { LottieAnimation, LOTTIE_URLS } from './lottie-animation';
import { AnimatePresence, motion } from 'framer-motion';

// Global event listener approach for simplicity
// In a real app, you'd use a context provider
export const triggerLottieSuccess = () => {
  window.dispatchEvent(new CustomEvent('lottie-success'));
};

export const LottieSuccessOverlay = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleSuccess = () => {
      setShow(true);
      // Hide after animation completes (roughly 2.5 seconds)
      setTimeout(() => setShow(false), 2500);
    };

    window.addEventListener('lottie-success', handleSuccess);
    return () => window.removeEventListener('lottie-success', handleSuccess);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-background/50 backdrop-blur-sm"
        >
          <div className="w-96 h-96">
            <LottieAnimation url={LOTTIE_URLS.success} loop={false} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
