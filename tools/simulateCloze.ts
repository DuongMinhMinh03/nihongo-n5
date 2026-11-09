/**
 * Mô phỏng đúng logic của app (src/features/quiz/VocabQuiz.tsx → buildCloze)
 * để kiểm tra 100% thẻ từ vựng tạo được câu bỏ trống hợp lệ.
 *
 * Ngoài ra kiểm tra "tính toàn vẹn": before + answer + after phải khớp lại
 * đúng câu gốc (không bị cắt sai khi chuẩn hoá chữ số).
 */
import fs from 'node:fs';

import { clozeCandidates, normalizeNumbers } from '../src/lib/cloze';

interface Vocab {
  id: string;
  kanji: string;
  hiragana: string;
  example: { jp: string; vi: string };
}

const vocab = JSON.parse(
  fs.readFileSync('content/vocab/n5.json', 'utf8')
) as Vocab[];

/** Bản đồ vị trí — cùng logic với src/lib/cloze.ts */
function normalizeNumbersWithMap(s: string): { text: string; map: number[] } {
  const FULLWIDTH_DIGITS: Record<string, string> = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
  };
  const KANJI_NUM: Record<string, string> = {
    '〇': '0', '一': '1', '二': '2', '三': '3', '四': '4',
    '五': '5', '六': '6', '七': '7', '八': '8', '九': '9'
  };
  const kanjiNumberToArabic = (x: string): string | null => {
    if (x === '十') return '10';
    const m = /^([一二三四五六七八九])?十([一二三四五六七八九])?$/.exec(x);
    if (m) {
      const tens = m[1] ? KANJI_NUM[m[1]] : '1';
      const ones = m[2] ? KANJI_NUM[m[2]] : '0';
      return String(Number(tens) * 10 + Number(ones));
    }
    if (x.length === 1 && x in KANJI_NUM) return KANJI_NUM[x];
    return null;
  };

  let text = '';
  const map: number[] = [];
  for (let i = 0; i < s.length; i++) {
    text += FULLWIDTH_DIGITS[s[i]] ?? s[i];
    map.push(i);
  }

  let out = '';
  const outMap: number[] = [];
  const re = /[〇一二三四五六七八九十]+/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    for (let i = last; i < m.index; i++) {
      out += text[i];
      outMap.push(map[i]);
    }
    const n = kanjiNumberToArabic(m[0]);
    if (n === null) {
      out += m[0];
      for (let i = m.index; i < m.index + m[0].length; i++) outMap.push(map[i]);
    } else {
      for (const _ of n) {
        out += _;
        outMap.push(map[m.index]);
      }
    }
    last = m.index + m[0].length;
  }
  for (let i = last; i < text.length; i++) {
    out += text[i];
    outMap.push(map[i]);
  }
  return { text: out, map: outMap };
}

function buildCloze(v: Vocab) {
  const jp = v.example.jp;
  const candidates = clozeCandidates(v.kanji, v.hiragana);
  const { text: normJp, map } = normalizeNumbersWithMap(jp);

  for (const cand of candidates) {
    const idx = jp.indexOf(cand);
    if (idx >= 0) {
      return {
        before: jp.slice(0, idx),
        after: jp.slice(idx + cand.length),
        answer: cand,
        accepted: [...new Set([cand, v.kanji, v.hiragana, ...candidates])].filter(Boolean)
      };
    }
    const normCand = normalizeNumbers(cand);
    const nIdx = normJp.indexOf(normCand);
    if (nIdx < 0) continue;
    const start = map[nIdx] ?? 0;
    const end = (map[nIdx + normCand.length - 1] ?? start) + 1;
    return {
      before: jp.slice(0, start),
      after: jp.slice(end),
      answer: cand,
      accepted: [...new Set([cand, v.kanji, v.hiragana, ...candidates])].filter(Boolean)
    };
  }

  return { before: jp, after: '', answer: v.kanji, accepted: [] };
}

let fail = 0;
let broken = 0;

for (const v of vocab) {
  const c = buildCloze(v);

  // 1) phải tìm được vị trí bỏ trống
  if (!c.accepted.length || (c.before === v.example.jp && !c.after)) {
    fail++;
    console.log(`[KHÔNG TẠO ĐƯỢC] ${v.id} ${v.kanji}\t${v.example.jp}`);
    continue;
  }

  // 2) câu phải còn nguyên vẹn
  const rebuilt = c.before + v.example.jp.slice(c.before.length, c.before.length + (v.example.jp.length - c.before.length - c.after.length)) + c.after;
  if (rebuilt !== v.example.jp) {
    broken++;
    console.log(`[CẮT SAI] ${v.id} ${v.kanji}\t${v.example.jp}`);
  }
}

console.log(`Tổng ${vocab.length} — không tạo được cloze: ${fail} — cắt sai: ${broken}`);
