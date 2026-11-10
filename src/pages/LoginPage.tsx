import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Spinner } from '@/components/ui';
import { useAuth } from '@/store/auth';
import { isSupabaseConfigured } from '@/auth/supabase';
import { cn } from '@/lib/cn';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        const err = await signIn(email, password);
        if (err) {
          setError(err);
        } else {
          navigate('/');
        }
      } else {
        const err = await signUp(email, password, fullName);
        if (err) {
          setError(err);
        } else {
          setNotice(
            'Đăng ký thành công! Nếu chưa đăng nhập được, hãy kiểm tra email xác nhận (hoặc tắt xác nhận email trong Supabase).'
          );
          setMode('signin');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-3xl text-white dark:bg-brand-600">
            あ
          </span>
          <h1 className="mt-3 text-xl font-bold">Nihongo N5</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === 'signin' ? 'Đăng nhập để đồng bộ tiến độ học' : 'Tạo tài khoản học viên'}
          </p>
        </div>

        <Card className="p-6">
          {!isSupabaseConfigured && (
            <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs dark:border-amber-800 dark:bg-amber-950/40">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                ⚠️ Chưa cấu hình Supabase
              </p>
              <p className="mt-1 text-amber-700 dark:text-amber-400/90">
                Tạo file <code>.env.local</code> ở thư mục gốc rồi chạy lại <code>npm run dev</code>:
              </p>
              <pre className="mt-1.5 overflow-x-auto rounded-lg bg-white/70 p-2 text-[11px] dark:bg-slate-900/70">
                {`VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
              </pre>
              <p className="mt-1.5 text-amber-700 dark:text-amber-400/90">
                Chi tiết: <code>supabase/README.md</code>
              </p>
              <Link
                to="/setup"
                className="mt-2 inline-block rounded-lg bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-700"
              >
                📖 Hướng dẫn thiết lập chi tiết
              </Link>
            </div>
          )}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(
              [
                ['signin', 'Đăng nhập'],
                ['signup', 'Đăng ký']
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  setError(null);
                  setNotice(null);
                }}
                className={cn(
                  'rounded-lg py-2 text-sm font-medium transition',
                  mode === id
                    ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-brand-200'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-slate-500">Tối thiểu 6 ký tự.</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                <p>{error}</p>
                {(error.includes('API key') || error.includes('Supabase')) && (
                  <Link
                    to="/setup"
                    className="mt-1.5 inline-block font-medium underline underline-offset-2"
                  >
                    → Xem hướng dẫn thiết lập
                  </Link>
                )}
              </div>
            )}
            {notice && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                {notice}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy || loading}>
              {busy ? <Spinner label="" /> : mode === 'signin' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </Button>
          </form>
        </Card>

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400"
        >
          ← Quay lại trang học
        </button>
      </div>
    </div>
  );
}
