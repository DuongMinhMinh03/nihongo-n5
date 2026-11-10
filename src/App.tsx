import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ContentProvider, useTheme } from '@/store/content';
import { Spinner } from '@/components/ui';
import { AuthBootstrap, RedirectIfAuthed, RequireAdmin } from '@/auth/guards';

const HomePage = lazy(() => import('@/pages/HomePage'));
const VocabPage = lazy(() => import('@/pages/VocabPage'));
const GrammarPage = lazy(() => import('@/pages/GrammarPage'));
const KanjiPage = lazy(() => import('@/pages/KanjiPage'));
const ListenPage = lazy(() => import('@/pages/ListenPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const GuidePage = lazy(() => import('@/pages/GuidePage'));
const FlashcardPage = lazy(() => import('@/features/flashcard/FlashcardPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SetupPage = lazy(() => import('@/pages/SetupPage'));

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminVocab = lazy(() => import('@/pages/admin/AdminVocab'));
const AdminGrammar = lazy(() => import('@/pages/admin/AdminGrammar'));
const AdminKanji = lazy(() => import('@/pages/admin/AdminKanji'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminPublish = lazy(() => import('@/pages/admin/AdminPublish'));

function ThemeApplier() {
  useTheme();
  return null;
}

export function App() {
  return (
    <AuthBootstrap>
      <ContentProvider>
        <ThemeApplier />
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
              <Spinner label="Đang tải..." />
            </div>
          }
        >
          <Routes>
            {/* Trang hướng dẫn thiết lập Supabase */}
            <Route path="setup" element={<SetupPage />} />

            {/* Trang đăng nhập — nằm ngoài Layout */}
            <Route
              path="login"
              element={
                <RedirectIfAuthed>
                  <LoginPage />
                </RedirectIfAuthed>
              }
            />

            {/* Khu vực quản trị — yêu cầu đăng nhập + role admin */}
            <Route
              path="admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="vocab" element={<AdminVocab />} />
              <Route path="grammar" element={<AdminGrammar />} />
              <Route path="kanji" element={<AdminKanji />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="publish" element={<AdminPublish />} />
            </Route>
            {/*
              Khu vực học — mở cho tất cả (guest cũng dùng được offline).
              Đăng nhập chỉ là tùy chọn: dùng để đồng bộ tiến độ giữa nhiều
              thiết bị. Admin thì vào được khu vực quản trị.
            */}
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="vocab" element={<VocabPage />} />
              <Route path="vocab/:id" element={<VocabPage />} />
              <Route path="grammar" element={<GrammarPage />} />
              <Route path="grammar/:id" element={<GrammarPage />} />
              <Route path="kanji" element={<KanjiPage />} />
              <Route path="kanji/:id" element={<KanjiPage />} />
              <Route path="listen" element={<ListenPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="guide" element={<GuidePage />} />
              <Route path="review" element={<FlashcardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ContentProvider>
    </AuthBootstrap>
  );
}
