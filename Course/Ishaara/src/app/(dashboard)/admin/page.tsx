'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCourse } from '@/hooks/useCourse';
import { resetAllData } from '@/lib/storage';
import { Unit, Lesson, Challenge, ChallengeOption } from '@/types';
import { Modal } from '@/components/common/Modal';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Play, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Video,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AdminPage() {
  const { course, updateCourse } = useCourse();

  const [expandedUnitId, setExpandedUnitId] = useState<string | null>('unit-1-greetings');
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>('u1-l1');

  // Modals
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [targetUnitId, setTargetUnitId] = useState<string>('unit-1-greetings');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonType, setNewLessonType] = useState<'regular' | 'checkpoint' | 'boss'>('regular');
  const [newLessonXp, setNewLessonXp] = useState(25);

  // Add Challenge Modal
  const [showAddChallengeModal, setShowAddChallengeModal] = useState(false);
  const [targetLessonId, setTargetLessonId] = useState<string>('u1-l1');
  const [challengeQuestion, setChallengeQuestion] = useState('What does this ISL sign mean?');
  const [challengeEmoji, setChallengeEmoji] = useState('👋');
  const [challengeSignLabel, setChallengeSignLabel] = useState('Sign for: HELLO');
  const [challengeGestureGuide, setChallengeGestureGuide] = useState('Open palm waves outward at temple level.');
  const [challengeVideoUrl, setChallengeVideoUrl] = useState('');
  const [challengeExplanation, setChallengeExplanation] = useState('');
  const [challengeHint, setChallengeHint] = useState('');
  const [option1, setOption1] = useState('Option A');
  const [option2, setOption2] = useState('Option B');
  const [option3, setOption3] = useState('Option C');
  const [option4, setOption4] = useState('Option D');
  const [correctOptIndex, setCorrectOptIndex] = useState(0);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Create Lesson Handler
  const handleCreateLesson = () => {
    if (!newLessonTitle.trim()) return;

    const unit = course.units.find((u) => u.id === targetUnitId);
    if (!unit) return;

    const newId = `${targetUnitId}-l${unit.lessons.length + 1}-${Date.now().toString().slice(-4)}`;
    const newLesson: Lesson = {
      id: newId,
      unitId: targetUnitId,
      title: newLessonTitle.trim(),
      description: newLessonDesc.trim() || 'Learn essential ISL signs for this topic.',
      order: unit.lessons.length + 1,
      type: newLessonType,
      xpReward: Number(newLessonXp) || 25,
      challenges: [
        {
          id: `${newId}-c1`,
          lessonId: newId,
          type: 'SELECT',
          question: 'What does this ISL sign represent?',
          videoUrl: null,
          videoEmoji: '🤟',
          videoSignLabel: `Sign for: ${newLessonTitle.trim().toUpperCase()}`,
          videoGestureGuide: 'Watch the hand movement and facial expressions carefully.',
          explanation: 'Watch the hand movement and facial expressions carefully.',
          order: 1,
          options: [
            { id: 'opt-1', text: newLessonTitle.trim(), correct: true },
            { id: 'opt-2', text: 'Thank You', correct: false },
            { id: 'opt-3', text: 'Goodbye', correct: false },
            { id: 'opt-4', text: 'Please', correct: false },
          ],
        },
      ],
    };

    const updatedUnits = course.units.map((u) =>
      u.id === targetUnitId ? { ...u, lessons: [...u.lessons, newLesson] } : u
    );

    updateCourse({ ...course, units: updatedUnits });
    setShowAddLessonModal(false);
    setNewLessonTitle('');
    setNewLessonDesc('');
    showStatus(`Created Lesson: "${newLesson.title}"`);
  };

  // Create Challenge Handler
  const handleCreateChallenge = () => {
    if (!challengeQuestion.trim()) return;

    const newChallengeId = `c-${Date.now()}`;
    const options: ChallengeOption[] = [
      { id: 'opt-1', text: option1.trim(), correct: correctOptIndex === 0 },
      { id: 'opt-2', text: option2.trim(), correct: correctOptIndex === 1 },
      { id: 'opt-3', text: option3.trim(), correct: correctOptIndex === 2 },
      { id: 'opt-4', text: option4.trim(), correct: correctOptIndex === 3 },
    ];

    const newChallenge: Challenge = {
      id: newChallengeId,
      lessonId: targetLessonId,
      type: 'SELECT',
      question: challengeQuestion.trim(),
      videoUrl: challengeVideoUrl.trim() || null,
      videoEmoji: challengeEmoji.trim() || '🤟',
      videoSignLabel: challengeSignLabel.trim() || undefined,
      videoGestureGuide: challengeGestureGuide.trim() || undefined,
      explanation: challengeExplanation.trim() || undefined,
      hint: challengeHint.trim() || undefined,
      order: 1,
      options,
    };

    const updatedUnits = course.units.map((u) => ({
      ...u,
      lessons: u.lessons.map((l) =>
        l.id === targetLessonId
          ? { ...l, challenges: [...l.challenges, newChallenge] }
          : l
      ),
    }));

    updateCourse({ ...course, units: updatedUnits });
    setShowAddChallengeModal(false);
    showStatus(`Added Challenge to Lesson: "${targetLessonId}"`);
  };

  // Delete Lesson
  const handleDeleteLesson = (unitId: string, lessonId: string) => {
    const updatedUnits = course.units.map((u) =>
      u.id === unitId
        ? { ...u, lessons: u.lessons.filter((l) => l.id !== lessonId) }
        : u
    );
    updateCourse({ ...course, units: updatedUnits });
    showStatus(`Deleted Lesson "${lessonId}"`);
  };

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6 select-none">
      {/* Admin CMS Header */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-3xl p-6 text-white border-b-4 border-slate-950 shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-slate-700/80 text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> CMS ADMINISTRATOR
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Content Management</h1>
          <p className="text-xs font-bold text-slate-300 mt-1 max-w-sm">
            Add units, lessons, and video challenges directly into the active course.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all progress and content back to default seed?')) {
              resetAllData();
            }
          }}
          className="btn-duo px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-duo-rose flex items-center gap-1.5 flex-shrink-0"
          title="Restore original database seed"
        >
          <RotateCcw className="w-4 h-4" /> RESET DATA
        </button>
      </div>

      {/* Toast Banner */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-black text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {statusMessage}
        </div>
      )}

      {/* Course Hierarchy Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">
            Active Units & Lessons ({course.units.length} Units)
          </h2>
        </div>

        {course.units.map((unit) => {
          const isExpanded = expandedUnitId === unit.id;

          return (
            <div
              key={unit.id}
              className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm"
            >
              {/* Unit Header Bar */}
              <div
                onClick={() => setExpandedUnitId(isExpanded ? null : unit.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{unit.icon || '📖'}</span>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      {unit.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-400">
                      {unit.lessons.length} Lessons • Theme: {unit.color}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetUnitId(unit.id);
                      setShowAddLessonModal(true);
                    }}
                    className="btn-duo px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> LESSON
                  </button>

                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Lessons List inside Unit */}
              {isExpanded && (
                <div className="p-4 bg-slate-50/80 border-t-2 border-slate-100 space-y-3">
                  {unit.lessons.length === 0 ? (
                    <p className="text-xs font-bold text-slate-400 text-center py-3">
                      No lessons in this unit yet. Click &ldquo;+ LESSON&rdquo; to add one.
                    </p>
                  ) : (
                    unit.lessons.map((lesson) => {
                      const isLessonExpanded = expandedLessonId === lesson.id;

                      return (
                        <div
                          key={lesson.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                                L{lesson.order}
                              </span>
                              <div>
                                <h4 className="text-sm font-black text-slate-800">
                                  {lesson.title}
                                </h4>
                                <span className="text-[11px] font-bold text-slate-400">
                                  Type: {lesson.type} • Reward: +{lesson.xpReward} XP • {lesson.challenges.length} Challenges
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/lesson/${lesson.id}`}
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors font-bold text-xs flex items-center gap-1"
                                title="Test Lesson"
                              >
                                <Play className="w-3.5 h-3.5 fill-emerald-600" /> Test
                              </Link>

                              <button
                                onClick={() => {
                                  setTargetLessonId(lesson.id);
                                  setShowAddChallengeModal(true);
                                }}
                                className="p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors font-bold text-xs flex items-center gap-1"
                                title="Add Challenge"
                              >
                                <Plus className="w-3.5 h-3.5" /> Challenge
                              </button>

                              <button
                                onClick={() => handleDeleteLesson(unit.id, lesson.id)}
                                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Delete Lesson"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Challenges Summary */}
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            {lesson.challenges.map((c, cIdx) => (
                              <div
                                key={c.id}
                                className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-xl"
                              >
                                <span className="truncate max-w-sm">
                                  Q{cIdx + 1}: {c.question}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-extrabold flex-shrink-0">
                                  <Video className="w-3 h-3" /> {c.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={showAddLessonModal}
        onClose={() => setShowAddLessonModal(false)}
        title="Create New Lesson"
        maxWidth="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Lesson Title
            </label>
            <input
              type="text"
              placeholder="e.g. Daily Greeting Phrases"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Master common morning and afternoon signs."
              value={newLessonDesc}
              onChange={(e) => setNewLessonDesc(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={newLessonType}
                onChange={(e) => setNewLessonType(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:border-emerald-500 bg-white"
              >
                <option value="regular">Regular Lesson</option>
                <option value="checkpoint">Checkpoint Quiz</option>
                <option value="boss">Boss Challenge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                XP Reward
              </label>
              <input
                type="number"
                value={newLessonXp}
                onChange={(e) => setNewLessonXp(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleCreateLesson}
            className="btn-duo w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-duo-green border-b-4 border-emerald-600 mt-4"
          >
            CREATE LESSON
          </button>
        </div>
      </Modal>

      {/* Add Challenge Modal */}
      <Modal
        isOpen={showAddChallengeModal}
        onClose={() => setShowAddChallengeModal(false)}
        title="Add SELECT Challenge"
        maxWidth="md"
      >
        <div className="space-y-3 py-2">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Question Prompt
            </label>
            <input
              type="text"
              value={challengeQuestion}
              onChange={(e) => setChallengeQuestion(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Emoji Sign
              </label>
              <input
                type="text"
                value={challengeEmoji}
                onChange={(e) => setChallengeEmoji(e.target.value)}
                placeholder="e.g. 👋"
                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl font-bold text-center text-lg text-slate-800 outline-none focus:border-sky-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Sign Label
              </label>
              <input
                type="text"
                value={challengeSignLabel}
                onChange={(e) => setChallengeSignLabel(e.target.value)}
                placeholder="e.g. Sign for: HELLO"
                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Gesture Motion Guide
            </label>
            <input
              type="text"
              value={challengeGestureGuide}
              onChange={(e) => setChallengeGestureGuide(e.target.value)}
              placeholder="e.g. Open palm waves near temple outward."
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Optional Video URL (.mp4 / webm)
            </label>
            <input
              type="text"
              value={challengeVideoUrl}
              onChange={(e) => setChallengeVideoUrl(e.target.value)}
              placeholder="Leave empty to use Animated Emoji Sign"
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Answer Options (Select correct option)
            </label>
            <div className="space-y-2">
              {[
                { val: option1, set: setOption1, idx: 0 },
                { val: option2, set: setOption2, idx: 1 },
                { val: option3, set: setOption3, idx: 2 },
                { val: option4, set: setOption4, idx: 3 },
              ].map(({ val, set, idx }) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOptIndex === idx}
                    onChange={() => setCorrectOptIndex(idx)}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Educational Explanation
            </label>
            <input
              type="text"
              placeholder="Explain how this sign is formed..."
              value={challengeExplanation}
              onChange={(e) => setChallengeExplanation(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={handleCreateChallenge}
            className="btn-duo w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-duo-blue border-b-4 border-sky-600 mt-2"
          >
            SAVE CHALLENGE
          </button>
        </div>
      </Modal>
    </div>
  );
}
