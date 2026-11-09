/**
 * Xuất dữ liệu từ vựng và kanji ra định dạng TSV để import vào Anki.
 *
 * Dùng:  npm run export:anki
 * Kết quả: content/export/anki-vocab.tsv và content/export/anki-kanji.tsv
 *
 * Cấu trúc mỗi dòng (phân tách bằng TAB):
 *   vocab:  <kanji>\t<hiragana>\t<romaji>\t<nghĩa>\t<ví dụ jp>\t<ví dụ vi>\t<tags>
 *   kanji:  <kanji>\t<onyomi>\t<kunyomi>\t<số nét>\t<nghĩa>\t<radical>
 */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { VocabSchema, KanjiSchema } from '../src/data/schemas';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'content/export');

function clean(value: string): string {
  return value.replace(/[\t\r\n]+/g, ' ').trim();
}

function readJson(file: string): unknown {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    console.warn(`⚠ Không tìm thấy ${file} — bỏ qua`);
    return [];
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  /* ---- Vocab ---- */
  const vocab = z.array(VocabSchema).parse(readJson('content/vocab/n5.json'));
  const vocabRows = vocab.map((v) =>
    [
      clean(v.kanji),
      clean(v.hiragana),
      clean(v.romaji),
      clean(v.meaning_vi),
      clean(v.example.jp),
      clean(v.example.vi),
      clean(v.tags.join(' '))
    ].join('\t')
  );
  const vocabFile = path.join(OUT_DIR, 'anki-vocab.tsv');
  fs.writeFileSync(vocabFile, vocabRows.join('\n') + '\n', 'utf8');
  console.log(`✓ ${vocab.length} từ vựng → ${path.relative(ROOT, vocabFile)}`);

  /* ---- Kanji ---- */
  const kanji = z.array(KanjiSchema).parse(readJson('content/kanji/n5.json'));
  const kanjiRows = kanji.map((k) =>
    [
      clean(k.kanji),
      clean(k.onyomi.join(' ')),
      clean(k.kunyomi.join(' ')),
      String(k.strokes),
      clean(k.meaning_vi),
      clean(k.radical)
    ].join('\t')
  );
  const kanjiFile = path.join(OUT_DIR, 'anki-kanji.tsv');
  fs.writeFileSync(kanjiFile, kanjiRows.join('\n') + '\n', 'utf8');
  console.log(`✓ ${kanji.length} kanji → ${path.relative(ROOT, kanjiFile)}`);

  console.log('\nCách import vào Anki:');
  console.log('  1. Tạo note type (Basic, có trường Front/Back hoặc 6 trường tùy ý)');
  console.log('  2. File > Import > chọn file .tsv, phân cách bằng Tab');
  console.log('  3. Gán thẻ "Japanese N5" để ôn tập');
}

main();
