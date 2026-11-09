import type { CardProgress } from '@/data/schemas';

/** Chất lượng trả lời của người học */
export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

export const GRADE_LABEL: Record<ReviewGrade, string> = {
  again: 'Quên rồi',
  hard: 'Khó',
  good: 'Được',
  easy: 'Dễ'
};

export const MIN_EASE = 1.3;
export const MAX_EASE = 3.2;
const EASY_BONUS = 0.15;
const HARD_PENALTY = 0.2;

export function createProgress(): CardProgress {
  return {
    easeFactor: 2.5,
    repetitions: 0,
    interval: 0,
    nextReview: 0,
    lastReview: 0,
    reviews: 0,
    lapses: 0,
    score: 0
  };
}

/**
 * Thuật toán SM-2 (rút gọn cho 4 nút Again/Hard/Good/Easy).
 * - again: reset repetitions, interval về 0 (học lại trong phiên), ease giảm
 * - hard: interval tăng ít, ease giảm nhẹ
 * - good: interval theo SM-2 chuẩn
 * - easy: interval dài hơn, ease tăng
 */
export function applyReview(
  progress: CardProgress | undefined,
  grade: ReviewGrade,
  now: number = Date.now()
): CardProgress {
  const p: CardProgress = { ...(progress ?? createProgress()) };
  const DAY = 24 * 60 * 60 * 1000;

  p.reviews += 1;
  p.lastReview = now;

  switch (grade) {
    case 'again':
      p.repetitions = 0;
      p.interval = 0;
      p.lapses += 1;
      p.easeFactor = Math.max(MIN_EASE, p.easeFactor - 0.2);
      p.score = 0;
      p.nextReview = now + 10 * 60 * 1000; // 10 phút sau
      break;

    case 'hard':
      p.repetitions += 1;
      p.interval = p.repetitions === 1 ? 1 : Math.max(1, Math.round(p.interval * 1.2));
      p.easeFactor = Math.max(MIN_EASE, p.easeFactor - HARD_PENALTY);
      p.score = 0.5;
      p.nextReview = now + p.interval * DAY;
      break;

    case 'good':
      p.repetitions += 1;
      if (p.repetitions === 1) p.interval = 1;
      else if (p.repetitions === 2) p.interval = 3;
      else p.interval = Math.round(p.interval * p.easeFactor);
      p.score = 0.8;
      p.nextReview = now + p.interval * DAY;
      break;

    case 'easy':
      p.repetitions += 1;
      p.easeFactor = Math.min(MAX_EASE, p.easeFactor + EASY_BONUS);
      if (p.repetitions === 1) p.interval = 3;
      else p.interval = Math.round(Math.max(3, p.interval * p.easeFactor) + 1);
      p.score = 1;
      p.nextReview = now + p.interval * DAY;
      break;
  }

  return p;
}

/** Trạng thái của một thẻ dựa trên tiến độ */
export type CardState = 'new' | 'learning' | 'review' | 'mastered';

export function getCardState(progress: CardProgress | undefined, now = Date.now()): CardState {
  if (!progress || progress.reviews === 0) return 'new';
  if (progress.nextReview > now) return 'learning';
  if (progress.interval >= 21) return 'mastered';
  return 'review';
}

export function isDue(progress: CardProgress | undefined, now = Date.now()): boolean {
  if (!progress || progress.reviews === 0) return true;
  return progress.nextReview <= now;
}

/** Định dạng khoảng cách review cho người dùng đọc */
export function formatInterval(days: number): string {
  if (days <= 0) return '10 phút';
  if (days === 1) return '1 ngày';
  if (days < 30) return `${days} ngày`;
  if (days < 365) return `${Math.round(days / 30)} tháng`;
  return `${(days / 365).toFixed(1)} năm`;
}
