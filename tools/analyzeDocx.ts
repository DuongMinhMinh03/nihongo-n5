/**
 * Xác định chính xác những trường nào cần tác giả thủ công cho mỗi mục.
 *
 * Trường cần tác giả:
 *   - romaji / pos / tags  : không tìm được trong corpus cũ
 *   - example.jp / .vi     : không tìm được câu chứa từ trong corpus cũ
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

/** Tập từ hợp lệ — dùng để biết "朝ごはん" là từ ghép thật, còn "プログラム" thì không */
const LEXICON = new Set<string>();
for (const v of [...main, ...imported]) {
  if (v.kanji) LEXICON.add(v.kanji);
  if (v.hiragana) LEXICON.add(v.hiragana);
}

/** Tách một chuỗi "a / b" hoặc "a,b" thành nhiều lựa chọn */
function splitVariants(s: string): string[] {
  return s
    .split(/[,、/]|\s+\/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Các dạng viết có thể xuất hiện trong câu (kanji + các biến thể hiragana) */
function wordForms(kanji: string, hiragana: string): string[] {
  return [kanji, hiragana, ...splitVariants(hiragana)].filter(Boolean);
}

// --- Thu thập mục từ docx (giữ nguyên 1 dòng = 1 mục, KHÔNG tách) ---
const rows = readDocxTable(process.env.DOCX_PATH ?? 'C:/Users/Admin/Desktop/朝.docx');
const seen = new Set<string>();
const docx: { kanji: string; hiragana: string; meaning_vi: string }[] = [];
for (const r of rows) {
  const kanji = r[0].trim() || r[1].trim();
  const hiragana = r[1].trim();
  const key = `${norm(kanji)}|${norm(hiragana)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  docx.push({ kanji, hiragana, meaning_vi: r[2].trim() });
}

// --- Tra cứu corpus ---
function findMatch(
  kanji: string,
  hiragana: string
): { e: CorpusEntry; forms: string[] } | null {
  const forms = wordForms(kanji, hiragana);
  // ưu tiên khớp chính xác cả kanji lẫn hiragana
  for (const list of [main, imported]) {
    const hit = list.find((v) => norm(v.kanji) === norm(kanji) && norm(v.hiragana) === norm(hiragana));
    if (hit) return { e: hit, forms };
  }
  // khớp theo hiragana (đọc được)
  for (const list of [main, imported]) {
    const hit = list.find((v) => norm(v.hiragana) === norm(hiragana));
    if (hit) return { e: hit, forms };
  }
  // khớp theo kanji
  for (const list of [main, imported]) {
    const hit = list.find((v) => norm(v.kanji) === norm(kanji));
    if (hit) return { e: hit, forms };
  }
  return null;
}

interface Report {
  kanji: string;
  hiragana: string;
  meaning_vi: string;
  needRomaji: boolean;
  needPos: boolean;
  needTags: boolean;
  needExample: boolean;
  hasEn: boolean;
  en?: string;
  jp?: string;
  vi?: string;
}

const reports: Report[] = [];
for (const d of docx) {
  const m = findMatch(d.kanji, d.hiragana);
  const e = m?.e;
  const forms = m?.forms ?? [d.kanji, d.hiragana];

  const hasViEx = !!e?.example?.vi && containsAnyStandalone(e.example.jp, forms, LEXICON);
  const hasEnEx = !!e?.example?.en && containsAnyStandalone(e.example.jp, forms, LEXICON);

  reports.push({
    kanji: d.kanji,
    hiragana: d.hiragana,
    meaning_vi: d.meaning_vi,
    needRomaji: !e?.romaji,
    needPos: !e?.pos,
    needTags: !e?.tags?.length,
    needExample: !hasViEx && !hasEnEx,
    hasEn: hasEnEx,
    en: hasEnEx ? e!.example!.en : undefined,
    jp: hasViEx || hasEnEx ? e!.example!.jp : undefined,
    vi: hasViEx ? e!.example!.vi : undefined
  });
}

const need = {
  romaji: reports.filter((r) => r.needRomaji),
  pos: reports.filter((r) => r.needPos),
  tags: reports.filter((r) => r.needTags),
  example: reports.filter((r) => r.needExample),
  translate: reports.filter((r) => !r.needExample && r.hasEn)
};

console.log(`Tổng mục docx: ${reports.length}`);
console.log(`  cần viết romaji : ${need.romaji.length}`);
console.log(`  cần viết pos    : ${need.pos.length}`);
console.log(`  cần gán tags    : ${need.tags.length}`);
console.log(`  cần dịch VI     : ${need.translate.length}`);
console.log(`  cần viết example: ${need.example.length}`);

fs.writeFileSync('content/.docx-report.json', JSON.stringify(reports, null, 1));

const dump = (name: string, list: Report[]) => {
  fs.writeFileSync(
    `content/.need-${name}.tsv`,
    list
      .map((r) =>
        [r.kanji, r.hiragana, r.meaning_vi, r.jp ?? '', r.vi ?? '', r.en ?? ''].join('\t')
      )
      .join('\n')
  );
};
dump('romaji', need.romaji);
dump('tags', need.tags);
dump('translate', need.translate);
dump('example', need.example);
console.log('\nGhi content/.need-*.tsv');
