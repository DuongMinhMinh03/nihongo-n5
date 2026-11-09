/**
 * Gộp kanji bổ sung (tools/extraKanji.ts) vào content/kanji/n5.json.
 *
 * Onyomi / kunyomi / số nét / bộ sưu tập: content/kanji/imported-n5.json (OpenJLPT)
 * Nghĩa tiếng Việt + từ ví dụ: tools/extraKanji.ts
 *
 * Chạy:  npm run seed:extra
 */
import fs from 'node:fs';
import path from 'node:path';

import { EXTRA_KANJI } from './extraKanji';

const ROOT = process.cwd();
const MAIN = path.resolve(ROOT, 'content/kanji/n5.json');
const IMPORTED = path.resolve(ROOT, 'content/kanji/imported-n5.json');

interface ImportedKanji {
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  strokes: number;
  meaning_en: string;
  radical: string;
  example_words: string[];
  source: string;
}

interface Kanji {
  id: string;
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  strokes: number;
  meaning_vi: string;
  example_words: { word: string; vi: string }[];
  radical: string;
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

function main() {
  const main = readJson<Kanji[]>(MAIN);
  const imported = fs.existsSync(IMPORTED)
    ? readJson<ImportedKanji[]>(IMPORTED)
    : ([] as ImportedKanji[]);

  const importedByChar = new Map(imported.map((k) => [k.kanji, k]));
  const existing = new Set(main.map((k) => k.kanji));

  let added = 0;
  const problems: string[] = [];

  for (const extra of EXTRA_KANJI) {
    if (existing.has(extra.kanji)) continue;

    const src = importedByChar.get(extra.kanji);
    if (!src) {
      problems.push(
        `Không tìm thấy "${extra.kanji}" trong content/kanji/imported-n5.json — chạy: npm run import:jlpt`
      );
      continue;
    }

    const id = `n5-k${String(main.length + added + 1).padStart(3, '0')}`;

    main.push({
      id,
      kanji: extra.kanji,
      onyomi: src.onyomi,
      kunyomi: src.kunyomi,
      strokes: src.strokes,
      meaning_vi: extra.meaning_vi,
      example_words: extra.example_words,
      radical: src.radical
    });

    existing.add(extra.kanji);
    added++;
  }

  // Đánh số lại id cho duy nhất
  const seenIds = new Set<string>();
  main.forEach((k, i) => {
    let id = `n5-k${String(i + 1).padStart(3, '0')}`;
    let n = i + 1;
    while (seenIds.has(id)) {
      n += 1;
      id = `n5-k${String(n).padStart(3, '0')}`;
    }
    seenIds.add(id);
    k.id = id;
  });

  fs.writeFileSync(MAIN, JSON.stringify(main, null, 2) + '\n', 'utf8');

  console.log('═══ Seed kanji bổ sung ═══');
  console.log(`Đã thêm: ${added}`);
  console.log(`Tổng dataset: ${main.length} mục`);

  if (problems.length > 0) {
    console.log('\n⚠ Vấn đề:');
    for (const p of problems) console.log('  -', p);
    process.exitCode = 1;
  }

  console.log('\nBước tiếp theo:  npm run validate');
}

main();
