import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, ProgressBar, Spinner } from '@/components/ui';
import { SpeakButton } from '@/components/SpeakButton';
import { useContent } from '@/store/content';
import { useProgressStore } from '@/store/progress';
import { GRADE_LABEL, isDue, type ReviewGrade } from '@/store/srs';
import { cn } from '@/lib/cn';
import type { Vocab, Kanji } from '@/data/schemas';

type StudyMode = 'vocab' | 'kanji';

interface QueueItem {
  id: string;
  kind: StudyMode;
  payload: Vocab | Kanji;
}

/** Chọn thẻ cần học: ưu tiên thẻ đến hạn, sau đó thẻ mới */
export function buildQueue(
  vocab: Vocab[],
  kanji: Kanji[],
  cards: Record<string, unknown>,
  mode: StudyMode,
  limit: number
): QueueItem[] {
  const pool: QueueItem[] =
    mode === 'vocab'
      ? vocab.map((v) => ({ id: `vocab:${v.id}`, kind: 'vocab', payload: v }))
      : kanji.map((k) => ({ id: `kanji:${k.id}`, kind: 'kanji', payload: k }));

  const due = pool.filter((item) => isDue(cards[item.id] as never));
  const fresh = pool.filter((item) => !cards[item.id]);
  const rest = pool.filter((item) => cards[item.id] && !isDue(cards[item.id] as never));

  return [...due, ...fresh, ...rest].slice(0, limit);
}

