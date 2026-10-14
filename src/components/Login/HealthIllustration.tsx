// Mostra a ilustração usada na tela de login.

import healthEmblem from '../../assets/health-emblem.svg';

export function HealthIllustration() {
  return <img className="login-illustration" src={healthEmblem} alt="" aria-hidden="true" />;
}
