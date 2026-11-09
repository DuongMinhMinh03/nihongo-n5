import { Link } from 'react-router-dom';
import { Badge, Button, Card, ProgressBar, SectionTitle, Spinner } from '@/components/ui';
import { useContent } from '@/store/content';
import { useProgressStore, useStreak } from '@/store/progress';
import { getCardState } from '@/store/srs';

export default function HomePage() {
  const { vocab, grammar, kanji, loading } = useContent();
  const cards = useProgressStore((s) => s.cards);
  const todayCount = useProgressStore((s) => s.todayCount);
  const dailyGoal = useProgressStore((s) => s.settings.dailyGoal);
  const streak = useStreak();

  if (loading) return <Spinner label="Đang tải nội dung..." />;

  const vocabStates = summarize(vocab.map((v) => `vocab:${v.id}`));
  const kanjiStates = summarize(kanji.map((k) => `kanji:${k.id}`));
  const grammarDone = grammar.filter((g) => cards[`grammar:${g.id}`]).length;

  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((todayCount / dailyGoal) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-100">JLPT N5 · Học offline</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Tổng cộng {vocab.length} từ vựng · {kanji.length} kanji · {grammar.length} điểm ngữ pháp
            </h1>
            <p className="mt-2 max-w-xl text-sm text-brand-100">
              Luyện từ vựng bằng thẻ ghi nhớ có lặp lại ngắt quãng (SM-2), làm bài ngữ pháp, viết kanji và
              luyện nghe bằng giọng Nhật có sẵn trên máy.
            </p>
          </div>
          <Link to="/review">
            <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
              Bắt đầu học →
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-brand-100">Hôm nay</p>
            <p className="text-2xl font-bold">
              {todayCount}
              <span className="text-sm font-normal text-brand-200">/{dailyGoal}</span>
            </p>
            <ProgressBar value={goalPct} className="mt-2 bg-white/20" barClassName="bg-white" />
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-brand-100">Chuỗi học liên tiếp</p>
            <p className="text-2xl font-bold">🔥 {streak} ngày</p>
            <p className="mt-1 text-xs text-brand-200">
              {streak > 0 ? 'Giữ nhịp nhé!' : 'Học 1 thẻ để bắt đầu chuỗi'}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-brand-100">Từ đã học</p>
            <p className="text-2xl font-bold">
              {vocabStates.review + vocabStates.mastered}
              <span className="text-sm font-normal text-brand-200">/{vocab.length}</span>
            </p>
            <p className="mt-1 text-xs text-brand-200">từ đã bắt đầu học</p>
          </div>
        </div>
      </Card>

      {/* Luyện từ vựng */}
      <section>
        <SectionTitle
          title="Luyện từ vựng"
          subtitle="4 dạng bài: dịch nghĩa, trắc nghiệm, điền từ, nghe chọn từ"
          action={
            <Link to="/vocab">
              <Button variant="outline" size="sm">
                Mở từ vựng
              </Button>
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📖</span>
              <div>
                <p className="font-semibold">Từ vựng N5</p>
                <p className="text-xs text-slate-500">
                  {vocabStates.new} mới · {vocabStates.review} đang ôn · {vocabStates.mastered} thuộc
                </p>
              </div>
            </div>
            <ProgressBar
              value={vocabStates.new + vocabStates.review + vocabStates.mastered}
              max={vocab.length}
              className="mt-4"
            />
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✍️</span>
              <div>
                <p className="font-semibold">Kanji N5</p>
                <p className="text-xs text-slate-500">
                  {kanjiStates.new} mới · {kanjiStates.review} đang ôn · {kanjiStates.mastered} thuộc
                </p>
              </div>
            </div>
            <ProgressBar
              value={kanjiStates.new + kanjiStates.review + kanjiStates.mastered}
              max={kanji.length}
              className="mt-4"
              barClassName="bg-emerald-500"
            />
          </Card>
        </div>
      </section>

      {/* Ngữ pháp & kanji */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link to="/grammar" className="block">
          <Card interactive className="h-full p-5">
            <div className="flex items-center justify-between">
              <span className="text-3xl">📐</span>
              <Badge tone="violet">{grammar.length} điểm</Badge>
            </div>
            <p className="mt-3 font-semibold">Ngữ pháp N5</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Bài học kèm ví dụ, trắc nghiệm và tập viết câu. Đã học {grammarDone}/{grammar.length}.
            </p>
          </Card>
        </Link>

        <Link to="/kanji" className="block">
          <Card interactive className="h-full p-5">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🈶</span>
              <Badge tone="green">Bảng tra nhanh</Badge>
            </div>
            <p className="mt-3 font-semibold">Luyện kanji</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Đọc, nghĩa, và luyện viết tay trên canvas theo thứ tự nét.
            </p>
          </Card>
        </Link>

        <Link to="/listen" className="block">
          <Card interactive className="h-full p-5">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🎧</span>
              <Badge tone="amber">TTS offline</Badge>
            </div>
            <p className="mt-3 font-semibold">Luyện nghe</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Nghe từ tiếng Nhật và chọn đáp án đúng — không cần mạng.
            </p>
          </Card>
        </Link>

        <Link to="/stats" className="block">
          <Card interactive className="h-full p-5">
            <div className="flex items-center justify-between">
              <span className="text-3xl">📊</span>
              <Badge tone="brand">Tiến bộ</Badge>
            </div>
            <p className="mt-3 font-semibold">Thống kê</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Chuỗi học, biểu đồ tiến bộ, tỉ lệ đúng theo chủ đề.
            </p>
          </Card>
        </Link>
      </section>
    </div>
  );
}

function summarize(ids: string[]): { new: number; learning: number; review: number; mastered: number } {
  const cards = useProgressStore.getState().cards;
  const result = { new: 0, learning: 0, review: 0, mastered: 0 };
  for (const id of ids) {
    result[getCardState(cards[id])] += 1;
  }
  return result;
}
