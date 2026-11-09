/**
 * Gộp các file ngữ pháp trong tools/grammar/*.json thành content/grammar/n5.json
 * Mỗi file là một object: { "<id>": { ...Grammar } }
 *
 * Chạy: npx tsx tools/buildGrammar.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = 'tools/grammar';
const OUT = 'content/grammar/n5.json';

const files = fs
  .readdirSync(SRC_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

const merged: Record<string, unknown> = {};

for (const file of files) {
  const raw = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`✗ ${file}: JSON không hợp lệ — ${(err as Error).message}`);
    process.exit(1);
  }
  for (const [id, value] of Object.entries(parsed)) {
    if (merged[id]) {
      console.error(`✗ Trùng id: ${id} (${file})`);
      process.exit(1);
    }
    merged[id] = value;
  }
  console.log(`✓ ${file}: ${Object.keys(parsed).length} mục`);
}

const list = Object.entries(merged).map(([id, value]) => ({
  id,
  ...(value as object),
})) as {
  id: string;
  lesson: number;
  lesson_title: string;
  point: string;
  examples: unknown[];
  quiz: unknown[];
  cloze: unknown[];
}[];

// Sắp xếp theo bài rồi theo thứ tự trong file
list.sort((a, b) => a.lesson - b.lesson);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(list, null, 2) + '\n', 'utf8');

const lessons = [...new Set(list.map((g) => g.lesson))].sort((a, b) => a - b);
console.log(
  `\n✓ Đã ghi ${list.length} điểm ngữ pháp vào ${OUT}\n  Bài: ${lessons.join(', ')}`
);
console.log(
  `  Có ví dụ: ${list.filter((g) => g.examples.length > 0).length}/${list.length}` +
    ` | Có quiz: ${list.filter((g) => g.quiz.length > 0).length}/${list.length}` +
    ` | Có cloze: ${list.filter((g) => g.cloze.length > 0).length}/${list.length}`
);
