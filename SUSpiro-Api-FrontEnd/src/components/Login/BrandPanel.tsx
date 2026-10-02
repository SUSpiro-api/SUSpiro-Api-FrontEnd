import { LogoMark } from '../icons';
import { BenefitsList } from './BenefitsList';
import { HealthIllustration } from './HealthIllustration';

// Painel visual à esquerda
export function BrandPanel() {
  return (
    <aside className="login-brand-panel" aria-label="Informações da marca SUSpiro">
      <div className="login-brand-panel__overlay" />

      <header className="login-brand-panel__header">
        <LogoMark className="login-brand-panel__logo" aria-hidden="true" />
        <span className="login-brand-panel__name">SUSpiro</span>
      </header>

      <p className="login-brand-panel__tagline">
        Agendamento e reagendamento de consultas e exames
      </p>

      <figure className="login-brand-panel__illustration">
        <HealthIllustration />
      </figure>

      <BenefitsList />
    </aside>
  );
}
