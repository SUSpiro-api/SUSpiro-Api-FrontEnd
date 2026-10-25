// Mostra o nome e o símbolo do SUSpiro no menu lateral.

import { brand } from '../../config/brand';
import { LogoMark } from '../icons';

interface SidebarBrandProps {
  isProfessionalDashboard: boolean;
  isSchedulingDashboard: boolean;
  isPatientArea: boolean;
}

export function SidebarBrand({ isProfessionalDashboard, isSchedulingDashboard, isPatientArea }: SidebarBrandProps) {
  const context = isPatientArea
    ? 'Sua saúde'
    : isProfessionalDashboard
      ? (isSchedulingDashboard ? 'Central de agendamento' : 'Atendimento')
      : '';

  return (
    <div className="shell__brand">
      <span className="shell__brand-mark" aria-hidden="true">
        <LogoMark width={22} height={22} />
      </span>
      <div className="shell__brand-copy">
        <span className="shell__brand-name">{brand.name}</span>
        {context && <span className="shell__brand-context">{context}</span>}
      </div>
    </div>
  );
}
