/**
 * Tải dataset từ vựng / kanji JLPT N5 từ nguồn công khai và chuẩn hóa về schema của app.
 *
 * Nguồn chính (khuyến nghị — giấy phép rõ ràng, có JSON sẵn):
 *   https://github.com/evanclan/OpenJLPT
 * Nguồn dự phòng (HTML, có thể bị chặn bởi captcha):
 *   https://jlptsensei.com/jlpt/vocabulary/n5/
 *
 * Dùng:
 *   npm run import:jlpt          # tự động, thử lần lượt các nguồn
 *   npm run import:jlpt -- kanji # chỉ kanji
 *   npm run import:jlpt -- vocab # chỉ từ vựng
 *
 * Output (tạm thời, chưa nằm trong app):
 *   content/vocab/imported-n5.json   — từ vựng: kanji, hiragana, romaji, nghĩa EN, ví dụ JA/EN
 *   content/kanji/imported-n5.json   — kanji: onyomi, kunyomi, nét, nghĩa EN, từ ví dụ
 *
 * Sau đó bạn cần bổ sung nghĩa tiếng Việt + ví dụ tiếng Việt, rồi gộp vào
 * content/vocab/n5.json và content/kanji/n5.json (schema xem src/data/schemas.ts).
 * Kiểm tra dữ liệu sau khi gộp:  npm run validate
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VOCAB_OUT = path.resolve(ROOT, 'content/vocab/imported-n5.json');
const KANJI_OUT = path.resolve(ROOT, 'content/kanji/imported-n5.json');

const OPENJLPT_RAW = 'https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/json';
const SENSHEI_VOCAB = 'https://jlptsensei.com/jlpt/vocabulary/n5/';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

type Only = 'vocab' | 'kanji' | 'both';

// ---------------------------------------------------------------- helpers ---

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}

async function getText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/json,*/*' },
      redirect: 'follow'
    });
    if (!res.ok) {
      console.warn(`  ! ${url} → HTTP ${res.status}`);
      return null;
    }
    const text = await res.text();
    if (text.length < 500) {
      console.warn(`  ! ${url} → phản hồi quá ngắn (${text.length} byte), có thể bị chặn`);
      return null;
    }
    return text;
  } catch (err) {
    console.warn(`  ! ${url} → ${(err as Error).message}`);
    return null;
  }
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

// -------------------------------------------------------------- vocabulary ---

interface ImportedVocab {
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_en: string;
  pos: string;
  level: string;
  example: { jp: string; en: string } | null;
  source: string;
}

/** Chuẩn hóa nguyên âm tiếng Nhật về kana. */
function toKana(reading: string): string {
  return reading
    .trim()
    .replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/\s+/g, '');
}

function fromOpenJlptVocab(json: any[]): ImportedVocab[] {
  const out: ImportedVocab[] = [];

  for (const item of json) {
    const word: string = item?.word ?? '';
    const reading: string = item?.reading ?? '';
    const meanings: string[] = Array.isArray(item?.meanings) ? item.meanings : [];

    if (!word || !reading || meanings.length === 0) continue;

    const ex = Array.isArray(item?.examples) ? item.examples[0] : null;

    out.push({
      kanji: word,
      hiragana: toKana(reading),
      romaji: item?.romaji ?? '',
      meaning_en: meanings.join('; '),
      pos: Array.isArray(item?.pos) ? item.pos.join(', ') : '',
      level: item?.level ?? 'N5',
      example: ex?.ja ? { jp: ex.ja, en: ex.en ?? '' } : null,
      source: 'OpenJLPT'
    });
  }

  return out;
}

function fromSenseiTable(html: string): ImportedVocab[] {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
  const out: ImportedVocab[] = [];

  for (const row of rows) {
    const cells = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g) ?? [];
    if (cells.length < 4) continue;

    const text = cells.map(stripTags);
    const [word, kanji, reading, romaji, meaning] = text;
    if (!word || !reading || !meaning) continue;

    out.push({
      kanji: kanji && kanji !== '-' ? kanji : word,
      hiragana: toKana(reading),
      romaji: romaji ?? '',
      meaning_en: meaning,
      pos: '',
      level: 'N5',
      example: null,
      source: 'JLPT Sensei'
    });
  }

  return out;
}

