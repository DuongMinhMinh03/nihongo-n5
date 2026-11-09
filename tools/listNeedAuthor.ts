/**
 * Xuất danh sách chính xác các mục CẦN TÁC GIẢ câu ví dụ.
 *
 * Cần tác giả khi:
 *   - Tier D: không tìm được câu nào trong corpus.
 *   - Tier A/B/C: câu tìm được KHÔNG chứa đúng dạng chữ Hán/kana của từ
 *     (thường do okurigana: "会いました" cho "会う", "学生" cho "学生" trong
 *     "大学生"). Chế độ "Điền từ" cần câu CHỨA ĐÚNG chuỗi cần bỏ trống.
 */
import fs from 'node:fs';

import { containsAnyStandalone, normalizeDigits, type CorpusEntry } from './matchExample';

const main = JSON.parse(
  fs.readFileSync('content/vocab/n5.json', 'utf8')
) as CorpusEntry[];
const imported = JSON.parse(
  fs.readFileSync('content/vocab/imported-n5.json', 'utf8')
) as CorpusEntry[];

const LEXICON = new Set<string>();
for (const v of [...main, ...imported]) {
  if (v.kanji) LEXICON.add(v.kanji);
  if (v.hiragana) LEXICON.add(v.hiragana);
}

function splitReadings(s: string): string[] {
  return s
    .split(/[,、/]|\s+\/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

interface Draft {
  tier: 'A' | 'B' | 'C' | 'D';
  kanji: string;
  hiragana: string;
  meaning_vi: string;
  example?: { jp: string; vi?: string; en?: string };
  source?: string;
}

const drafts = JSON.parse(
  fs.readFileSync('content/.docx-drafts.json', 'utf8')
) as Draft[];

const need: Draft[] = [];
for (const d of drafts) {
  if (!d.example?.jp) {
    need.push(d);
    continue;
  }
  const forms = [d.kanji, d.hiragana, ...splitReadings(d.hiragana)].filter(Boolean);
  if (!containsAnyStandalone(normalizeDigits(d.example.jp), forms, LEXICON)) {
    need.push(d);
  }
}

fs.writeFileSync('content/.need-author.json', JSON.stringify(need, null, 1));
console.log(`Cần tác giả: ${need.length} mục`);
console.log(`  Tier D (không có câu nào): ${need.filter((d) => d.tier === 'D').length}`);
console.log(`  Tier A/B/C (câu không chứa từ): ${need.filter((d) => d.tier !== 'D').length}`);
