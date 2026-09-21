import { useEffect, useState } from 'react';
import { ForgotPasswordFeature, LoginFeature } from '../features/auth';
import { canCreateAdmin, canCreatePatient, isAdmin } from '../features/auth/authorization';
import { getCurrentUser, hasValidSession } from '../features/auth/token';
import { CadastroFuncionarioPage } from '../features/employees/CadastroFuncionarioPage';
import { CadastroCidadaoPage } from '../features/patients/CadastroCidadaoPage';
import { HomePage } from '../pages/Home/HomePage';
import { UnauthorizedPage } from '../pages/Unauthorized/UnauthorizedPage';
import { getCurrentPath, navigate } from './navigation';
import '../styles/global.css';

type Route =
  | '/'
  | '/login'
  | '/recuperar-senha'
  | '/criar-conta'
  | '/cadastro-funcionario'
  | '/cadastro-cidadao';

function resolveRoute(pathname: string): Route {
  if (pathname === '/recuperar-senha') return '/recuperar-senha';
  if (pathname === '/criar-conta') return '/criar-conta';
  if (pathname === '/cadastro-funcionario') return '/cadastro-funcionario';
  if (pathname === '/cadastro-cidadao') return '/cadastro-cidadao';
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
    window.addEventListener('suspiro:auth-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('suspiro:auth-expired', handleSessionExpired);
    };
  }, []);

  const goTo = (path: Route) => {
    navigate(path);
    setRoute(path);
  };

  const goToHome = () => goTo('/');
  const goToLogin = () => goTo('/login');
  const handleLogout = () => {
    setIsAuthenticated(false);
    goToLogin();
  };

  const user = getCurrentUser();
  const perfil = user?.perfil;

  if (route === '/recuperar-senha') {
    return <ForgotPasswordFeature onBack={goToLogin} />;
  }

  if (!isAuthenticated) {
    if (route === '/criar-conta') {
      return <UnauthorizedPage onBack={goToLogin} />;
    }

    return (
      <LoginFeature
        onForgotPassword={() => goTo('/recuperar-senha')}
        onCreateAccount={() => goTo('/criar-conta')}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          goToHome();
        }}
      />
    );
  }

  if (route === '/login') {
    return (
      <HomePage
        onLogout={handleLogout}
        onCadastrarFuncionario={() => goTo('/cadastro-funcionario')}
        onCadastrarCidadao={() => goTo('/cadastro-cidadao')}
      />
    );
  }

  if (route === '/criar-conta') {
    return <UnauthorizedPage onBack={goToHome} />;
  }

  if (route === '/cadastro-funcionario') {
    if (!isAdmin(perfil)) return <UnauthorizedPage onBack={goToHome} />;

    return (
      <CadastroFuncionarioPage
        podeCriarAdmin={canCreateAdmin(perfil)}
        onVoltar={goToHome}
      />
    );
  }

  if (route === '/cadastro-cidadao') {
    if (!canCreatePatient(perfil)) return <UnauthorizedPage onBack={goToHome} />;

    return <CadastroCidadaoPage onVoltar={goToHome} />;
  }

  return (
    <HomePage
      onLogout={handleLogout}
      onCadastrarFuncionario={() => goTo('/cadastro-funcionario')}
      onCadastrarCidadao={() => goTo('/cadastro-cidadao')}
    />
  );
}
