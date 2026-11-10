/**
 * Đồng bộ tiến độ học lên Supabase (bảng `user_progress`).
 *
 * Nguyên tắc:
 *  - Local (localStorage) là nguồn sự thật khi offline.
 *  - Khi đăng nhập + online, đẩy tiến độ lên cloud để dùng được nhiều thiết bị.
 *  - Khi logout hoặc offline, không ghi gì cả (không mất dữ liệu).
 */
import { supabase } from '@/auth/supabase';
import { useAuth } from '@/store/auth';
import { useProgressStore } from '@/store/progress';

let lastPushedAt = 0;
let lastSignature = '';

/** Đẩy tiến độ hiện tại lên cloud (không gọi quá thường xuyên) */
export async function pushProgress(force = false): Promise<void> {
  if (!supabase) return;
  const session = useAuth.getState().session;
  if (!session) return;
  if (!navigator.onLine) return;

  const { cards, log, studyDays } = useProgressStore.getState();

  // Tránh gọi lặp lại khi dữ liệu không đổi
  const signature = JSON.stringify({ cards, logLen: log.length, days: studyDays.length });
  if (!force && signature === lastSignature) return;
  if (!force && Date.now() - lastPushedAt < 15_000) return;

  lastPushedAt = Date.now();
  lastSignature = signature;

  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: session.user.id,
      cards,
      log: log.slice(-500),
      study_days: studyDays
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.warn('[progress] không đồng bộ được:', error.message);
  }
}

/** Tải tiến độ từ cloud về local (gọi 1 lần khi đăng nhập) */
export async function pullProgress(): Promise<void> {
  if (!supabase) return;
  const session = useAuth.getState().session;
  if (!session) return;

  const { data, error } = await supabase
    .from('user_progress')
    .select('cards, log, study_days')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error || !data) return;

  const store = useProgressStore.getState();
  const remoteCards = (data.cards ?? {}) as Record<string, never>;
  const remoteLog = (data.log ?? []) as never[];
  const remoteDays = (data.study_days ?? []) as string[];

  // Gộp: giữ bản local có nhiều thẻ hơn, ưu tiên bản có tiến độ cao hơn
  const mergedCards = { ...remoteCards, ...store.cards };
  const mergedLog = [...remoteLog, ...store.log].slice(-500);
  const mergedDays = [...new Set([...remoteDays, ...store.studyDays])].sort();

  store.mergeCloudState({
    cards: mergedCards,
    log: mergedLog,
    studyDays: mergedDays
  });

  lastSignature = JSON.stringify({
    cards: mergedCards,
    logLen: mergedLog.length,
    days: mergedDays.length
  });
}

/** Gọi định kỳ (mỗi 30s) khi user đã đăng nhập */
export function startProgressSync(): () => void {
  const timer = window.setInterval(() => {
    void pushProgress();
  }, 30_000);

  const onOnline = () => void pushProgress(true);

  window.addEventListener('online', onOnline);

  return () => {
    window.clearInterval(timer);
    window.removeEventListener('online', onOnline);
  };
}
