/**
 * Tìm câu ví dụ trong corpus + hỗ trợ chế độ "Điền từ vào chỗ trống".
 *
 * Vấn đề cốt lõi: câu ví dụ dùng DẠNG BIẾN CÁCH của động từ.
 *   - "会う" (từ điển) vs "友達に会いました" ( câu ví dụ) → không khớp chuỗi.
 *   - Nhưng gốc kanji vẫn giống: cả hai đều chứa "会".
 *
 * Vì vậy ta tách mỗi từ thành:
 *   - KANJI_PART: phần chữ Hán       (例: 会う → 会)
 *   - KANA_PART : phần kana okurigana (例: 会う → う)
 *   - STEM      : KANJI_PART          (đơn vị gốc dùng để bỏ trống)
 *
 * Luật nhận biết từ hợp lệ trong câu:
 *   1. Khớp chính xác chuỗi kanji / hiragana.
 *   2. Khớp STEM (gốc kanji) — dùng cho động từ biến cách.
 *   3. Biên trước / sau phải hợp lệ (particle, dấu câu, okurigana, từ ghép).
 */

/** Một mục từ vựng trong corpus (n5.json / imported-n5.json) */
export interface CorpusEntry {
  id?: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_vi?: string;
  meaning_en?: string;
  pos?: string;
  tags?: string[];
  level?: string;
  example: { jp: string; vi?: string; en?: string } | null;
}

/** Ký tự tiếng Nhật (hiragana, katakana, kanji) */
const JP_CHAR = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\u3005]/;
/** Chữ Hán (kanji) */
const KANJI_CHAR = /[\u3400-\u4dbf\u4e00-\u9fff\u3005]/;
/** Hiragana */
const HIRAGANA = /[\u3040-\u309f]/;
/** Katakana */
const KATAKANA = /[\u30a0-\u30ff]/;

/** Particle đứng được trước từ (đủ dùng cho N5) */
const PARTICLE_BEFORE = new Set([
  'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'や', 'の', 'から', 'まで',
  'より', 'など', 'だけ', 'しか', 'ので', 'のに', 'ば', 'り', 'ね', 'よ', 'か',
  'な', 'ら', 'て', 'た', 'だ', 'です', 'ます', 'だっ', 'でし', 'する', 'し',
  'い', 'う'
]);

/** Kanji đứng được trước từ (lượng từ, đơn vị) */
const KANJI_BEFORE = new Set([
  '月', '日', '年', '元', '毎', '新', '古', '人', '個', '枚', '番', '階', '回',
  '度', '歳', '方', '軒', '冊', '束', '皿', '杯', '足', '匹', '頭', '列', '台',
  '割', '部', '課', '門', '件', '週', '泊', '膳', '挺', '本', '着', '丁',
  '時', '円', '社', '校', '室', '車', '台', '軒', '匹'
]);

/** Hậu tố (particle + dạng biến cách) được phép đứng sau từ */
const SUFFIX_AFTER = [
  'ませんでした', 'ましょうか', 'ましょう', 'でした', 'ません', 'ました',
  'ている', 'ください', 'なさい', 'だった', 'でしょう', 'らしい', 'みたい',
  'ながら', 'ので', 'のに', 'たら', 'たり', 'です', 'ます', 'である', 'たい',
  'そう', 'よう', 'だ', 'は', 'へ', 'が', 'を', 'に', 'で', 'と', 'も', 'や',
  'の', 'ね', 'よ', 'か', 'な', 'ら', 'り', 'て', 'た', 'ない', 'い', 'ば',
  'まで', 'から', 'より', 'など', 'だけ', 'しか'
];

