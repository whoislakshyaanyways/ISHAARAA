'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck, Heart, Flame } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between select-none">
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-3xl shadow-duo-green">
            🤟
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600 tracking-tight block leading-tight">
              ISL Lingo
            </span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Indian Sign Language
            </span>
          </div>
        </div>

        <Link
          href="/learn"
          className="btn-duo px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-duo-green border-b-4 border-emerald-600 flex items-center gap-2"
        >
          START LEARNING <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center flex flex-col items-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6 animate-float">
          <Sparkles className="w-4 h-4 text-emerald-600" /> Free & Gamified ISL Learning Platform
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-3xl mb-6">
          Learn <span className="text-emerald-500 underline decoration-emerald-300">Indian Sign Language</span> one fun sign at a time.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl font-bold text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          Master ISL through bite-sized video demonstrations, interactive challenges, streaks, and gamified pathways.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-12">
          <Link
            href="/learn"
            className="btn-duo w-full sm:w-auto flex-1 py-4 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base tracking-wider uppercase rounded-2xl shadow-duo-green border-b-4 border-emerald-600 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-5 h-5 fill-white" /> GET STARTED
          </Link>
          <Link
            href="/lesson/u1-l1"
            className="btn-duo w-full sm:w-auto flex-1 py-4 px-8 bg-white hover:bg-slate-50 text-slate-700 font-black text-base tracking-wider uppercase rounded-2xl shadow-duo border-2 border-slate-200 border-b-4 flex items-center justify-center gap-2 transition-all"
          >
            TRY LESSON 1
          </Link>
        </div>

        {/* Feature Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl mb-3">
              🎥
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">Visual Sign Demos</h3>
            <p className="text-xs font-bold text-slate-500">
              Clear video demonstrations with speed controls so you can catch every gesture.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl mb-3">
              🔥
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">Streaks & Gamification</h3>
            <p className="text-xs font-bold text-slate-500">
              Earn XP, build daily streaks, unlock badges, and compete on the weekly leaderboard.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-xl mb-3">
              🗺️
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">Structured Pathway</h3>
            <p className="text-xs font-bold text-slate-500">
              8 comprehensive units covering greetings, numbers, family, emotions, and daily life.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 bg-white py-6 px-4 text-center">
        <p className="text-xs font-bold text-slate-400">
          ISL Lingo © 2026 — Dedicated to empowering accessible Indian Sign Language learning.
        </p>
      </footer>
    </div>
  );
}
