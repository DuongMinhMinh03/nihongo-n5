import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyReview, createProgress, type ReviewGrade } from './srs';
import type { CardProgress } from '@/data/schemas';

export type CardKind = 'vocab' | 'kanji';

export interface ReviewLogEntry {
  id: string;
  kind: CardKind;
  grade: ReviewGrade;
  timestamp: number;
  correct: boolean;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  dailyGoal: number;
  autoPlayAudio: boolean;
  speechRate: number;
  showRomanization: boolean;
  ttsVoiceURI: string | null;
}

interface ProgressState {
  /** Tiến độ SRS theo card id */
  cards: Record<string, CardProgress>;
  /** Nhật ký review để vẽ biểu đồ */
  log: ReviewLogEntry[];
  /** Ngày đã học (YYYY-MM-DD) */
  studyDays: string[];
  /** Số card đã review trong ngày hiện tại */
  todayCount: number;
  /** Ngày của todayCount */
  todayDate: string;

  settings: Settings;

  reviewCard: (id: string, kind: CardKind, grade: ReviewGrade, correct: boolean) => void;
  markStudiedToday: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
  exportProgress: () => string;
  importProgress: (json: string) => boolean;
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  dailyGoal: 20,
  autoPlayAudio: true,
  speechRate: 0.9,
  showRomanization: true,
  ttsVoiceURI: null
};

function computeStreak(studyDays: string[]): number {
  if (studyDays.length === 0) return 0;
  const days = new Set(studyDays);
  let streak = 0;
  const cursor = new Date();

  // Nếu hôm nay chưa học, streak được tính từ hôm qua
  if (!days.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(todayKey(cursor))) return 0;
  }

  while (days.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      cards: {},
      log: [],
      studyDays: [],
      todayCount: 0,
      todayDate: todayKey(),
      settings: DEFAULT_SETTINGS,

      reviewCard: (id, kind, grade, correct) => {
        const state = get();
        const existing = state.cards[id];
        const updated = applyReview(existing, grade);

        const today = todayKey();
        const isNewDay = state.todayDate !== today;
        const todayCount = isNewDay ? 1 : state.todayCount + 1;

        set({
          cards: { ...state.cards, [id]: updated },
          log: [
            ...state.log.slice(-2000),
            { id, kind, grade, timestamp: Date.now(), correct }
          ],
          studyDays: state.studyDays.includes(today)
            ? state.studyDays
            : [...state.studyDays, today].slice(-400),
          todayCount,
          todayDate: today
        });
      },

      markStudiedToday: () => {
        const state = get();
        const today = todayKey();
        if (state.studyDays.includes(today)) return;
        set({ studyDays: [...state.studyDays, today].slice(-400) });
      },

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      resetAll: () =>
        set({
          cards: {},
          log: [],
          studyDays: [],
          todayCount: 0,
          todayDate: todayKey(),
          settings: get().settings
        }),

      exportProgress: () => {
        const { cards, log, studyDays, settings } = get();
        return JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            cards,
            log,
            studyDays,
            settings
          },
          null,
          2
        );
      },

      importProgress: (json) => {
        try {
          const parsed = JSON.parse(json) as {
            cards?: Record<string, CardProgress>;
            log?: ReviewLogEntry[];
            studyDays?: string[];
            settings?: Partial<Settings>;
          };
          if (!parsed.cards || typeof parsed.cards !== 'object') return false;
          set({
            cards: parsed.cards,
            log: parsed.log ?? [],
            studyDays: parsed.studyDays ?? [],
            todayCount: 0,
            todayDate: todayKey(),
            settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) }
          });
          return true;
        } catch {
          return false;
        }
      }
    }),
    {
      name: 'nihongo-n5-progress',
      version: 1
    }
  )
);

/** Tính streak hiện tại (hook helper) */
export function useStreak(): number {
  const studyDays = useProgressStore((s) => s.studyDays);
  return computeStreak(studyDays);
}

export { computeStreak, DEFAULT_SETTINGS, createProgress };
