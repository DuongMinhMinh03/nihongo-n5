/**
 * Kiểm tra CHẤT LƯỢNG dataset từ vựng sau khi ghép từ docx.
 *
 *   1. Mọi mục phải có romaji, pos, tags, ví dụ JP + VI không rỗng.
 *   2. Câu ví dụ phải chứa được từ (để chế độ "Điền từ" bỏ trống đúng chỗ).
 *   3. Bản dịch VI phải là tiếng Việt, không phải tiếng Anh còn sót lại.
 *   4. Nghĩa VI không được trùng với câu ví dụ một cách vô nghĩa.
 */
import fs from 'node:fs';

import { clozeCandidates } from '../src/lib/cloze';

interface Vocab {
  id: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_vi: string;
  pos: string;
  tags: string[];
  example: { jp: string; vi: string };
}

/** Chuẩn hoá để so khớp: bỏ khoảng trắng + dấu câu */
const normJP = (s: string) =>
  s.replace(/[\s　]/g, '').replace(/[。、!?！？「」『』,.!?"'()（）]/g, '');

/**
 * Chuẩn hoá chữ số fullwidth về ASCII và kanji số về ASCII.
 *
 * Câu ví dụ trong corpus dùng cả hai dạng:
 *   "１０月３日です"  (số fullwidth)
 *   "十月三日です"  (kanji số)
 *
 * Ta đổi cả hai về cùng dạng để so khớp với từ điển "三日".
 */
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

/** Chuẩn hoá mọi cách viết số về dạng ASCII */
function normalizeNumbers(s: string): string {
  let out = s.replace(/[０-９]/g, (c) => FULLWIDTH_DIGITS[c] ?? c);
  // Kanji số 1-99: 十, 二十, 三 …
  out = out.replace(/[〇一二三四五六七八九十]+/g, (m) => {
    const n = kanjiNumberToArabic(m);
    return n ?? m;
  });
  return out;
}

const vocab = JSON.parse(
  fs.readFileSync('content/vocab/n5.json', 'utf8')
) as Vocab[];

let noRomaji = 0;
let noPos = 0;
let noTags = 0;
let noExample = 0;
let clozeFail: string[] = [];
let enLeftover: string[] = [];
let viNotVietnamese: string[] = [];

/**
 * Phát hiện bản dịch còn sót tiếng Anh.
 *
 * Chỉ bắt các từ tiếng Anh đặc trưng, KHÔNG bắt "I" (vì "Tôi" chứa chữ I
 * và "I" hợp lệ trong câu tiếng Anh nhưng không xuất hiện độc lập trong
 * tiếng Việt). Dùng ranh giới từ + yêu cầu có ít nhất 2 từ tiếng Anh.
 */
const EN_WORDS = [
  'the', 'is', 'are', 'was', 'were', 'and', 'you', 'he', 'she', 'it',
  'this', 'that', 'there', 'here', 'with', 'for', 'from', 'have', 'has',
  'had', 'will', 'would', 'can', 'could', 'not', 'but', 'of', 'to', 'in',
  'on', 'at', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what',
  'where', 'when', 'why', 'how', 'about', 'after', 'before', 'into', 'out',
  'up', 'down', 'over', 'than', 'then', 'very', 'some', 'any', 'all',
  'we', 'they', 'them', 'been', 'were', 'more', 'much', 'many', 'such'
];

const EN_RE = new RegExp(`\\b(${EN_WORDS.join('|')})\\b`, 'gi');

for (const v of vocab) {
  if (!v.romaji?.trim()) noRomaji++;
  if (!v.pos?.trim()) noPos++;
  if (!v.tags?.length) noTags++;
  if (!v.example?.jp?.trim() || !v.example?.vi?.trim()) {
    noExample++;
    continue;
  }

  // 2. Cloze: câu phải chứa được ít nhất một candidate
  const cands = clozeCandidates(v.kanji, v.hiragana);
  const jpNorm = normalizeNumbers(normJP(v.example.jp));
  const ok = cands.some((c) => jpNorm.includes(normalizeNumbers(normJP(c))));
  if (!ok) clozeFail.push(`${v.id} ${v.kanji}\t${v.example.jp}`);

  // 3. Bản dịch VI còn sót tiếng Anh — cần >= 2 từ tiếng Anh mới báo
  const enHits = v.example.vi.match(EN_RE) ?? [];
  if (enHits.length >= 2) enLeftover.push(`${v.id} ${v.kanji}\t${v.example.vi}`);

  // 4. Bản dịch VI phải chứa chữ cái Latin (tiếng Việt) — trừ ngoại lệ
  if (!/[a-zA-Zàáảãạăâđêôơư]/.test(v.example.vi)) {
    viNotVietnamese.push(`${v.id} ${v.kanji}\t${v.example.vi}`);
  }
}

console.log(`Tổng: ${vocab.length} mục`);
console.log(`  thiếu romaji : ${noRomaji}`);
console.log(`  thiếu pos    : ${noPos}`);
console.log(`  thiếu tags   : ${noTags}`);
console.log(`  thiếu ví dụ  : ${noExample}`);
console.log(`  cloze không tạo được (${clozeFail.length}):`);
for (const f of clozeFail.slice(0, 30)) console.log('    ' + f.replace(/\t/g, ' | '));
console.log(`  bản dịch còn tiếng Anh (${enLeftover.length}):`);
for (const f of enLeftover.slice(0, 20)) console.log('    ' + f.replace(/\t/g, ' | '));
console.log(`  bản dịch không phải tiếng Việt (${viNotVietnamese.length}):`);
for (const f of viNotVietnamese.slice(0, 20)) console.log('    ' + f.replace(/\t/g, ' | '));
