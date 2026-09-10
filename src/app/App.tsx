import { useEffect, useState } from 'react';
import { ForgotPasswordFeature, LoginFeature } from '../features/auth';
import { hasValidSession, getCurrentUser } from '../features/auth/token';
import { HomePage } from '../pages/Home/HomePage';
import { CadastroFuncionarioPage } from '../features/employees/CadastroFuncionarioPage';
import { getCurrentPath, navigate } from './navigation';
import '../styles/global.css';

type Route = '/' | '/login' | '/recuperar-senha' | '/criar-conta' | '/cadastro-funcionario';

function resolveRoute(pathname: string): Route {
  if (pathname === '/recuperar-senha') return '/recuperar-senha';
  if (pathname === '/criar-conta') return '/criar-conta';
  if (pathname === '/cadastro-funcionario') return '/cadastro-funcionario';
  if (pathname === '/login') return '/login';
  return '/';
}

export default function App() {
  const [route, setRoute] = useState<Route>(resolveRoute(getCurrentPath()));
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasValidSession());

  useEffect(() => {
    const handlePopState = () => setRoute(resolveRoute(getCurrentPath()));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToLogin = () => {
    navigate('/login');
    setRoute('/login');
  };

  const goToForgotPassword = () => {
    navigate('/recuperar-senha');
    setRoute('/recuperar-senha');
  };

  const goToCreateAccount = () => {
    navigate('/criar-conta');
    setRoute('/criar-conta');
  };

  const goToHome = () => {
    navigate('/');
    setRoute('/');
  };

  const goToCadastroFuncionario = () => {
    navigate('/cadastro-funcionario');
    setRoute('/cadastro-funcionario');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    goToHome();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    goToLogin();
  };

  // "Criar conta" acessível a partir da tela pública de login, sem exigir
  // sessão ativa. IMPORTANTE: o backend (POST /usuarios) hoje exige um
  // token de ADMIN/SUPER_ADMIN válido para aceitar o cadastro. Enquanto
  // essa regra não for alterada no backend, o formulário abre normalmente,
  // mas o envio retorna "Você não tem permissão para realizar essa ação."
  // Isso é esperado nesta etapa (só front-end) e será resolvido quando o
  // backend for ajustado para permitir esse fluxo público.
  if (route === '/criar-conta' && !isAuthenticated) {
    return <CadastroFuncionarioPage podeCriarAdmin={false} onVoltar={goToLogin} />;
  }

  if (route === '/recuperar-senha') {
    return <ForgotPasswordFeature onBack={goToLogin} />;
  }

  if (isAuthenticated) {
    const user = getCurrentUser();
    const isAdmin = user?.perfil === 'ADMIN' || user?.perfil === 'SUPER_ADMIN';

    if (route === '/cadastro-funcionario' && isAdmin) {
      return (
        <CadastroFuncionarioPage
          podeCriarAdmin={user?.perfil === 'SUPER_ADMIN'}
          onVoltar={goToHome}
        />
      );
    }

    return <HomePage onLogout={handleLogout} onCadastrarFuncionario={goToCadastroFuncionario} />;
  }

  return (
    <LoginFeature
      onForgotPassword={goToForgotPassword}
      onCreateAccount={goToCreateAccount}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
