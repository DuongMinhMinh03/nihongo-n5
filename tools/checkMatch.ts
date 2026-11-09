/**
 * Kiểm tra chất lượng: in ra câu ví dụ được gán cho từng mục để rà soát thủ công.
 */
import fs from 'node:fs';

import { readDocxTable } from './readDocx';
import { containsAnyStandalone, type CorpusEntry } from './matchExample';

const norm = (s: string) => String(s ?? '').trim().toLowerCase();

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

function splitVariants(s: string): string[] {
  return s
    .split(/[,、/]|\s+\/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function wordForms(kanji: string, hiragana: string): string[] {
  return [kanji, hiragana, ...splitVariants(hiragana)].filter(Boolean);
}

function findMatch(kanji: string, hiragana: string): CorpusEntry | null {
  for (const list of [main, imported]) {
    const hit = list.find(
      (v) => norm(v.kanji) === norm(kanji) && norm(v.hiragana) === norm(hiragana)
    );
    if (hit) return hit;
  }
  for (const list of [main, imported]) {
    const hit = list.find((v) => norm(v.hiragana) === norm(hiragana));
    if (hit) return hit;
  }
  for (const list of [main, imported]) {
    const hit = list.find((v) => norm(v.kanji) === norm(kanji));
    if (hit) return hit;
  }
  return null;
}

const rows = readDocxTable(process.env.DOCX_PATH ?? 'C:/Users/Admin/Desktop/朝.docx');
const seen = new Set<string>();
const out: string[] = [];

for (const r of rows) {
  const kanji = r[0].trim() || r[1].trim();
  const hiragana = r[1].trim();
  const key = `${norm(kanji)}|${norm(hiragana)}`;
  if (seen.has(key)) continue;
  seen.add(key);

  const e = findMatch(kanji, hiragana);
  const forms = wordForms(kanji, hiragana);

  if (!e?.example?.jp) {
    out.push(`[NONE] ${kanji}\t${hiragana}\t${r[2].trim()}`);
    continue;
  }
  const ok = containsAnyStandalone(e.example.jp, forms, LEXICON);
  out.push(
    `${ok ? '[OK]  ' : '[MISS]'} ${kanji}\t${e.example.jp}\t${e.example.vi ?? e.example.en ?? ''}`
  );
}

fs.writeFileSync('content/.check-match.tsv', out.join('\n'));
const okCount = out.filter((l) => l.startsWith('[OK]')).length;
const missCount = out.filter((l) => l.startsWith('[MISS]')).length;
const noneCount = out.filter((l) => l.startsWith('[NONE]')).length;
console.log(`OK=${okCount} MISS=${missCount} NONE=${noneCount}`);
console.log('Ghi content/.check-match.tsv');
