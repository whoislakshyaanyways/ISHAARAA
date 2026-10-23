'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Zap, Heart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackDrawerProps {
  isAnswerChecked: boolean;
  isCorrect: boolean | null;
  correctAnswerText?: string;
  explanation?: string;
  hasSelection: boolean;
  onCheckAnswer: () => void;
  onContinue: () => void;
}

export const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({
  isAnswerChecked,
  isCorrect,
  correctAnswerText,
  explanation,
  hasSelection,
  onCheckAnswer,
  onContinue,
}) => {
  // Allow Enter key to trigger check or continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!isAnswerChecked && hasSelection) {
          onCheckAnswer();
        } else if (isAnswerChecked) {
          onContinue();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerChecked, hasSelection, onCheckAnswer, onContinue]);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 py-6 px-4 sm:px-8 border-t-2 z-30 transition-all duration-200 select-none',
        !isAnswerChecked && 'bg-white border-slate-200 shadow-lg',
        isAnswerChecked && isCorrect && 'bg-emerald-100 border-emerald-300',
        isAnswerChecked && !isCorrect && 'bg-rose-100 border-rose-300'
      )}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* State feedback message */}
        <div className="flex-1 w-full flex items-start gap-4">
          {isAnswerChecked && isCorrect && (
            <div className="flex items-start gap-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-duo-green">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-emerald-800 tracking-tight">
                    Nicely done!
                  </h3>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-black">
                    <Zap className="w-3.5 h-3.5 fill-white" /> +10 XP
                  </span>
                </div>
                {explanation && (
                  <p className="text-xs font-bold text-emerald-700/90 mt-1 max-w-lg">
                    {explanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {isAnswerChecked && !isCorrect && (
            <div className="flex items-start gap-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-duo-rose">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-rose-800 tracking-tight">
                    Not quite
                  </h3>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black">
                    <Heart className="w-3.5 h-3.5 fill-white" /> -1 Heart
                  </span>
                </div>
                <p className="text-sm font-black text-rose-900 mt-1">
                  Correct answer:{' '}
                  <span className="underline decoration-2">{correctAnswerText}</span>
                </p>
                {explanation && (
                  <p className="text-xs font-bold text-rose-700/90 mt-0.5 max-w-lg">
                    {explanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {!isAnswerChecked && (
            <div className="hidden sm:block text-xs font-bold text-slate-400">
              Select an answer and press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-600 font-mono">Enter</kbd>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto flex-shrink-0">
          {!isAnswerChecked ? (
            <button
              onClick={onCheckAnswer}
              disabled={!hasSelection}
              className={cn(
                'btn-duo w-full sm:w-44 py-4 px-6 rounded-2xl font-black text-base tracking-wider uppercase transition-all flex items-center justify-center gap-2',
                hasSelection
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-duo-green border-b-4 border-emerald-600'
                  : 'bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed'
              )}
            >
              CHECK
            </button>
          ) : (
            <button
              onClick={onContinue}
              className={cn(
                'btn-duo w-full sm:w-44 py-4 px-6 rounded-2xl font-black text-base tracking-wider uppercase transition-all flex items-center justify-center gap-2 text-white',
                isCorrect
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-duo-green border-b-4 border-emerald-600'
                  : 'bg-rose-500 hover:bg-rose-600 shadow-duo-rose border-b-4 border-rose-600'
              )}
            >
              CONTINUE <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
