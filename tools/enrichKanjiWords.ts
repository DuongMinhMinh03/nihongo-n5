/**
 * Bổ sung phiên âm cho "Từ vựng liên quan" của kanji.
 *
 * Trước đây `example_words` chỉ có `{ word, vi }` → không hiện được cách đọc
 * và không có nút loa để nghe máy đọc.
 *
 * Script này gắn thêm `reading` (hiragana) và `romaji` (latin) cho từng từ:
 *   1. Tra trong content/vocab/n5.json + content/vocab/imported-n5.json
 *   2. Nếu không có → lấy từ tools/kanjiWordReadings.json (từ ghép)
 *
 * Chạy:  npx tsx tools/enrichKanjiWords.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const KANJI_FILE = path.resolve(ROOT, 'content/kanji/n5.json');
const VOCAB_FILE = path.resolve(ROOT, 'content/vocab/n5.json');
const IMPORTED_FILE = path.resolve(ROOT, 'content/vocab/imported-n5.json');
const READINGS_FILE = path.resolve(ROOT, 'tools/kanjiWordReadings.json');

interface CorpusEntry {
  kanji: string;
  hiragana: string;
  romaji: string;
}

interface WordReading {
  reading: string;
  romaji: string;
}

interface Kanji {
  id: string;
  kanji: string;
  example_words: { word: string; vi: string; reading?: string; romaji?: string }[];
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

const kanjiList = readJson<Kanji[]>(KANJI_FILE);

/** Chỉ số: kanji → { hiragana, romaji } */
const index = new Map<string, WordReading>();
for (const file of [VOCAB_FILE, IMPORTED_FILE]) {
  if (!fs.existsSync(file)) continue;
  for (const e of readJson<CorpusEntry[]>(file)) {
    if (!e.kanji || index.has(e.kanji)) continue;
    index.set(e.kanji, { reading: e.hiragana ?? '', romaji: e.romaji ?? '' });
  }
}

/** Bổ sung thủ công cho các từ ghép không có trong corpus */
const manual = readJson<Record<string, WordReading>>(READINGS_FILE);
for (const [word, r] of Object.entries(manual)) {
  if (!index.has(word)) index.set(word, r);
}

let enriched = 0;
let missing: string[] = [];

for (const k of kanjiList) {
  for (const w of k.example_words) {
    const hit = index.get(w.word);
    if (hit?.reading) {
      if (w.reading !== hit.reading) enriched++;
      w.reading = hit.reading;
      w.romaji = hit.romaji ?? w.romaji ?? '';
    } else if (!w.reading) {
      missing.push(w.word);
    }
  }
}

fs.writeFileSync(KANJI_FILE, JSON.stringify(kanjiList, null, 2) + '\n', 'utf8');

console.log(`Đã bổ sung phiên âm cho ${enriched} từ trong ${kanjiList.length} kanji.`);
if (missing.length) {
  console.log(`Còn thiếu phiên âm (${missing.length}): ${[...new Set(missing)].join(' ')}`);
}
