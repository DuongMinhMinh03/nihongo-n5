import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui';
import { useContent } from '@/store/content';
import { useAdminContent } from '@/features/admin/useAdminContent';
import { applyOverrides } from '@/data/contentMerge';
import type { Vocab } from '@/data/schemas';
import { cn } from '@/lib/cn';

export default function AdminVocab() {
  const { vocab: base } = useContent();
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Vocab | null>(null);

  const { items, loading, saving, error, save, remove, restore, changedIds } = useAdminContent(
    'vocab',
    base,
    applyOverrides
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (v) =>
        v.kanji.includes(q) ||
        v.hiragana.includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.meaning_vi.toLowerCase().includes(q)
    );
  }, [items, filter]);

  if (loading) return <Spinner label="Đang tải từ vựng..." />;

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Quản lý từ vựng"
        subtitle={`${items.length} từ · ${changedIds.length} đã sửa (chưa publish)`}
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
          placeholder="Tìm theo kanji / hiragana / romaji / nghĩa…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Không tìm thấy từ nào" description="Thử từ khoá khác." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-slate-700/60 dark:text-slate-300">
                <tr>
                  <Th>Kanji</Th>
                  <Th>Hiragana</Th>
                  <Th>Romaji</Th>
                  <Th>Nghĩa (VI)</Th>
                  <Th>Từ loại</Th>
                  <Th>Ví dụ</Th>
                  <Th className="text-right">Thao tác</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filtered.slice(0, 300).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <Td>
                      <span className="font-jp text-base">{v.kanji}</span>
                    </Td>
                    <Td>{v.hiragana}</Td>
                    <Td className="text-slate-500">{v.romaji}</Td>
                    <Td>{v.meaning_vi}</Td>
                    <Td>
                      <Badge>{v.pos}</Badge>
                    </Td>
                    <Td className="max-w-[240px] truncate text-slate-500">{v.example.jp}</Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setEditing(v)}>
                          Sửa
                        </Button>
                        {changedIds.includes(v.id) ? (
                          <Button size="sm" variant="ghost" onClick={() => void restore(v.id)}>
                            Khôi phục
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Xoá "${v.kanji}"? Sẽ ẩn từ này khỏi app sau khi publish.`)) {
                                void remove(v.id);
                              }
                            }}
                          >
                            Xoá
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 300 && (
            <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700">
              Đang hiển thị 300 / {filtered.length} — dùng ô tìm kiếm để lọc.
            </p>
          )}
        </Card>
      )}

      {editing && (
        <VocabEditor
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

function Th({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <th className={cn('px-3 py-2 font-medium', className)}>{children}</th>;
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('px-3 py-2', className)}>{children}</td>;
}

/* ------------------------------------------------------------------ */

function VocabEditor({
  item,
  saving,
  onClose,
  onSave
}: {
  item: Vocab;
  saving: boolean;
  onClose: () => void;
  onSave: (v: Vocab) => void | Promise<void>;
}) {
  const [form, setForm] = useState<Vocab>(item);

  const set = <K extends keyof Vocab>(key: K, value: Vocab[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const field =
    'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <Card className="my-8 w-full max-w-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            Sửa từ vựng <span className="font-jp text-brand-600">{item.kanji}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <p className="mt-1 text-xs text-slate-500">ID: {form.id}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Kanji</Label>
            <input className={`${field} font-jp text-lg`} value={form.kanji} onChange={(e) => set('kanji', e.target.value)} />
          </div>
          <div>
            <Label>Hiragana</Label>
            <input className={field} value={form.hiragana} onChange={(e) => set('hiragana', e.target.value)} />
          </div>
          <div>
            <Label>Romaji</Label>
            <input className={field} value={form.romaji} onChange={(e) => set('romaji', e.target.value)} />
          </div>
          <div>
            <Label>Từ loại</Label>
            <input
              className={field}
              value={form.pos}
              onChange={(e) => set('pos', e.target.value)}
              placeholder="noun / verb-u / adj-i / adj-na / pronoun"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Nghĩa tiếng Việt</Label>
            <input className={field} value={form.meaning_vi} onChange={(e) => set('meaning_vi', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Câu ví dụ (tiếng Nhật)</Label>
            <textarea
              className={`${field} font-jp`}
              rows={2}
              value={form.example.jp}
              onChange={(e) => set('example', { ...form.example, jp: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Câu ví dụ (tiếng Việt)</Label>
            <textarea
              className={field}
              rows={2}
              value={form.example.vi}
              onChange={(e) => set('example', { ...form.example, vi: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Chủ đề (ngăn cách bằng dấu phẩy)</Label>
            <input
              className={field}
              value={form.tags.join(', ')}
              onChange={(e) =>
                set(
                  'tags',
                  e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Từ liên quan (ngăn cách bằng dấu phẩy)</Label>
            <input
              className={field}
              value={form.related.join(', ')}
              onChange={(e) =>
                set(
                  'related',
                  e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{children}</label>
  );
}
