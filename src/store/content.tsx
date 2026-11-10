import { create } from 'zustand';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useProgressStore } from './progress';
import { supabase } from '@/auth/supabase';

interface ContentState {
  vocab: import('@/data/schemas').Vocab[];
  grammar: import('@/data/schemas').Grammar[];
  kanji: import('@/data/schemas').Kanji[];
  loading: boolean;
  error: string | null;
  /** Lần cập nhật nội dung gần nhất (dùng để biết có thay đổi mới) */
  updatedAt: number;
  load: () => Promise<void>;
}

export const useContentStore = create<ContentState>((set) => ({
  vocab: [],
  grammar: [],
  kanji: [],
  loading: false,
  error: null,
  updatedAt: 0,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const { loadAllContent } = await import('@/data/loader');
      const data = await loadAllContent();
      set({ ...data, loading: false, error: null, updatedAt: Date.now() });
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

interface ContentContextValue {
  reload: () => Promise<void>;
  /** true nếu admin vừa sửa nội dung (dùng để hiện thông báo) */
  freshUpdate: boolean;
  dismissFresh: () => void;
}

const ContentContext = createContext<ContentContextValue>({
  reload: async () => {},
  freshUpdate: false,
  dismissFresh: () => {}
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const load = useContentStore((s) => s.load);
  const updatedAt = useContentStore((s) => s.updatedAt);
  const [freshUpdate, setFreshUpdate] = useState(false);
  const firstLoad = useRef(true);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime: admin sửa nội dung → tự động tải lại, không cần F5
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel('content_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_items' },
        () => {
          void load();
          setFreshUpdate(true);
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [load]);

  // Đánh dấu "có bản cập nhật" khi nội dung được tải lại (không phải lần đầu)
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (updatedAt > 0) setFreshUpdate(true);
  }, [updatedAt]);

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  const dismissFresh = useCallback(() => setFreshUpdate(false), []);

  return (
    <ContentContext.Provider value={{ reload, freshUpdate, dismissFresh }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContentStore();
}

/** Dùng content context (reload + thông báo cập nhật) */
export function useContentActions(): ContentContextValue {
  return useContext(ContentContext);
}
