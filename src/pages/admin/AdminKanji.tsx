import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui';
import { useContent } from '@/store/content';
import { useAdminContent } from '@/features/admin/useAdminContent';
import { applyOverrides } from '@/data/contentMerge';
import type { Kanji } from '@/data/schemas';

export default function AdminKanji() {
  const { kanji: base } = useContent();
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Kanji | null>(null);

  const { items, loading, saving, error, save, remove, restore, changedIds } = useAdminContent(
    'kanji',
    base,
    applyOverrides
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (k) => k.kanji.includes(q) || k.meaning_vi.toLowerCase().includes(q)
    );
  }, [items, filter]);

  if (loading) return <Spinner label="Đang tải kanji..." />;

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Quản lý kanji"
        subtitle={`${items.length} kanji · ${changedIds.length} đã sửa (chưa publish)`}
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
          placeholder="Tìm theo kanji / nghĩa…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Không tìm thấy kanji nào" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-slate-700/60 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2 font-medium">Kanji</th>
                  <th className="px-3 py-2 font-medium">Onyomi</th>
                  <th className="px-3 py-2 font-medium">Kunyomi</th>
                  <th className="px-3 py-2 font-medium">Nét</th>
                  <th className="px-3 py-2 font-medium">Bộ phận</th>
                  <th className="px-3 py-2 font-medium">Nghĩa (VI)</th>
                  <th className="px-3 py-2 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filtered.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2">
                      <span className="font-jp text-lg">{k.kanji}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {k.onyomi.join(', ') || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {k.kunyomi.join(', ') || '—'}
                    </td>
                    <td className="px-3 py-2">{k.strokes}</td>
                    <td className="px-3 py-2">
                      <span className="font-jp">{k.radical || '—'}</span>
                    </td>
                    <td className="px-3 py-2">{k.meaning_vi}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setEditing(k)}>
                          Sửa
                        </Button>
                        {changedIds.includes(k.id) ? (
                          <Button size="sm" variant="ghost" onClick={() => void restore(k.id)}>
                            Khôi phục
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Xoá kanji "${k.kanji}"?`)) void remove(k.id);
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
        <KanjiEditor
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

function KanjiEditor({
  item,
  saving,
  onClose,
  onSave
}: {
  item: Kanji;
  saving: boolean;
  onClose: () => void;
  onSave: (k: Kanji) => void | Promise<void>;
}) {
  const [form, setForm] = useState<Kanji>(item);
  const [wordsText, setWordsText] = useState(() =>
    item.example_words.map((w) => `${w.word}|${w.vi}|${w.reading ?? ''}|${w.romaji ?? ''}`).join('\n')
  );

  const set = <K extends keyof Kanji>(key: K, value: Kanji[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const field =
    'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800';

  const saveWords = () => {
    const words = wordsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [word = '', vi = '', reading = '', romaji = ''] = line.split('|');
        return { word: word.trim(), vi: vi.trim(), reading: reading.trim(), romaji: romaji.trim() };
      });
    set('example_words', words);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <Card className="my-8 w-full max-w-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            Sửa kanji <span className="font-jp text-brand-600">{item.kanji}</span>
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
            <Label>Nghĩa tiếng Việt</Label>
            <input className={field} value={form.meaning_vi} onChange={(e) => set('meaning_vi', e.target.value)} />
          </div>
          <div>
            <Label>Onyomi (ngăn cách bằng dấu phẩy)</Label>
            <input
              className={field}
              value={form.onyomi.join(', ')}
              onChange={(e) => set('onyomi', splitList(e.target.value))}
            />
          </div>
          <div>
            <Label>Kunyomi (ngăn cách bằng dấu phẩy)</Label>
            <input
              className={field}
              value={form.kunyomi.join(', ')}
              onChange={(e) => set('kunyomi', splitList(e.target.value))}
            />
          </div>
          <div>
            <Label>Số nét</Label>
            <input
              type="number"
              min={0}
              className={field}
              value={form.strokes}
              onChange={(e) => set('strokes', Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Bộ phận</Label>
            <input className={`${field} font-jp`} value={form.radical} onChange={(e) => set('radical', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Từ ví dụ — mỗi dòng: từ | nghĩa VI | hiragana | romaji</Label>
            <textarea
              className={`${field} font-jp`}
              rows={6}
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value)}
              onBlur={saveWords}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            onClick={() => {
              saveWords();
              void onSave(form);
            }}
            disabled={saving}
          >
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function splitList(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{children}</label>
  );
}
