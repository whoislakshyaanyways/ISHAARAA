'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Store, 
  User, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProgress } from '@/hooks/useUserProgress';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { progress } = useUserProgress();

  const navItems = [
    {
      label: 'LEARN',
      href: '/learn',
      icon: BookOpen,
      activeColor: 'text-emerald-500 bg-emerald-50 border-emerald-300',
    },
    {
      label: 'LEADERBOARD',
      href: '/leaderboard',
      icon: Trophy,
      activeColor: 'text-amber-500 bg-amber-50 border-amber-300',
    },
    {
      label: 'QUESTS',
      href: '/quests',
      icon: Target,
      activeColor: 'text-rose-500 bg-rose-50 border-rose-300',
    },
    {
      label: 'SHOP',
      href: '/shop',
      icon: Store,
      activeColor: 'text-purple-500 bg-purple-50 border-purple-300',
    },
    {
      label: 'PROFILE',
      href: '/profile',
      icon: User,
      activeColor: 'text-sky-500 bg-sky-50 border-sky-300',
    },
    {
      label: 'ADMIN CMS',
      href: '/admin',
      icon: ShieldCheck,
      activeColor: 'text-slate-700 bg-slate-100 border-slate-300',
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white border-r-2 border-slate-200 px-4 py-6 z-30 select-none">
      {/* Brand Header */}
      <Link href="/learn" className="flex items-center gap-3 px-3 mb-8 group">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-2xl shadow-duo-green transform group-hover:scale-105 transition-transform">
          🤟
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight text-emerald-600 block leading-tight">
            ISL Lingo
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Learn Sign Language
          </span>
        </div>
      </Link>

      {/* Nav List */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/learn' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3.5 rounded-2xl font-extrabold text-sm tracking-wider uppercase transition-all duration-150 border-2',
                isActive
                  ? cn(item.activeColor, 'shadow-sm')
                  : 'text-slate-500 border-transparent hover:bg-slate-100/80 hover:text-slate-800'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive ? 'stroke-[2.5]' : 'stroke-2')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Card */}
      <div className="pt-4 border-t-2 border-slate-100">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xl shadow-sm">
            {progress.avatar || '🚀'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-slate-800 truncate">
              {progress.name}
            </p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {progress.xp} Total XP
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
