import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { AppErrorBoundary } from '../components/system/AppErrorBoundary';
import { brand } from '../config/brand';
import { canAccessProfessionalDashboard, canCreateAdmin, canCreatePatient, isAdmin } from '../features/auth/authorization';
import { authService } from '../features/auth/service';
import { AUTH_EXPIRED_EVENT, watchSessionExpiry } from '../features/auth/session';
import { getCurrentUser } from '../features/auth/token';
import type { AuthUser } from '../features/auth/types';
import { navigate, getCurrentPath } from './navigation';
import {
  LazyCadastroCidadaoPage,
  LazyCadastroFuncionarioPage,
  LazyDashboardPage,
  LazyUnauthorizedPage,
  InitialForgotPasswordFeature,
  InitialHomePage,
  InitialLoginFeature,
  resolveRoute,
  type Route,
} from './routes';
import '../styles/global.css';

function PageLoading(): ReactNode {
  return <div className="page-loading" role="status" aria-live="polite">Carregando…</div>;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => resolveRoute(getCurrentPath()));
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const handlePopState = () => setRoute(resolveRoute(getCurrentPath()));
    const handleSessionExpired = () => {
      setUser(null);
      navigate('/login');
      setRoute('/login');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    void authService.restoreSession()
      .then((restoredUser) => {
        if (!mounted) return;
        setUser(restoredUser);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
      })
      .finally(() => {
        if (mounted) setIsCheckingSession(false);
      });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const titles: Record<Route, string> = {
      '/': 'Início',
      '/login': 'Entrar',
      '/recuperar-senha': 'Recuperar senha',
      '/cadastro-cidadao': 'Cadastrar cidadão',
      '/cadastro-funcionario': 'Cadastrar funcionário',
      '/dashboard': 'Dashboard profissional',
    };
    document.title = `${titles[route]} · ${brand.name}`;
  }, [route]);

  useEffect(() => {
    if (!user) return;
    return watchSessionExpiry();
  }, [user]);

  const goTo = (path: Route) => {
    navigate(path);
    setRoute(path);
  };

  const perfil = user?.perfil;

  if (isCheckingSession) {
    return <PageLoading />;
  }

  const content = (() => {
    if (route === '/recuperar-senha') {
      return <InitialForgotPasswordFeature onBack={() => goTo('/login')} />;
    }

    if (!user) {
      return (
        <InitialLoginFeature
          onForgotPassword={() => goTo('/recuperar-senha')}
          onLoginSuccess={(authenticatedUser) => {
            setUser(authenticatedUser);
            goTo(canAccessProfessionalDashboard(authenticatedUser.perfil) ? '/dashboard' : '/');
          }}
        />
      );
    }

    const renderInShell = (page: ReactNode) => (
      <AppShell
        current={route}
        user={user}
        onNavigate={(path) => goTo(resolveRoute(path))}
        onLogout={() => {
          void authService.logout().finally(() => {
            setUser(null);
            goTo('/login');
          });
        }}
      >
        {page}
      </AppShell>
    );

    if (route === '/cadastro-funcionario') {
      return isAdmin(perfil)
        ? renderInShell(<LazyCadastroFuncionarioPage podeCriarAdmin={canCreateAdmin(perfil)} onVoltar={() => goTo('/')} />)
        : renderInShell(<LazyUnauthorizedPage onBack={() => goTo('/')} />);
    }

    if (route === '/dashboard') {
      return canAccessProfessionalDashboard(perfil)
        ? renderInShell(<LazyDashboardPage user={user} />)
        : renderInShell(<LazyUnauthorizedPage onBack={() => goTo('/')} />);
    }

    if (route === '/cadastro-cidadao') {
      return canCreatePatient(perfil)
        ? renderInShell(<LazyCadastroCidadaoPage onVoltar={() => goTo('/')} />)
        : renderInShell(<LazyUnauthorizedPage onBack={() => goTo('/')} />);
    }

    return renderInShell(<InitialHomePage onNavigate={(path) => goTo(resolveRoute(path))} />);
  })();

  return (
    <AppErrorBoundary>
      <Suspense fallback={<PageLoading />}>{content}</Suspense>
    </AppErrorBoundary>
  );
}
