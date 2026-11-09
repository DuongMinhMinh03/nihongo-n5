import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, ProgressBar, SectionTitle, Spinner } from '@/components/ui';
import { SpeakButton } from '@/components/SpeakButton';
import { useContent } from '@/store/content';
import { useProgressStore } from '@/store/progress';
import type { Grammar } from '@/data/schemas';
import { cn, compareSentence } from '@/lib/cn';

export default function GrammarPage() {
  const { grammar, loading, error, load } = useContent();
  const cards = useProgressStore((s) => s.cards);
  const [activeId, setActiveId] = useState<string | null>(null);

  const doneCount = useMemo(
    () => grammar.filter((g) => cards[`grammar:${g.id}`]?.reviews).length,
    [grammar, cards]
  );

  /** Nhóm các điểm ngữ pháp theo bài */
  const lessonGroups = useMemo(() => {
    const map = new Map<number, Grammar[]>();
    for (const g of grammar) {
      const list = map.get(g.lesson) ?? [];
      list.push(g);
      map.set(g.lesson, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [grammar]);

  const lessonCount = lessonGroups.length;

  if (loading) return <Spinner label="Đang tải ngữ pháp..." />;
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
  if (grammar.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="Chưa có bài ngữ pháp"
        description="Thêm dữ liệu vào content/grammar/n5.json rồi chạy lại."
      />
    );
  }

  const active = grammar.find((g) => g.id === activeId) ?? null;

  if (active) {
    return <GrammarLesson grammar={active} onBack={() => setActiveId(null)} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Ngữ pháp N5"
        subtitle={`${grammar.length} điểm ngữ pháp · ${lessonCount} bài · đã học ${doneCount}/${grammar.length}`}
      />
      <ProgressBar value={doneCount} max={grammar.length} />

      {/* Nhóm theo bài */}
      <div className="space-y-6">
        {lessonGroups.map(([lesson, items]) => {
          const lessonDone = items.filter((g) => cards[`grammar:${g.id}`]?.reviews).length;
          return (
            <section key={lesson}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                  {items[0].lesson_title}
                </h2>
                <span className="text-xs text-slate-400">
                  {lessonDone}/{items.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((g) => {
                  const done = Boolean(cards[`grammar:${g.id}`]?.reviews);
                  return (
                    <button key={g.id} onClick={() => setActiveId(g.id)} className="text-left">
                      <Card interactive className="h-full p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-jp text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {g.point}
                            </span>
                          </div>
                          {done && <Badge tone="green">Đã học</Badge>}
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{g.title_vi}</p>
                        <p className="font-jp mt-2 text-xs text-slate-400">{g.pattern}</p>
                      </Card>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function GrammarLesson({ grammar, onBack }: { grammar: Grammar; onBack: () => void }) {
  const reviewCard = useProgressStore((s) => s.reviewCard);
  const [tab, setTab] = useState<'lesson' | 'quiz' | 'cloze' | 'write'>('lesson');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [clozeIndex, setClozeIndex] = useState(0);
  const [clozeInput, setClozeInput] = useState('');
  const [clozeAnswered, setClozeAnswered] = useState(false);
  const [writeInput, setWriteInput] = useState('');
  const [writeChecked, setWriteChecked] = useState(false);

  const markDone = (correct: boolean) => {
    reviewCard(`grammar:${grammar.id}`, 'vocab', correct ? 'good' : 'again', correct);
  };

  const quiz = grammar.quiz[quizIndex];
  const cloze = grammar.cloze[clozeIndex];

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline dark:text-brand-400">
        ← Quay lại danh sách
      </button>

      <Card className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          {grammar.lesson_title} · {grammar.point}
        </p>
        <h1 className="mt-1 text-xl font-bold">{grammar.title_vi}</h1>
        <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
          <p className="text-xs font-medium uppercase text-slate-400">Cấu trúc</p>
          <p className="font-jp mt-0.5 text-base font-semibold text-slate-800 dark:text-slate-100">
            {grammar.pattern}
          </p>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {grammar.explanation_vi}
        </p>
      </Card>

      {/* Ghi chú */}
      {grammar.notes.length > 0 && (
        <section>
          <SectionTitle title="Ghi chú & quy tắc" />
          <div className="space-y-2">
            {grammar.notes.map((note, i) => (
              <Card key={i} className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                  {note.title}
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {note.body}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Hội thoại */}
      {grammar.dialog.length > 0 && (
        <section>
          <SectionTitle title="Hội thoại mẫu" subtitle="Bấm 🔊 để nghe" />
          <div className="space-y-2">
            {grammar.dialog.map((d, i) => (
              <Card key={i} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-jp text-base text-slate-800 dark:text-slate-100">{d.q}</p>
                    {d.q_vi && (
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{d.q_vi}</p>
                    )}
                  </div>
                  <SpeakButton text={d.q} label="Nghe câu hỏi" size="sm" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-jp text-base text-brand-700 dark:text-brand-300">{d.a}</p>
                    {d.a_vi && (
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{d.a_vi}</p>
                    )}
                  </div>
                  <SpeakButton text={d.a} label="Nghe câu trả lời" size="sm" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Ví dụ */}
      <section>
        <SectionTitle title="Ví dụ" subtitle="Bấm 🔊 để nghe giọng Nhật" />
        <div className="space-y-2">
          {grammar.examples.map((ex) => (
            <Card key={ex.jp} className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-jp text-lg text-slate-800 dark:text-slate-100">{ex.jp}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{ex.vi}</p>
              </div>
              <SpeakButton text={ex.jp} />
            </Card>
          ))}
        </div>
      </section>

      {/* Tabs bài tập */}
      <div className="flex gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-700">
        {([
          ['lesson', '📖 Bài học'],
          ['quiz', '☑️ Trắc nghiệm'],
          ['cloze', '✏️ Điền từ'],
          ['write', '✍️ Viết câu']
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 rounded-lg px-2 py-2 text-xs font-medium transition sm:text-sm',
              tab === id
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                : 'text-slate-600 dark:text-slate-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'lesson' && (
        <Card className="p-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Đã đọc xong phần lý thuyết? Hãy làm bài trắc nghiệm hoặc điền từ để củng cố.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setTab('quiz')}>Làm trắc nghiệm</Button>
            {grammar.cloze.length > 0 && (
              <Button variant="outline" onClick={() => setTab('cloze')}>
                Điền từ
              </Button>
            )}
            <Button variant="outline" onClick={() => setTab('write')}>
              Viết câu
            </Button>
          </div>
        </Card>
      )}

      {tab === 'quiz' &&
        (quiz ? (
          <Card className="p-5">
            <p className="text-sm font-medium">{quiz.question}</p>
            <div className="mt-4 space-y-2">
              {quiz.options.map((opt, i) => {
                const isCorrect = i === quiz.answer_index;
                const isSelected = quizSelected === i;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (quizAnswered) return;
                      setQuizSelected(i);
                      setQuizAnswered(true);
                      markDone(isCorrect);
                    }}
                    disabled={quizAnswered}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition',
                      !quizAnswered && 'hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20',
                      quizAnswered && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
                      quizAnswered && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/30',
                      quizAnswered && !isCorrect && !isSelected && 'border-slate-200 opacity-50 dark:border-slate-700'
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => {
                  setQuizIndex((i) => (i + 1) % grammar.quiz.length);
                  setQuizSelected(null);
                  setQuizAnswered(false);
                }}
              >
                Câu tiếp theo →
              </Button>
            </div>
          </Card>
        ) : (
          <EmptyState icon="📝" title="Bài này chưa có trắc nghiệm" />
        ))}

      {tab === 'cloze' &&
        (cloze ? (
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Điền từ vào chỗ trống
            </p>
            <p className="font-jp mt-2 text-xl text-slate-800 dark:text-slate-100">
              {cloze.sentence.replace('___', clozeAnswered ? cloze.answer : '　？　')}
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={clozeInput}
                onChange={(e) => setClozeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' || clozeAnswered) return;
                  const correct = clozeInput.trim() === cloze.answer;
                  setClozeAnswered(true);
                  markDone(correct);
                }}
                disabled={clozeAnswered}
                placeholder="Nhập đáp án…"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-jp text-sm outline-none focus:border-brand-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
              />
              <Button
                onClick={() => {
                  if (!clozeInput.trim()) return;
                  const correct = clozeInput.trim() === cloze.answer;
                  setClozeAnswered(true);
                  markDone(correct);
                }}
                disabled={clozeAnswered || !clozeInput.trim()}
              >
                Kiểm tra
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => {
                  setClozeIndex((i) => (i + 1) % grammar.cloze.length);
                  setClozeInput('');
                  setClozeAnswered(false);
                }}
              >
                Câu tiếp theo →
              </Button>
            </div>
          </Card>
        ) : (
          <EmptyState icon="✏️" title="Bài này chưa có bài điền từ" />
        ))}

      {tab === 'write' && (
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Tập viết câu — dùng các từ gợi ý để tạo câu của riêng bạn
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {grammar.examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setWriteInput('')}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-jp text-sm hover:border-brand-400 dark:border-slate-700"
              >
                {ex.jp}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Mẹo: bấm vào một ví dụ để xem bản dịch, rồi viết câu riêng của bạn ở ô bên dưới.
          </p>

          <textarea
            value={writeInput}
            onChange={(e) => setWriteInput(e.target.value)}
            disabled={writeChecked}
            rows={3}
            placeholder="例：わたしは学生です。"
            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-jp text-sm outline-none focus:border-brand-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
          />

          <div className="mt-3 flex items-center gap-3">
            <Button onClick={() => setWriteChecked(true)} disabled={writeChecked || !writeInput.trim()}>
              Kiểm tra
            </Button>
            {writeChecked && (
              <span className="text-sm text-slate-500">
                {compareSentence(writeInput, grammar.examples[0]?.jp ?? '')}% trùng với ví dụ mẫu
              </span>
            )}
          </div>

          {writeChecked && (
            <div className="mt-4 animate-fade-in space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              {grammar.examples.map((ex) => (
                <div key={ex.jp} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                  <p className="font-jp text-slate-800 dark:text-slate-100">{ex.jp}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{ex.vi}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
