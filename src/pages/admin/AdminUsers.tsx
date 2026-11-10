import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, SectionTitle, Spinner } from '@/components/ui';
import { supabase } from '@/auth/supabase';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/cn';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setUsers((data as UserRow[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changeRole = async (user: UserRow, role: 'user' | 'admin') => {
    if (!supabase) return;
    setBusyId(user.id);
    setError(null);
    const { error: err } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id);
    setBusyId(null);
    if (err) {
      setError(err.message);
      return;
    }
    await load();
  };

  const deleteUser = async (user: UserRow) => {
    if (!supabase) return;
    if (!confirm(`Xoá tài khoản "${user.email}"? Tiến độ học của họ cũng sẽ bị xoá.`)) return;
    setBusyId(user.id);
    setError(null);
    // Xoá auth.users cần service_role key → dùng RPC chạy trong DB.
    const { error: err } = await supabase.rpc('delete_user', { target_id: user.id });
    setBusyId(null);
    if (err) {
      setError(err.message);
      return;
    }
    await load();
  };

  if (users === null) return <Spinner label="Đang tải danh sách người dùng..." />;

  const filtered = users.filter(
    (u) =>
      !filter.trim() ||
      u.email.toLowerCase().includes(filter.trim().toLowerCase()) ||
      (u.full_name ?? '').toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Quản lý người dùng"
        subtitle={`${users.length} tài khoản · ${users.filter((u) => u.role === 'admin').length} admin`}
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
          placeholder="Tìm theo email / tên…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-slate-700/60 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Tên</th>
                <th className="px-3 py-2 font-medium">Vai trò</th>
                <th className="px-3 py-2 font-medium">Ngày tạo</th>
                <th className="px-3 py-2 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filtered.map((u) => {
                const isSelf = u.id === profile?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2 font-medium">{u.email}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {u.full_name || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={u.role === 'admin' ? 'violet' : 'default'}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant={u.role === 'admin' ? 'outline' : 'primary'}
                          disabled={busyId === u.id || isSelf}
                          onClick={() =>
                            void changeRole(u, u.role === 'admin' ? 'user' : 'admin')
                          }
                          title={isSelf ? 'Không thể tự đổi vai trò của mình' : undefined}
                        >
                          {u.role === 'admin' ? 'Bỏ admin' : 'Làm admin'}
                        </Button>
                        {!isSelf && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busyId === u.id}
                            onClick={() => void deleteUser(u)}
                          >
                            Xoá
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <p className="font-semibold">Về việc xoá tài khoản</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Xoá tài khoản sẽ xoá luôn tiến độ học của người đó (dữ liệu nằm trong bảng{' '}
          <code>user_progress</code>). Bạn không thể tự xoá chính tài khoản đang đăng nhập.
        </p>
      </Card>
    </div>
  );
}

export { cn };
