import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { canAccessProfessionalDashboard, canAccessSchedulingDashboard, canViewGuideQueue, isPatient } from '../../../features/auth/authorization';
import type { AuthUser } from '../../../features/auth/types';

interface UseAppShellParams {
  current: string;
  user: AuthUser | null;
  onNavigate: (path: string) => void;
}

export function useAppShell({ current, user, onNavigate }: UseAppShellParams) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isProfessionalDashboard = (current.startsWith('/dashboard') || current === '/cadastro-cidadao' || current === '/perfil' || current === '/minha-saude')
    && canAccessProfessionalDashboard(user?.perfil);
  const isSchedulingDashboard = (current === '/dashboard' && canAccessSchedulingDashboard(user?.perfil))
    || ((current === '/dashboard/guias' || current === '/dashboard/buscar-guia' || current === '/dashboard/buscar-paciente') && canViewGuideQueue(user?.perfil));
  // Pacientes têm um espaço próprio, em todas as telas.
  const isPatientArea = isPatient(user?.perfil);
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [current]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleMenu() {
    setMenuOpen((open) => !open);
  }

  function handleNavigate(event: MouseEvent<HTMLAnchorElement>, path: string) {
    // Deixa o navegador cuidar de links abertos em outra aba ou botão do mouse.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    event.preventDefault();
    closeMenu();

    onNavigate(path);
  }

  return { menuOpen, mainRef, isProfessionalDashboard, isSchedulingDashboard, isPatientArea, closeMenu, toggleMenu, handleNavigate };
}

