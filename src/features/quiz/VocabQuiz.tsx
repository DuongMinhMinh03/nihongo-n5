import { useMemo, useState } from 'react';
import { Button, Card, EmptyState } from '@/components/ui';
import { SpeakButton } from '@/components/SpeakButton';
import { useProgressStore } from '@/store/progress';
import type { Vocab } from '@/data/schemas';
import { cn, normalizeJP, shuffle } from '@/lib/cn';
import { clozeCandidates, normalizeNumbers, normalizeNumbersWithMap } from '@/lib/cloze';

export type VocabMode = 'meaning' | 'mcq' | 'cloze' | 'listen';

export const VOCAB_MODES: { id: VocabMode; label: string; icon: string; desc: string }[] = [
  { id: 'meaning', label: 'Đoán nghĩa', icon: '💡', desc: 'Nhìn kanji, chọn nghĩa tiếng Việt' },
  { id: 'mcq', label: 'Trắc nghiệm', icon: '☑️', desc: 'Chọn từ đúng dựa trên câu ví dụ' },
  { id: 'cloze', label: 'Điền từ', icon: '✏️', desc: 'Điền từ vào chỗ trống trong câu' },
  { id: 'listen', label: 'Nghe chọn từ', icon: '🎧', desc: 'Nghe TTS rồi chọn từ phù hợp' }
];

interface Props {
  pool: Vocab[];
  mode: VocabMode;
}

export function VocabQuiz({ pool, mode }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const reviewCard = useProgressStore((s) => s.reviewCard);

  const current = pool[index % Math.max(pool.length, 1)];

  const answer = (value: string, correct: boolean) => {
    if (answered || !current) return;
    setSelected(value);
    setAnswered(true);
    reviewCard(`vocab:${current.id}`, 'vocab', correct ? 'good' : 'again', correct);
  };

  const next = () => {
    setSelected(null);
    setAnswered(false);
    setIndex((i) => i + 1);
  };

  if (!current) {
    return <EmptyState icon="🔍" title="Không có từ nào để luyện" />;
  }

  return (
    <Card className="p-6">
      {mode === 'meaning' && (
        <MeaningQuiz vocab={current} pool={pool} onAnswer={answer} selected={selected} answered={answered} />
      )}
      {mode === 'mcq' && (
        <McqQuiz vocab={current} pool={pool} onAnswer={answer} selected={selected} answered={answered} />
      )}
      {mode === 'cloze' && (
        <ClozeQuiz vocab={current} pool={pool} onAnswer={answer} answered={answered} />
      )}
      {mode === 'listen' && (
        <ListenQuiz vocab={current} pool={pool} onAnswer={answer} selected={selected} answered={answered} />
      )}

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {index + 1}/{pool.length}
        </span>
        <Button onClick={next} disabled={!answered}>
          {answered ? 'Câu tiếp theo →' : 'Chọn đáp án trước'}
        </Button>
      </div>
    </Card>
  );
}

