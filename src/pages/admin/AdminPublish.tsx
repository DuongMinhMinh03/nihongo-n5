import { useEffect, useState } from 'react';
import { Badge, Button, Card, SectionTitle, Spinner } from '@/components/ui';
import { supabase } from '@/auth/supabase';
import { useContent } from '@/store/content';
import { applyOverrides } from '@/data/contentMerge';
import type { ContentKind } from '@/auth/types';

type PublishState = 'idle' | 'publishing' | 'success' | 'error';

interface KindInfo {
  kind: ContentKind;
  label: string;
  file: string;
  icon: string;
}

const KINDS: KindInfo[] = [
  { kind: 'vocab', label: 'Từ vựng', file: 'content/vocab/n5.json', icon: '📖' },
  { kind: 'grammar', label: 'Ngữ pháp', file: 'content/grammar/n5.json', icon: '📐' },
  { kind: 'kanji', label: 'Kanji', file: 'content/kanji/n5.json', icon: '✍️' }
];

export default function AdminPublish() {
  const { vocab, grammar, kanji } = useContent();
  const [state, setState] = useState<PublishState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.from('content_items').select('kind, item_id');
      if (cancelled) return;
      const c: Record<string, number> = {};
      for (const row of (data ?? []) as { kind: string }[]) {
        c[row.kind] = (c[row.kind] ?? 0) + 1;
      }
      setCounts(c);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const baseByKind: Record<ContentKind, unknown[]> = {
    vocab: vocab as unknown[],
    grammar: grammar as unknown[],
    kanji: kanji as unknown[]
  };

  const hasChanges = Object.values(counts).some((n) => n > 0);

  /**
   * Xuất nội dung đã merge ra file JSON.
   *
   * Hiện tại app chạy hoàn toàn tĩnh (Cloudflare Pages), nên bước publish thật
   * sẽ ghi file JSON vào repo GitHub → Cloudflare tự build lại.
   * Nếu chưa cấu hình GitHub token, hàm này vẫn cho tải file về máy để
   * bạn tự commit.
   */
  const publish = async (kind: ContentKind) => {
    setState('publishing');
    setMessage(null);
    try {
      const merged = await applyOverrides(kind, baseByKind[kind] as { id: string }[]);
      const json = JSON.stringify(merged, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}-n5.json`;
      a.click();
      URL.revokeObjectURL(url);

      setState('success');
      setMessage(
        `Đã tải xuống ${kind}-n5.json (${merged.length} mục). Hãy thay file tương ứng trong content/ rồi commit & push để publish.`
      );
    } catch (e) {
      setState('error');
      setMessage((e as Error).message);
    }
  };

  if (loading) return <Spinner label="Đang kiểm tra thay đổi..." />;

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Publish nội dung"
        subtitle="Đưa các thay đổi trong dashboard lên trang web đang chạy"
        action={
          <Badge tone={hasChanges ? 'amber' : 'green'}>
            {hasChanges ? 'Có thay đổi chưa publish' : 'Đã đồng bộ'}
          </Badge>
        }
      />

      {message && (
        <p
          className={`rounded-xl border px-3 py-2 text-sm ${
            state === 'error'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
          }`}
        >
          {message}
        </p>
      )}

      <Card className="p-5">
        <p className="font-semibold">Cách publish</p>
        <ol className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <strong>1.</strong> Bấm nút bên dưới để tải file JSON đã merge (base + thay đổi của
            admin).
          </li>
          <li>
            <strong>2.</strong> Thay file đó vào đúng thư mục trong repo:
            <ul className="ml-5 mt-1 list-disc text-slate-500">
              <li>
                <code>content/vocab/n5.json</code>
              </li>
              <li>
                <code>content/grammar/n5.json</code>
              </li>
              <li>
                <code>content/kanji/n5.json</code>
              </li>
            </ul>
          </li>
          <li>
            <strong>3.</strong> Commit & push → Cloudflare Pages tự build và deploy trong ~1–2
            phút.
          </li>
        </ol>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-emerald-300">
          {`git add content/
git commit -m "content: cap nhat noi dung hoc"
git push`}
        </pre>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {KINDS.map((k) => (
          <Card key={k.kind} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{k.icon}</span>
              <Badge tone={counts[k.kind] ? 'amber' : 'default'}>
                {counts[k.kind] ?? 0} thay đổi
              </Badge>
            </div>
            <p className="mt-3 font-semibold">{k.label}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">{k.file}</p>
            <Button
              className="mt-4 w-full"
              variant="outline"
              disabled={state === 'publishing'}
              onClick={() => void publish(k.kind)}
            >
              {state === 'publishing' ? 'Đang xử lý…' : '⬇ Tải JSON đã merge'}
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <p className="font-semibold">Về service worker</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Sau khi push, Cloudflare build lại và tạo file service worker mới (hash khác). Người học
          cần <strong>F5 2 lần</strong> (hoặc bấm nút cập nhật nếu app hiện banner) để nhận nội dung
          mới. Nội dung cũ vẫn nằm trong cache nên app không bị trắng màn hình.
        </p>
      </Card>
    </div>
  );
}
