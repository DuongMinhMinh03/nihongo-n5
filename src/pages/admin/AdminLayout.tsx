import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/cn';

const ADMIN_NAV = [
  { to: '/admin', label: 'Tổng quan', icon: '📊', end: true },
  { to: '/admin/vocab', label: 'Từ vựng', icon: '📖' },
  { to: '/admin/grammar', label: 'Ngữ pháp', icon: '📐' },
  { to: '/admin/kanji', label: 'Kanji', icon: '✍️' },
  { to: '/admin/users', label: 'Người dùng', icon: '👥' },
  { to: '/admin/publish', label: 'Publish', icon: '🚀' }
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-lg text-white">
              🛠
            </span>
            <div>
              <p className="font-bold leading-tight">Quản trị Nihongo N5</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile?.email ?? 'admin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              ← Về trang học
            </Link>
            <button
              onClick={() => void signOut()}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <nav className="sticky top-20 flex flex-col gap-1">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800'
                  )
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
