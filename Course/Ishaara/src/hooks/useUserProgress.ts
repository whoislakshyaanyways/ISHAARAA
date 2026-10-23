'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProgress } from '@/types';
import { getUserProgress, saveUserProgress, deductHeart, refillHearts } from '@/lib/storage';

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(getUserProgress());
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setProgress(getUserProgress());
  }, []);

  useEffect(() => {
    setProgress(getUserProgress());
    setIsLoaded(true);

    const handleProgressUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProgress>;
      if (customEvent.detail) {
        setProgress(customEvent.detail);
      } else {
        setProgress(getUserProgress());
      }
    };

    window.addEventListener('user-progress-updated', handleProgressUpdate);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('user-progress-updated', handleProgressUpdate);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return {
    progress,
    isLoaded,
    updateProgress: saveUserProgress,
    deductHeart,
    refillHearts,
    refresh,
  };
}
