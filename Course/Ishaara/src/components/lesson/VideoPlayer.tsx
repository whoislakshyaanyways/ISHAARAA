'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Gauge, 
  Video, 
  Hand,
  Info,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Challenge } from '@/types';
import { resolveSignAnimation, SignAnimationConfig } from '@/lib/signAnimations';

interface VideoPlayerProps {
  challenge?: Challenge;
  videoUrl?: string | null;
  poster?: string;
  hint?: string;
  videoEmoji?: string;
  videoSignLabel?: string;
  videoGestureGuide?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  challenge,
  videoUrl = challenge?.videoUrl ?? null,
  poster = challenge?.videoPoster,
  hint = challenge?.hint,
  videoEmoji = challenge?.videoEmoji || '🤟',
  videoSignLabel = challenge?.videoSignLabel,
  videoGestureGuide = challenge?.videoGestureGuide,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Resolve question-specific animation configuration
  const signConfig: SignAnimationConfig = useMemo(() => {
    if (challenge) {
      return resolveSignAnimation(challenge);
    }
    return resolveSignAnimation({
      id: 'custom',
      lessonId: '',
      type: 'SELECT',
      question: videoSignLabel || 'Sign Demonstration',
      videoUrl: videoUrl ?? null,
      videoEmoji,
      videoSignLabel,
      videoGestureGuide,
      order: 1,
    });
  }, [challenge, videoUrl, videoEmoji, videoSignLabel, videoGestureGuide]);

  // Default to animated virtual sign demonstration unless user switches to video clip
  const [activeTab, setActiveTab] = useState<'sign' | 'video'>('sign');

