export type ChallengeType = 'SELECT' | 'ASSIST' | 'MATCH' | 'ORDER' | 'MEMORY' | 'CONVERSATION' | 'REVERSE_SELECT';

export type LessonType = 'regular' | 'checkpoint' | 'boss' | 'practice';

export interface ChallengeOption {
  id: string;
  text: string;
  correct: boolean;
  videoUrl?: string;
  imageSrc?: string;
  hint?: string;
}

export interface MatchPair {
  id: string;
  signText: string;
  meaningText: string;
  videoUrl?: string;
  signSymbol?: string;
}

export interface Challenge {
  id: string;
  lessonId: string;
  type: ChallengeType;
  question: string;
  videoUrl: string | null;
  videoPoster?: string;
  videoEmoji?: string;
  videoSignLabel?: string;
  videoGestureGuide?: string;
  explanation?: string;
  hint?: string;
  order: number;
  options?: ChallengeOption[];
  pairs?: MatchPair[];
  correctOrder?: string[];
  initialOrder?: string[];
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  order: number;
  type: LessonType;
  xpReward: number;
  challenges: Challenge[];
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'rose' | 'emerald';
  icon?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  units: Unit[];
}

export interface UserLessonProgress {
  lessonId: string;
  completed: boolean;
  score: number; // percentage 0-100
  stars: number; // 1, 2, or 3
  perfect: boolean;
  completedAt: string;
  attempts: number;
}

export interface UserProgress {
  userId: string;
  name: string;
  avatar: string;
  activeCourseId: string;
  hearts: number;
  maxHearts: number;
  xp: number;
  gems: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  activeDays: string[]; // ISO date strings (YYYY-MM-DD)
  completedLessons: Record<string, UserLessonProgress>;
  unlockedLessons: string[];
  inventory: string[];
  equippedAvatar?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  targetValue: number;
  currentProgress: number;
  rewardXp: number;
  rewardGems: number;
  icon: string;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rewardXp: number;
  category: 'learning' | 'streak' | 'perfection' | 'mastery';
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  rank: number;
  league: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  isCurrentUser?: boolean;
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  costGems: number;
  icon: string;
  category: 'powerups' | 'cosmetics' | 'boosts';
  actionType: 'refill_hearts' | 'streak_freeze' | 'xp_boost' | 'avatar';
  value?: any;
}
