/**
 * Áp dụng bản dịch tiếng Việt (tools/translationsVi.json) vào content/vocab/n5.json.
 *
 * Bản dịch được ghi theo id của mục để tránh nhầm lẫn khi một từ xuất hiện
 * nhiều lần với cách đọc khác nhau (私/わたし, 誰/だれ...).
 *
 * Các mục đã được vá câu ví dụ (tools/exampleOverrides.json) được liệt kê trong
 * tools/overriddenIds.json — bản dịch cũ không khớp câu mới nên bỏ qua.
 *
 * Chạy:  npx tsx tools/applyTranslations.ts
 */
import fs from 'node:fs';

interface Vocab {
  id: string;
  example: { jp: string; vi: string };
}

const FILE = 'content/vocab/n5.json';

const vocab = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Vocab[];
const translations = JSON.parse(
  fs.readFileSync('tools/translationsVi.json', 'utf8')
) as Record<string, string>;

/** Các id đã được vá câu ví dụ — không ghi đè bản dịch của chúng */
let overriddenIds: string[] = [];
try {
  overriddenIds = JSON.parse(
    fs.readFileSync('tools/overriddenIds.json', 'utf8')
  ) as string[];
} catch {
  /* file chưa được sinh ra — bỏ qua */
}
const overridden = new Set(overriddenIds);

let applied = 0;
let skipped = 0;
const missing: string[] = [];

for (const v of vocab) {
  if (overridden.has(v.id)) {
    skipped++;
    continue;
  }
  const t = translations[v.id];
  if (!t) continue;
  v.example.vi = t;
  applied++;
}

const usedIds = new Set(vocab.map((v) => v.id).filter((id) => translations[id]));
for (const id of Object.keys(translations)) {
  if (!usedIds.has(id)) missing.push(id);
}

fs.writeFileSync(FILE, JSON.stringify(vocab, null, 2) + '\n', 'utf8');

console.log(
  `Đã áp dụng ${applied}/${Object.keys(translations).length} bản dịch (bỏ qua ${skipped} mục đã vá).`
);
if (missing.length) {
  console.log(`Không tìm thấy id sau khi dựng lại dataset: ${missing.join(', ')}`);
  console.log('→ Cần chạy lại "npm run seed:docx" rồi áp dụng lại bản dịch.');
}
