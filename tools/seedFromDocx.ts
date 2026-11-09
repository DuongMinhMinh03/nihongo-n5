/**
 * GHÉP DỮ LIỆU TỪ VỰNG TỪ FILE .docx → content/vocab/n5.json
 *
 * Nguồn dữ liệu:
 *   1. File .docx (mặc định C:/Users/Admin/Desktop/朝.docx)
 *      → cột 1: chữ Hán/kana, cột 2: cách đọc, cột 3: nghĩa tiếng Việt
 *   2. content/vocab/n5.json (bản cũ)  → romaji, pos, tags, ví dụ JP+VI
 *   3. content/vocab/imported-n5.json    → romaji, pos, ví dụ JP+EN
 *   4. tools/authored-part*.json        → ví dụ do tác giả viết tay
 *
 * Quy trình:
 *   - Đọc docx → 603 mục (loại trùng).
 *   - Với mỗi mục, tìm entry tương ứng trong corpus để lấy romaji/pos/tags.
 *   - Tìm câu ví dụ theo thứ tự: corpus chính → corpus import → bản tác giả.
 *   - Giữ lại các mục cũ KHÔNG có trong docx (theo yêu cầu "merge").
 *   - Gán lại id liên tục, thêm tags, rồi validate bằng Zod.
 *
 * Chạy:  npm run seed:docx
 */
import fs from 'node:fs';
import path from 'node:path';

import { readDocxTable } from './readDocx';
import { cleanMeaningVi } from './cleanMeaning';

const ROOT = process.cwd();
const MAIN_FILE = path.resolve(ROOT, 'content/vocab/n5.json');
const IMPORTED_FILE = path.resolve(ROOT, 'content/vocab/imported-n5.json');
const OUT_FILE = path.resolve(ROOT, 'content/vocab/n5.json');

const DOCX = process.env.DOCX_PATH ?? 'C:/Users/Admin/Desktop/朝.docx';

interface CorpusEntry {
  id?: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_vi?: string;
  meaning_en?: string;
  pos?: string;
  tags?: string[];
  level?: string;
  example: { jp: string; vi?: string; en?: string } | null;
}

interface Authored {
  jp: string;
  vi: string;
}

interface Vocab {
  id: string;
  level: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_vi: string;
  pos: string;
  tags: string[];
  example: { jp: string; vi: string };
  related: string[];
}

const norm = (s: string) => String(s ?? '').trim().toLowerCase();

