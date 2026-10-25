// Cuida do login, da sessão e da saída do usuário.

import { useEffect, useState } from 'react';
import { canAccessProfessionalDashboard, isPatient } from '../features/auth/authorization';
import { authService, dismissWeakPasswordNotice } from '../features/auth/service';
import { AUTH_EXPIRED_EVENT, watchSessionExpiry } from '../features/auth/session';
import { getCurrentUser, precisaTrocarSenha, setAvisoSenhaFraca, setCurrentUser, setSenhaProvisoria, temAvisoSenhaFraca } from '../features/auth/token';
import type { AuthUser } from '../features/auth/types';
import type { Route } from './routes';

interface UseAuthSessionParams {
  goTo: (path: Route) => void;
}

export function useAuthSession({ goTo }: UseAuthSessionParams) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [needsPasswordChange, setNeedsPasswordChange] = useState(() => precisaTrocarSenha());
  // Mantido apenas para compatibilidade com sessões antigas; o fluxo atual usa troca obrigatória de senha.
  // Começa fechado para evitar que um aviso de sessão anterior reapareça.
  const [showWeakPasswordNotice, setShowWeakPasswordNotice] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    function handleExpiredSession() {
      setUser(null);
      setNeedsPasswordChange(false);
      setShowWeakPasswordNotice(false);
      goTo('/login');
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
  }, [goTo]);

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
    if (!user) return;
    return watchSessionExpiry();
  }, [user]);

  function goToStartPage(perfil: AuthUser['perfil']) {
    // Pacientes caem direto na própria área de saúde; profissionais, no dashboard.
    if (isPatient(perfil)) {
      goTo('/minha-saude');
      return;
    }
    goTo(canAccessProfessionalDashboard(perfil) ? '/dashboard' : '/');
  }

  function handleLoginSuccess(authenticatedUser: AuthUser) {
    setUser(authenticatedUser);
    setNeedsPasswordChange(precisaTrocarSenha());

    // Primeiro acesso do paciente: o aviso de segurança aparece antes da área de saúde.
    const hasNotice = temAvisoSenhaFraca();
    setShowWeakPasswordNotice(hasNotice);
    if (hasNotice) return;
    goToStartPage(authenticatedUser.perfil);
  }

  /** Fecha o aviso de senha fraca. A troca de senha é opcional: o paciente escolhe seguir ou ir ao perfil. */
  function closeWeakPasswordNotice(destination: 'start' | 'profile') {
    setAvisoSenhaFraca(false);
    setShowWeakPasswordNotice(false);
    // Melhor esforço: se a API falhar, o paciente não fica preso; o aviso só volta no próximo login.
    void dismissWeakPasswordNotice().catch(() => undefined);

    if (destination === 'profile') {
      goTo('/perfil');
      return;
    }
    goToStartPage(user?.perfil);
  }

  /** Sincroniza o nome já persistido pela API com a sessão em memória. */
  function updateLocalUser(updates: Partial<Pick<AuthUser, 'nome'>>) {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...updates };
      setCurrentUser(updated);
      return updated;
    });
  }

  function finishPasswordChange() {
    setSenhaProvisoria(false);
    setNeedsPasswordChange(false);
    // Após ativar a conta, o paciente permanece na própria área; profissionais voltam ao painel correto.
    goToStartPage(user?.perfil);
  }

  function logout() {
    void authService.logout().finally(() => {
      setUser(null);
      setNeedsPasswordChange(false);
      setShowWeakPasswordNotice(false);
      goTo('/login');
    });
  }

  return { user, needsPasswordChange, showWeakPasswordNotice, isCheckingSession, handleLoginSuccess, closeWeakPasswordNotice, finishPasswordChange, logout, updateLocalUser };
}
