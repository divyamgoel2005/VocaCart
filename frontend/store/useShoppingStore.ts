import { create } from 'zustand';

export interface ShoppingItem {
  id: number;
  product_id?: number;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  is_completed: boolean;
}

export interface SuggestionItem {
  id: number;
  name: string;
  category: string;
  brand?: string;
  sale_price: number;
  image_url?: string;
  reason?: string;
}

interface ShoppingState {
  items: ShoppingItem[];
  categories: Record<string, ShoppingItem[]>;
  rawTranscript: string;
  isListening: boolean;
  isProcessing: boolean;
  needsClarification: boolean;
  clarifyingQuestion: string;
  lastSuggestedProduct: string;
  toastMessage: string | null;
  urgencyScore: number;
  recommendedTone: 'standard' | 'concise';
  socketConnected: boolean;
  
  // Actions
  fetchList: () => Promise<void>;
  addItem: (item: { product_name: string; quantity: number; unit?: string; category?: string }) => Promise<void>;
  updateItemQuantity: (id: number, delta: number) => Promise<void>;
  toggleItemComplete: (id: number, is_completed: boolean) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  undoAction: () => Promise<void>;
  processVoiceText: (transcript: string) => Promise<void>;
  setListening: (listening: boolean) => void;
  setRawTranscript: (text: string) => void;
  setSocketConnected: (connected: boolean) => void;
  speakText: (text: string) => void;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  categories: {},
  rawTranscript: '',
  isListening: false,
  isProcessing: false,
  needsClarification: false,
  clarifyingQuestion: '',
  lastSuggestedProduct: '',
  toastMessage: null,
  urgencyScore: 0.2,
  recommendedTone: 'standard',
  socketConnected: false,

  fetchList: async () => {
    try {
      const res = await fetch('/api/list');
      if (res.ok) {
        const data = await res.json();
        set({
          items: data.raw_items || [],
          categories: data.categories || {}
        });
      }
    } catch (e) {
      console.error('Fetch list error:', e);
    }
  },

  addItem: async (itemPayload) => {
    try {
      const res = await fetch('/api/list/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemPayload)
      });
      if (res.ok) {
        await get().fetchList();
        set({ toastMessage: `Added ${itemPayload.product_name}` });
        get().speakText(`Added ${itemPayload.product_name}`);
      }
    } catch (e) {
      console.error('Add item error:', e);
    }
  },

  updateItemQuantity: async (id, delta) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);
    try {
      const res = await fetch(`/api/list/item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      if (res.ok) {
        await get().fetchList();
      }
    } catch (e) {
      console.error('Update quantity error:', e);
    }
  },

  toggleItemComplete: async (id, is_completed) => {
    try {
      const res = await fetch(`/api/list/item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed })
      });
      if (res.ok) {
        await get().fetchList();
      }
    } catch (e) {
      console.error('Toggle complete error:', e);
    }
  },

  deleteItem: async (id) => {
    try {
      const res = await fetch(`/api/list/item/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await get().fetchList();
        set({ toastMessage: 'Item removed' });
      }
    } catch (e) {
      console.error('Delete item error:', e);
    }
  },

  undoAction: async () => {
    try {
      const res = await fetch('/api/list/undo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await get().fetchList();
        set({ toastMessage: 'Reverted last action' });
        get().speakText('Undone last action');
      }
    } catch (e) {
      console.error('Undo error:', e);
    }
  },

  processVoiceText: async (transcriptText) => {
    if (!transcriptText || !transcriptText.trim()) return;
    set({ isProcessing: true, needsClarification: false });

    try {
      const formData = new FormData();
      formData.append('transcript', transcriptText);
      if (get().lastSuggestedProduct) {
        formData.append('context_product', get().lastSuggestedProduct);
      }

      const res = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        set({
          isProcessing: false,
          urgencyScore: data.urgency_score || 0.2,
          needsClarification: data.needs_clarification || false,
          clarifyingQuestion: data.clarifying_question || '',
          lastSuggestedProduct: data.needs_clarification ? (data.suggested_product || data.raw_item_name || '') : '',
          toastMessage: data.spoken_text || 'Processed command'
        });

        if (data.needs_clarification) {
          get().speakText(data.clarifying_question || 'Could you please clarify?');
        } else {
          get().speakText(data.spoken_text || 'Command executed');
          await get().fetchList();
        }
      }
    } catch (e) {
      console.error('Voice process error:', e);
      set({ isProcessing: false });
    }
  },

  setListening: (isListening) => set({ isListening }),
  setRawTranscript: (rawTranscript) => set({ rawTranscript }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),

  speakText: (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = get().urgencyScore > 0.65 ? 1.15 : 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}));
