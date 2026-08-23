'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Repeat, Plus, ShoppingBag, Check } from 'lucide-react';
import { useShoppingStore, SuggestionItem } from '@/store/useShoppingStore';

export const SuggestionsRail: React.FC = () => {
  const { addItem, items } = useShoppingStore();
  const [activeTab, setActiveTab] = useState<'co_occurrence' | 'running_low' | 'substitutes'>('co_occurrence');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  const fetchSuggestions = async (tab: string) => {
    setLoading(true);
    try {
      let endpoint = '/api/suggestions/co-occurrence';
      if (tab === 'running_low') endpoint = '/api/suggestions/running-low';
      if (tab === 'substitutes') endpoint = '/api/suggestions/substitutes';

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.items || []);
      }
    } catch (e) {
      console.error('Fetch suggestions error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions(activeTab);
  }, [activeTab, items]);

  const handleAddSuggestion = async (item: SuggestionItem) => {
    await addItem({ product_name: item.name, quantity: 1, category: item.category });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className="w-full flex flex-col space-y-4 glass-panel rounded-2xl p-5 shadow-2xl">
      {/* Suggestions Rail Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Smart Suggestions</h2>
            <p className="text-xs text-slate-400">AI recommendations based on patterns & vector similarity</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('co_occurrence')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'co_occurrence'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          Bought Together
        </button>
        <button
          onClick={() => setActiveTab('running_low')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'running_low'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Running Low
        </button>
        <button
          onClick={() => setActiveTab('substitutes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'substitutes'
              ? 'bg-violet-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Substitutes
        </button>
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-center text-xs text-slate-500 py-6">No suggestions available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {suggestions.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-3 rounded-xl flex items-center justify-between border border-slate-800/80 hover:border-emerald-500/40 transition-all group"
              >
                <div className="space-y-1 pr-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs font-mono font-semibold text-emerald-400">
                    ₹{item.sale_price}
                  </p>
                  {item.reason && (
                    <p className="text-[10px] text-slate-500 italic">{item.reason}</p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddSuggestion(item)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md ${
                    addedIds[item.id]
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  {addedIds[item.id] ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
