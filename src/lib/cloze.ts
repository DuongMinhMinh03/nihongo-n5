/**
 * Tách từ thành các "candidate" dùng để bỏ trống trong câu ví dụ.
 *
 * Vấn đề: từ trong từ điển không phải lúc nào cũng xuất hiện nguyên văn trong
 * câu ví dụ, vì câu dùng DẠNG BIẾN CÁCH:
 *
 *   - 会う (từ điển)  vs  友達に会いました (câu ví dụ) → gốc kanji là "会"
 *   - コピーする    vs  この書類をコピーします     → gốc là "コピー"
 *   - 食べる        vs  朝ごはんを食べます        → gốc là "食"
 *
 * Ngoài ra, câu ví dụ viết ngày tháng bằng nhiều cách:
 *   "１０月３日です" (số fullwidth), "十月三日です" (kanji số), "10月3日" (ASCII)
 *
 * Nên ta sinh nhiều candidate và chuẩn hoá số khi so khớp.
 */

/** Kanji: CJK Unified Ideographs + Kangxi + 々 + 〇 */
const KANJI_RE = /^[㐀-䶿一-鿿々〇]+/;
/** Katakana ở cuối từ */
const KATAKANA_TAIL_RE = /[゠-ヿ]+$/;

/** Phần chữ Hán ở đầu chuỗi */
export function kanjiStem(word: string): string {
  const m = KANJI_RE.exec(word);
  return m ? m[0] : '';
}

/**
 * Gốc của từ — phần có nghĩa, bỏ phần okurigana / hậu tố.
 *
 *   会う      → 会
 *   食べる    → 食
 *   コピーする → コピー
 *   勉強する  → 勉強
 */
export function wordStem(word: string): string {
  const kanji = kanjiStem(word);
  if (kanji) return kanji;

  // Từ katakana + する: コピーする → コピー
  if (word.endsWith('する')) {
    const base = word.slice(0, -2);
    if (base.length >= 2 && KATAKANA_TAIL_RE.test(base)) return base;
  }
  return '';
}

/** Tách ô docx ghi nhiều từ: "キロ/キロメートル" → ["キロ", "キロメートル"] */
export function splitEntry(value: string): string[] {
  return value
    .split(/[/／]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Danh sách candidate để bỏ trống, theo thứ tự ưu tiên.
 */
export function clozeCandidates(kanji: string, hiragana: string): string[] {
  const out: string[] = [];
  const push = (s: string) => {
    if (s && !out.includes(s)) out.push(s);
  };

  // Ô docx có thể chứa nhiều từ → xét từng từ một.
  for (const k of splitEntry(kanji)) {
    push(k);
    push(wordStem(k));
  }
  for (const h of splitEntry(hiragana)) {
    push(h);
    push(wordStem(h));
  }

  return out;
}

/* ------------------------------------------------------------------ */
/*  Chuẩn hoá chữ số                                                  */
/* ------------------------------------------------------------------ */

const FULLWIDTH_DIGITS: Record<string, string> = {
  '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
  '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
};

const KANJI_NUM: Record<string, string> = {
  '〇': '0', '一': '1', '二': '2', '三': '3', '四': '4',
  '五': '5', '六': '6', '七': '7', '八': '8', '九': '9'
};

/** "十" → "10", "二十" → "20" */
function kanjiNumberToArabic(s: string): string | null {
  if (s === '十') return '10';
  const m = /^([一二三四五六七八九])?十([一二三四五六七八九])?$/.exec(s);
  if (m) {
    const tens = m[1] ? KANJI_NUM[m[1]] : '1';
    const ones = m[2] ? KANJI_NUM[m[2]] : '0';
    return String(Number(tens) * 10 + Number(ones));
  }
  if (s.length === 1 && s in KANJI_NUM) return KANJI_NUM[s];
  return null;
}

/**
 * Chuẩn hoá mọi cách viết số về dạng ASCII.
 * "１０月３日" → "10月3日", "十月三日" → "10月3日".
 */
export function normalizeNumbers(s: string): string {
  let out = s.replace(/[０-９]/g, (c) => FULLWIDTH_DIGITS[c] ?? c);
  out = out.replace(/[〇一二三四五六七八九十]+/g, (m) => {
    const n = kanjiNumberToArabic(m);
    return n ?? m;
  });
  return out;
}

/**
 * Chuẩn hoá chữ số kèm bản đồ vị trí về chuỗi gốc.
 *
 * Vì chuẩn hoá có thể đổi độ dài ("十" → "10"), ta cần biết mỗi ký tự sau
 * khi chuẩn hoá ứng với ký tự nào của chuỗi gốc để cắt câu chính xác.
 *
 * @returns `text` (chuỗi đã chuẩn hoá) và `map` với
 *          `map[i]` = chỉ số trong chuỗi gốc của ký tự `text[i]`.
 */
export function normalizeNumbersWithMap(s: string): {
  text: string;
  map: number[];
} {
  let text = '';
  const map: number[] = [];

  // 1. Số fullwidth → ASCII (giữ nguyên độ dài 1:1)
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    text += FULLWIDTH_DIGITS[c] ?? c;
    map.push(i);
  }

  // 2. Kanji số → ASCII (độ dài có thể thay đổi)
  let out = '';
  const outMap: number[] = [];
  const re = /[〇一二三四五六七八九十]+/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text))) {
    // phần trước kanji số — giữ nguyên
    for (let i = last; i < m.index; i++) {
      out += text[i];
      outMap.push(map[i]);
    }
    const n = kanjiNumberToArabic(m[0]);
    if (n === null) {
      out += m[0];
      for (let i = m.index; i < m.index + m[0].length; i++) {
        outMap.push(map[i]);
      }
    } else {
      // Mọi ký tự ASCII sinh ra trỏ về ký tự gốc đầu tiên của cụm kanji số
      for (const _ of n) {
        out += _;
        outMap.push(map[m.index]);
      }
    }
    last = m.index + m[0].length;
  }

  // phần còn lại
  for (let i = last; i < text.length; i++) {
    out += text[i];
    outMap.push(map[i]);
  }

  return { text: out, map: outMap };
}
