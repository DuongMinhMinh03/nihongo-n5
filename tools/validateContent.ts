import fs from 'node:fs';
import { z } from 'zod';
import { VocabSchema, GrammarSchema, KanjiSchema } from '../src/data/schemas';

const vocab = JSON.parse(fs.readFileSync('./content/vocab/n5.json', 'utf8'));
const grammar = JSON.parse(fs.readFileSync('./content/grammar/n5.json', 'utf8'));
const kanji = JSON.parse(fs.readFileSync('./content/kanji/n5.json', 'utf8'));

function validate(label: string, data: unknown, schema: z.ZodTypeAny) {
  const result = schema.safeParse(data);
  if (result.success) {
    console.log(`✓ ${label}: ${(data as unknown[]).length} mục hợp lệ`);
  } else {
    console.log(`✗ ${label}: ${result.error.issues.length} lỗi`);
    result.error.issues.slice(0, 10).forEach((i) => console.log(`   ${i.path.join('.')}: ${i.message}`));
  }
}

validate('vocab', vocab, z.array(VocabSchema));
validate('grammar', grammar, z.array(GrammarSchema));
validate('kanji', kanji, z.array(KanjiSchema));

// kiểm tra trùng id
for (const [label, data] of [
  ['vocab', vocab],
  ['grammar', grammar],
  ['kanji', kanji]
] as const) {
  const ids = (data as { id: string }[]).map((x) => x.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) console.log(`⚠ ${label} trùng id: ${[...new Set(dup)].join(', ')}`);
}
