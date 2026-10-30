import type { ReactNode } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { resolveRoute } from './routes';
import type { useAppController } from './useAppController';

interface ShellPageProps {
  controller: ReturnType<typeof useAppController>;
  children: ReactNode;
}

export function ShellPage({ controller, children }: ShellPageProps) {
  return (
    <AppShell
      current={controller.route}
      user={controller.user}
      onNavigate={(path) => controller.goTo(resolveRoute(path))}
      onLogout={controller.logout}
    >
      {children}
    </AppShell>
  );
}
