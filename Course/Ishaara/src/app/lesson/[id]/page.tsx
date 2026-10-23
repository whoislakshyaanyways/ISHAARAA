'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourseData, getUserProgress, completeLesson, deductHeart } from '@/lib/storage';
import { Lesson, Challenge, ChallengeOption } from '@/types';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { VideoPlayer } from '@/components/lesson/VideoPlayer';
import { SelectChallenge } from '@/components/lesson/SelectChallenge';
import { FeedbackDrawer } from '@/components/lesson/FeedbackDrawer';
import { LessonComplete } from '@/components/lesson/LessonComplete';
import { OutOfHeartsModal } from '@/components/lesson/OutOfHeartsModal';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<ChallengeOption | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [earnedXp, setEarnedXp] = useState(0);
  const [isHeartLost, setIsHeartLost] = useState(false);
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [unlockedNextId, setUnlockedNextId] = useState<string | null>(null);
  const [isOutOfHearts, setIsOutOfHearts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load lesson from course data
  useEffect(() => {
    const course = getCourseData();
    let foundLesson: Lesson | null = null;

    for (const unit of course.units) {
      for (const l of unit.lessons) {
        if (l.id === lessonId) {
          foundLesson = l;
          break;
        }
      }
      if (foundLesson) break;
    }

    if (foundLesson) {
      setLesson(foundLesson);
      const user = getUserProgress();
      setHearts(user.hearts);
    } else {
      // Lesson not found
      router.push('/learn');
    }
    setIsLoading(false);
  }, [lessonId, router]);

  const challenges = useMemo(() => lesson?.challenges || [], [lesson]);
  const currentChallenge: Challenge | undefined = challenges[currentChallengeIndex];

  // Handle option selection
  const handleSelectOption = useCallback((option: ChallengeOption) => {
    setSelectedOption(option);
  }, []);

  // Handle checking answer
  const handleCheckAnswer = () => {
    if (!selectedOption || !currentChallenge || isAnswerChecked) return;

    const correct = selectedOption.correct;
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      setEarnedXp((prev) => prev + 10);
    } else {
      setMistakesCount((prev) => prev + 1);
      const updatedHearts = deductHeart();
      setHearts(updatedHearts);
      setIsHeartLost(true);
      setTimeout(() => setIsHeartLost(false), 1000);

      if (updatedHearts <= 0) {
        setIsOutOfHearts(true);
      }
    }
  };

  // Handle continuing to next challenge or finishing
  const handleContinue = () => {
    if (currentChallengeIndex + 1 < challenges.length) {
      // Move to next challenge
      setCurrentChallengeIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setIsCorrect(null);
    } else {
      // Complete lesson!
      if (!lesson) return;
      const total = challenges.length;
      const accuracy = Math.max(
        0,
        Math.round(((total - mistakesCount) / total) * 100)
      );
      const isPerfect = mistakesCount === 0;
      const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;
      const totalEarnedXp = earnedXp + lesson.xpReward + (isPerfect ? 15 : 0);

      const result = completeLesson(
        lesson.id,
        accuracy,
        stars,
        totalEarnedXp,
        isPerfect
      );

      setUnlockedNextId(result.unlockedNextId);
      setIsLessonFinished(true);
    }
  };

  const handlePracticeAgain = () => {
    setCurrentChallengeIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setMistakesCount(0);
    setEarnedXp(0);
    setIsLessonFinished(false);
  };

  if (isLoading || !lesson) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-extrabold text-slate-500">Preparing ISL Lesson...</p>
      </div>
    );
  }

  // If completed, show completion screen
  if (isLessonFinished) {
    const total = challenges.length;
    const accuracy = Math.max(
      0,
      Math.round(((total - mistakesCount) / total) * 100)
    );
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;

    return (
      <LessonComplete
        lesson={lesson}
        earnedXp={earnedXp + lesson.xpReward + (mistakesCount === 0 ? 15 : 0)}
        accuracy={accuracy}
        stars={stars}
        heartsRemaining={hearts}
        unlockedNextId={unlockedNextId}
        onPracticeAgain={handlePracticeAgain}
      />
    );
  }

  const correctOption = currentChallenge?.options?.find((o) => o.correct);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col pb-36">
      {/* Top Header */}
      <LessonHeader
        currentIndex={currentChallengeIndex}
        totalChallenges={challenges.length}
        hearts={hearts}
        earnedXp={earnedXp}
        isHeartLost={isHeartLost}
      />

      {/* Main Learning & Challenge Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col items-center justify-center space-y-6">
        {currentChallenge && (
          <>
            {/* Prominent ISL Video Demonstration */}
            <VideoPlayer
              challenge={currentChallenge}
              videoUrl={currentChallenge.videoUrl}
              poster={currentChallenge.videoPoster}
              hint={currentChallenge.hint}
              videoEmoji={currentChallenge.videoEmoji}
              videoSignLabel={currentChallenge.videoSignLabel}
              videoGestureGuide={currentChallenge.videoGestureGuide}
            />

            {/* Interactive Select Challenge */}
            <SelectChallenge
              challenge={currentChallenge}
              selectedOptionId={selectedOption?.id || null}
              onSelectOption={handleSelectOption}
              isAnswerChecked={isAnswerChecked}
            />
          </>
        )}
      </main>

      {/* Bottom Feedback Drawer */}
      <FeedbackDrawer
        isAnswerChecked={isAnswerChecked}
        isCorrect={isCorrect}
        correctAnswerText={correctOption?.text}
        explanation={currentChallenge?.explanation}
        hasSelection={!!selectedOption}
        onCheckAnswer={handleCheckAnswer}
        onContinue={handleContinue}
      />

      {/* Out of Hearts Modal */}
      <OutOfHeartsModal
        isOpen={isOutOfHearts}
        onRefilled={() => {
          setIsOutOfHearts(false);
          setHearts(5);
        }}
      />
    </div>
  );
}
