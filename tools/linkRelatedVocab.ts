/**
 * Tính "Từ vựng liên quan" cho mỗi mục từ vựng.
 *
 * `related` là danh sách ID của các từ khác có quan hệ với từ hiện tại, dùng
 * để hiển thị chip ở thẻ flashcard. Trước đây trường này luôn rỗng nên phần
 * "Từ vựng liên quan" không bao giờ hiển thị.
 *
 * Tiêu chí quan hệ (theo thứ tự ưu tiên):
 *   1. Chia sẻ chữ Hán với từ hiện tại   (日本 ↔ 日本語)
 *   2. Cùng chủ đề (tag)                 (giao thông ↔ xe buýt)
 *   3. Cùng loại từ (pos)                (từ ghép cùng nhóm)
 *
 * Chạy:  npx tsx tools/linkRelatedVocab.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VOCAB_FILE = path.resolve(ROOT, 'content/vocab/n5.json');

interface Vocab {
  id: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_vi: string;
  pos: string;
  tags: string[];
  related: string[];
}

/** Chữ Hán có trong từ (bỏ qua kana) */
function kanjiChars(s: string): Set<string> {
  const out = new Set<string>();
  for (const ch of s) {
    if (/[㐀-䶿一-鿿々〇]/.test(ch)) out.add(ch);
  }
  return out;
}

const vocab = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8')) as Vocab[];

// Tiền tính
const chars = vocab.map((v) => kanjiChars(v.kanji));
const tagSets = vocab.map((v) => new Set(v.tags));

const MAX_RELATED = 8;

vocab.forEach((v, i) => {
  const scored: { id: string; score: number }[] = [];

  for (let j = 0; j < vocab.length; j++) {
    if (j === i) continue;
    const other = vocab[j];

    // 1. Chung chữ Hán
    let shared = 0;
    for (const c of chars[i]) {
      if (chars[j].has(c)) shared++;
    }
    if (shared > 0) {
      scored.push({ id: other.id, score: 100 + shared * 10 });
      continue;
    }

    // 2. Chung tag
    let sharedTags = 0;
    for (const t of tagSets[i]) {
      if (tagSets[j].has(t)) sharedTags++;
    }
    if (sharedTags > 0) {
      scored.push({ id: other.id, score: 50 + sharedTags * 5 });
      continue;
    }

    // 3. Cùng pos
    if (v.pos && other.pos === v.pos) {
      scored.push({ id: other.id, score: 10 });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  v.related = scored.slice(0, MAX_RELATED).map((s) => s.id);
});

fs.writeFileSync(VOCAB_FILE, JSON.stringify(vocab, null, 2) + '\n', 'utf8');

const withRelated = vocab.filter((v) => v.related.length).length;
const avg = vocab.reduce((s, v) => s + v.related.length, 0) / vocab.length;
console.log(
  `Đã liên kết "từ vựng liên quan" cho ${withRelated}/${vocab.length} mục (trung bình ${avg.toFixed(1)} liên kết/mục).`
);
