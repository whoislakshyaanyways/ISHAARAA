'use client';

import React, { useEffect } from 'react';
import { Challenge, ChallengeOption } from '@/types';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface SelectChallengeProps {
  challenge: Challenge;
  selectedOptionId: string | null;
  onSelectOption: (option: ChallengeOption) => void;
  isAnswerChecked: boolean;
}

export const SelectChallenge: React.FC<SelectChallengeProps> = ({
  challenge,
  selectedOptionId,
  onSelectOption,
  isAnswerChecked,
}) => {
  const options = challenge.options || [];

  // Enable keyboard shortcuts 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerChecked) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        onSelectOption(options[num - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, isAnswerChecked, onSelectOption]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 select-none">
      {/* Question prompt */}
      <h2 className="text-xl sm:text-2xl font-black text-slate-800 text-center tracking-tight">
        {challenge.question}
      </h2>

      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.correct;

          let cardStyle =
            'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-duo-sm';

          if (isSelected && !isAnswerChecked) {
            // Selected before submit
            cardStyle =
              'bg-sky-50 border-2 border-sky-500 text-sky-700 shadow-duo-blue';
          } else if (isAnswerChecked) {
            if (isCorrect) {
              // Highlight correct answer in green
              cardStyle =
                'bg-emerald-50 border-2 border-emerald-500 text-emerald-800 shadow-duo-green';
            } else if (isSelected && !isCorrect) {
              // Highlight selected wrong answer in red
              cardStyle =
                'bg-rose-50 border-2 border-rose-500 text-rose-800 shadow-duo-rose';
            } else {
              // Inactive options
              cardStyle = 'bg-slate-100/60 border-2 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => {
                if (!isAnswerChecked) onSelectOption(option);
              }}
              disabled={isAnswerChecked}
              className={cn(
                'btn-duo relative w-full p-4 rounded-2xl flex items-center justify-between text-left font-black text-base transition-all duration-150',
                cardStyle
              )}
            >
              <div className="flex items-center gap-3">
                {/* Number Key Badge [1] [2] [3] [4] */}
                <span
                  className={cn(
                    'w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-black transition-colors',
                    isSelected && !isAnswerChecked
                      ? 'bg-sky-500 text-white border-sky-500'
                      : isAnswerChecked && isCorrect
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : isAnswerChecked && isSelected && !isCorrect
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-100 text-slate-500 border-slate-300'
                  )}
                >
                  {index + 1}
                </span>

                <span className="leading-snug">{option.text}</span>
              </div>

              {/* Status icons when checked */}
              {isAnswerChecked && isCorrect && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
              {isAnswerChecked && isSelected && !isCorrect && (
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
