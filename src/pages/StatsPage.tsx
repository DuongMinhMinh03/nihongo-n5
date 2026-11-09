import { useMemo } from 'react';
import { Card, ProgressBar, SectionTitle, Spinner } from '@/components/ui';
import { useContent } from '@/store/content';
import { useProgressStore, useStreak } from '@/store/progress';
import { getCardState } from '@/store/srs';
import { cn } from '@/lib/cn';

export default function StatsPage() {
  const { vocab, kanji, loading } = useContent();
  const cards = useProgressStore((s) => s.cards);
  const log = useProgressStore((s) => s.log);
  const studyDays = useProgressStore((s) => s.studyDays);
  const todayCount = useProgressStore((s) => s.todayCount);
  const dailyGoal = useProgressStore((s) => s.settings.dailyGoal);
  const streak = useStreak();

  const vocabStats = useMemo(() => {
    const result = { new: 0, learning: 0, review: 0, mastered: 0 };
    vocab.forEach((v) => result[getCardState(cards[`vocab:${v.id}`])] += 1);
    return result;
  }, [vocab, cards]);

  const kanjiStats = useMemo(() => {
    const result = { new: 0, learning: 0, review: 0, mastered: 0 };
    kanji.forEach((k) => result[getCardState(cards[`kanji:${k.id}`])] += 1);
    return result;
  }, [kanji, cards]);

  /** Tỉ lệ đúng theo chủ đề (dựa trên log + tag của từ) */
  const byTag = useMemo(() => {
    const totals = new Map<string, { correct: number; total: number }>();
    const vocabById = new Map(vocab.map((v) => [v.id, v]));

    log.forEach((entry) => {
      if (!entry.id.startsWith('vocab:')) return;
      const vocabItem = vocabById.get(entry.id.slice('vocab:'.length));
      if (!vocabItem) return;
      vocabItem.tags.forEach((tag) => {
        const stat = totals.get(tag) ?? { correct: 0, total: 0 };
        stat.total += 1;
        if (entry.correct) stat.correct += 1;
        totals.set(tag, stat);
      });
    });

    return [...totals.entries()]
      .map(([tag, s]) => ({ tag, ...s, rate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [log, vocab]);

  /** Biểu đồ hoạt động 14 ngày gần nhất */
  const last14 = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const count = log.filter((l) => {
        const ld = new Date(l.timestamp);
        const lk = `${ld.getFullYear()}-${String(ld.getMonth() + 1).padStart(2, '0')}-${String(ld.getDate()).padStart(2, '0')}`;
        return lk === key;
      }).length;
      days.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, count });
    }
    return days;
  }, [log]);

  const maxCount = Math.max(1, ...last14.map((d) => d.count));
  const totalReviews = log.length;
  const correctReviews = log.filter((l) => l.correct).length;
  const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

  if (loading) return <Spinner label="Đang tải..." />;

  return (
    <div className="space-y-6">
      <SectionTitle title="Thống kê học tập" subtitle="Theo dõi tiến bộ của bạn" />

      {/* Thẻ tổng quan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Chuỗi học" value={`${streak}`} unit="ngày" icon="🔥" />
        <StatCard label="Hôm nay" value={`${todayCount}`} unit={`/${dailyGoal}`} icon="📅" />
        <StatCard label="Tổng lượt học" value={`${totalReviews}`} unit="lượt" icon="📚" />
        <StatCard label="Tỉ lệ đúng" value={`${accuracy}`} unit="%" icon="🎯" />
      </div>

      {/* Biểu đồ 14 ngày */}
      <Card className="p-5">
        <p className="font-semibold">Hoạt động 14 ngày gần nhất</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Mỗi cột là số thẻ đã review trong ngày đó
        </p>
        <div className="mt-5 flex h-40 items-end gap-1.5">
          {last14.map((d) => (
            <div key={d.label} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] text-slate-400 opacity-0 transition group-hover:opacity-100">
                {d.count}
              </span>
              <div
                className={cn(
                  'w-full rounded-t transition-all',
                  d.count > 0 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
                style={{ height: `${Math.max(3, (d.count / maxCount) * 100)}%` }}
              />
              <span className="text-[9px] text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Trạng thái từ vựng & kanji */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StateCard title="Từ vựng" stats={vocabStats} total={vocab.length} />
        <StateCard title="Kanji" stats={kanjiStats} total={kanji.length} />
      </div>

      {/* Tỉ lệ đúng theo chủ đề */}
      <Card className="p-5">
        <p className="font-semibold">Tỉ lệ đúng theo chủ đề</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Dựa trên các lượt luyện đã ghi nhận
        </p>
        {byTag.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Chưa có dữ liệu. Hãy làm vài bài luyện để xem thống kê chủ đề.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {byTag.map((t) => (
              <div key={t.tag}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{t.tag}</span>
                  <span className="text-xs text-slate-500">
                    {t.correct}/{t.total} · {t.rate}%
                  </span>
                </div>
                <ProgressBar
                  value={t.rate}
                  barClassName={t.rate >= 80 ? 'bg-emerald-500' : t.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Ngày đã học */}
      <Card className="p-5">
        <p className="font-semibold">Lịch sử học</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {studyDays.length} ngày đã học
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {studyDays
            .slice()
            .reverse()
            .slice(0, 60)
            .map((d) => (
              <span
                key={d}
                title={d}
                className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
              >
                {d.slice(5)}
              </span>
            ))}
          {studyDays.length === 0 && (
            <span className="text-sm text-slate-400">Chưa có dữ liệu</span>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  icon
}: {
  label: string;
  value: string;
  unit: string;
  icon: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="mt-1 text-2xl font-bold">
        {value}
        <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>
      </p>
    </Card>
  );
}

function StateCard({
  title,
  stats,
  total
}: {
  title: string;
  stats: { new: number; learning: number; review: number; mastered: number };
  total: number;
}) {
  const items = [
    { label: 'Mới', value: stats.new, color: 'bg-slate-300 dark:bg-slate-600' },
    { label: 'Đang học', value: stats.learning, color: 'bg-amber-400' },
    { label: 'Đang ôn', value: stats.review, color: 'bg-brand-500' },
    { label: 'Đã thuộc', value: stats.mastered, color: 'bg-emerald-500' }
  ];

  return (
    <Card className="p-5">
      <p className="font-semibold">{title}</p>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        {items.map((it) => (
          <div
            key={it.label}
            className={cn('h-full transition-all', it.color)}
            style={{ width: `${total > 0 ? (it.value / total) * 100 : 0}%` }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className={cn('h-2.5 w-2.5 rounded-full', it.color)} />
              {it.label}
            </span>
            <span className="font-medium">{it.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
