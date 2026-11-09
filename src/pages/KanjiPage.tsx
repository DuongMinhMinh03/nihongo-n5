import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui';
import { SpeakButton } from '@/components/SpeakButton';
import { KanjiCanvas } from '@/features/kanji/KanjiCanvas';
import { useContent, useContentStore } from '@/store/content';
import { useProgressStore } from '@/store/progress';
import type { Kanji } from '@/data/schemas';
import { cn, shuffle } from '@/lib/cn';

type KanjiMode = 'reading' | 'meaning' | 'write';

const MODES: { id: KanjiMode; label: string; icon: string }[] = [
  { id: 'reading', label: 'Đọc', icon: '🔤' },
  { id: 'meaning', label: 'Nghĩa', icon: '💭' },
  { id: 'write', label: 'Viết tay', icon: '✍️' }
];

export default function KanjiPage() {
  const { kanji, loading, error, load } = useContent();
  const [mode, setMode] = useState<KanjiMode>('reading');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return kanji;
    return kanji.filter(
      (k) => k.kanji.includes(q) || k.meaning_vi.toLowerCase().includes(q.toLowerCase())
    );
  }, [kanji, search]);

  if (loading) return <Spinner label="Đang tải kanji..." />;
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
  if (kanji.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="Chưa có kanji"
        description="Thêm dữ liệu vào content/kanji/n5.json rồi chạy lại."
      />
    );
  }

  const active = kanji.find((k) => k.id === activeId) ?? null;

  if (active) {
    return <KanjiDetail kanji={active} mode={mode} onBack={() => setActiveId(null)} onMode={setMode} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle title="Kanji N5" subtitle={`${kanji.length} kanji cơ bản`} />

      <div className="grid grid-cols-3 gap-2 sm:max-w-md">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'rounded-xl border p-3 text-center transition',
              mode === m.id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800'
            )}
          >
            <span className="text-lg">{m.icon}</span>
            <p className="mt-1 text-sm font-medium">{m.label}</p>
          </button>
        ))}
      </div>

      <Card className="p-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kanji hoặc nghĩa…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
        />
        <p className="mt-2 text-xs text-slate-500">
          Đang hiển thị {filtered.length}/{kanji.length} kanji
        </p>
      </Card>

      {mode === 'write' ? (
        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Chọn một kanji trong bảng bên dưới để luyện viết tay trên giấy ô.
          </p>
        </Card>
      ) : null}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {filtered.map((k) => (
          <button
            key={k.id}
            onClick={() => setActiveId(k.id)}
            className="group flex aspect-square flex-col items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-brand-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <span className="font-jp text-2xl text-slate-800 dark:text-slate-100">{k.kanji}</span>
            <span className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">{k.meaning_vi}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function KanjiDetail({
  kanji,
  mode,
  onBack,
  onMode
}: {
  kanji: Kanji;
  mode: KanjiMode;
  onBack: () => void;
  onMode: (m: KanjiMode) => void;
}) {
  const reviewCard = useProgressStore((s) => s.reviewCard);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const readings = kanji.onyomi.concat(kanji.kunyomi);
  const options = useMemo(() => {
    const pool = useContentStore.getState().kanji;
    const others = shuffle(
      pool.filter((x) => x.id !== kanji.id && x.onyomi.concat(x.kunyomi).length > 0)
    ).slice(0, 3);
    return shuffle([kanji, ...others]);
  }, [kanji]);

  const answer = (value: string, correct: boolean) => {
    if (answered) return;
    setSelected(value);
    setAnswered(true);
    reviewCard(`kanji:${kanji.id}`, 'kanji', correct ? 'good' : 'again', correct);
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline dark:text-brand-400">
        ← Quay lại danh sách
      </button>

      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              onMode(m.id);
              setSelected(null);
              setAnswered(false);
            }}
            className={cn(
              'rounded-xl border p-3 text-center transition',
              mode === m.id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
            )}
          >
            <span className="text-lg">{m.icon}</span>
            <p className="mt-1 text-sm font-medium">{m.label}</p>
          </button>
        ))}
      </div>

      {mode === 'write' && (
        <Card className="p-6">
          <p className="mb-4 text-center text-sm text-slate-600 dark:text-slate-300">
            Vẽ lại kanji <span className="font-jp text-2xl text-slate-900 dark:text-slate-50">{kanji.kanji}</span>{' '}
            theo thứ tự nét. Mẫu có thể ẩn đi khi bạn đã thuộc.
          </p>
          <KanjiCanvas target={kanji.kanji} strokes={kanji.strokes} />
        </Card>
      )}

      {mode !== 'write' && (
        <Card className="p-6">
          <div className="text-center">
            <p className="font-jp text-6xl font-bold text-slate-900 dark:text-slate-50">{kanji.kanji}</p>
            <p className="mt-2 text-sm text-slate-400">
              {kanji.strokes} nét · bộ phận {kanji.radical}
            </p>
            <div className="mt-2 flex justify-center">
              <SpeakButton text={kanji.kanji} />
            </div>
          </div>

          {mode === 'meaning' ? (
            <>
              <p className="mt-6 text-center text-2xl font-semibold text-brand-700 dark:text-brand-300">
                {kanji.meaning_vi}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {options.map((opt) => {
                  const isCorrect = opt.id === kanji.id;
                  const isSelected = selected === opt.meaning_vi;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => answer(opt.meaning_vi, isCorrect)}
                      disabled={answered}
                      className={cn(
                        'rounded-xl border px-4 py-3 text-sm transition',
                        !answered && 'hover:border-brand-400',
                        answered && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
                        answered && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/30',
                        answered && !isCorrect && !isSelected && 'border-slate-200 opacity-50 dark:border-slate-700'
                      )}
                    >
                      <span className="font-jp mr-2 text-lg">{opt.kanji}</span>
                      {opt.meaning_vi}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="mt-6 text-center text-xs uppercase tracking-wide text-slate-400">
                Chọn cách đọc đúng
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((opt) => {
                  const readingsOfOpt = opt.onyomi.concat(opt.kunyomi);
                  const isCorrect = readingsOfOpt.some((r) => readings.includes(r));
                  const isSelected = selected === opt.kanji;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => answer(opt.kanji, isCorrect)}
                      disabled={answered}
                      className={cn(
                        'rounded-xl border px-4 py-3 text-left transition',
                        !answered && 'hover:border-brand-400',
                        answered && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
                        answered && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/30',
                        answered && !isCorrect && !isSelected && 'border-slate-200 opacity-50 dark:border-slate-700'
                      )}
                    >
                      <span className="font-jp text-2xl">{opt.kanji}</span>
                      <span className="font-jp mt-1 block text-xs text-slate-500">
                        {readingsOfOpt.join('・') || '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {answered && (
            <div className="mt-5 animate-fade-in space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                  <p className="text-xs uppercase text-slate-400">Onyomi</p>
                  <p className="font-jp text-slate-800 dark:text-slate-100">
                    {kanji.onyomi.join('・') || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                  <p className="text-xs uppercase text-slate-400">Kunyomi</p>
                  <p className="font-jp text-slate-800 dark:text-slate-100">
                    {kanji.kunyomi.join('・') || '—'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Từ vựng liên quan</p>
                <ul className="mt-1 space-y-1">
                  {kanji.example_words.map((w) => (
                    <li
                      key={w.word}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="font-jp text-slate-800 dark:text-slate-100">
                          {w.word}
                        </span>
                        {w.reading && (
                          <span className="font-jp ml-2 text-xs text-slate-400">
                            {w.reading}
                          </span>
                        )}
                        {w.romaji && (
                          <span className="ml-2 text-xs italic text-slate-400">
                            {w.romaji}
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400">{w.vi}</span>
                        <SpeakButton
                          text={w.word}
                          label={`Nghe ${w.word}`}
                          size="sm"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Badge tone="green">Nghĩa: {kanji.meaning_vi}</Badge>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
