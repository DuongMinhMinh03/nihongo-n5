/**
 * Xuất danh sách các mục còn bản dịch tiếng Anh, cần dịch sang tiếng Việt.
 */
import fs from 'node:fs';

interface Vocab {
  id: string;
  kanji: string;
  hiragana: string;
  meaning_vi: string;
  example: { jp: string; vi: string };
}

const vocab = JSON.parse(
  fs.readFileSync('content/vocab/n5.json', 'utf8')
) as Vocab[];

const EN_RE =
  /\b(the|is|are|was|were|and|you|he|she|it|this|that|there|here|with|for|from|have|has|had|will|would|can|could|not|but|of|to|in|on|at|my|your|his|her|its|our|their|what|where|when|why|how|about|after|before|into|out|up|down|over|than|then|very|some|any|all|we|they|them|been|more|much|many|such)\b/gi;

const todo = vocab.filter((v) => (v.example.vi.match(EN_RE) ?? []).length >= 2);

const lines = todo.map(
  (v) => [v.id, v.kanji, v.hiragana, v.meaning_vi, v.example.jp, v.example.vi].join('\t')
);
fs.writeFileSync('content/.need-translate-vi.tsv', lines.join('\n'));
console.log(`Cần dịch: ${todo.length} mục`);
