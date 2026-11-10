import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Spinner } from '@/components/ui';
import { pullProgress, pushProgress, startProgressSync } from '@/store/progressSync';

/** Bọc nội dung chỉ hiện khi đã đăng nhập */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading, disabled } = useAuth();
  const location = useLocation();

  if (disabled) return <>{children}</>;
  if (loading) return <FullScreenSpinner label="Đang kiểm tra đăng nhập..." />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** Bọc nội dung chỉ hiện cho admin */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, role, loading, disabled } = useAuth();

  // Chưa cấu hình Supabase → dẫn tới trang login để xem hướng dẫn thiết lập
  if (disabled) return <Navigate to="/login" replace />;
  if (loading) return <FullScreenSpinner label="Đang kiểm tra quyền..." />;
  if (!session) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Chuyển hướng admin đã đăng nhập ra khỏi trang login */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { session, loading, disabled } = useAuth();
  if (disabled) return <>{children}</>;
  if (loading) return <FullScreenSpinner label="Đang tải..." />;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Khởi tạo session khi app mount + đồng bộ tiến độ học */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const init = useAuth((s) => s.init);
  const session = useAuth((s) => s.session);

  useEffect(() => {
    void init();
  }, [init]);

  // Khi đăng nhập → tải tiến độ từ cloud, rồi bật đồng bộ định kỳ
  useEffect(() => {
    if (!session) return;
    void pullProgress().then(() => pushProgress(true));
    return startProgressSync();
  }, [session]);

  return <>{children}</>;
}

function FullScreenSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Spinner label={label} />
    </div>
  );
}