/** Dấu câu / khoảng trắng — ranh giới từ hợp lệ */
const PUNCT = /[\s、。！？!?「」『』（）()\[\]…・:：,.~〜\-–—"'’”]/;

function startsWithSuffix(text: string): boolean {
  return SUFFIX_AFTER.some((s) => text.startsWith(s));
}

/** Chữ số fullwidth → ASCII */
const FULLWIDTH_DIGITS: Record<string, string> = {
  '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
  '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
};

/** Chuẩn hoá chữ số fullwidth về ASCII */
export function normalizeDigits(s: string): string {
  return s.replace(/[０-９]/g, (c) => FULLWIDTH_DIGITS[c] ?? c);
}

const NUM_KANJI = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** "十" → 10, "二十" → 20 */
export function kanjiToNumber(s: string): number | null {
  const table: Record<string, number> = {
    〇: 0, 一: 1, 二: 2, 三: 3, 四: 4,
    五: 5, 六: 6, 七: 7, 八: 8, 九: 9
  };
  if (s === '十') return 10;
  const m = /^([一二三四五六七八九])?十([一二三四五六七八九])?$/.exec(s);
  if (m) {
    const tens = m[1] ? table[m[1]] : 1;
    const ones = m[2] ? table[m[2]] : 0;
    return tens * 10 + ones;
  }
  return s.length === 1 && s in table ? table[s] : null;
}

/** "2" → "二" (chỉ dùng cho 1–99) */
export function numberToKanji(n: number): string | null {
  if (n < 0 || n > 99) return null;
  if (n < 10) return NUM_KANJI[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return (
    (tens === 1 ? '十' : NUM_KANJI[tens] + '十') +
    (ones === 0 ? '' : NUM_KANJI[ones])
  );
}

/**
 * Sinh các biến thể chữ số của một từ.
 * "二日" → ["二日", "2日"], "三人" → ["三人", "3人"].
 */
export function numericVariants(word: string): string[] {
  const out = new Set<string>([word]);
  const m = /^([〇一二三四五六七八九十]+)(日|人|月|個|本|匹|枚|時|週間|度|回)$/.exec(
    word
  );
  if (m) {
    const n = kanjiToNumber(m[1]);
    if (n !== null) {
      out.add(`${n}${m[2]}`);
      const k = numberToKanji(n);
      if (k) out.add(`${k}${m[2]}`);
    }
  }
  return [...out];
}

/* ------------------------------------------------------------------ */
/*  Tách từ thành phần                                               */
/* ------------------------------------------------------------------ */

/** Phần chữ Hán ở đầu chuỗi (gốc của động từ: 会う → 会) */
export function kanjiStem(word: string): string {
  const m = /^[㐀-䶿一-鿿々〇]+/.exec(word);
  return m ? m[0] : '';
}

/** Phần kana ở cuối chuỗi */
export function kanaPart(word: string): string {
  const m = /[ぁ-ゟ゠-ヿ]+$/.exec(word);
  return m ? m[0] : '';
}

/**
 * Gốc của từ — phần chữ Hán, dùng để bỏ trống trong câu ví dụ.
 * 会う → 会, 開く → 開, 食べる → 食, 日本語 → 日本語
 */
export function stemOf(word: string): string {
  return kanjiPartOf(word) || word;
}

/** Phần chữ Hán ở đầu chuỗi */
export function kanjiPartOf(word: string): string {
  const m = /^[㐀-䶿一-鿿々〇]+/.exec(word);
  return m ? m[0] : '';
}

/* ------------------------------------------------------------------ */
/*  Kiểm tra từ trong câu                                             */
/* ------------------------------------------------------------------ */

/**
 * Kiểm tra `word` xuất hiện trong `jp` như một từ hợp lệ.
 *
 * @param jp      câu tiếng Nhật
 * @param word    từ cần tìm
 * @param lexicon tập từ hợp lệ (để nhận biết từ ghép)
 */
export function containsWordStandalone(
  jp: string,
  word: string,
  lexicon: Set<string>
): boolean {
  if (!jp || !word) return false;

  const wordStartsKana = KATAKANA.test(word[0]);
  const wordEndsKana = KATAKANA.test(word[word.length - 1]);

  let from = 0;
  for (;;) {
    const idx = jp.indexOf(word, from);
    if (idx < 0) return false;

    const prev = idx > 0 ? jp[idx - 1] : '';
    const next = idx + word.length < jp.length ? jp[idx + word.length] : '';

    // --- Token katakana bị "nuốt" bởi từ dài hơn ---
    if ((wordStartsKana && prev && KATAKANA.test(prev)) ||
        (wordEndsKana && next && KATAKANA.test(next))) {
      let left = idx;
      while (left > 0 && JP_CHAR.test(jp[left - 1])) left--;
      let right = idx + word.length;
      while (right < jp.length && JP_CHAR.test(jp[right])) right++;
      if (!lexicon.has(jp.slice(left, right))) {
        from = idx + 1;
        continue;
      }
    }

    // --- Biên TRƯỚC ---
    const prevOk =
      prev === '' ||
      PUNCT.test(prev) ||
      !JP_CHAR.test(prev) ||
      PARTICLE_BEFORE.has(prev) ||
      KANJI_BEFORE.has(prev) ||
      startsWithSuffix(prev);
    if (!prevOk) {
      from = idx + 1;
      continue;
    }

    // --- Biên SAU ---
    const nextOk =
      next === '' ||
      PUNCT.test(next) ||
      !JP_CHAR.test(next) ||
      startsWithSuffix(jp.slice(idx + word.length)) ||
      KANJI_CHAR.test(next) ||
      HIRAGANA.test(next);
    if (nextOk) return true;

    // --- Từ ghép hữu nghĩa ---
    let right = idx + word.length;
    while (right < jp.length && JP_CHAR.test(jp[right])) {
      right++;
      const compound = jp.slice(idx, right);
      if (compound !== word && lexicon.has(compound)) return true;
    }

    from = idx + 1;
  }
}

/**
 * Kiểm tra `word` (hoặc gốc kanji của nó) xuất hiện trong câu.
 *
 * @param allowStem cho phép khớp theo gốc kanji (dùng cho động từ biến cách)
 */
export function containsAnyStandalone(
  jp: string,
  words: string[],
  lexicon: Set<string>,
  allowStem = true
): boolean {
  const jpNorm = normalizeDigits(jp);
  return words.some((w) => {
    if (!w) return false;
    const variants = numericVariants(w);
    if (variants.some((v) => containsWordStandalone(jpNorm, v, lexicon))) return true;
    if (!allowStem) return false;
    // Khớp theo gốc kanji: 会う → 会
    const stem = stemOf(w);
    if (stem && stem !== w && stem.length >= 1) {
      return containsWordStandalone(jpNorm, stem, lexicon);
    }
    return false;
  });
}