  const steps = signConfig.steps || [];
  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto-cycle animation keyframes based on playback speed
  useEffect(() => {
    if (activeTab === 'sign' && isPlaying && steps.length > 0) {
      const stepInterval = Math.round(1400 / playbackSpeed);
      const timer = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % steps.length);
      }, stepInterval);
      return () => clearInterval(timer);
    }
  }, [activeTab, isPlaying, playbackSpeed, steps.length]);

  // Reset to step 0 when challenge changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  }, [challenge?.id]);

  // Handle Video Mode
  useEffect(() => {
    if (videoUrl && activeTab === 'video') {
      setIsLoading(true);
      setHasError(false);
      if (videoRef.current) {
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.currentTime = 0;
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  }, [videoUrl, playbackSpeed, activeTab]);

  const togglePlay = () => {
    if (activeTab === 'video' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReplay = () => {
    if (activeTab === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 0.75, 0.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto select-none group">
      {/* Top Demonstrator Bar: Mode Switcher & Sign Title */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <Hand className="w-3.5 h-3.5" /> ISL DEMONSTRATION
          </span>
          {signConfig.hindiMeaning && (
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline-block">
              {signConfig.hindiMeaning}
            </span>
          )}
        </div>

        {videoUrl && (
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('sign')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-black text-xs transition-all flex items-center gap-1',
                activeTab === 'sign'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              <Hand className="w-3 h-3" /> Virtual Sign
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-black text-xs transition-all flex items-center gap-1',
                activeTab === 'video'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              <Video className="w-3 h-3" /> Video Clip
            </button>
          </div>
        )}
      </div>

      {/* Main Video / Animated Sign Demonstrator Stage */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border-4 border-slate-200 shadow-xl flex items-center justify-center">
        {/* HTML5 Video Element (when video mode selected) */}
        {activeTab === 'video' && videoUrl && !hasError ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">
                  Loading Video...
                </span>
              </div>
            )}
            <video
              ref={videoRef}
              src={videoUrl}
              poster={poster}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
                setActiveTab('sign');
              }}
              className="w-full h-full object-cover object-center"
            />
          </>
        ) : (
          /* Multi-Step Question-Specific Virtual Sign Animation Stage */
          <div className="w-full h-full flex flex-col items-center justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-5 text-center relative overflow-hidden">
            {/* Ambient Background Gradient Glow corresponding to sign theme */}
            <div
              className={cn(
                'absolute -inset-10 bg-gradient-to-tr opacity-30 blur-2xl pointer-events-none transition-all duration-700',
                signConfig.backdropGlow
              )}
            />

            {/* Top Sign Name Badge */}
            <div className="relative z-10 w-full flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-white/15 shadow-sm">
                {signConfig.signName}
              </span>

              {/* Step counter pill */}
              <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur text-slate-300 text-[11px] font-bold border border-white/10">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>

            {/* Central Animated Signer Avatar & Hand Gesture Area */}
            <div className="relative z-10 my-auto flex items-center justify-center gap-6 sm:gap-8">
              {/* Signer Avatar */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl transition-all duration-500 transform',
                    isPlaying && currentStepIndex === 0 && 'scale-100 rotate-0',
                    isPlaying && currentStepIndex === 1 && 'scale-110 rotate-3 ring-4 ring-emerald-400/40 shadow-emerald-500/30',
                    isPlaying && currentStepIndex === 2 && 'scale-105 -rotate-3 ring-2 ring-amber-400/30'
                  )}
                  style={{
                    transitionDuration: `${500 / playbackSpeed}ms`,
                  }}
                >
                  <span>{currentStep?.avatarPose || signConfig.avatar}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  ISL SIGNER
                </span>
              </div>

              {/* Animated Motion Arrow / Trail */}
              <div className="flex flex-col items-center">
                <div className="text-2xl animate-pulse text-emerald-400">
                  {currentStep?.motionDirection === 'wave' && '〰️'}
                  {currentStep?.motionDirection === 'circle' && '🔄'}
                  {currentStep?.motionDirection === 'up' && '⬆️'}
                  {currentStep?.motionDirection === 'down' && '⬇️'}
                  {currentStep?.motionDirection === 'connect' && '🔗'}
                  {currentStep?.motionDirection === 'pulse' && '✨'}
                  {(!currentStep?.motionDirection || currentStep?.motionDirection === 'right') && '➡️'}
                </div>
                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-tight max-w-[80px] leading-tight mt-0.5">
                  {currentStep?.badgeText?.split(': ')[1] || 'MOTION'}
                </span>
              </div>

              {/* Hand Sign Gesture Frame */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 border-2 border-emerald-400/50 flex items-center justify-center text-4xl sm:text-5xl shadow-xl transition-all duration-500 transform',
                    isPlaying && 'animate-bounce',
                    currentStepIndex === 1 && 'ring-4 ring-emerald-400/50'
                  )}
                  style={{
                    animationDuration: `${1200 / playbackSpeed}ms`,
                  }}
                >
                  <span>{currentStep?.handEmoji || signConfig.visualGraphic}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                  HAND SHAPE
                </span>
              </div>
            </div>

            {/* Bottom Step Guide & Live Caption */}
            <div className="relative z-10 w-full bg-black/40 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-white/10">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-300">
                <span>{currentStep?.title}:</span>
                <span className="text-white font-medium text-xs truncate max-w-xs sm:max-w-md">
                  {currentStep?.description}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Speed Badge */}
        {playbackSpeed !== 1 && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur text-amber-300 text-xs font-black border border-amber-300/40">
            {playbackSpeed}x Speed
          </div>
        )}

        {/* Bottom Video & Motion Control Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between z-20 opacity-90 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
            </button>

            <button
              onClick={handleReplay}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-all"
              title="Replay from Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={cycleSpeed}
              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur text-xs font-black transition-all flex items-center gap-1"
              title="Adjust Speed (0.5x Slow, 0.75x, 1x)"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{playbackSpeed}x</span>
            </button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {activeTab === 'video' && videoUrl && !hasError ? (
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-all"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            ) : (
              <span className="text-[11px] font-extrabold text-slate-300 bg-white/10 px-2.5 py-1 rounded-xl backdrop-blur hidden sm:inline-block">
                {signConfig.motionTrail}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Step Scrubber Pills (Click to inspect any keyframe) */}
      {activeTab === 'sign' && steps.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2.5">
          {steps.map((step, idx) => {
            const isStepActive = currentStepIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setIsPlaying(false); // Pause on manual step click so user can study it
                }}
                className={cn(
                  'p-2 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-2',
                  isStepActive
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-duo-green'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0',
                    isStepActive
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {step.handEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black truncate">{step.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate">
                    {step.badgeText}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Educational Hint underneath */}
      {hint && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
};
