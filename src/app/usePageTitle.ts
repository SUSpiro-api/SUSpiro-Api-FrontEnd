// Atualiza o título da aba conforme a página aberta.

import { useEffect } from 'react';
import { brand } from '../config/brand';
import type { AuthUser } from '../features/auth/types';
import type { Route } from './routes';
import { canAccessSchedulingDashboard } from '../features/auth/authorization';

const routeTitles: Record<Route, string> = {
  '/': 'Início',
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
};

export function usePageTitle(route: Route, user: AuthUser | null) {
  useEffect(() => {
    const visibleRoute = !user && route !== '/recuperar-senha' && route !== '/criar-conta'
      ? '/login'
      : route;

    const title = visibleRoute === '/dashboard' && canAccessSchedulingDashboard(user?.perfil)
      ? 'Central de agendamento'
      : routeTitles[visibleRoute];
    document.title = `${title} · ${brand.name}`;
  }, [route, user]);
}
