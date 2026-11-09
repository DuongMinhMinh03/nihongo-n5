import { create } from 'zustand';
import { createContext, useEffect, type ReactNode } from 'react';
import { useProgressStore } from './progress';

interface ContentState {
  vocab: import('@/data/schemas').Vocab[];
  grammar: import('@/data/schemas').Grammar[];
  kanji: import('@/data/schemas').Kanji[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useContentStore = create<ContentState>((set) => ({
  vocab: [],
  grammar: [],
  kanji: [],
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const { loadAllContent } = await import('@/data/loader');
      const data = await loadAllContent();
      set({ ...data, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  }
}));

/** Áp dụng theme đã lưu lên <html> */
export function useTheme() {
  const theme = useProgressStore((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', dark);
  }, [theme]);
}

const ContentContext = createContext<{ reload: () => void }>({ reload: () => {} });

export function ContentProvider({ children }: { children: ReactNode }) {
  const load = useContentStore((s) => s.load);
  useEffect(() => {
    void load();
  }, [load]);
  return <ContentContext.Provider value={{ reload: load }}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContentStore();
}
