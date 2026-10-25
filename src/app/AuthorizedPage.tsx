// Mostra as páginas internas e confere se o perfil pode acessá-las.

import type { AuthUser } from '../features/auth/types';
import { canAccessProfessionalDashboard, canAccessSchedulingDashboard, canCreateAdmin, canCreatePatient, canViewGuideQueue, isAdmin, isPatient } from '../features/auth/authorization';
import {
  LazyCadastroCidadaoPage,
  LazyCadastroFuncionarioPage,
  LazyDashboardPage,
  LazyUnauthorizedPage,
  LazyPerfilPage,
  LazyBuscarGuiaPage,
  LazyBuscarPacientePage,
  LazyMinhaSaudePage,
  LazyOrientacoesPage,
  InitialHomePage,
  resolveRoute,
} from './routes';
import { ShellPage } from './ShellPage';
import type { useAppController } from './useAppController';

interface AuthorizedPageProps {
  controller: ReturnType<typeof useAppController>;
  user: AuthUser;
}

export function AuthorizedPage({ controller, user }: AuthorizedPageProps) {
  const { route } = controller;
  const page = getPageForRoute(route, user, controller);

  return <ShellPage controller={controller}>{page}</ShellPage>;
}

function getPageForRoute(
  route: ReturnType<typeof resolveRoute>,
  user: AuthUser,
  controller: ReturnType<typeof useAppController>,
) {
  const profile = user.perfil;

  if (route === '/perfil') {
    return (
      <LazyPerfilPage
        user={user}
        onAtualizarUsuario={controller.updateLocalUser}
        onVoltar={() => controller.goTo('/')}
      />
    );
  }

  if (route === '/minha-saude') {
    // Admin pode pré-visualizar esta tela para validar a jornada do paciente.
    if (!isPatient(profile) && !isAdmin(profile)) {
      return <LazyUnauthorizedPage onBack={() => controller.goTo('/dashboard')} />;
    }
    return <LazyMinhaSaudePage user={user} preview={!isPatient(profile)} />;
  }

  if (route === '/orientacoes') {
    if (!isPatient(profile)) return <LazyUnauthorizedPage onBack={() => controller.goTo('/minha-saude')} />;
    return <LazyOrientacoesPage />;
  }

  if (route === '/proteger-conta') {
    if (!isPatient(profile)) return <LazyUnauthorizedPage onBack={() => controller.goTo('/minha-saude')} />;
    return (
      <LazyPerfilPage
        user={user}
        securityMode
        onAtualizarUsuario={controller.updateLocalUser}
        onVoltar={() => controller.goTo('/minha-saude')}
      />
    );
  }

  if (route === '/dashboard/buscar-paciente' || route === '/dashboard/buscar-guia') {
    if (!canViewGuideQueue(profile)) {
      return <LazyUnauthorizedPage onBack={() => controller.goTo('/dashboard')} />;
    }
    return route === '/dashboard/buscar-paciente'
      ? <LazyBuscarPacientePage />
      : <LazyBuscarGuiaPage />;
  }

  if (route === '/cadastro-funcionario') {
    if (!isAdmin(profile)) return <LazyUnauthorizedPage onBack={() => controller.goTo('/')} />;
    return <LazyCadastroFuncionarioPage podeCriarAdmin={canCreateAdmin(profile)} onVoltar={() => controller.goTo('/')} />;
  }

  if (route.startsWith('/dashboard')) {
    const isSchedulingProfile = canAccessSchedulingDashboard(profile);
    const isDoctorOnlySection = route !== '/dashboard' && route !== '/dashboard/guias';
    const isForbiddenGuideQueue = route === '/dashboard/guias' && !canViewGuideQueue(profile);

    if (!canAccessProfessionalDashboard(profile) || isForbiddenGuideQueue || (isSchedulingProfile && isDoctorOnlySection)) {
      return <LazyUnauthorizedPage onBack={() => controller.goTo('/dashboard')} />;
    }
    return <LazyDashboardPage user={user} route={route} onNavigate={(path) => controller.goTo(resolveRoute(path))} />;
  }

  if (route === '/cadastro-cidadao') {
    if (!canCreatePatient(profile)) return <LazyUnauthorizedPage onBack={() => controller.goTo('/')} />;
    return <LazyCadastroCidadaoPage onVoltar={() => controller.goTo('/')} />;
  }

  return <InitialHomePage onNavigate={(path) => controller.goTo(resolveRoute(path))} />;
}