/** Tách cách đọc "a / b" hoặc "a,b" */
function splitReadings(s: string): string[] {
  return s
    .split(/[,、/]|\s+\/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

// ------------------------------------------------------------------
// Nạp nguồn
// ------------------------------------------------------------------
const mainOld = readJson<CorpusEntry[]>(MAIN_FILE);
const imported = readJson<CorpusEntry[]>(IMPORTED_FILE);

const authored: Record<string, Authored> = {};
for (const f of ['authored-part1.json', 'authored-part2.json', 'authored-part3.json']) {
  Object.assign(authored, readJson<Record<string, Authored>>(path.resolve(ROOT, 'tools', f)));
}

/**
 * Bản vá câu ví dụ — ưu tiên CAO NHẤT.
 * Dùng khi câu gốc không chứa từ (biến cách đổi kanji/kana) nên chế độ
 * "Điền từ" không bỏ trống được, ví dụ "ある" → "机の上に本があります。"
 */
const overrides: Record<string, Authored> = readJson<Record<string, Authored>>(
  path.resolve(ROOT, 'tools', 'exampleOverrides.json')
);

/** Tập từ hợp lệ (dùng để nhận biết từ ghép) */
const LEXICON = new Set<string>();
for (const v of [...mainOld, ...imported]) {
  if (v.kanji) LEXICON.add(v.kanji);
  if (v.hiragana) LEXICON.add(v.hiragana);
}

// ------------------------------------------------------------------
// Chỉ số tra cứu corpus
// ------------------------------------------------------------------
interface Index {
  byKanji: Map<string, CorpusEntry[]>;
  byHiragana: Map<string, CorpusEntry[]>;
}

function buildIndex(list: CorpusEntry[]): Index {
  const byKanji = new Map<string, CorpusEntry[]>();
  const byHiragana = new Map<string, CorpusEntry[]>();
  for (const e of list) {
    const k = norm(e.kanji);
    if (k) {
      if (!byKanji.has(k)) byKanji.set(k, []);
      byKanji.get(k)!.push(e);
    }
    const h = norm(e.hiragana);
    if (h) {
      if (!byHiragana.has(h)) byHiragana.set(h, []);
      byHiragana.get(h)!.push(e);
    }
  }
  return { byKanji, byHiragana };
}

const mainIdx = buildIndex(mainOld);
const impIdx = buildIndex(imported);

/** Tìm entry có kanji khớp, ưu tiên cách đọc khớp */
function findByKanji(kanji: string, readings: string[], idx: Index): CorpusEntry | null {
  const cands = idx.byKanji.get(norm(kanji));
  if (!cands?.length) return null;
  return cands.find((v) => readings.some((r) => norm(v.hiragana) === norm(r))) ?? cands[0];
}

/** Tìm entry có cách đọc khớp */
function findByReading(readings: string[], idx: Index): CorpusEntry | null {
  for (const r of readings) {
    const cands = idx.byHiragana.get(norm(r));
    if (cands?.length) return cands[0];
  }
  return null;
}

// ------------------------------------------------------------------
// Đọc docx
// ------------------------------------------------------------------
interface DocxRow {
  kanji: string;
  hiragana: string;
  meaning_raw: string;
}

const rows = readDocxTable(DOCX);
const seen = new Set<string>();
const docxRows: DocxRow[] = [];
for (const r of rows) {
  const kanji = r[0].trim() || r[1].trim();
  const hiragana = r[1].trim();
  const key = `${norm(kanji)}|${norm(hiragana)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  docxRows.push({ kanji, hiragana, meaning_raw: r[2].trim() });
}

// ------------------------------------------------------------------
// Gộp dữ liệu
// ------------------------------------------------------------------
const out: Vocab[] = [];
const usedMain = new Set<CorpusEntry>();
const usedImported = new Set<CorpusEntry>();

for (const row of docxRows) {
  const readings = splitReadings(row.hiragana);

  // --- Nguồn metadata (romaji / pos / tags) ---
  let ref: CorpusEntry | null = findByKanji(row.kanji, readings, mainIdx);
  let refImported: CorpusEntry | null = null;
  if (ref) {
    usedMain.add(ref);
  } else {
    refImported = findByKanji(row.kanji, readings, impIdx);
    if (refImported) usedImported.add(refImported);
    else {
      ref = findByReading(readings, mainIdx);
      if (ref) usedMain.add(ref);
      else {
        refImported = findByReading(readings, impIdx);
        if (refImported) usedImported.add(refImported);
      }
    }
  }
  const meta = ref ?? refImported;

  // --- Nghĩa tiếng Việt (lấy từ docx, đã làm sạch) ---
  const meaning = cleanMeaningVi(row.meaning_raw);

  // --- Câu ví dụ ---
  let example: { jp: string; vi: string } | null = null;

  // 1. Bản vá ưu tiên cao nhất — bảo đảm cloze hoạt động
  const ov = overrides[row.kanji] ?? overrides[row.hiragana];
  if (ov?.jp && ov?.vi) {
    example = { jp: ov.jp, vi: ov.vi };
  }

  // 2. Corpus chính (đã có bản dịch VI)
  if (!example) {
    const mainHit = findByKanji(row.kanji, readings, mainIdx);
    if (mainHit?.example?.jp && mainHit.example.vi) {
      example = { jp: mainHit.example.jp, vi: mainHit.example.vi };
    }
  }

  // 3. Bản tác giả
  if (!example) {
    const key = authored[row.kanji] ?? authored[row.hiragana];
    if (key?.jp && key?.vi) example = { jp: key.jp, vi: key.vi };
  }

  // 4. Corpus import (có bản dịch EN) — dùng làm fallback
  if (!example) {
    const impHit = findByKanji(row.kanji, readings, impIdx);
    if (impHit?.example?.jp && impHit.example.en) {
      example = { jp: impHit.example.jp, vi: impHit.example.en };
    }
  }
  if (!example) {
    const impHit2 = findByReading(readings, impIdx);
    if (impHit2?.example?.jp && impHit2.example.en) {
      example = { jp: impHit2.example.jp, vi: impHit2.example.en };
    }
  }

  if (!example) {
    example = { jp: row.kanji, vi: meaning };
  }

  out.push({
    id: '',
    level: 'N5',
    kanji: row.kanji,
    hiragana: row.hiragana,
    romaji: meta?.romaji ?? '',
    meaning_vi: meaning,
    pos: meta?.pos ?? '',
    tags: meta?.tags ?? [],
    example,
    related: []
  });
}

// ------------------------------------------------------------------
// Giữ lại mục cũ KHÔNG có trong docx
// ------------------------------------------------------------------
const docxKanji = new Set(docxRows.map((r) => norm(r.kanji)));
const docxHiragana = new Set(docxRows.map((r) => norm(r.hiragana)));

for (const v of mainOld) {
  if (docxKanji.has(norm(v.kanji)) || docxHiragana.has(norm(v.hiragana))) continue;

  // Áp bản vá câu ví dụ cho mục giữ lại (để cloze hoạt động)
  const ov = overrides[v.kanji] ?? overrides[v.hiragana];

  out.push({
    id: '',
    level: v.level ?? 'N5',
    kanji: v.kanji,
    hiragana: v.hiragana,
    romaji: v.romaji,
    meaning_vi: v.meaning_vi ?? '',
    pos: v.pos ?? '',
    tags: v.tags ?? [],
    example: ov?.jp
      ? { jp: ov.jp, vi: ov.vi }
      : {
          jp: v.example?.jp ?? v.kanji,
          vi: v.example?.vi ?? v.meaning_vi ?? ''
        },
    related: []
  });
}

// ------------------------------------------------------------------
// Gán id liên tục + chuẩn hoá tags
// ------------------------------------------------------------------
const KNOWN_TAGS = new Set<string>();
for (const v of mainOld) for (const t of v.tags ?? []) KNOWN_TAGS.add(t);

/** Gán tag mặc định dựa trên từ khoá trong nghĩa tiếng Việt */
function inferTags(meaning: string, pos: string): string[] {
  const m = meaning.toLowerCase();
  const rules: [RegExp, string][] = [
    [/thời gian|ngày|tháng|năm|sáng|tối|chiều|mùa|buổi/, 'thời gian'],
    [/động từ|hành động|^\s*(làm|viết|đi|nói|ăn|uống|ngủ|mua|bán)/, 'hành động'],
    [/giao tiếp|nói|chào|hỏi|trả lời/, 'giao tiếp'],
    [/chỗ|nơi|địa điểm|phía|vị trí/, 'địa điểm'],
    [/tính chất|đẹp|xấu|lớn|nhỏ|mới|cũ|ngon|tốt/, 'tính chất'],
    [/đồ vật|cái |món |thứ/, 'đồ vật'],
    [/mô tả|người|anh|chị|em|ông|bà|cô|chú/, 'người'],
    [/nhà|cửa|phòng|bếp/, 'nhà cửa'],
    [/số|một|two|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười/, 'số đếm'],
    [/gia đình|mẹ|bố|em|anh|chị|con/, 'gia đình'],
    [/tiền|giá|yên/, 'tiền bạc'],
    [/xe|buýt|tàu|ga|đường|lai/, 'giao thông'],
    [/màu/, 'màu sắc'],
    [/trời|mưa|snow| tuyết|gió/, 'thời tiết'],
    [/học|trường|lớp|học sinh|sinh viên/, 'học tập'],
    [/áo|quần|giày|mũ/, 'quần áo'],
    [/ăn|thức ăn|cơm|thịt|trứng|rau/, 'đồ ăn'],
    [/uống|nước|trà|cà phê|sữa/, 'đồ uống'],
    [/cơ thể|người|tay|chân|mắt|miệng/, 'cơ thể'],
    [/việc|làm việc|công ty|văn phòng/, 'công việc'],
    [/du lịch|chuyến|đi chơi/, 'du lịch'],
    [/vui|buồn|tức giận|thích|ghét/, 'cảm xúc'],
    [/gợi ý|hỏi|khách|người/, 'giao tiếp']
  ];
  const tags: string[] = [];
  for (const [re, tag] of rules) {
    if (re.test(m) && !tags.includes(tag)) tags.push(tag);
  }
  if (!tags.length) {
    if (pos.startsWith('v')) tags.push('hành động');
    else if (pos.startsWith('adj')) tags.push('tính chất');
    else tags.push('đồ vật');
  }
  return tags;
}

out.forEach((v, i) => {
  v.id = `n5-v${String(i + 1).padStart(3, '0')}`;
  if (!v.tags.length) v.tags = inferTags(v.meaning_vi, v.pos);
  if (!v.pos) {
    v.pos = v.kanji.match(/する$/) ? 'v1' : 'noun';
  }
  if (!v.romaji) v.romaji = v.hiragana;
});

/**
 * Ghi lại các mục đã dùng bản vá câu ví dụ, để tools/applyTranslations.ts
 * không ghi đè bản dịch tiếng Việt mới bằng bản dịch của câu cũ.
 */
const overriddenIds = out
  .filter((v) => overrides[v.kanji]?.jp === v.example.jp || overrides[v.hiragana]?.jp === v.example.jp)
  .map((v) => v.id);
fs.writeFileSync(
  path.resolve(ROOT, 'tools', 'overriddenIds.json'),
  JSON.stringify(overriddenIds, null, 2) + '\n',
  'utf8'
);

fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');

const fromDocx = docxRows.length;
console.log(`Đã ghi ${out.length} mục vào ${path.relative(ROOT, OUT_FILE)}`);
console.log(`  từ docx           : ${fromDocx}`);
console.log(`  giữ lại từ dataset cũ: ${out.length - fromDocx}`);
console.log(`  còn thiếu romaji   : ${out.filter((v) => !v.romaji).length}`);
console.log(`  còn thiếu ví dụ    : ${out.filter((v) => !v.example.jp || !v.example.vi).length}`);
