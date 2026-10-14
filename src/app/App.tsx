// Escolhe a tela e mostra o menu principal do sistema.

import { Suspense, type ReactNode } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { AppErrorBoundary } from '../components/system/AppErrorBoundary';
import {
  canCreateAdmin,
  canCreatePatient,
  isAdmin,
  canAccessProfessionalDashboard,
} from '../features/auth/authorization';
import { TrocaSenhaPage } from '../features/auth/password-change/TrocaSenhaPage';
import {
  LazyCadastroCidadaoPage,
  LazyCadastroFuncionarioPage,
  LazyDashboardPage,
  LazyUnauthorizedPage,
  InitialForgotPasswordFeature,
  InitialHomePage,
  InitialLoginFeature,
  resolveRoute,
} from './routes';
import { useAppController } from './useAppController';
import type { AuthUser } from '../features/auth/types';
import '../styles/global.css';

function PageLoading() {
  return <div className="page-loading" role="status" aria-live="polite">Carregando…</div>;
}

export default function App() {
  const app = useAppController();
  const { route, user, needsPasswordChange, isCheckingSession } = app;

  if (isCheckingSession) return <PageLoading />;

  function renderInShell(page: ReactNode) {
    return (
      <AppShell
        current={route}
        user={user}
        onNavigate={(path) => app.goTo(resolveRoute(path))}
        onLogout={app.logout}
      >
        {page}
      </AppShell>
    );
  }

  function renderPage() {
    if (route === '/recuperar-senha') {
      return <InitialForgotPasswordFeature onBack={() => app.goTo('/login')} />;
    }

    // A criação de conta não permite criar administradores.
    if (route === '/criar-conta' && !user) {
      return <LazyCadastroFuncionarioPage podeCriarAdmin={false} onVoltar={() => app.goTo('/login')} />;
    }

    if (!user) {
      return (
        <InitialLoginFeature
          onForgotPassword={() => app.goTo('/recuperar-senha')}
          onCreateAccount={() => app.goTo('/criar-conta')}
          onLoginSuccess={app.handleLoginSuccess}
        />
      );
    }

    if (needsPasswordChange) {
      return (
        <TrocaSenhaPage
          onConcluido={app.finishPasswordChange}
          onSair={app.logout}
        />
      );
    }

    const profile = user.perfil;

    if (route === '/cadastro-funcionario') {
      const page = isAdmin(profile)
        ? <LazyCadastroFuncionarioPage podeCriarAdmin={canCreateAdmin(profile)} onVoltar={() => app.goTo('/')} />
        : <LazyUnauthorizedPage onBack={() => app.goTo('/')} />;
      return renderInShell(page);
    }

    if (route === '/dashboard') {
      const page = canAccessProfessionalDashboard(profile)
        ? <LazyDashboardPage user={user} />
        : <LazyUnauthorizedPage onBack={() => app.goTo('/')} />;
      return renderInShell(page);
    }

    if (route === '/cadastro-cidadao') {
      const page = canCreatePatient(profile)
        ? <LazyCadastroCidadaoPage onVoltar={() => app.goTo('/')} />
        : <LazyUnauthorizedPage onBack={() => app.goTo('/')} />;
      return renderInShell(page);
    }

    return renderInShell(
      <InitialHomePage onNavigate={(path) => app.goTo(resolveRoute(path))} />,
    );
  }

  return (
    <AppErrorBoundary>
      <Suspense fallback={<PageLoading />}>{renderPage()}</Suspense>
    </AppErrorBoundary>
  );
}
