'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, Zap } from 'lucide-react';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Modal } from '@/components/common/Modal';

interface LessonHeaderProps {
  currentIndex: number;
  totalChallenges: number;
  hearts: number;
  earnedXp: number;
  isHeartLost?: boolean;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
  currentIndex,
  totalChallenges,
  hearts,
  earnedXp,
  isHeartLost = false,
}) => {
  const router = useRouter();
  const [showExitModal, setShowExitModal] = useState(false);

  const progressPercentage = totalChallenges > 0
    ? (currentIndex / totalChallenges) * 100
    : 0;

  return (
    <>
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4 py-4 px-4 sm:px-6 select-none">
        {/* Close Button */}
        <button
          onClick={() => setShowExitModal(true)}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors"
          aria-label="Quit lesson"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Lesson Progress Bar */}
        <div className="flex-1 max-w-xl">
          <ProgressBar
            value={progressPercentage}
            height="md"
            color="green"
          />
        </div>

        {/* Stats on right */}
        <div className="flex items-center gap-4">
          {/* XP gained in this session */}
          <div className="hidden sm:flex items-center gap-1 font-black text-xs text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>+{earnedXp} XP</span>
          </div>

          {/* Hearts */}
          <div
            className={`flex items-center gap-1.5 font-black text-base text-rose-500 transition-transform ${
              isHeartLost ? 'animate-bounce text-rose-600 scale-125' : ''
            }`}
          >
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            <span>{hearts}</span>
          </div>
        </div>
      </header>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Leave Lesson?"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-4">
          <div className="text-4xl">🥺</div>
          <p className="text-sm font-bold text-slate-600">
            Are you sure you want to quit? All progress made in this session will not be saved.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setShowExitModal(false)}
              className="btn-duo w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-duo-green border-b-4 border-emerald-600"
            >
              KEEP LEARNING
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="btn-duo w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl"
            >
              QUIT LESSON
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
