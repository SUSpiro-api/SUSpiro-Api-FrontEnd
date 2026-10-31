import { Suspense } from 'react';
import { AppErrorBoundary } from '../components/system/AppErrorBoundary';
import { AppContent } from './AppContent';
import { PageLoading } from './PageLoading';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import { useAppController } from './useAppController';
import '../styles/global.css';

export default function App() {
  const controller = useAppController();

  return (
    <ThemeProvider>
      {controller.isCheckingSession ? <PageLoading /> : (
        <AppErrorBoundary resetKey={controller.route}>
          <Suspense fallback={<PageLoading />}>
            <AppContent controller={controller} />
          </Suspense>
        </AppErrorBoundary>
      )}
    </ThemeProvider>
  );
}
