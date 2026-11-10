import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BrandRevealOpeningScreenProps {
  onComplete?: () => void;
  pageTitle?: string;
}

/**
 * Full-screen loading screen playing the brand reveal video at 2x accelerated speed (~2.5s duration)
 * with zero player chrome/details, transitioning seamlessly into the landing page.
 */
export const BrandRevealOpeningScreen: React.FC<BrandRevealOpeningScreenProps> = ({
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const TARGET_DURATION_SEC = 2.5;

    const enforcePlaybackSpeed = () => {
      try {
        if (video.duration && video.duration > 0) {
          const rate = Math.max(2.0, video.duration / TARGET_DURATION_SEC);
          video.playbackRate = rate;
          video.defaultPlaybackRate = rate;
        } else {
          video.playbackRate = 4.0;
          video.defaultPlaybackRate = 4.0;
        }
      } catch {
        video.playbackRate = 4.0;
      }
    };

    enforcePlaybackSpeed();

    const handleLoadedMetadata = () => {
      enforcePlaybackSpeed();
      video.play().catch(() => {});
    };

    const handlePlay = () => {
      enforcePlaybackSpeed();
    };

    const handleEnded = () => {
      if (onComplete) onComplete();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('ratechange', enforcePlaybackSpeed);
    video.addEventListener('ended', handleEnded);

    video.play().catch(() => {});

    // Guaranteed completion timer at ~2.5 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ratechange', enforcePlaybackSpeed);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] bg-black w-screen h-screen overflow-hidden flex items-center justify-center select-none"
    >
      {/* Full-screen loading screen video */}
      <video
        ref={videoRef}
        src="/procureai-intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Sleek bottom loading progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-[#F2C8A8] via-[#FAF7F2] to-[#B4C7A6]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
};
