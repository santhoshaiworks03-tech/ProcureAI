import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  SkipForward,
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw
} from 'lucide-react';

interface BrandRevealOpeningScreenProps {
  onComplete?: () => void;
  pageTitle?: string;
}

export const BrandRevealOpeningScreen: React.FC<BrandRevealOpeningScreenProps> = ({
  onComplete,
  pageTitle
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);

  // Enforce strict 2.0x playback speed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const enforceDoubleSpeed = () => {
      try {
        video.playbackRate = 2.0;
        video.defaultPlaybackRate = 2.0;
      } catch (e) {
        // Fallback
      }
    };

    enforceDoubleSpeed();

    const handleLoadedMetadata = () => {
      enforceDoubleSpeed();
      video.play().catch(() => {
        setIsPlaying(false);
      });
    };

    const handlePlay = () => {
      enforceDoubleSpeed();
      setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        setProgress(pct);
      }
      // Re-assert 2x speed if browser resets it
      if (video.playbackRate !== 2.0) {
        enforceDoubleSpeed();
      }
    };

    const handleEnded = () => {
      setHasEnded(true);
      // Auto complete smoothly after short pause
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 450);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('ratechange', enforceDoubleSpeed);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    // Initial play attempt
    video.play().catch(() => {
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ratechange', enforceDoubleSpeed);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      videoRef.current.volume = 1.0;
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComplete) onComplete();
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.playbackRate = 2.0;
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.playbackRate = 2.0;
    video.play();
    setHasEnded(false);
    setIsPlaying(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-[#0E0C0B] flex flex-col items-center justify-center select-none overflow-hidden font-sans"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1C1916]/80 via-[#13110F] to-[#0A0908] pointer-events-none" />

      {/* Subtle brand watermark & background grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#F2C8A8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-5 sm:p-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F2C8A8]" />
            <span className="text-xs font-semibold text-[#FAF7F2] tracking-wide">ProcureAI 2.0</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BE123C]/20 border border-[#BE123C]/30 text-rose-300 text-xs font-mono font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>2.0x SPEED</span>
          </div>

          {pageTitle && (
            <span className="hidden md:inline text-[11px] font-mono text-[#8C847D] border-l border-white/10 pl-3">
              Opening {pageTitle}
            </span>
          )}
        </div>

        {/* Skip Action */}
        <button
          onClick={handleSkip}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] backdrop-blur-md border border-white/15 text-xs font-semibold text-[#FAF7F2] transition-all hover:scale-105 active:scale-95 shadow-lg"
          title="Skip intro and enter portal"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-3.5 h-3.5 text-[#F2C8A8] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Centered Video Showcase Container */}
      <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-[rgba(244,238,230,0.15)] shadow-[0_20px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(242,200,168,0.1)] group cursor-pointer"
          onClick={togglePlay}
        >
          {/* HTML5 Video Element playing at 2.0x speed */}
          <video
            ref={videoRef}
            src="/procureai-intro.mp4"
            autoPlay
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Pause / Play Overlay if paused */}
          {!isPlaying && !hasEnded && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-2xl"
              >
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </motion.div>
            </div>
          )}

          {/* 2x Speed Watermark in Top Corner of Video */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-[#F2C8A8] flex items-center gap-1 shadow-md">
              <Zap className="w-3 h-3 text-[#F2C8A8] fill-current" />
              2x
            </span>
          </div>

          {/* Bottom Video Controls Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF7F2] transition-colors border border-white/15 backdrop-blur-sm"
                title={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#F2C8A8]" />}
              </button>

              {hasEnded ? (
                <button
                  onClick={handleReplay}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#FAF7F2] border border-white/15 backdrop-blur-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Replay (2x)
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F2C8A8] hover:bg-[#F2C8A8]/90 text-xs font-bold text-[#13110F] shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span>Enter Site</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F2C8A8] to-rose-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </motion.div>

        {/* Caption info below the showcase */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between w-full text-xs text-[#8C847D] gap-2 px-2"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B4C7A6] animate-pulse" />
            <span className="font-medium text-[#FAF7F2]">ProcureAI Autonomous Procurement Platform</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-[#F2C8A8]">Playback: 2.0x Fast-Track</span>
            <span className="text-white/20">•</span>
            <span>PayPal AI Hackathon 2026</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
