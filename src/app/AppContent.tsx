
import { AuthorizedPage } from './AuthorizedPage';
import { TrocaSenhaPage } from '../features/auth/password-change/TrocaSenhaPage';
import { WeakPasswordNoticeModal } from '../features/auth/weak-password/WeakPasswordNoticeModal';
import { InitialForgotPasswordFeature, InitialLoginFeature, InitialPublicHomePage } from './routes';
import type { useAppController } from './useAppController';

interface AppContentProps {
  controller: ReturnType<typeof useAppController>;
}

export function AppContent({ controller }: AppContentProps) {
  const { route, user, needsPasswordChange, showWeakPasswordNotice } = controller;

  if (route === '/recuperar-senha') {
    return <InitialForgotPasswordFeature onBack={() => controller.goTo('/login')} />;
  }

  if (!user && route === '/') {
    return <InitialPublicHomePage onNavigate={(path) => controller.goTo(path)} />;
  }

  if (!user) {
    return (
      <InitialLoginFeature
        onForgotPassword={() => controller.goTo('/recuperar-senha')}
        onLoginSuccess={controller.handleLoginSuccess}
      />
    );
  }

  if (needsPasswordChange) {
    return <TrocaSenhaPage perfil={user.perfil} onConcluido={controller.finishPasswordChange} onSair={controller.logout} />;
  }

  if (showWeakPasswordNotice) {
    return (
      <WeakPasswordNoticeModal
        onContinue={() => controller.closeWeakPasswordNotice('start')}
        onChangePassword={() => controller.closeWeakPasswordNotice('profile')}
      />
    );
  }

  return <AuthorizedPage controller={controller} user={user} />;
}
