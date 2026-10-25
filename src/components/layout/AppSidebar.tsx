// Monta o menu lateral do sistema.

import type { MouseEvent } from 'react';
import type { AuthUser } from '../../features/auth/types';
import { Navbar } from './Navbar';
import { SidebarBrand } from './SidebarBrand';
import { SidebarProfile } from './SidebarProfile';
import { isAdmin } from '../../features/auth/authorization';
import { getNavItems, getPatientNavItems, getProfessionalNavItems } from './navigation';

interface AppSidebarProps {
  current: string;
  user: AuthUser | null;
  isProfessionalDashboard: boolean;
  isSchedulingDashboard: boolean;
  isPatientArea: boolean;
  menuOpen: boolean;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, path: string) => void;
  onLogout: () => void;
}

export function AppSidebar({
  current,
  user,
  isProfessionalDashboard,
  isSchedulingDashboard,
  isPatientArea,
  menuOpen,
  onNavigate,
  onLogout,
}: AppSidebarProps) {
  const items = isPatientArea
    ? getPatientNavItems()
    : isProfessionalDashboard
      ? getProfessionalNavItems(user?.perfil)
      : getNavItems(user?.perfil);

  const navLabel = isPatientArea
    ? 'Navegação do paciente'
    : isProfessionalDashboard && isAdmin(user?.perfil)
      ? 'Navegação da gestão'
      : isProfessionalDashboard && isSchedulingDashboard
        ? 'Navegação do agendamento'
        : isProfessionalDashboard
          ? 'Navegação do atendimento'
          : 'Navegação principal';

  return (
    <aside
      id="shell-sidebar"
      className={[
        'shell__sidebar',
        (isProfessionalDashboard || isPatientArea) && 'shell__sidebar--workspace',
        menuOpen && 'shell__sidebar--open',
      ].filter(Boolean).join(' ')}
      aria-label="Menu principal"
    >
      <SidebarBrand
        isProfessionalDashboard={isProfessionalDashboard}
        isSchedulingDashboard={isSchedulingDashboard}
        isPatientArea={isPatientArea}
      />

      {isProfessionalDashboard ? (
        <div className="shell__professional-content">
          <Navbar
            items={items}
            current={current}
            label={navLabel}
            sectionTitle={isAdmin(user?.perfil) && !isSchedulingDashboard ? 'Gestão' : isSchedulingDashboard ? 'Agendamento' : 'Atendimento'}
            onNavigate={onNavigate}
          />
        </div>
      ) : (
        <Navbar items={items} current={current} label={navLabel} onNavigate={onNavigate} />
      )}

      {(isProfessionalDashboard || isPatientArea) && (
        <SidebarProfile user={user} onNavigate={onNavigate} onLogout={onLogout} />
      )}
    </aside>
  );
}
