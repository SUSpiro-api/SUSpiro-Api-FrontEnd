import { MaterialIcon } from '../icons';

const BENEFITS: readonly string[] = [
  'Zero solicitações perdidas ou esquecidas',
  'Notificações automáticas por SMS e e-mail',
  'Painel com status de cada solicitação em tempo real',
];

export function BenefitsList() {
  return (
    <section className="login-benefits" aria-labelledby="suspiro-benefits-title">
      <h2 id="suspiro-benefits-title" className="login-benefits__title">
        Por que usar o SUSpiro
      </h2>
      <ul className="login-benefits__list">
        {BENEFITS.map((benefit) => (
          <li key={benefit}>
            <MaterialIcon name="check" size={16} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
