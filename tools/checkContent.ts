import fs from 'node:fs';

const paths = ['./content/vocab/n5.json', './content/grammar/n5.json', './content/kanji/n5.json'];

/** Chỉ xét các trường chứa **tiếng Nhật thuần** — Latin ở đây là lỗi lẫn ký tự. */
const JP_FIELDS = new Set(['jp', 'sentence', 'kanji', 'hiragana', 'word', 'radical']);

/** Ký tự Latin lẫn vào câu tiếng Nhật (vd: "友達か Tomoko に会いました") */
const LATIN_WORD = /[A-Za-z]{2,}/;

/** Bất kỳ ký tự Hán / Kana nào */
const JP_RANGE = /[　-〿぀-ゟ゠-ヿ㐀-䶿一-鿿]/;

/**
 * Ký tự CHỈ tồn tại trong Trung Quốc, KHÔNG có trong tiếng Nhật.
 * Đây là dấu hiệu đáng tin cậy nhất của việc gõ tiếng Việt bằng IME Trung Quốc
 * (ví dụ "哪个" thay vì "どの").
 */
const CHINESE_ONLY = /[个么这们说时来对开关电东马鸟鱼门长风飞气国语]/;

/**
 * Bảng chữ ngoài tiếng Nhật: Hangul (Hàn Quốc), Cyrillic (Nga),
 * Greek, Hebrew, Arabic, Thai…
 */
const FOREIGN_SCRIPT = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u0400-\u04FF\u0370-\u03FF\u0590-\u05FF\u0600-\u06FF\u0E00-\u0E7F]/;

interface Finding {
  path: string;
  text: string;
  kind: 'latin' | 'chinese' | 'foreign';
}

function walk(value: unknown, trail: string, key: string, out: Finding[]) {
  if (typeof value === 'string') {
    // 1. Latin trong trường tiếng Nhật → lỗi
    if (JP_FIELDS.has(key) && LATIN_WORD.test(value) && JP_RANGE.test(value)) {
      out.push({ path: trail, text: value, kind: 'latin' });
    }
    // 2. Ký tự Trung Quốc ở bất kỳ trường nào → lỗi
    const zh = value.match(new RegExp(`[${CHINESE_ONLY.source}]`, 'g'));
    if (zh) out.push({ path: trail, text: value, kind: 'chinese' });
    // 3. Chữ viết của nước khác (Hàn Quốc, Nga…) → lỗi
    if (FOREIGN_SCRIPT.test(value)) {
      out.push({ path: trail, text: value, kind: 'foreign' });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${trail}[${i}]`, key, out));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walk(v, trail ? `${trail}.${k}` : k, k, out);
  }
}

let failed = false;

for (const p of paths) {
  if (!fs.existsSync(p)) {
    console.log(`${p}: chưa tồn tại (bỏ qua)`);
    continue;
  }

  const raw = fs.readFileSync(p, 'utf8');
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    failed = true;
    console.log(`${p}: JSON SAI — ${(e as Error).message}`);
    continue;
  }

  const count = Array.isArray(data) ? data.length : 0;
  console.log(`${p}: OK — ${count} mục`);

  const findings: Finding[] = [];
  walk(data, '', '', findings);

  if (findings.length) {
    failed = true;
    console.log(`  ⚠ ${findings.length} giá trị cần kiểm tra:`);
    for (const f of findings.slice(0, 25)) {
      const tag =
        f.kind === 'chinese' ? 'TRUNG QUỐC' : f.kind === 'foreign' ? 'NGOÀI  ' : 'LATIN   ';
      console.log(`    [${tag}] ${f.path} → "${f.text.slice(0, 120)}"`);
    }
    if (findings.length > 25) console.log(`    … và ${findings.length - 25} giá trị khác`);
  }
}

if (!failed) console.log('\n✓ Không phát hiện ký tự lẫn.');

process.exit(failed ? 1 : 0);
