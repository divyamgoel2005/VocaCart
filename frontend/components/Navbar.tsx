'use client';

import React, { useEffect } from 'react';
import { Mic, Activity, Zap, Radio } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

export const Navbar: React.FC = () => {
  const { socketConnected, urgencyScore } = useShoppingStore();

  const getUrgencyBadge = () => {
    if (urgencyScore >= 0.65) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          <Zap className="w-3 h-3 text-rose-400" />
          High Urgency ({urgencyScore})
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Activity className="w-3 h-3 text-emerald-400" />
        Normal Emotion ({urgencyScore})
      </span>
    );
  };

  return (
    <header className="w-full glass-panel border-b border-slate-800/80 sticky top-0 z-40 px-4 py-3 shadow-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-violet-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              Voice Assistant
              <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-mono">
                PWA Ready
              </span>
            </h1>
            <p className="text-xs text-slate-400">Smart Grocery Shopping</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-3">
          {/* Socket.IO Live Sync Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Radio className={`w-3.5 h-3.5 ${socketConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="font-mono text-[11px]">{socketConnected ? 'Socket Live' : 'HTTP Mode'}</span>
          </div>

          {/* Urgency Badge */}
          {getUrgencyBadge()}
        </div>
      </div>
    </header>
  );
};
