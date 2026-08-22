'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, CheckCircle2, Circle, RotateCcw, ShoppingBag, Tag } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

export const ShoppingList: React.FC = () => {
  const {
    categories,
    items,
    fetchList,
    updateItemQuantity,
    toggleItemComplete,
    deleteItem,
    undoAction
  } = useShoppingStore();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.is_completed).length;

  return (
    <div className="w-full flex flex-col space-y-4 glass-panel rounded-2xl p-5 shadow-2xl">
      {/* List Header & Undo Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Shopping List
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
                {completedItems}/{totalItems}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Grouped automatically by aisle category</p>
          </div>
        </div>

        {/* Undo Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => undoAction()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-semibold shadow-md transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Undo Last
        </motion.button>
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium text-slate-400">Your shopping list is empty</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Tap the mic button above and say "add 2 packets Maggi" or "add 1L milk"
          </p>
        </div>
      )}

      {/* Grouped Category Lists */}
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
        {Object.entries(categories).map(([categoryName, categoryItems]) => (
          <div key={categoryName} className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
              <Tag className="w-3.5 h-3.5" />
              <span>{categoryName}</span>
              <span className="text-slate-500 font-normal">({categoryItems.length})</span>
            </div>

            <AnimatePresence mode="popLayout">
              {categoryItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    item.is_completed
                      ? 'bg-slate-900/40 border-slate-900/60 text-slate-500 line-through'
                      : 'glass-card border-slate-800/80 text-slate-100 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Complete Checkbox & Product Info */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleItemComplete(item.id, !item.is_completed)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {item.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-sm font-semibold tracking-tight">{item.product_name}</h4>
                      <p className="text-xs text-slate-400">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>

                  {/* Right: Steppers & Delete */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-1">
                      <button
                        onClick={() => updateItemQuantity(item.id, -1)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-emerald-400">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, 1)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};
