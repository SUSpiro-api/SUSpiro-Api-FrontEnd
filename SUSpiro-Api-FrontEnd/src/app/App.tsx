import { useEffect, useState, type ReactNode } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { brand } from '../config/brand';
import { ForgotPasswordFeature, LoginFeature } from '../features/auth';
import { canAccessProfessionalDashboard, canCreateAdmin, canCreatePatient, isAdmin } from '../features/auth/authorization';
import { logout } from '../features/auth/service';
import { AUTH_EXPIRED_EVENT, watchSessionExpiry } from '../features/auth/session';
import { getCurrentUser, hasValidSession } from '../features/auth/token';
import { CadastroFuncionarioPage } from '../features/employees/CadastroFuncionarioPage';
import { CadastroCidadaoPage } from '../features/patients/CadastroCidadaoPage';
import { HomePage } from '../pages/Home/HomePage';
import { DashboardPage } from '../features/dashboard';
import { UnauthorizedPage } from '../pages/Unauthorized/UnauthorizedPage';
import { getCurrentPath, navigate } from './navigation';
import '../styles/global.css';

type Route =
  | '/'
  | '/login'
  | '/recuperar-senha'
  | '/cadastro-funcionario'
  | '/cadastro-cidadao'
  | '/dashboard';

function resolveRoute(pathname: string): Route {
  if (pathname === '/recuperar-senha') return '/recuperar-senha';
  if (pathname === '/cadastro-funcionario') return '/cadastro-funcionario';
  if (pathname === '/cadastro-cidadao') return '/cadastro-cidadao';
  if (pathname === '/dashboard') return '/dashboard';
  if (pathname === '/login') return '/login';
  return '/';
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => resolveRoute(getCurrentPath()));
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasValidSession());

  useEffect(() => {
    const handlePopState = () => setRoute(resolveRoute(getCurrentPath()));
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
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

  // Cada tela tem um título próprio na aba do navegador (WCAG 2.4.2).
  useEffect(() => {
    const titles: Record<string, string> = {
      '/recuperar-senha': 'Recuperar senha',
      '/cadastro-cidadao': 'Cadastrar cidadão',
      '/cadastro-funcionario': 'Cadastrar funcionário',
      '/dashboard': 'Dashboard profissional',
    };
    const page = isAuthenticated ? (titles[route] ?? 'Início') : (titles[route] ?? 'Entrar');
    document.title = `${page} · ${brand.name}`;
  }, [route, isAuthenticated]);

  // Expira a sessão por tempo mesmo sem chamadas à API (tela parada, aba em segundo plano).
  useEffect(() => {
    if (!isAuthenticated) return;
    return watchSessionExpiry();
  }, [isAuthenticated]);

  const goTo = (path: Route) => {
    navigate(path);
    setRoute(path);
  };

  const goToHome = () => goTo('/');
  const goToLogin = () => goTo('/login');
  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    goToLogin();
  };

  const user = getCurrentUser();
  const perfil = user?.perfil;

  if (route === '/recuperar-senha') {
    return <ForgotPasswordFeature onBack={goToLogin} />;
  }

  if (!isAuthenticated) {
    // Não há autocadastro: contas são criadas por um administrador, então não existe "Criar conta".
    return (
      <LoginFeature
        onForgotPassword={() => goTo('/recuperar-senha')}
        onLoginSuccess={() => {
          const authenticatedUser = getCurrentUser();
          setIsAuthenticated(true);
          goTo(canAccessProfessionalDashboard(authenticatedUser?.perfil) ? '/dashboard' : '/');
        }}
      />
    );
  }

  // Daqui em diante há sessão: todas as telas ficam dentro da estrutura com menu e barra superior.
  const renderInShell = (content: ReactNode) => (
    <AppShell
      current={route === '/login' ? '/' : route}
      user={user}
      onNavigate={(path) => goTo(resolveRoute(path))}
      onLogout={handleLogout}
    >
      {content}
    </AppShell>
  );

  if (route === '/cadastro-funcionario') {
    if (!isAdmin(perfil)) return renderInShell(<UnauthorizedPage onBack={goToHome} />);

    return renderInShell(
      <CadastroFuncionarioPage podeCriarAdmin={canCreateAdmin(perfil)} onVoltar={goToHome} />,
    );
  }

  if (route === '/dashboard') {
    if (!canAccessProfessionalDashboard(perfil)) {
      return renderInShell(<UnauthorizedPage onBack={goToHome} />);
    }

    return renderInShell(<DashboardPage user={user} />);
  }

  if (route === '/cadastro-cidadao') {
    if (!canCreatePatient(perfil)) return renderInShell(<UnauthorizedPage onBack={goToHome} />);

    return renderInShell(<CadastroCidadaoPage onVoltar={goToHome} />);
  }

  return renderInShell(<HomePage onNavigate={(path) => goTo(resolveRoute(path))} />);
}
