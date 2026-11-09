import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui';
import { SpeakButton } from '@/components/SpeakButton';
import { useContent } from '@/store/content';
import { useProgressStore } from '@/store/progress';
import { useTTS } from '@/hooks/useTTS';
import { cn, shuffle } from '@/lib/cn';
import type { Vocab } from '@/data/schemas';

type ListenMode = 'choose' | 'meaning';

export default function ListenPage() {
  const { vocab, loading, error, load } = useContent();
  const { supported, voices, activeVoice } = useTTS();
  const reviewCard = useProgressStore((s) => s.reviewCard);
  const [mode, setMode] = useState<ListenMode>('choose');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const current = vocab[index % Math.max(vocab.length, 1)];

  const options = useMemo(() => {
    if (!current) return [];
    const distractors = shuffle(vocab.filter((v) => v.id !== current.id)).slice(0, 3);
    return shuffle([current, ...distractors]);
  }, [current, vocab]);

  if (loading) return <Spinner label="Đang tải nội dung..." />;
  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Lỗi tải dữ liệu"
        description={error}
        action={<Button onClick={() => void load()}>Thử lại</Button>}
      />
    );
  }
  if (!supported) {
    return (
      <EmptyState
        icon="🔇"
        title="Trình duyệt không hỗ trợ phát âm"
        description="Hãy dùng Chrome hoặc Edge trên Windows để có giọng đọc tiếng Nhật."
      />
    );
  }
  if (vocab.length === 0) return <EmptyState icon="📭" title="Chưa có từ vựng" />;

  const answer = (value: string, correct: boolean) => {
    if (answered) return;
    setSelected(value);
    setAnswered(true);
    reviewCard(`vocab:${current.id}`, 'vocab', correct ? 'good' : 'again', correct);
  };

  const next = () => {
    setSelected(null);
    setAnswered(false);
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Luyện nghe"
        subtitle="Nghe giọng Nhật (TTS offline) rồi chọn đáp án đúng"
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Giọng đang dùng</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeVoice
                ? `${activeVoice.name} (${activeVoice.lang})${activeVoice.localService ? ' — offline' : ' — online'}`
                : 'Chưa tìm thấy giọng tiếng Nhật'}
            </p>
            {!activeVoice && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Chưa có giọng Nhật?{' '}
                <Link
                  to="/guide"
                  className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  Xem hướng dẫn cài giọng
                </Link>{' '}
                trên Windows.
              </p>
            )}
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-700">
            {([
              ['choose', 'Chọn từ'],
              ['meaning', 'Chọn nghĩa']
            ] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setMode(id);
                  setSelected(null);
                  setAnswered(false);
                  setRevealed(false);
                }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  mode === id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                    : 'text-slate-600 dark:text-slate-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {voices.length === 0 && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            ⚠️ Chưa có giọng tiếng Nhật nào được cài đặt. Hãy vào <strong>Cài đặt → Hướng dẫn</strong> để
            biết cách bật giọng Nhật trên Windows.
          </div>
        )}
      </Card>

      <Card className="p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Nghe từ này</p>
        <div className="mt-4 flex justify-center">
          <SpeakButton text={current.kanji} size="lg" label="Phát âm" />
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {options.map((opt) => {
            const isCorrect = opt.id === current.id;
            const isSelected = selected === (mode === 'choose' ? opt.kanji : opt.meaning_vi);
            const label = mode === 'choose' ? opt.kanji : opt.meaning_vi;
            return (
              <button
                key={opt.id}
                onClick={() => answer(label, isCorrect)}
                disabled={answered}
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm font-medium transition',
                  !answered && 'hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20',
                  answered && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
                  answered && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/30',
                  answered && !isCorrect && !isSelected && 'border-slate-200 opacity-50 dark:border-slate-700'
                )}
              >
                {mode === 'choose' ? (
                  <span className="font-jp text-xl">{opt.kanji}</span>
                ) : (
                  opt.meaning_vi
                )}
              </button>
            );
          })}
        </div>

        {!answered && (
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => setRevealed(true)}>
            {revealed ? 'Đã hiện đáp án' : 'Xem đáp án (gợi ý)'}
          </Button>
        )}

        {revealed && !answered && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-700/50">
            <p className="font-jp text-xl text-slate-800 dark:text-slate-100">{current.kanji}</p>
            <p className="font-jp text-sm text-slate-500">{current.hiragana}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{current.meaning_vi}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {index + 1}/{vocab.length}
          </span>
          <Button onClick={next} disabled={!answered}>
            {answered ? 'Câu tiếp theo →' : 'Hãy nghe và chọn'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export type { Vocab };