/* ---------- Đoán nghĩa ---------- */
function MeaningQuiz({
  vocab,
  pool,
  onAnswer,
  selected,
  answered
}: {
  vocab: Vocab;
  pool: Vocab[];
  onAnswer: (value: string, correct: boolean) => void;
  selected: string | null;
  answered: boolean;
}) {
  const options = useMemo(
    () => shuffle([vocab.meaning_vi, ...shuffle(pool.filter((v) => v.id !== vocab.id)).slice(0, 3).map((d) => d.meaning_vi)]),
    [vocab, pool]
  );

  return (
    <div className="text-center">
      <div className="flex items-start justify-center gap-3">
        <p className="font-jp text-5xl font-bold sm:text-6xl">{vocab.kanji}</p>
        <SpeakButton text={vocab.kanji} size="lg" />
      </div>
      <p className="font-jp mt-2 text-2xl text-slate-600 dark:text-slate-300">{vocab.hiragana}</p>
      <p className="text-sm text-slate-400">{vocab.romaji}</p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const isCorrect = opt === vocab.meaning_vi;
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => onAnswer(opt, isCorrect)}
              disabled={answered}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-medium transition',
                !answered && 'hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20',
                answered && isCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
                answered && isSelected && !isCorrect && 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200',
                answered && !isCorrect && !isSelected && 'border-slate-200 opacity-50 dark:border-slate-700'
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Trắc nghiệm theo ngữ cảnh ---------- */
function McqQuiz({
  vocab,
  pool,
  onAnswer,
  selected,
  answered
}: {
  vocab: Vocab;
  pool: Vocab[];
  onAnswer: (value: string, correct: boolean) => void;
  selected: string | null;
  answered: boolean;
}) {
  const options = useMemo(
    () => shuffle([vocab, ...shuffle(pool.filter((v) => v.id !== vocab.id)).slice(0, 3)]),
    [vocab, pool]
  );

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Chọn từ đúng cho câu này</p>
      <div className="mt-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
        <div className="flex items-start justify-between gap-2">
          <p className="font-jp text-xl text-slate-800 dark:text-slate-100">{vocab.example.jp}</p>
          <SpeakButton text={vocab.example.jp} size="sm" />
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{vocab.example.vi}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const isCorrect = opt.id === vocab.id;
          const isSelected = selected === opt.meaning_vi;
          return (
            <button
              key={opt.id}
              onClick={() => onAnswer(opt.meaning_vi, isCorrect)}
              disabled={answered}
              className={cn(
                'flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left transition',
                !answered && 'hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20',
                answered && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
                answered && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/30',
                answered && !isCorrect && !isSelected && 'border-slate-200 opacity-50 dark:border-slate-700'
              )}
            >
              <span className="font-jp text-lg">{opt.kanji}</span>
              <span className="text-xs text-slate-500">{opt.meaning_vi}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Điền từ vào chỗ trống ---------- */
function ClozeQuiz({
  vocab,
  pool,
  onAnswer,
  answered
}: {
  vocab: Vocab;
  pool: Vocab[];
  onAnswer: (value: string, correct: boolean) => void;
  answered: boolean;
}) {
  const [input, setInput] = useState('');
  const sentence = useMemo(() => buildCloze(vocab), [vocab]);
  const options = useMemo(
    () => shuffle([vocab, ...shuffle(pool.filter((v) => v.id !== vocab.id)).slice(0, 3)]),
    [vocab, pool]
  );

  const submit = () => {
    if (!input.trim()) return;
    const norm = normalizeJP(input.trim());
    const ok = sentence.accepted.some((a) => normalizeJP(a) === norm);
    onAnswer(input.trim(), ok);
  };

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Điền từ vào chỗ trống</p>
      <div className="mt-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
        <p className="font-jp text-xl text-slate-800 dark:text-slate-100">
          {sentence.before}
          <span className="rounded bg-brand-200 px-1 text-brand-900 dark:bg-brand-900 dark:text-brand-100">
            {answered ? sentence.answer : '　？　'}
          </span>
          {sentence.after}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{vocab.example.vi}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          disabled={answered}
          placeholder="Nhập từ bằng kanji hoặc hiragana…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-jp text-sm outline-none focus:border-brand-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
        />
        <Button onClick={submit} disabled={answered || !input.trim()}>
          Kiểm tra
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            disabled={answered}
            onClick={() =>
              onAnswer(
                opt.kanji,
                sentence.accepted.some((a) => normalizeJP(a) === normalizeJP(opt.kanji))
              )
            }
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-jp text-sm hover:border-brand-400 disabled:opacity-50 dark:border-slate-700"
          >
            {opt.kanji}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Nghe chọn từ ---------- */
function ListenQuiz({
  vocab,
  pool,
  onAnswer,
  selected,
  answered
}: {
  vocab: Vocab;
  pool: Vocab[];
  onAnswer: (value: string, correct: boolean) => void;
  selected: string | null;
  answered: boolean;
}) {
  const options = useMemo(
    () => shuffle([vocab, ...shuffle(pool.filter((v) => v.id !== vocab.id)).slice(0, 3)]),
    [vocab, pool]
  );

  return (
    <div className="text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Nghe và chọn từ phù hợp</p>
      <div className="mt-4 flex justify-center">
        <SpeakButton text={vocab.kanji} size="lg" label="Phát âm" />
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const isCorrect = opt.id === vocab.id;
          const isSelected = selected === opt.meaning_vi;
          return (
            <button
              key={opt.id}
              onClick={() => onAnswer(opt.meaning_vi, isCorrect)}
              disabled={answered}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-medium transition',
                !answered && 'hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20',
                answered && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
                answered && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/30',
                answered && !isCorrect && !isSelected && 'border-slate-200 opacity-50 dark:border-slate-700'
              )}
            >
              {opt.meaning_vi}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

/** Phần chữ Hán ở đầu chuỗi (gốc của động từ: 会う → 会) */
export function kanjiStem(word: string): string {
  const m = /^[　-鿿々]+/.exec(word);
  return m ? m[0] : '';
}

/**
 * Tạo câu có chỗ trống bằng cách thay từ trong ví dụ.
 *
 * Thử lần lượt các candidate: kanji đầy đủ → hiragana → gốc kanji.
 * Bước cuối là quan trọng với động từ biến cách: từ "会う" xuất hiện
 * trong câu "友達に会います。" dưới dạng "会".
 *
 * @returns before/after/answer + danh sách đáp án được chấp nhận
 */
export function buildCloze(vocab: Vocab): {
  before: string;
  after: string;
  answer: string;
  accepted: string[];
} {
  const jp = vocab.example.jp;
  const candidates = clozeCandidates(vocab.kanji, vocab.hiragana);

  // Bản chuẩn hoá kèm bản đồ vị trí về chuỗi gốc (để cắt câu chính xác
  // kể cả khi chuẩn hoá đổi độ dài, ví dụ "十" → "10").
  const { text: normJp, map } = normalizeNumbersWithMap(jp);

  for (const cand of candidates) {
    // 1) Khớp trực tiếp trên chuỗi gốc
    let idx = jp.indexOf(cand);
    if (idx >= 0) {
      const accepted = [cand, vocab.kanji, vocab.hiragana, ...candidates];
      return {
        before: jp.slice(0, idx),
        after: jp.slice(idx + cand.length),
        answer: cand,
        accepted: [...new Set(accepted)].filter(Boolean)
      };
    }

    // 2) Khớp trên chuỗi đã chuẩn hoá → ánh xạ vị trí về chuỗi gốc
    const normCand = normalizeNumbers(cand);
    const nIdx = normJp.indexOf(normCand);
    if (nIdx < 0) continue;

    const start = map[nIdx] ?? 0;
    const end = (map[nIdx + normCand.length - 1] ?? start) + 1;

    const accepted = [cand, vocab.kanji, vocab.hiragana, ...candidates];
    return {
      before: jp.slice(0, start),
      after: jp.slice(end),
      answer: cand,
      accepted: [...new Set(accepted)].filter(Boolean)
    };
  }

  return {
    before: jp,
    after: '',
    answer: vocab.kanji,
    accepted: [vocab.kanji, vocab.hiragana, ...candidates].filter(Boolean)
  };
}
