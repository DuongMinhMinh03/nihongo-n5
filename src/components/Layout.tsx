import { NavLink, Outlet, Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useProgressStore } from '@/store/progress';
import { useAuth } from '@/store/auth';
import { isSupabaseConfigured } from '@/auth/supabase';

const NAV = [
  { to: '/', label: 'Học', icon: '🏠', end: true },
  { to: '/vocab', label: 'Từ vựng', icon: '📖' },
  { to: '/grammar', label: 'Ngữ pháp', icon: '📐' },
  { to: '/kanji', label: 'Kanji', icon: '✍️' },
  { to: '/listen', label: 'Nghe', icon: '🎧' },
  { to: '/stats', label: 'Thống kê', icon: '📊' },
  { to: '/settings', label: 'Cài đặt', icon: '⚙️' }
];

export function Layout() {
  const todayCount = useProgressStore((s) => s.todayCount);
  const dailyGoal = useProgressStore((s) => s.settings.dailyGoal);
  const session = useAuth((s) => s.session);
  const role = useAuth((s) => s.role);
  const profile = useAuth((s) => s.profile);
  const signOut = useAuth((s) => s.signOut);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Header cho mobile */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">あ</span>
            <div>
              <p className="font-bold leading-tight">Nihongo N5</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hôm nay: {todayCount}/{dailyGoal} thẻ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSupabaseConfigured && !session && (
              <Link
                to="/login"
                className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white"
              >
                🔑 Đăng nhập
              </Link>
            )}
            {isSupabaseConfigured && session && role === 'admin' && (
              <Link
                to="/admin"
                className="rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-medium text-white"
              >
                🛠 Admin
              </Link>
            )}
            <NavLink to="/guide" className="text-sm text-brand-600 dark:text-brand-400">
              Hướng dẫn
            </NavLink>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-5 md:px-6">
        {/* Sidebar cho desktop */}
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-5">
            <NavLink to="/" className="mb-6 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xl text-white dark:bg-brand-600">
                あ
              </span>
              <div>
                <p className="font-bold leading-tight">Nihongo N5</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Học từ vựng · Ngữ pháp · Kanji</p>
              </div>
            </NavLink>

            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
                    )
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/guide"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
                  )
                }
              >
                <span className="text-base">📖</span>
                Hướng dẫn
              </NavLink>
            </nav>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-800">
              <p className="font-medium text-slate-700 dark:text-slate-200">Mục tiêu hôm nay</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                {todayCount}/{dailyGoal} thẻ đã học
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all dark:bg-brand-500"
                  style={{
                    width: `${dailyGoal > 0 ? Math.min(100, (todayCount / dailyGoal) * 100) : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Tài khoản */}
            {isSupabaseConfigured && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-800">
                {session ? (
                  <>
                    <p className="truncate font-medium text-slate-700 dark:text-slate-200">
                      {profile?.email ?? 'Đã đăng nhập'}
                    </p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Vai trò: {role === 'admin' ? 'Admin' : 'User'}
                    </p>
                    <div className="mt-2 flex flex-col gap-1">
                      {role === 'admin' && (
                        <Link
                          to="/admin"
                          className="rounded-lg bg-violet-600 px-2 py-1.5 text-center font-medium text-white hover:bg-violet-700"
                        >
                          🛠 Bảng quản trị
                        </Link>
                      )}
                      <button
                        onClick={() => void signOut()}
                        className="rounded-lg border border-slate-300 px-2 py-1.5 font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block rounded-lg bg-brand-600 px-2 py-1.5 text-center font-medium text-white hover:bg-brand-700"
                  >
                    🔑 Đăng nhập
                  </Link>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav cho mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:hidden">
        <div className="grid grid-cols-6">
          {NAV.slice(0, 6).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition',
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
                )
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
