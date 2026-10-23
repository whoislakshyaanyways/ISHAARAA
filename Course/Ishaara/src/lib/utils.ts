import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getDaysOfWeek(): { dayName: string; dateStr: string; isPastOrToday: boolean; isToday: boolean }[] {
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayStr = getTodayDateString();

  return days.map((dayName, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const dateStr = d.toISOString().split('T')[0];
    return {
      dayName,
      dateStr,
      isPastOrToday: dateStr <= todayStr,
      isToday: dateStr === todayStr,
    };
  });
}