export default function FlashcardPage() {
  const navigate = useNavigate();
  const { vocab, kanji, loading } = useContent();
  const cards = useProgressStore((s) => s.cards);
  const dailyGoal = useProgressStore((s) => s.settings.dailyGoal);
  const reviewCard = useProgressStore((s) => s.reviewCard);
  const showRomanization = useProgressStore((s) => s.settings.showRomanization);

  const [mode, setMode] = useState<StudyMode>('vocab');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState<Record<StudyMode, number>>({ vocab: 0, kanji: 0 });

  const queue = useMemo(
    () => buildQueue(vocab, kanji, cards, mode, Math.max(10, dailyGoal)),
    [vocab, kanji, cards, mode, dailyGoal]
  );

  /** Tra cứu nhanh các từ được liên kết trong `related` */
  const relatedMap = useMemo(() => {
    const map = new Map<string, Vocab>();
    for (const v of vocab) map.set(v.id, v);
    return map;
  }, [vocab]);

  const current = queue[index];

  const handleGrade = useCallback(
    (grade: ReviewGrade) => {
      if (!current) return;
      reviewCard(current.id, current.kind, grade, grade !== 'again');
      setDone((d) => ({ ...d, [current.kind]: d[current.kind] + 1 }));
      setRevealed(false);
      setIndex((i) => i + 1);
    },
    [current, reviewCard]
  );

  if (loading) return <Spinner label="Đang tải nội dung..." />;

  const totalDone = done.vocab + done.kanji;

  if (queue.length === 0) {
    return (
      <EmptyState
        icon="🎉"
        title="Chưa có thẻ nào để học"
        description="Hãy kiểm tra lại dữ liệu từ vựng/kanji trong thư mục content."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-700">
          {(['vocab', 'kanji'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setIndex(0);
                setRevealed(false);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                mode === m
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                  : 'text-slate-600 dark:text-slate-300'
              )}
            >
              {m === 'vocab' ? 'Từ vựng' : 'Kanji'}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {Math.min(index + 1, queue.length)}/{queue.length}
        </span>
      </div>

      <ProgressBar value={Math.min(index, queue.length)} max={queue.length} className="mb-5" />

      {index >= queue.length ? (
        <Card className="p-8 text-center">
          <div className="text-5xl">🎊</div>
          <h2 className="mt-3 text-xl font-bold">Hoàn thành phiên học!</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Bạn đã review {totalDone} thẻ trong phiên này.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={() => { setIndex(0); setDone({ vocab: 0, kanji: 0 }); }}>
              Học thêm
            </Button>
            <Button variant="outline" onClick={() => navigate('/stats')}>
              Xem thống kê
            </Button>
          </div>
        </Card>
      ) : (
        current && (
          <Card className="p-6">
            {current.kind === 'vocab' ? (
              <VocabCard
                vocab={current.payload as Vocab}
                revealed={revealed}
                showRomanization={showRomanization}
                relatedMap={relatedMap}
              />
            ) : (
              <KanjiCard kanji={current.payload as Kanji} revealed={revealed} showRomanization={showRomanization} />
            )}

            {revealed ? (
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(['again', 'hard', 'good', 'easy'] as const).map((g) => (
                  <Button
                    key={g}
                    variant={g === 'again' ? 'danger' : g === 'good' ? 'primary' : 'secondary'}
                    onClick={() => handleGrade(g)}
                    className="flex-col !gap-0 py-3"
                  >
                    <span className="text-sm font-semibold">{GRADE_LABEL[g]}</span>
                    <span className="text-[11px] font-normal opacity-80">
                      {g === 'again' ? '10 phút' : g === 'hard' ? '1 ngày' : g === 'good' ? '3 ngày' : '5 ngày'}
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <Button className="mt-6 w-full" size="lg" onClick={() => setRevealed(true)}>
                Hiện đáp án
              </Button>
            )}
          </Card>
        )
      )}
    </div>
  );
}

function VocabCard({
  vocab,
  revealed,
  showRomanization,
  relatedMap
}: {
  vocab: Vocab;
  revealed: boolean;
  showRomanization: boolean;
  relatedMap: Map<string, Vocab>;
}) {
  return (
    <div className="text-center">
      <div className="flex items-start justify-center gap-3">
        <p className="font-jp text-5xl font-bold text-slate-900 dark:text-slate-50 sm:text-6xl">
          {vocab.kanji}
        </p>
        <SpeakButton text={vocab.kanji} size="lg" />
      </div>
      <p className="font-jp mt-2 text-2xl text-slate-600 dark:text-slate-300">{vocab.hiragana}</p>
      {showRomanization && (
        <p className="text-sm text-slate-400 dark:text-slate-500">{vocab.romaji}</p>
      )}

      {revealed && (
        <div className="mt-6 animate-fade-in space-y-4 border-t border-slate-200 pt-5 dark:border-slate-700">
          <div>
            <p className="text-2xl font-semibold text-brand-700 dark:text-brand-300">
              {vocab.meaning_vi}
            </p>
            <p className="text-xs uppercase tracking-wide text-slate-400">{vocab.pos}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-700/50">
            <div className="flex items-start justify-between gap-2">
              <p className="font-jp text-lg text-slate-800 dark:text-slate-100">{vocab.example.jp}</p>
              <SpeakButton text={vocab.example.jp} size="sm" />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{vocab.example.vi}</p>
          </div>

          {vocab.related.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Từ vựng liên quan
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {vocab.related.map((id) => {
                  const r = relatedMap.get(id);
                  if (!r) return null;
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <span className="font-jp">{r.kanji}</span>
                      <span className="font-jp text-slate-400">{r.hiragana}</span>
                      <SpeakButton
                        text={r.kanji}
                        label={`Nghe ${r.kanji}`}
                        size="sm"
                        className="h-6 w-6 text-xs"
                      />
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!revealed && (
        <p className="mt-6 text-sm text-slate-400">Nhớ nghĩa của từ này rồi bấm "Hiện đáp án"</p>
      )}
    </div>
  );
}

function KanjiCard({
  kanji,
  revealed,
  showRomanization
}: {
  kanji: Kanji;
  revealed: boolean;
  showRomanization: boolean;
}) {
  return (
    <div className="text-center">
      <p className="font-jp text-6xl font-bold text-slate-900 dark:text-slate-50">{kanji.kanji}</p>
      <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">{kanji.strokes} nét</p>

      {revealed && (
        <div className="mt-6 animate-fade-in space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          <div>
            <p className="text-2xl font-semibold text-brand-700 dark:text-brand-300">
              {kanji.meaning_vi}
            </p>
            <p className="text-xs text-slate-400">Bộ phận: {kanji.radical}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 text-left dark:bg-slate-700/50">
              <p className="text-xs font-medium uppercase text-slate-400">Onyomi</p>
              <p className="font-jp text-slate-800 dark:text-slate-100">{kanji.onyomi.join('・') || '—'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-left dark:bg-slate-700/50">
              <p className="text-xs font-medium uppercase text-slate-400">Kunyomi</p>
              <p className="font-jp text-slate-800 dark:text-slate-100">{kanji.kunyomi.join('・') || '—'}</p>
            </div>
          </div>
          {showRomanization && kanji.example_words.length > 0 && (
            <ul className="space-y-1 text-left text-sm">
              {kanji.example_words.map((w) => (
                <li key={w.word} className="flex items-center justify-between gap-2">
                  <span className="font-jp text-slate-800 dark:text-slate-100">{w.word}</span>
                  <span className="text-slate-500 dark:text-slate-400">{w.vi}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
