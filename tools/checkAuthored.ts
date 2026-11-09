/**
 * Kiểm tra dữ liệu tác giả: phủ hết danh sách cần, câu có chứa đúng từ, không còn lỗi.
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
  tier: string;
  kanji: string;
  hiragana: string;
  meaning_vi: string;
}

const need = JSON.parse(
  fs.readFileSync('content/.need-author.json', 'utf8')
) as Draft[];

const authored: Record<string, { jp: string; vi: string }> = {};
for (const f of [
  'tools/authored-part1.json',
  'tools/authored-part2.json',
  'tools/authored-part3.json'
]) {
  Object.assign(authored, JSON.parse(fs.readFileSync(f, 'utf8')));
}

const missing: string[] = [];
const notContaining: string[] = [];
const emptyVi: string[] = [];
const unused = Object.keys(authored);

for (const d of need) {
  // tìm theo kanji, rồi theo hiragana
  const hit = authored[d.kanji] ?? authored[d.hiragana];
  if (!hit) {
    missing.push(`${d.kanji} (${d.hiragana})`);
    continue;
  }
  const i = unused.indexOf(d.kanji);
  if (i >= 0) unused.splice(i, 1);
  else {
    const j = unused.indexOf(d.hiragana);
    if (j >= 0) unused.splice(j, 1);
  }

  if (!hit.vi?.trim()) emptyVi.push(`${d.kanji}: ${hit.jp}`);
  else if (!hit.jp?.trim()) emptyVi.push(`${d.kanji}: thiếu jp`);

  const forms = [d.kanji, d.hiragana, ...splitReadings(d.hiragana)].filter(Boolean);
  if (!containsAnyStandalone(normalizeDigits(hit.jp ?? ''), forms, LEXICON)) {
    notContaining.push(`${d.kanji}\t${hit.jp}`);
  }
}

console.log(`Cần tác giả : ${need.length}`);
console.log(`Đã có      : ${need.length - missing.length}`);
console.log(`THIẾU       : ${missing.length}`);
if (missing.length) console.log('  ' + missing.join('\n  '));
console.log(`Câu KHÔNG chứa từ : ${notContaining.length}`);
for (const n of notContaining) console.log('  ' + n.replace(/\t/g, ' | '));
console.log(`Bản dịch rỗng / thiếu jp : ${emptyVi.length}`);
for (const e of emptyVi) console.log('  ' + e);
console.log(`Không dùng (thừa) : ${unused.length}`);
if (unused.length) console.log('  ' + unused.join(' '));
