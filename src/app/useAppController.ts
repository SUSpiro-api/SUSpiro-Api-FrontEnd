// Cuida da rota aberta e da sessão do usuário.

import { useEffect, useState } from 'react';
import { brand } from '../config/brand';
import { canAccessProfessionalDashboard } from '../features/auth/authorization';
import { authService } from '../features/auth/service';
import { AUTH_EXPIRED_EVENT, watchSessionExpiry } from '../features/auth/session';
import { getCurrentUser, precisaTrocarSenha, setSenhaProvisoria } from '../features/auth/token';
import type { AuthUser } from '../features/auth/types';
import { getCurrentPath, navigate } from './navigation';
import { resolveRoute, type Route } from './routes';

export function useAppController() {
  const [route, setRoute] = useState<Route>(() => resolveRoute(getCurrentPath()));
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [needsPasswordChange, setNeedsPasswordChange] = useState(() => precisaTrocarSenha());
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    function updateRoute() {
      setRoute(resolveRoute(getCurrentPath()));
    }

    function handleExpiredSession() {
      setUser(null);
      setNeedsPasswordChange(false);
      navigate('/login');
      setRoute('/login');
    }

    window.addEventListener('popstate', updateRoute);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);

    return () => {
      window.removeEventListener('popstate', updateRoute);
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    authService.restoreSession()
      .then((restoredUser) => {
        if (!isMounted) return;
        setUser(restoredUser);
        setNeedsPasswordChange(precisaTrocarSenha());
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const titles: Record<Route, string> = {
      '/': 'Início',
      '/login': 'Entrar',
      '/criar-conta': 'Criar conta',
      '/recuperar-senha': 'Recuperar senha',
      '/cadastro-cidadao': 'Cadastrar cidadão',
      '/cadastro-funcionario': 'Cadastrar funcionário',
      '/dashboard': 'Dashboard profissional',
    };

    const visibleRoute = !user && route !== '/recuperar-senha' && route !== '/criar-conta'
      ? '/login'
      : route;

    document.title = `${titles[visibleRoute]} · ${brand.name}`;
  }, [route, user]);

  useEffect(() => {
    if (!user) return;
    return watchSessionExpiry();
  }, [user]);

  function goTo(path: Route) {
    navigate(path);
    setRoute(path);
  }

  function handleLoginSuccess(authenticatedUser: AuthUser) {
    setUser(authenticatedUser);
    setNeedsPasswordChange(precisaTrocarSenha());
    goTo(canAccessProfessionalDashboard(authenticatedUser.perfil) ? '/dashboard' : '/');
  }

  function finishPasswordChange() {
    setSenhaProvisoria(false);
    setNeedsPasswordChange(false);
    goTo('/');
  }

  function logout() {
    void authService.logout().finally(() => {
      setUser(null);
      setNeedsPasswordChange(false);
      goTo('/login');
    });
  }

  return {
    route,
    user,
    needsPasswordChange,
    isCheckingSession,
    goTo,
    handleLoginSuccess,
    finishPasswordChange,
    logout,
  };
}
