// Controla o carregamento inicial e mostra a página atual.

import { Suspense } from 'react';
import { AppErrorBoundary } from '../components/system/AppErrorBoundary';
import { AppContent } from './AppContent';
import { PageLoading } from './PageLoading';
import { useAppController } from './useAppController';
import '../styles/global.css';

export default function App() {
  const controller = useAppController();

  if (controller.isCheckingSession) return <PageLoading />;

  return (
    <AppErrorBoundary>
      <Suspense fallback={<PageLoading />}>
        <AppContent controller={controller} />
      </Suspense>
    </AppErrorBoundary>
  );
}
