import { useMemo, useState } from 'react';
import { Button, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui';
import { useContent } from '@/store/content';
import { VocabQuiz, VOCAB_MODES, type VocabMode } from '@/features/quiz/VocabQuiz';
import { cn } from '@/lib/cn';

export default function VocabPage() {
  const { vocab, loading, error, load } = useContent();
  const [mode, setMode] = useState<VocabMode>('meaning');
  const [filter, setFilter] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    vocab.forEach((v) => v.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [vocab]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return vocab.filter((v) => {
      if (tag && !v.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        v.kanji.toLowerCase().includes(q) ||
        v.hiragana.includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.meaning_vi.toLowerCase().includes(q)
      );
    });
  }, [vocab, filter, tag]);

  if (loading) return <Spinner label="Đang tải từ vựng..." />;
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
  if (vocab.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="Chưa có từ vựng"
        description="Thêm dữ liệu vào content/vocab/n5.json rồi chạy lại."
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Từ vựng N5"
        subtitle={`${vocab.length} từ · chọn chế độ luyện bên dưới`}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {VOCAB_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'rounded-xl border p-3 text-left transition',
              mode === m.id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800'
            )}
          >
            <span className="text-lg">{m.icon}</span>
            <p className="mt-1 text-sm font-medium">{m.label}</p>
            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{m.desc}</p>
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Tìm theo kanji / hiragana / romaji / nghĩa…"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
          />
          <select
            value={tag ?? ''}
            onChange={(e) => setTag(e.target.value || null)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">Tất cả chủ đề</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Đang hiển thị {filtered.length}/{vocab.length} từ
        </p>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Không tìm thấy từ nào"
          description="Thử bỏ bộ lọc hoặc đổi từ khoá tìm kiếm."
        />
      ) : (
        <VocabQuiz key={mode} pool={filtered} mode={mode} />
      )}
    </div>
  );
}
