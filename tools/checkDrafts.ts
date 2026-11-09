/**
 * Rà soát chất lượng các câu ví dụ được gán ở Tier A/B.
 *
 * Tier A/B khớp theo KANJI CHÍNH XÁC, nên câu ví dụ gần như chắc chắn
 * liên quan. Tuy nhiên vẫn cần kiểm tra: câu có chứa đúng từ không
 * (để chế độ "điền từ vào chỗ trống" hoạt động), và từ có bị "nuốt"
 * trong một từ dài hơn không (vd "あそこ" ⊂ "あそこだけ").
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

const bad: string[] = [];
const good: string[] = [];

for (const d of drafts) {
  if (!d.example?.jp) continue;
  const forms = [d.kanji, d.hiragana, ...splitReadings(d.hiragana)].filter(Boolean);
  const ok = containsAnyStandalone(normalizeDigits(d.example.jp), forms, LEXICON);
  const line = `${d.tier}\t${d.kanji}\t${d.example.jp}`;
  (ok ? good : bad).push(line);
}

console.log(`Tier A/B/C có câu ví dụ: ${good.length + bad.length}`);
console.log(`  câu CHỨA đúng từ : ${good.length}`);
console.log(`  câu KHÔNG chứa   : ${bad.length}`);
fs.writeFileSync('content/.check-examples.tsv', [...good, ...bad].join('\n'));
fs.writeFileSync('content/.check-examples-bad.tsv', bad.join('\n'));
console.log('\n--- câu KHÔNG chứa từ (cần rà soát) ---');
for (const b of bad) console.log(b.replace(/\t/g, ' | '));
