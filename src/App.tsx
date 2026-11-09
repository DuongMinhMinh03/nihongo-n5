import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ContentProvider, useTheme } from '@/store/content';
import { Spinner } from '@/components/ui';

const HomePage = lazy(() => import('@/pages/HomePage'));
const VocabPage = lazy(() => import('@/pages/VocabPage'));
const GrammarPage = lazy(() => import('@/pages/GrammarPage'));
const KanjiPage = lazy(() => import('@/pages/KanjiPage'));
const ListenPage = lazy(() => import('@/pages/ListenPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const GuidePage = lazy(() => import('@/pages/GuidePage'));
const FlashcardPage = lazy(() => import('@/features/flashcard/FlashcardPage'));

function ThemeApplier() {
  useTheme();
  return null;
}

export function App() {
  return (
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ContentProvider>
  );
}