// -------------------------------------------------------------------- kanji ---

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

function fromOpenJlptKanji(json: any[]): ImportedKanji[] {
  const out: ImportedKanji[] = [];

  for (const item of json) {
    const kanji: string = item?.character ?? '';
    if (!kanji) continue;

    out.push({
      kanji,
      onyomi: Array.isArray(item?.onyomi) ? item.onyomi : [],
      kunyomi: Array.isArray(item?.kunyomi) ? item.kunyomi : [],
      strokes: Number(item?.strokes ?? 0),
      meaning_en: Array.isArray(item?.meanings) ? item.meanings.join('; ') : '',
      radical: item?.radical ?? '',
      example_words: Array.isArray(item?.words) ? item.words.slice(0, 8) : [],
      source: 'OpenJLPT'
    });
  }

  return out;
}

// --------------------------------------------------------------------- main ---

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  ✓ ${path.relative(ROOT, file)} (${Array.isArray(data) ? data.length : 0} mục)`);
}

async function importVocab(): Promise<number> {
  console.log('\n→ Từ vựng N5');

  const raw = await getText(`${OPENJLPT_RAW}/vocab/n5.json`);
  if (raw) {
    try {
      const words = fromOpenJlptVocab(JSON.parse(raw));
      if (words.length > 0) {
        writeJson(VOCAB_OUT, words);
        return words.length;
      }
    } catch (err) {
      console.warn(`  ! JSON OpenJLPT không đọc được: ${(err as Error).message}`);
    }
  }

  console.log('  → thử nguồn dự phòng JLPT Sensei…');
  const html = await getText(SENSHEI_VOCAB);
  if (html) {
    const words = fromSenseiTable(html);
    if (words.length > 0) {
      writeJson(VOCAB_OUT, words);
      return words.length;
    }
    console.warn('  ! Nguồn dự phòng không có bảng (có thể bị captcha chặn).');
  }

  return 0;
}

async function importKanji(): Promise<number> {
  console.log('\n→ Kanji N5');

  const raw = await getText(`${OPENJLPT_RAW}/kanji/n5.json`);
  if (!raw) return 0;

  try {
    const kanjis = fromOpenJlptKanji(JSON.parse(raw));
    if (kanjis.length > 0) {
      writeJson(KANJI_OUT, kanjis);
      return kanjis.length;
    }
  } catch (err) {
    console.warn(`  ! JSON OpenJLPT không đọc được: ${(err as Error).message}`);
  }

  return 0;
}

async function main() {
  const arg = process.argv[2];
  const only: Only =
    arg === 'vocab' ? 'vocab' : arg === 'kanji' ? 'kanji' : 'both';

  console.log('═══ Import dữ liệu JLPT N5 ═══');

  let vocabCount = 0;
  let kanjiCount = 0;

  if (only === 'vocab' || only === 'both') vocabCount = await importVocab();
  if (only === 'kanji' || only === 'both') kanjiCount = await importKanji();

  console.log('\n═══ Xong ═══');
  console.log(`Từ vựng: ${vocabCount}   Kanji: ${kanjiCount}`);

  if (vocabCount === 0 && kanjiCount === 0) {
    console.log(
      '\nNếu nguồn bị chặn, bạn có thể tự nhập: mở trang danh sách từ vựng N5, copy\n' +
        'vào file content/vocab/imported-n5.json theo format:\n' +
        '  [{ "kanji": "日本", "hiragana": "にほん", "romaji": "nihon",\n' +
        '     "meaning_en": "Japan", "pos": "n", "level": "N5",\n' +
        '     "example": { "jp": "日本去过。", "en": "I have been to Japan." } }]'
    );
    process.exitCode = 1;
    return;
  }

  console.log('\nBước tiếp theo: bổ sung nghĩa tiếng Việt + câu ví dụ, gộp vào content/vocab/n5.json');
}

main().catch((err) => {
  console.error('✗ Lỗi:', (err as Error).message);
  process.exit(1);
});
