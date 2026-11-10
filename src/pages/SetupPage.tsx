import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, SectionTitle } from '@/components/ui';
import { isSupabaseConfigured, supabase } from '@/auth/supabase';
import { useAuth } from '@/store/auth';

/**
 * Trang hướng dẫn thiết lập Supabase + kiểm tra kết nối.
 * Hiển thị khi: chưa cấu hình, hoặc truy cập trực tiếp /setup
 */
export default function SetupPage() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const session = useAuth((s) => s.session);
  const role = useAuth((s) => s.role);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    try {
      const u = url.trim();
      const k = key.trim();

      // Kiểm tra định dạng trước cho thông báo rõ ràng
      if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(u)) {
        setResult({
          ok: false,
          msg: 'URL không đúng định dạng. Phải có dạng https://xxxxx.supabase.co (lấy ở Project Settings → API → Project URL).'
        });
        setTesting(false);
        return;
      }
      if (!k.startsWith('eyJ')) {
        setResult({
          ok: false,
          msg:
            'Key không đúng định dạng. Supabase anon key luôn bắt đầu bằng "eyJ" (là JWT). Nếu key của bạn bắt đầu bằng "sb_publishable_" thì đó là Publishable key mới — vẫn dùng được, hãy thử tiếp.'
        });
        setTesting(false);
        return;
      }

      const mod = await import('@supabase/supabase-js');
      const client = mod.createClient(u, k, {
        auth: { persistSession: false }
      });

      // Kiểm tra key có hợp lệ không (gọi endpoint auth)
      const { error: authErr } = await client.auth.getSession();
      if (authErr) {
        setResult({ ok: false, msg: `Key bị từ chối: ${authErr.message}` });
        setTesting(false);
        return;
      }

      const { error } = await client.from('profiles').select('id').limit(1);
      if (error) {
        if (/schema cache|does not exist|relation/i.test(error.message)) {
          setResult({
            ok: false,
            msg:
              'Key hợp lệ, nhưng bảng "profiles" chưa tồn tại. Bạn đã chạy schema.sql chưa? (Bước 2 trong hướng dẫn)'
          });
        } else if (/api key|jwt|invalid/i.test(error.message)) {
          setResult({
            ok: false,
            msg: `Key không hợp lệ: ${error.message}. Kiểm tra lại đã copy đúng "anon public" key chưa.`
          });
        } else {
          setResult({ ok: false, msg: `Lỗi truy vấn: ${error.message}` });
        }
      } else {
        setResult({
          ok: true,
          msg: '✅ Kết nối thành công! Copy 2 giá trị này vào file .env.local rồi khởi động lại dev server.'
        });
      }
    } catch (e) {
      setResult({ ok: false, msg: (e as Error).message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-3xl text-white dark:bg-brand-600">
            あ
          </span>
          <h1 className="mt-3 text-xl font-bold">Thiết lập đăng nhập (Supabase)</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Làm theo 5 bước dưới đây — miễn phí 100%, khoảng 5 phút.
          </p>
        </div>

        {isSupabaseConfigured ? (
          <Card className="border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/40">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              ✅ Đã cấu hình Supabase
            </p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400/90">
              {session
                ? `Đang đăng nhập với vai trò: ${role === 'admin' ? 'Admin' : 'User'}.`
                : 'Chưa đăng nhập. Bạn có thể đăng ký tài khoản ngay.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/login">
                <Button>{session ? 'Chuyển đổi tài khoản' : 'Đi tới trang đăng nhập'}</Button>
              </Link>
              {role === 'admin' && (
                <Link to="/admin">
                  <Button variant="outline">Vào bảng quản trị</Button>
                </Link>
              )}
              <Link to="/">
                <Button variant="ghost">Về trang học</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/40">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              ⚠️ Chưa cấu hình Supabase
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400/90">
              Tạo file <code className="font-mono">.env.local</code> ở thư mục gốc rồi chạy lại{' '}
              <code className="font-mono">npm run dev</code>.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-white/70 p-3 text-xs dark:bg-slate-900/70">
              {`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
            </pre>
          </Card>
        )}

        {/* Cách nhanh bằng script */}
        <Card className="border-brand-200 bg-brand-50/50 p-5 dark:border-brand-900 dark:bg-brand-950/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <p className="font-semibold">Cách nhanh nhất — 3 lệnh, xong hết</p>
          </div>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
            Thay vì copy SQL thủ công, bạn có thể chạy script tự động tạo bảng + tạo tài khoản
            admin. Cần điền 3 giá trị vào file <code className="font-mono">.env.local</code> trước.
          </p>

          <div className="mt-3 space-y-2">
            <EnvRow
              name="VITE_SUPABASE_URL"
              desc="Project Settings → API → Project URL"
              example="https://xxxxx.supabase.co"
              required
            />
            <EnvRow
              name="VITE_SUPABASE_ANON_KEY"
              desc="Project Settings → API → anon public key"
              example="eyJhbGciOi..."
              required
            />
            <EnvRow
              name="SUPABASE_ACCESS_TOKEN"
              desc="supabase.com/dashboard/account/tokens → Generate new token (sbp_xxx)"
              example="sbp_xxxxxxxxxxxx"
              secret
            />
            <EnvRow
              name="SUPABASE_PROJECT_REF"
              desc="Lấy từ Project URL (phần trước .supabase.co)"
              example="abcdefghijklmnop"
            />
            <EnvRow
              name="SUPABASE_DB_URL"
              desc="Project Settings → Database → Connection string → URI (chọn Session pooler)"
              example="postgresql://postgres.xxx:pass@aws-0-xx.pooler.supabase.com:5432/postgres"
            />
          </div>

          <div className="mt-4 space-y-2">
            <CmdLine label="1. Kiểm tra cấu hình" cmd="npm run check:env" />
            <CmdLine label="2. Tạo bảng + trigger + RLS" cmd="npm run db:setup:api" />
            <CmdLine
              label="3. Tạo tài khoản admin"
              cmd='npm run db:make-admin:api -- admin@abc.com "Tên Admin" "MatKhau123"'
            />
            <CmdLine label="4. Kiểm tra toàn bộ hệ thống" cmd="npm run db:doctor" />
          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Sau khi chạy xong, khởi động lại <code className="font-mono">npm run dev</code> rồi đăng
            nhập tại <code className="font-mono">/login</code>.
          </p>

          <details className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
            <summary className="cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
              💡 Dùng cách khác (không cần Access Token)?
            </summary>
            <div className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Nếu bạn không muốn tạo Access Token, dùng 2 biến{' '}
                <code className="font-mono">SUPABASE_DB_URL</code> +{' '}
                <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>:
              </p>
              <CmdLine label="Tạo bảng" cmd="npm run db:setup" />
              <CmdLine
                label="Tạo admin"
                cmd='npm run db:make-admin -- admin@abc.com "Tên" "MatKhau"'
              />
              <p className="text-slate-500 dark:text-slate-400">
                Hoặc đơn giản nhất: copy <code className="font-mono">supabase/schema.sql</code> và
                dán vào SQL Editor trên web (bước 2 bên dưới).
              </p>
            </div>
          </details>
        </Card>

        {/* Các bước */}
        <Card className="p-5">
          <SectionTitle
            title="Cách làm thủ công trên web"
            subtitle="Nếu bạn không muốn dùng script"
          />

          <ol className="mt-4 space-y-5">
            <Step
              n={1}
              title="Tạo project Supabase"
              desc={
                <>
                  Vào{' '}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 underline dark:text-brand-400"
                  >
                    supabase.com/dashboard
                  </a>{' '}
                  → <strong>New project</strong>. Đặt tên (vd <code>n5</code>), chọn region gần bạn
                  nhất, đặt mật khẩu database rồi chờ ~1 phút.
                </>
              }
            />

            <Step
              n={2}
              title="Tạo bảng + bật bảo mật"
              desc={
                <>
                  Mở <strong>SQL Editor</strong> → dán toàn bộ nội dung file{' '}
                  <code className="font-mono">supabase/schema.sql</code> trong project của bạn →
                  bấm <strong>Run</strong>. Lệnh này tạo 3 bảng (
                  <code className="font-mono">profiles</code>,{' '}
                  <code className="font-mono">content_items</code>,{' '}
                  <code className="font-mono">user_progress</code>) cùng các chính sách bảo mật RLS.
                </>
              }
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const path = 'supabase/schema.sql';
                    try {
                      const res = await fetch(`/${path}`);
                      const text = await res.text();
                      await navigator.clipboard.writeText(text);
                      setCopied('sql');
                      setTimeout(() => setCopied(null), 2000);
                    } catch {
                      window.open(
                        'https://github.com/DuongMinhMinh03/nihongo-n5/blob/main/supabase/schema.sql',
                        '_blank'
                      );
                    }
                  }}
                >
                  {copied === 'sql' ? '✓ Đã copy' : '📋 Copy nội dung schema.sql'}
                </Button>
              }
            />

            <Step
              n={3}
              title="Lấy URL + anon key"
              desc={
                <>
                  Vào <strong>Project Settings → API</strong> (giao diện mới: <strong>Data API</strong>) →
                  copy <strong>Project URL</strong> và <strong>anon public</strong> key.
                </>
              }
            />

            <Step
              n={4}
              title="Kiểm tra kết nối (tùy chọn)"
              desc="Dán 2 giá trị vào đây để kiểm tra trước khi lưu file."
              action={
                <div className="mt-2 space-y-2">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xxxxx.supabase.co"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <input
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <Button size="sm" onClick={() => void testConnection()} disabled={testing || !url || !key}>
                    {testing ? 'Đang kiểm tra…' : '🔍 Kiểm tra kết nối'}
                  </Button>
                  {result && (
                    <p
                      className={`rounded-xl px-3 py-2 text-xs ${
                        result.ok
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                      }`}
                    >
                      {result.msg}
                    </p>
                  )}
                </div>
              }
            />

            <Step
              n={5}
              title="Tạo tài khoản admin"
              desc={
                <>
                  <strong>(a)</strong> Vào <code className="font-mono">/login</code> → tab{' '}
                  <strong>Đăng ký</strong> → tạo tài khoản (vd <code>admin@abc.com</code>).
                  <br />
                  <strong>(b)</strong> Supabase → <strong>Authentication → Users</strong> → copy{' '}
                  <strong>User UID</strong> của tài khoản vừa tạo.
                  <br />
                  <strong>(c)</strong> Quay lại <strong>SQL Editor</strong> → chạy:
                  <pre className="mt-1.5 overflow-x-auto rounded-lg bg-slate-900 p-2.5 text-[11px] text-emerald-300">
                    {`update public.profiles set role = 'admin' where id = '<UID>';`}
                  </pre>
                  <strong>(d)</strong> Đăng xuất → đăng nhập lại → vào{' '}
                  <code className="font-mono">/admin</code>.
                </>
              }
            />
          </ol>
        </Card>

        <Card className="p-5">
          <p className="font-semibold">Mẹo nhanh</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Tắt xác nhận email</strong> (để đăng ký không cần vào hộp thư):{' '}
              <strong>Authentication → Sign In / Providers → Email</strong> → tắt{' '}
              <em>Confirm email</em>.
            </li>
            <li>
              Nếu đăng ký xong báo lỗi <em>"Database error saving new user"</em> → trigger tạo
              profile chưa chạy, hãy chạy lại <code className="font-mono">schema.sql</code>.
            </li>
            <li>
              Vào <code className="font-mono">/admin</code> mà bị đá về trang chủ → tài khoản chưa
              có role admin (bước 5c).
            </li>
            <li>
              Deploy lên Cloudflare: thêm <code className="font-mono">VITE_SUPABASE_URL</code> và{' '}
              <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> trong{' '}
              <strong>Settings → Environment variables</strong> rồi redeploy.
            </li>
          </ul>
        </Card>

        <div className="text-center">
          <Link to="/">
            <Button variant="outline">← Quay lại trang học</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
  action
}: {
  n: number;
  title: string;
  desc: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
        {action}
      </div>
    </li>
  );
}

/** Một dòng biến cần điền vào .env.local */
function EnvRow({
  name,
  desc,
  example,
  secret,
  required
}: {
  name: string;
  desc: string;
  example: string;
  secret?: boolean;
  required?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <code className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-300">
          {name}
        </code>
        <span className="flex gap-1">
          {required && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              bắt buộc
            </span>
          )}
          {secret && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
              toàn quyền — chỉ dùng local
            </span>
          )}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{desc}</p>
      <p className="mt-1 truncate font-mono text-[11px] text-slate-400">{example}</p>
    </div>
  );
}

/** Một dòng lệnh terminal có nút copy */
function CmdLine({ label, cmd }: { label: string; cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-900 px-2.5 py-1.5 font-mono text-[11px] text-emerald-300">
        {cmd}
      </code>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(cmd);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard bị chặn — bỏ qua */
          }
        }}
        className="shrink-0 rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        {copied ? '✓' : 'copy'}
      </button>
    </div>
  );
}

export { supabase };
