import type { AuthUser } from '../features/auth/types';
import { canAccessProfessionalDashboard, canCreateAdmin, canCreatePatient, canViewGuideQueue, isAdmin, isPatient } from '../features/auth/authorization';
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
  const backToDashboard = () => controller.goTo('/dashboard');
  const backToHome = () => controller.goTo('/');
  const unauthorized = (onBack: () => void) => (
    <LazyUnauthorizedPage onBack={onBack} />
  );

  switch (route) {
    case '/':
    case '/login':
      if (isPatient(profile)) return <LazyMinhaSaudePage user={user} />;
      if (canAccessProfessionalDashboard(profile)) return <LazyDashboardPage user={user} route="/dashboard" onNavigate={(path) => controller.goTo(resolveRoute(path))} />;
      return unauthorized(backToDashboard);

    case '/perfil':
      return (
        <LazyPerfilPage
          user={user}
          onAtualizarUsuario={controller.updateLocalUser}
          onVoltar={backToHome}
        />
      );

    case '/minha-saude':
      if (!isPatient(profile)) return unauthorized(backToDashboard);
      return <LazyMinhaSaudePage user={user} />;

    case '/orientacoes':
      if (!isPatient(profile)) return unauthorized(() => controller.goTo('/minha-saude'));
      return <LazyOrientacoesPage />;

    case '/proteger-conta':
      if (!isPatient(profile)) return unauthorized(() => controller.goTo('/minha-saude'));
      return (
        <LazyPerfilPage
          user={user}
          securityMode
          onAtualizarUsuario={controller.updateLocalUser}
          onVoltar={() => controller.goTo('/minha-saude')}
        />
      );

    case '/dashboard/buscar-paciente':
    case '/dashboard/buscar-guia':
      if (!canViewGuideQueue(profile)) return unauthorized(backToDashboard);
      return route === '/dashboard/buscar-paciente'
        ? <LazyBuscarPacientePage />
        : <LazyBuscarGuiaPage />;


    case '/cadastro-funcionario':
      if (!isAdmin(profile)) return unauthorized(backToHome);
      return (
        <LazyCadastroFuncionarioPage
          podeCriarAdmin={canCreateAdmin(profile)}
          onVoltar={backToHome}
        />
      );

    case '/dashboard':
    case '/dashboard/atendimento':
    case '/dashboard/agenda':
    case '/dashboard/pacientes-recentes':
    case '/dashboard/atividade-recente':
    case '/dashboard/acoes-rapidas':
    case '/dashboard/guias': {
      const isSchedulingProfile = profile === 'ATENDENTE' || profile === 'ENFERMEIRO';
      const isDoctorOnlySection = route !== '/dashboard' && route !== '/dashboard/guias';
      const isForbiddenGuideQueue = route === '/dashboard/guias' && !canViewGuideQueue(profile);

      if (
        !canAccessProfessionalDashboard(profile)
        || isForbiddenGuideQueue
        || (isSchedulingProfile && isDoctorOnlySection)
      ) {
        return unauthorized(backToDashboard);
      }

      return (
        <LazyDashboardPage
          user={user}
          route={route}
          onNavigate={(path) => controller.goTo(resolveRoute(path))}
        />
      );
    }

    case '/cadastro-cidadao':
      if (!canCreatePatient(profile)) return unauthorized(backToHome);
      return <LazyCadastroCidadaoPage onVoltar={backToHome} />;

    default:
      return <InitialHomePage onNavigate={(path) => controller.goTo(resolveRoute(path))} />;
  }
}
