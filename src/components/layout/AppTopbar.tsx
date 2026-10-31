import type { AuthUser } from '../../features/auth/types';
import { MaterialIcon } from '../icons';
import { Button } from '../ui/Button';
import { UserIdentity } from './UserIdentity';
import { ThemeSelector } from '../theme/ThemeSelector';

interface AppTopbarProps {
  user: AuthUser | null;
  menuOpen: boolean;
  isProfessionalDashboard: boolean;
  isPatientArea: boolean;
  onToggleMenu: () => void;
  onLogout: () => void;
}

export function AppTopbar({ user, menuOpen, isProfessionalDashboard, isPatientArea, onToggleMenu, onLogout }: AppTopbarProps) {
  // Workspaces (profissional e paciente) guardam o sair no cartão do menu lateral.
  const sairNoMenuLateral = isProfessionalDashboard || isPatientArea;

  return (
    <header className={['shell__topbar', sairNoMenuLateral && 'shell__topbar--professional'].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="ui-icon-button shell__menu-button"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
        aria-controls="shell-sidebar"
        onClick={onToggleMenu}
      >
        <MaterialIcon name={menuOpen ? 'close' : 'menu'} size={22} />
      </button>

      <ThemeSelector />
      <UserIdentity user={user} />

      {!sairNoMenuLateral && (
        <Button variant="secondary" onClick={onLogout}>
          <MaterialIcon name="logout" size={18} />
          Sair
        </Button>
      )}
    </header>
  );
}
