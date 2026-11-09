import fs from 'node:fs';
const tiers = JSON.parse(
  fs.readFileSync('content/.docx-tiers.json', 'utf8')
) as {
  tier: string;
  kanji: string;
  hiragana: string;
  meaning_vi: string;
  example?: { jp: string; vi?: string; en?: string };
}[];

const special = tiers.filter(
  (t) => /[\/,]/.test(t.kanji) || /[\/,]/.test(t.hiragana) || /\s/.test(t.kanji)
);
console.log('special count', special.length);
for (const t of special) {
  console.log(
    JSON.stringify({
      tier: t.tier,
      kanji: t.kanji,
      hiragana: t.hiragana,
      meaning_vi: t.meaning_vi,
      jp: t.example?.jp,
      vi: t.example?.vi,
      en: t.example?.en
    })
  );
}
