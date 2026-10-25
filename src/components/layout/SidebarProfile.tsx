// Mostra os dados do profissional no final do menu lateral e leva ao próprio perfil.

import type { MouseEvent } from 'react';
import { perfilLabel } from '../../features/auth/perfil';
import type { AuthUser } from '../../features/auth/types';
import { maskCpf } from '../../utils/mask';
import { initialsFromName } from '../../utils/initials';
import { MaterialIcon } from '../icons';

interface SidebarProfileProps {
  user: AuthUser | null;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, path: string) => void;
  onLogout: () => void;
}

export function SidebarProfile({ user, onNavigate, onLogout }: SidebarProfileProps) {
  const initials = initialsFromName(user?.nome);

  return (
    <div className="shell__profile">
      <a
        className="shell__profile-link"
        href="/perfil"
        onClick={(event) => onNavigate(event, '/perfil')}
        aria-label="Meu perfil"
      >
        <span className="shell__profile-avatar" aria-hidden="true">
          {initials || <MaterialIcon name="person" size={20} />}
        </span>
        <span className="shell__profile-copy">
          <span className="shell__profile-name">{user?.nome ?? perfilLabel(user?.perfil)}</span>
          <span>{perfilLabel(user?.perfil)}</span>
          {user?.sub && <span>{(user.cpfMascarado ?? maskCpf(user.sub))}</span>}
        </span>
      </a>
      <button type="button" className="shell__logout" onClick={onLogout} aria-label="Sair" title="Sair">
        <MaterialIcon name="logout" size={18} />
      </button>
    </div>
  );
}
