import { z } from 'zod';

/** Một mục từ vựng N5 */
export const VocabSchema = z.object({
  id: z.string(),
  level: z.string().default('N5'),
  kanji: z.string(),
  hiragana: z.string(),
  romaji: z.string(),
  meaning_vi: z.string(),
  pos: z.string(),
  tags: z.array(z.string()).default([]),
  example: z.object({
    jp: z.string(),
    vi: z.string()
  }),
  related: z.array(z.string()).default([])
});

export type Vocab = z.infer<typeof VocabSchema>;

/** Một ví dụ trong bài ngữ pháp */
export const GrammarExampleSchema = z.object({
  jp: z.string(),
  vi: z.string()
});

/** Một ghi chú / quy tắc / chú ý */
export const GrammarNoteSchema = z.object({
  /** Tiêu đề, ví dụ "Cách dùng", "Chú ý" */
  title: z.string(),
  body: z.string()
});

/** Một mẫu hội thoại hỏi – đáp */
export const GrammarDialogSchema = z.object({
  q: z.string(),
  a: z.string(),
  q_vi: z.string().default(''),
  a_vi: z.string().default('')
});

/** Câu hỏi trắc nghiệm */
export const GrammarQuizSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  answer_index: z.number().int().min(0)
});

/** Bài điền từ vào chỗ trống */
export const GrammarClozeSchema = z.object({
  sentence: z.string(),
  answer: z.string()
});

/** Một điểm ngữ pháp N5 */
export const GrammarSchema = z.object({
  id: z.string(),
  level: z.string().default('N5'),
  /** Số bài (1-25) trong giáo trình */
  lesson: z.number().int().min(1),
  /** Tên bài, ví dụ "NGỮ PHÁP BÀI 1" */
  lesson_title: z.string(),
  point: z.string(),
  title_vi: z.string(),
  explanation_vi: z.string(),
  pattern: z.string(),
  /** Các ghi chú, quy tắc, chú ý */
  notes: z.array(GrammarNoteSchema).default([]),
  examples: z.array(GrammarExampleSchema).default([]),
  /** Mẫu hội thoại hỏi – đáp */
  dialog: z.array(GrammarDialogSchema).default([]),
  quiz: z.array(GrammarQuizSchema).default([]),
  cloze: z.array(GrammarClozeSchema).default([])
});

export type Grammar = z.infer<typeof GrammarSchema>;

/** Một kanji */
export const KanjiSchema = z.object({
  id: z.string(),
  kanji: z.string(),
  onyomi: z.array(z.string()).default([]),
  kunyomi: z.array(z.string()).default([]),
  strokes: z.number().int().min(0),
  meaning_vi: z.string(),
  example_words: z
    .array(
      z.object({
        word: z.string(),
        vi: z.string(),
        /** Cách đọc bằng hiragana (có thể thiếu) */
        reading: z.string().default(''),
        /** Phiên âm latin (có thể thiếu) */
        romaji: z.string().default('')
      })
    )
    .default([]),
  radical: z.string().default('')
});

export type Kanji = z.infer<typeof KanjiSchema>;

/** Tiến độ SRS của một thẻ */
export const CardProgressSchema = z.object({
  /** SM-2: hệ số độ khó */
  easeFactor: z.number().default(2.5),
  /** Số lần nhớ liên tiếp đúng */
  repetitions: z.number().int().default(0),
  /** Khoảng cách giữa 2 lần review (ngày) */
  interval: z.number().default(0),
  /** Timestamp (ms) lần review kế tiếp */
  nextReview: z.number().default(0),
  /** Timestamp lần review gần nhất */
  lastReview: z.number().default(0),
  /** Tổng số lần đã review */
  reviews: z.number().int().default(0),
  /** Số lần trả lời sai */
  lapses: z.number().int().default(0),
  /** Điểm gần nhất 0..1 để vẽ biểu đồ */
  score: z.number().default(0)
});

export type CardProgress = z.infer<typeof CardProgressSchema>;
