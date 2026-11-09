/**
 * Ghép dữ liệu từ vựng từ file .docx vào content/vocab/n5.json.
 *
 * Chiến lược tìm câu ví dụ, theo thứ tự ưu tiên:
 *
 *   Tier A — KHỚP KANJI CHÍNH XÁC trong content/vocab/n5.json (bản cũ).
 *            Câu ví dụ đã có sẵn bản dịch tiếng Việt.
 *            Không cần kiểm tra "contains": cùng một chữ Hán + cùng cách
 *            đọc ⇒ chắc chắn là cùng một từ.
 *
 *   Tier B — KHỚP KANJI CHÍNH XÁC trong content/vocab/imported-n5.json.
 *            Câu ví dụ có sẵn bản dịch tiếng Anh → cần dịch sang Việt.
 *
 *   Tier C — chỉ khớp CÁCH ĐỌC (hiragana), hoặc khớp kanji nhưng khác cách đọc.
 *            Phải kiểm tra câu ví dụ có chứa đúng từ (dựa trên ranh giới từ).
 *
 *   Tier D — không tìm được. Phải tự viết câu ví dụ tiếng Nhật + Việt.
 */
import fs from 'node:fs';

import { readDocxTable } from './readDocx';
import { containsAnyStandalone, normalizeDigits, type CorpusEntry } from './matchExample';

const norm = (s: string) => String(s ?? '').trim().toLowerCase();

const main = JSON.parse(
  fs.readFileSync('content/vocab/n5.json', 'utf8')
) as CorpusEntry[];
const imported = JSON.parse(
  fs.readFileSync('content/vocab/imported-n5.json', 'utf8')
) as CorpusEntry[];

/** Tập từ hợp lệ — dùng để nhận biết từ ghép ("朝ごはん") */
const LEXICON = new Set<string>();
for (const v of [...main, ...imported]) {
  if (v.kanji) LEXICON.add(v.kanji);
  if (v.hiragana) LEXICON.add(v.hiragana);
}

/** Tách "a / b" hoặc "a,b" thành các cách đọc riêng */
function splitReadings(s: string): string[] {
  return s
    .split(/[,、/]|\s+\/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Các dạng viết có thể xuất hiện trong câu */
function wordForms(kanji: string, hiragana: string): string[] {
  return [kanji, hiragana, ...splitReadings(hiragana)].filter(Boolean);
}

/** Tìm entry trong corpus có kanji khớp chính xác VÀ cách đọc tương thích */
function findByKanji(
  kanji: string,
  readings: string[],
  list: CorpusEntry[]
): CorpusEntry | null {
  const cands = list.filter((v) => norm(v.kanji) === norm(kanji));
  if (!cands.length) return null;
  // ưu tiên entry có cách đọc nằm trong danh sách cách đọc của docx
  return (
    cands.find((v) => readings.some((r) => norm(v.hiragana) === norm(r))) ?? cands[0]
  );
}

/** Tìm entry có cách đọc khớp */
function findByReading(
  readings: string[],
  list: CorpusEntry[]
): CorpusEntry | null {
  for (const r of readings) {
    const hit = list.find((v) => norm(v.hiragana) === norm(r));
    if (hit) return hit;
  }
  return null;
}

export interface VocabDraft {
  kanji: string;
  hiragana: string;
  meaning_vi: string;
  tier: 'A' | 'B' | 'C' | 'D';
  example?: { jp: string; vi?: string; en?: string };
  source?: string;
  /** Entry corpus dùng làm nguồn (để lấy romaji / pos / tags) */
  ref?: CorpusEntry;
}

// --- Đọc docx ---
const rows = readDocxTable(process.env.DOCX_PATH ?? 'C:/Users/Admin/Desktop/朝.docx');
const seen = new Set<string>();
const drafts: VocabDraft[] = [];

for (const r of rows) {
  const kanji = r[0].trim() || r[1].trim();
  const hiragana = r[1].trim();
  const meaning_vi = r[2].trim();
  const key = `${norm(kanji)}|${norm(hiragana)}`;
  if (seen.has(key)) continue;
  seen.add(key);

  const readings = splitReadings(hiragana);
  const forms = wordForms(kanji, hiragana);

  // Tier A — corpus chính, khớp kanji chính xác
  const mA = findByKanji(kanji, readings, main);
  if (mA?.example?.jp && mA.example.vi) {
    drafts.push({
      tier: 'A',
      kanji,
      hiragana,
      meaning_vi,
      example: mA.example,
      source: 'main',
      ref: mA
    });
    continue;
  }

  // Tier B — corpus import, khớp kanji chính xác
  const mB = findByKanji(kanji, readings, imported);
  if (mB?.example?.jp && mB.example.en) {
    drafts.push({
      tier: 'B',
      kanji,
      hiragana,
      meaning_vi,
      example: mB.example,
      source: 'imported',
      ref: mB
    });
    continue;
  }

  // Tier C — khớp cách đọc, cần kiểm tra câu có chứa từ
  const cA = findByReading(readings, main);
  const cB = findByReading(readings, imported);
  for (const [c, src] of [
    [cA, 'main'],
    [cB, 'imported']
  ] as const) {
    if (!c?.example?.jp) continue;
    if (!containsAnyStandalone(normalizeDigits(c.example.jp), forms, LEXICON)) continue;
    drafts.push({
      tier: 'C',
      kanji,
      hiragana,
      meaning_vi,
      example: c.example,
      source: src,
      ref: c
    });
    break;
  }
  if (drafts[drafts.length - 1]?.kanji === kanji && drafts[drafts.length - 1]?.hiragana === hiragana) {
    continue;
  }

  // Tier D — tự viết
  drafts.push({ tier: 'D', kanji, hiragana, meaning_vi });
}

// --- Thống kê ---
const count = { A: 0, B: 0, C: 0, D: 0 };
for (const d of drafts) count[d.tier]++;
console.log(`Tổng mục docx: ${drafts.length}`);
console.log(`  A — corpus chính, có JP+VI : ${count.A}`);
console.log(`  B — corpus import, JP+EN   : ${count.B}`);
console.log(`  C — khớp cách đọc          : ${count.C}`);
console.log(`  D — cần tự viết            : ${count.D}`);

fs.writeFileSync('content/.docx-drafts.json', JSON.stringify(drafts, null, 1));
console.log('\nGhi content/.docx-drafts.json');
