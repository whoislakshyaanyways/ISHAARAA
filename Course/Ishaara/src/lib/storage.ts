import { Course, UserProgress, Quest, Achievement, LeaderboardUser, ShopItem } from '@/types';
import { INITIAL_COURSE, INITIAL_QUESTS, INITIAL_ACHIEVEMENTS, INITIAL_LEADERBOARD, INITIAL_SHOP_ITEMS } from './mockData';
import { getTodayDateString } from './utils';

const STORAGE_KEYS = {
  USER_PROGRESS: 'isl_lingo_user_progress',
  COURSE_DATA: 'isl_lingo_course_data',
  QUESTS: 'isl_lingo_quests',
  ACHIEVEMENTS: 'isl_lingo_achievements',
  SHOP_ITEMS: 'isl_lingo_shop_items',
};

const DEFAULT_USER_PROGRESS: UserProgress = {
  userId: 'user_lakshya_1',
  name: 'Lakshya',
  avatar: '🚀',
  activeCourseId: 'isl-foundations',
  hearts: 5,
  maxHearts: 5,
  xp: 0,
  gems: 300,
  streak: 1,
  longestStreak: 1,
  lastActiveDate: getTodayDateString(),
  activeDays: [getTodayDateString()],
  completedLessons: {},
  unlockedLessons: ['u1-l1'], // First lesson unlocked
  inventory: [],
};

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getUserProgress(): UserProgress {
  if (!isBrowser()) return DEFAULT_USER_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (!raw) {
      saveUserProgress(DEFAULT_USER_PROGRESS);
      return DEFAULT_USER_PROGRESS;
    }
    const data = JSON.parse(raw) as UserProgress;
    return {
      ...DEFAULT_USER_PROGRESS,
      ...data,
      unlockedLessons: Array.from(new Set(['u1-l1', ...(data.unlockedLessons || [])])),
    };
  } catch (e) {
    console.error('Error reading user progress:', e);
    return DEFAULT_USER_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent('user-progress-updated', { detail: progress }));
  } catch (e) {
    console.error('Error saving user progress:', e);
  }
}

export function getCourseData(): Course {
  if (!isBrowser()) return INITIAL_COURSE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSE_DATA);
    if (!raw) {
      saveCourseData(INITIAL_COURSE);
      return INITIAL_COURSE;
    }
    return JSON.parse(raw) as Course;
  } catch (e) {
    console.error('Error reading course data:', e);
    return INITIAL_COURSE;
  }
}

export function saveCourseData(course: Course): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.COURSE_DATA, JSON.stringify(course));
    window.dispatchEvent(new CustomEvent('course-data-updated', { detail: course }));
  } catch (e) {
    console.error('Error saving course data:', e);
  }
}

export function getQuests(): Quest[] {
  if (!isBrowser()) return INITIAL_QUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTS);
    if (!raw) {
      saveQuests(INITIAL_QUESTS);
      return INITIAL_QUESTS;
    }
    return JSON.parse(raw) as Quest[];
  } catch (e) {
    return INITIAL_QUESTS;
  }
}

export function saveQuests(quests: Quest[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
    window.dispatchEvent(new CustomEvent('quests-updated', { detail: quests }));
  } catch (e) {
    console.error('Error saving quests:', e);
  }
}

export function getAchievements(): Achievement[] {
  if (!isBrowser()) return INITIAL_ACHIEVEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) {
      saveAchievements(INITIAL_ACHIEVEMENTS);
      return INITIAL_ACHIEVEMENTS;
    }
    return JSON.parse(raw) as Achievement[];
  } catch (e) {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    window.dispatchEvent(new CustomEvent('achievements-updated', { detail: achievements }));
  } catch (e) {
    console.error('Error saving achievements:', e);
  }
}

export function getShopItems(): ShopItem[] {
  return INITIAL_SHOP_ITEMS;
}

export function getLeaderboard(): LeaderboardUser[] {
  const user = getUserProgress();
  const list = [...INITIAL_LEADERBOARD];
  const userEntry = list.find((u) => u.isCurrentUser || u.id === 'user-curr');
  if (userEntry) {
    userEntry.xp = user.xp;
    userEntry.streak = user.streak;
    userEntry.avatar = user.avatar;
    userEntry.name = `${user.name} (You)`;
  }
  // Sort descending by XP
  list.sort((a, b) => b.xp - a.xp);
  // Re-rank
  list.forEach((u, i) => {
    u.rank = i + 1;
  });
  return list;
}

export function findNextLessonId(currentLessonId: string, course: Course): string | null {
  const allLessons: string[] = [];
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      allLessons.push(lesson.id);
    }
  }
  const currentIndex = allLessons.indexOf(currentLessonId);
  if (currentIndex !== -1 && currentIndex + 1 < allLessons.length) {
    return allLessons[currentIndex + 1];
  }
  return null;
}

export function deductHeart(): number {
  const progress = getUserProgress();
  const newHearts = Math.max(0, progress.hearts - 1);
  saveUserProgress({
    ...progress,
    hearts: newHearts,
  });
  return newHearts;
}

export function refillHearts(): boolean {
  const progress = getUserProgress();
  saveUserProgress({
    ...progress,
    hearts: progress.maxHearts,
  });
  return true;
}

