import { useEffect, useState } from 'react';
import { Badge, Card, SectionTitle, Spinner } from '@/components/ui';
import { supabase } from '@/auth/supabase';
import { useContent } from '@/store/content';
import { useAuth } from '@/store/auth';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { vocab, grammar, kanji } = useContent();
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setUsers([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (err) setError(err.message);
      else setUsers((data as UserRow[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const admins = users?.filter((u) => u.role === 'admin').length ?? 0;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Tổng quan"
        subtitle={`Đang đăng nhập với quyền admin — ${profile?.email ?? ''}`}
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="📖" label="Từ vựng" value={vocab.length} tone="brand" />
        <StatCard icon="📐" label="Điểm ngữ pháp" value={grammar.length} tone="violet" />
        <StatCard icon="✍️" label="Kanji" value={kanji.length} tone="green" />
        <StatCard
          icon="👥"
          label="Người dùng"
          value={users === null ? '—' : users.length}
          tone="amber"
          sub={users ? `${admins} admin` : undefined}
        />
      </div>

      <Card className="p-5">
        <p className="font-semibold">Cách hoạt động của hệ thống</p>
        <ol className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <strong>1.</strong> Nội dung gốc nằm trong <code>content/*.json</code> (đã được
            service worker cache → app chạy offline).
          </li>
          <li>
            <strong>2.</strong> Admin sửa ở các trang bên trái → thay đổi được lưu vào bảng{' '}
            <code>content_items</code> trên Supabase (bản nháp).
          </li>
          <li>
            <strong>3.</strong> Bấm <strong>Publish</strong> để ghi thay đổi vào GitHub →
            Cloudflare Pages tự build lại → mọi người học nhận bản mới.
          </li>
          <li>
            <strong>4.</strong> Nếu mất mạng, app tự dùng bản JSON gốc đã cache.
          </li>
        </ol>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  sub
}: {
  icon: string;
  label: string;
  value: number | string;
  tone: 'brand' | 'violet' | 'green' | 'amber';
  sub?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      {sub && (
        <div className="mt-3">
          <Badge tone={tone}>{sub}</Badge>
        </div>
      )}
    </Card>
  );
}

export { Spinner };
