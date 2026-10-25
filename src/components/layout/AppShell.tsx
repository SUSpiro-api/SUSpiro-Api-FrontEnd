// Junta o menu, a barra superior e o conteúdo da página.

import type { ReactNode } from 'react';
import type { AuthUser } from '../../features/auth/types';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { useAppShell } from './hooks/useAppShell';
import './layout.css';

interface AppShellProps {
  current: string;
  user: AuthUser | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AppShell({ current, user, onNavigate, onLogout, children }: AppShellProps) {
  const shell = useAppShell({ current, user, onNavigate });

  return (
    <div className="shell">
      <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>

      <AppSidebar
        current={current}
        user={user}
        isProfessionalDashboard={shell.isProfessionalDashboard}
        isSchedulingDashboard={shell.isSchedulingDashboard}
        isPatientArea={shell.isPatientArea}
        menuOpen={shell.menuOpen}
        onNavigate={shell.handleNavigate}
        onLogout={onLogout}
      />

      {shell.menuOpen && (
        <button
          type="button"
          className="shell__overlay"
          aria-label="Fechar menu lateral"
          onClick={shell.closeMenu}
        />
      )}

      <div className="shell__body">
        <AppTopbar
          user={user}
          menuOpen={shell.menuOpen}
          isProfessionalDashboard={shell.isProfessionalDashboard}
          isPatientArea={shell.isPatientArea}
          onToggleMenu={shell.toggleMenu}
          onLogout={onLogout}
        />
        <main id="conteudo" ref={shell.mainRef} tabIndex={-1} className="shell__main">
          {children}
        </main>
      </div>
    </div>
  );
}
