import type { AuthUser } from '../features/auth/types';
import { canCreateAdmin, isPatient } from '../features/auth/authorization';
import {
  LazyCadastroCidadaoPage,
  LazyCadastroFuncionarioPage,
  LazyDashboardPage,
  LazyPerfilPage,
  LazyBuscarGuiaPage,
  LazyBuscarPacientePage,
  LazyMinhaSaudePage,
  LazyOrientacoesPage,
  InitialHomePage,
  InitialNotFoundPage,
  resolveRoute,
} from './routes';
import { canAccessRoute } from './routeAccess';
import { getStartRouteForProfile } from './startRoute';
import { ShellPage } from './ShellPage';
import type { useAppController } from './useAppController';

interface AuthorizedPageProps {
  controller: ReturnType<typeof useAppController>;
  user: AuthUser;
}

export function AuthorizedPage({ controller, user }: AuthorizedPageProps) {
  const page = getPageForRoute(controller.route, user, controller);

  return <ShellPage controller={controller}>{page}</ShellPage>;
}

function getPageForRoute(
  route: ReturnType<typeof resolveRoute>,
  user: AuthUser,
  controller: ReturnType<typeof useAppController>,
) {
  const profile = user.perfil;
  const backToHome = () => controller.goTo('/');

  // Rota inexistente ou fora das permissões do perfil: a mesma 404, sem revelar que a tela existe.
  if (route === '/404' || !canAccessRoute(route, profile)) {
    return (
      <InitialNotFoundPage
        variant="embedded"
        actionLabel="Voltar ao início"
        onAction={() => controller.goTo(getStartRouteForProfile(profile))}
        onBack={window.history.length > 1 ? () => window.history.back() : undefined}
      />
    );
  }

  switch (route) {
    case '/':
    case '/login':
      return isPatient(profile)
        ? <LazyMinhaSaudePage user={user} />
        : <LazyDashboardPage user={user} route="/dashboard" onNavigate={(path) => controller.goTo(resolveRoute(path))} />;

    case '/perfil':
      return (
        <LazyPerfilPage
          user={user}
          onAtualizarUsuario={controller.updateLocalUser}
          onVoltar={backToHome}
        />
      );

    case '/minha-saude':
      return <LazyMinhaSaudePage user={user} />;

    case '/orientacoes':
      return <LazyOrientacoesPage />;

    case '/proteger-conta':
      return (
        <LazyPerfilPage
          user={user}
          securityMode
          onAtualizarUsuario={controller.updateLocalUser}
          onVoltar={() => controller.goTo('/minha-saude')}
        />
      );

    case '/dashboard/buscar-paciente':
      return <LazyBuscarPacientePage />;

    case '/dashboard/buscar-guia':
      return <LazyBuscarGuiaPage />;

    case '/cadastro-funcionario':
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
    case '/dashboard/guias':
      return (
        <LazyDashboardPage
          user={user}
          route={route}
          onNavigate={(path) => controller.goTo(resolveRoute(path))}
        />
      );

    case '/cadastro-cidadao':
      return <LazyCadastroCidadaoPage onVoltar={backToHome} />;

    default:
      return <InitialHomePage onNavigate={(path) => controller.goTo(resolveRoute(path))} />;
  }
}
