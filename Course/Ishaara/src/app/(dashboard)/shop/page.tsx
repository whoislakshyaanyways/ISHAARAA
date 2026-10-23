'use client';

import React, { useState } from 'react';
import { getShopItems, purchaseItem } from '@/lib/storage';
import { useUserProgress } from '@/hooks/useUserProgress';
import { ShopItem } from '@/types';
import { Gem, Heart, Check, Sparkles, AlertCircle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function ShopPage() {
  const { progress, refresh } = useUserProgress();
  const shopItems = getShopItems();
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handlePurchase = (item: ShopItem) => {
    const result = purchaseItem(item);
    if (result.success) {
      refresh();
      setFeedbackMsg({ text: result.message, isError: false });
    } else {
      setFeedbackMsg({ text: result.message, isError: true });
    }
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const powerups = shopItems.filter((i) => i.category === 'powerups' || i.category === 'boosts');
  const cosmetics = shopItems.filter((i) => i.category === 'cosmetics');

  return (
    <div className="py-6 max-w-xl mx-auto space-y-6 select-none">
      {/* Shop Header Card */}
      <div className="bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-3xl p-6 text-white border-b-4 border-purple-700 shadow-duo-purple flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-purple-800/60 text-purple-100 text-xs font-black uppercase tracking-wider">
              REWARDS & POWERUPS
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">ISL Gem Shop</h1>
          <p className="text-xs font-bold text-purple-100/90 mt-1 max-w-sm">
            Spend earned gems on heart refills, streak shields, and profile items.
          </p>
        </div>

        {/* Current Gem Balance */}
        <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30 text-center flex-shrink-0">
          <div className="flex items-center gap-1.5 text-sky-200 font-black text-xs uppercase mb-0.5">
            <Gem className="w-4 h-4 fill-sky-300 text-sky-300" /> YOUR GEMS
          </div>
          <span className="text-2xl font-black text-white">{formatNumber(progress.gems)}</span>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm animate-fadeIn ${
            feedbackMsg.isError
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          {feedbackMsg.isError ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <Sparkles className="w-5 h-5 text-emerald-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Powerups Section */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider px-1">
          Power-ups & Boosts
        </h2>

        <div className="space-y-3">
          {powerups.map((item) => {
            const isPurchased = progress.inventory?.includes(item.id);
            const canAfford = progress.gems >= item.costGems;

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 max-w-xs">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford}
                  className={`btn-duo px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 transition-all ${
                    canAfford
                      ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-duo-blue border-b-4 border-sky-600'
                      : 'bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Gem className="w-4 h-4 fill-white" />
                  <span>{item.costGems}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cosmetics Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider px-1">
          Avatar Cosmetics
        </h2>

        <div className="space-y-3">
          {cosmetics.map((item) => {
            const isOwned = progress.inventory?.includes(item.id);
            const isEquipped = progress.avatar === item.value;
            const canAfford = progress.gems >= item.costGems;

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 max-w-xs">
                      {item.description}
                    </p>
                  </div>
                </div>

                {isEquipped ? (
                  <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200 flex items-center gap-1">
                    <Check className="w-4 h-4" /> EQUIPPED
                  </div>
                ) : isOwned ? (
                  <button
                    onClick={() => handlePurchase(item)}
                    className="btn-duo px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-duo-green border-b-4 border-emerald-600"
                  >
                    EQUIP
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford}
                    className={`btn-duo px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 transition-all ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-duo-yellow border-b-4 border-amber-600'
                        : 'bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Gem className="w-4 h-4 fill-white" />
                    <span>{item.costGems}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
