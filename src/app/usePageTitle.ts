import { useEffect } from 'react';
import { brand } from '../config/brand';
import type { AuthUser } from '../features/auth/types';
import type { Route } from './routes';
import { canAccessSchedulingDashboard } from '../features/auth/authorization';
import { canAccessRoute } from './routeAccess';

const routeTitles: Record<Route, string> = {
  '/': 'Página inicial',
  '/login': 'Entrar',
  '/criar-conta': 'Criar conta',
  '/recuperar-senha': 'Recuperar senha',
  '/cadastro-cidadao': 'Cadastrar paciente',
  '/cadastro-funcionario': 'Cadastrar funcionário',
  '/dashboard': 'Visão geral',
  '/dashboard/atendimento': 'Atender paciente',
  '/dashboard/agenda': 'Agenda',
  '/dashboard/pacientes-recentes': 'Últimos pacientes',
  '/dashboard/atividade-recente': 'Atividade recente',
  '/dashboard/acoes-rapidas': 'Ações rápidas',
  '/dashboard/guias': 'Central de agendamento',
  '/dashboard/buscar-paciente': 'Buscar paciente',
  '/dashboard/buscar-guia': 'Buscar guia',
  '/perfil': 'Meu perfil',
  '/minha-saude': 'Minha saúde',
  '/orientacoes': 'Orientações',
  '/proteger-conta': 'Proteja sua conta',
  '/404': 'Página não encontrada',
};

export function usePageTitle(route: Route, user: AuthUser | null) {
  useEffect(() => {
    const visibleRoute = !user && route !== '/' && route !== '/recuperar-senha' && route !== '/criar-conta' && route !== '/404'
      ? '/login'
      : route;

    const blocked = Boolean(user) && !canAccessRoute(visibleRoute, user?.perfil);
    const title = blocked
      ? routeTitles['/404']
      : visibleRoute === '/dashboard' && canAccessSchedulingDashboard(user?.perfil)
      ? 'Central de agendamento'
      : visibleRoute === '/' && user
        ? 'Início'
        : routeTitles[visibleRoute];
    document.title = `${title} · ${brand.name}`;
  }, [route, user]);
}