export function completeLesson(
  lessonId: string,
  score: number,
  stars: number,
  earnedXp: number,
  isPerfect: boolean
): { unlockedNextId: string | null; totalXp: number } {
  const progress = getUserProgress();
  const course = getCourseData();
  const today = getTodayDateString();

  const nextLessonId = findNextLessonId(lessonId, course);
  const unlockedSet = new Set(progress.unlockedLessons || []);
  if (nextLessonId) {
    unlockedSet.add(nextLessonId);
  }

  // Update Streak logic
  let newStreak = progress.streak;
  const activeDays = new Set(progress.activeDays || []);
  if (!activeDays.has(today)) {
    activeDays.add(today);
    // Check if last active was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (progress.lastActiveDate === yesterdayStr) {
      newStreak += 1;
    } else if (progress.lastActiveDate !== today) {
      newStreak = 1;
    }
  }
  const longestStreak = Math.max(progress.longestStreak || 1, newStreak);

  const updatedCompleted = {
    ...progress.completedLessons,
    [lessonId]: {
      lessonId,
      completed: true,
      score,
      stars,
      perfect: isPerfect,
      completedAt: new Date().toISOString(),
      attempts: ((progress.completedLessons[lessonId]?.attempts || 0) + 1),
    },
  };

  const newTotalXp = progress.xp + earnedXp;
  const newGems = progress.gems + (isPerfect ? 15 : 10);

  const updatedProgress: UserProgress = {
    ...progress,
    xp: newTotalXp,
    gems: newGems,
    streak: newStreak,
    longestStreak,
    lastActiveDate: today,
    activeDays: Array.from(activeDays),
    completedLessons: updatedCompleted,
    unlockedLessons: Array.from(unlockedSet),
  };

  saveUserProgress(updatedProgress);

  // Update Quests
  const quests = getQuests().map((q) => {
    let newProgress = q.currentProgress;
    if (q.id === 'q1' || q.id === 'q4') {
      newProgress += earnedXp;
    } else if (q.id === 'q2') {
      newProgress += 1;
    } else if (q.id === 'q3' && isPerfect) {
      newProgress += 1;
    }
    const completed = newProgress >= q.targetValue;
    return {
      ...q,
      currentProgress: newProgress,
      completed,
    };
  });
  saveQuests(quests);

  // Update Achievements
  const totalCompletedCount = Object.keys(updatedCompleted).length;
  const perfectCount = Object.values(updatedCompleted).filter((l) => l.perfect).length;
  const achievements = getAchievements().map((ach) => {
    let p = ach.progress;
    if (ach.id === 'ach-first-lesson') {
      p = totalCompletedCount > 0 ? 1 : 0;
    } else if (ach.id === 'ach-streak-3') {
      p = newStreak;
    } else if (ach.id === 'ach-perfect-3') {
      p = perfectCount;
    } else if (ach.id === 'ach-unit-master') {
      // Check unit 1 completion
      const unit1Lessons = course.units[0]?.lessons.map((l) => l.id) || [];
      const u1Done = unit1Lessons.filter((id) => updatedCompleted[id]?.completed).length;
      p = u1Done;
    } else if (ach.id === 'ach-xp-500') {
      p = newTotalXp;
    }
    const unlocked = p >= ach.maxProgress;
    return {
      ...ach,
      progress: Math.min(p, ach.maxProgress),
      unlocked,
      unlockedAt: unlocked && !ach.unlocked ? new Date().toISOString() : ach.unlockedAt,
    };
  });
  saveAchievements(achievements);

  return {
    unlockedNextId: nextLessonId,
    totalXp: newTotalXp,
  };
}

export function claimQuestReward(questId: string): boolean {
  const quests = getQuests();
  const quest = quests.find((q) => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) return false;

  const progress = getUserProgress();
  saveUserProgress({
    ...progress,
    xp: progress.xp + quest.rewardXp,
    gems: progress.gems + quest.rewardGems,
  });

  const updatedQuests = quests.map((q) =>
    q.id === questId ? { ...q, claimed: true } : q
  );
  saveQuests(updatedQuests);
  return true;
}

export function purchaseItem(item: ShopItem): { success: boolean; message: string } {
  const progress = getUserProgress();
  if (progress.gems < item.costGems) {
    return { success: false, message: 'Not enough gems!' };
  }

  const updatedProgress: UserProgress = {
    ...progress,
    gems: progress.gems - item.costGems,
    inventory: [...progress.inventory, item.id],
  };

  if (item.actionType === 'refill_hearts') {
    updatedProgress.hearts = progress.maxHearts;
  } else if (item.actionType === 'avatar' && item.value) {
    updatedProgress.avatar = item.value;
  }

  saveUserProgress(updatedProgress);
  return { success: true, message: `Successfully purchased ${item.title}!` };
}

export function resetAllData(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.COURSE_DATA);
  localStorage.removeItem(STORAGE_KEYS.QUESTS);
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
  saveUserProgress(DEFAULT_USER_PROGRESS);
  saveCourseData(INITIAL_COURSE);
  saveQuests(INITIAL_QUESTS);
  saveAchievements(INITIAL_ACHIEVEMENTS);
  window.location.reload();
}
