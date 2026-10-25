// Mostra o nome, o perfil e o CPF do usuário.

import { perfilLabel } from '../../features/auth/perfil';
import type { AuthUser } from '../../features/auth/types';
import { maskCpf } from '../../utils/mask';
import { initialsFromName } from '../../utils/initials';
import { MaterialIcon } from '../icons';

interface UserIdentityProps {
  user: AuthUser | null;
}

export function UserIdentity({ user }: UserIdentityProps) {
  const initials = initialsFromName(user?.nome);
  const maskedCpf = user?.cpfMascarado ?? (user?.sub ? maskCpf(user.sub) : '');

  return (
    <div className="shell__user">
      <span className="shell__avatar" aria-hidden="true">
        {initials || <MaterialIcon name="person" size={20} />}
      </span>
      <span className="shell__user-text">
        <strong>{user?.nome ?? perfilLabel(user?.perfil)}</strong>
        <span>{perfilLabel(user?.perfil)}{maskedCpf ? ` · ${maskedCpf}` : ''}</span>
      </span>
    </div>
  );
}
