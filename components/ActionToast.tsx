'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Sparkles, CheckCircle } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

export const ActionToast: React.FC = () => {
  const { toastMessage } = useShoppingStore();

  if (!toastMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 glass-panel border border-emerald-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 glow-emerald"
      >
        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <Volume2 className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Spoken Confirmation</p>
          <p className="text-sm font-bold text-slate-100">{toastMessage}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
