'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Trophy, Target, Store, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Learn', href: '/learn', icon: BookOpen },
    { label: 'Rank', href: '/leaderboard', icon: Trophy },
    { label: 'Quests', href: '/quests', icon: Target },
    { label: 'Shop', href: '/shop', icon: Store },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Admin', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-2 border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/learn' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-150',
              isActive
                ? 'text-emerald-600 font-extrabold scale-105 bg-emerald-50'
                : 'text-slate-400 hover:text-slate-700 font-bold'
            )}
          >
            <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
