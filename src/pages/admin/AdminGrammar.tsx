import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui';
import { useContent } from '@/store/content';
import { useAdminContent } from '@/features/admin/useAdminContent';
import { applyOverrides } from '@/data/contentMerge';
import type { Grammar, GrammarExample, GrammarNote, GrammarDialog, GrammarQuiz, GrammarCloze } from '@/data/schemas';

export default function AdminGrammar() {
  const { grammar: base } = useContent();
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Grammar | null>(null);

  const { items, loading, saving, error, save, remove, restore, changedIds } = useAdminContent(
    'grammar',
    base,
    applyOverrides
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (g) =>
        g.point.toLowerCase().includes(q) ||
        g.title_vi.toLowerCase().includes(q) ||
        String(g.lesson).includes(q)
    );
  }, [items, filter]);

  if (loading) return <Spinner label="Đang tải ngữ pháp..." />;

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Quản lý ngữ pháp"
        subtitle={`${items.length} điểm · ${changedIds.length} đã sửa (chưa publish)`}
        action={
          <Badge tone={changedIds.length > 0 ? 'amber' : 'default'}>
            {changedIds.length > 0 ? 'Có thay đổi chưa publish' : 'Không có thay đổi'}
          </Badge>
        }
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      <Card className="p-4">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Tìm theo điểm ngữ pháp / tiêu đề / số bài…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Không tìm thấy điểm ngữ pháp nào" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-slate-700/60 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2 font-medium">Bài</th>
                  <th className="px-3 py-2 font-medium">Điểm ngữ pháp</th>
                  <th className="px-3 py-2 font-medium">Tiêu đề (VI)</th>
                  <th className="px-3 py-2 font-medium">Công thức</th>
                  <th className="px-3 py-2 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2">
                      <Badge tone="violet">{g.lesson}</Badge>
                    </td>
                    <td className="px-3 py-2 font-jp">{g.point}</td>
                    <td className="px-3 py-2">{g.title_vi}</td>
                    <td className="max-w-[280px] truncate px-3 py-2 font-jp text-slate-500">
                      {g.pattern}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setEditing(g)}>
                          Sửa
                        </Button>
                        {changedIds.includes(g.id) ? (
                          <Button size="sm" variant="ghost" onClick={() => void restore(g.id)}>
                            Khôi phục
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Xoá điểm ngữ pháp "${g.point}"?`)) void remove(g.id);
                            }}
                          >
                            Xoá
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editing && (
        <GrammarEditor
          item={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={async (next) => {
            const ok = await save(next);
            if (ok) setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/* ================================================================== */

type Tab = 'info' | 'notes' | 'examples' | 'dialog' | 'quiz' | 'cloze';

function GrammarEditor({
  item,
  saving,
  onClose,
  onSave
}: {
  item: Grammar;
  saving: boolean;
  onClose: () => void;
  onSave: (g: Grammar) => void | Promise<void>;
}) {
  const [form, setForm] = useState<Grammar>(item);
  const [tab, setTab] = useState<Tab>('info');

  const set = <K extends keyof Grammar>(key: K, value: Grammar[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const field =
    'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800';

  const TABS: [Tab, string][] = [
    ['info', 'Thông tin'],
    ['notes', `Ghi chú (${form.notes.length})`],
    ['examples', `Ví dụ (${form.examples.length})`],
    ['dialog', `Hội thoại (${form.dialog.length})`],
    ['quiz', `Trắc nghiệm (${form.quiz.length})`],
    ['cloze', `Điền từ (${form.cloze.length})`]
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <Card className="my-8 w-full max-w-3xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            Sửa ngữ pháp <span className="font-jp text-brand-600">{item.point}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">ID: {form.id}</p>

        {/* Tabs */}
        <div className="mt-4 flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-t-lg px-3 py-2 text-sm font-medium transition ${
                tab === id
                  ? 'border-b-2 border-violet-600 text-violet-700 dark:text-violet-300'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === 'info' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Số bài</Label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  className={field}
                  value={form.lesson}
                  onChange={(e) => set('lesson', Number(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label>Tên bài</Label>
                <input
                  className={field}
                  value={form.lesson_title}
                  onChange={(e) => set('lesson_title', e.target.value)}
                />
              </div>
              <div>
                <Label>Điểm ngữ pháp</Label>
                <input
                  className={`${field} font-jp`}
                  value={form.point}
                  onChange={(e) => set('point', e.target.value)}
                />
              </div>
              <div>
                <Label>Tiêu đề (VI)</Label>
                <input
                  className={field}
                  value={form.title_vi}
                  onChange={(e) => set('title_vi', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Công thức</Label>
                <input
                  className={`${field} font-jp`}
                  value={form.pattern}
                  onChange={(e) => set('pattern', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Giải thích (VI)</Label>
                <textarea
                  className={field}
                  rows={6}
                  value={form.explanation_vi}
                  onChange={(e) => set('explanation_vi', e.target.value)}
                />
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <ListEditor
              items={form.notes}
              onChange={(notes) => set('notes', notes)}
              createNew={() => ({ title: 'Ghi chú mới', body: '' })}
              render={(n, update) => (
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    className={field}
                    value={n.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="Tiêu đề"
                  />
                  <textarea
                    className={`${field} sm:col-span-2`}
                    rows={2}
                    value={n.body}
                    onChange={(e) => update({ body: e.target.value })}
                    placeholder="Nội dung"
                  />
                </div>
              )}
            />
          )}

          {tab === 'examples' && (
            <ListEditor
              items={form.examples}
              onChange={(examples) => set('examples', examples)}
              createNew={() => ({ jp: '', vi: '' })}
              render={(ex, update) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={`${field} font-jp`}
                    value={ex.jp}
                    onChange={(e) => update({ jp: e.target.value })}
                    placeholder="Câu tiếng Nhật"
                  />
                  <input
                    className={field}
                    value={ex.vi}
                    onChange={(e) => update({ vi: e.target.value })}
                    placeholder="Nghĩa tiếng Việt"
                  />
                </div>
              )}
            />
          )}

          {tab === 'dialog' && (
            <ListEditor
              items={form.dialog}
              onChange={(dialog) => set('dialog', dialog)}
              createNew={() => ({ q: '', a: '', q_vi: '', a_vi: '' })}
              render={(d, update) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={`${field} font-jp`}
                    value={d.q}
                    onChange={(e) => update({ q: e.target.value })}
                    placeholder="Câu hỏi (JP)"
                  />
                  <input
                    className={`${field} font-jp`}
                    value={d.a}
                    onChange={(e) => update({ a: e.target.value })}
                    placeholder="Câu trả lời (JP)"
                  />
                  <input
                    className={field}
                    value={d.q_vi}
                    onChange={(e) => update({ q_vi: e.target.value })}
                    placeholder="Câu hỏi (VI)"
                  />
                  <input
                    className={field}
                    value={d.a_vi}
                    onChange={(e) => update({ a_vi: e.target.value })}
                    placeholder="Câu trả lời (VI)"
                  />
                </div>
              )}
            />
          )}

          {tab === 'quiz' && (
            <ListEditor
              items={form.quiz}
              onChange={(quiz) => set('quiz', quiz)}
              createNew={() => ({ question: '', options: ['', ''], answer_index: 0 })}
              render={(qz, update) => (
                <div className="space-y-2">
                  <input
                    className={field}
                    value={qz.question}
                    onChange={(e) => update({ question: e.target.value })}
                    placeholder="Câu hỏi"
                  />
                  {qz.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`ans-${item.id}-${i}`}
                        checked={qz.answer_index === i}
                        onChange={() => update({ answer_index: i })}
                        className="h-4 w-4 accent-violet-600"
                      />
                      <input
                        className={field}
                        value={opt}
                        onChange={(e) => {
                          const options = [...qz.options];
                          options[i] = e.target.value;
                          update({ options });
                        }}
                        placeholder={`Lựa chọn ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => update({ options: qz.options.filter((_, j) => j !== i) })}
                        className="shrink-0 text-xs text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => update({ options: [...qz.options, ''] })}
                    className="text-xs text-violet-600"
                  >
                    + Thêm lựa chọn
                  </button>
                </div>
              )}
            />
          )}

          {tab === 'cloze' && (
            <ListEditor
              items={form.cloze}
              onChange={(cloze) => set('cloze', cloze)}
              createNew={() => ({ sentence: '', answer: '' })}
              render={(c, update) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={`${field} font-jp`}
                    value={c.sentence}
                    onChange={(e) => update({ sentence: e.target.value })}
                    placeholder="Câu có chỗ trống"
                  />
                  <input
                    className={`${field} font-jp`}
                    value={c.answer}
                    onChange={(e) => update({ answer: e.target.value })}
                    placeholder="Đáp án"
                  />
                </div>
              )}
            />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={() => void onSave(form)} disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/** Bộ chỉnh sỉa danh sách (notes / examples / dialog / quiz / cloze) */
function ListEditor<T extends object>({
  items,
  onChange,
  createNew,
  render
}: {
  items: T[];
  onChange: (items: T[]) => void;
  createNew: () => T;
  render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">#{index + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="text-xs text-red-500"
            >
              Xoá
            </button>
          </div>
          {render(item, (patch) => {
            const next = [...items];
            next[index] = { ...item, ...patch };
            onChange(next);
          })}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, createNew()])}>
        + Thêm mục
      </Button>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{children}</label>
  );
}

// Re-export để tránh unused import warning
export type { GrammarExample, GrammarNote, GrammarDialog, GrammarQuiz, GrammarCloze };
