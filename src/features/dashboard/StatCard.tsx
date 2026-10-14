// Mostra um número importante do dashboard em um cartão.

import { MaterialIcon, type MaterialIconName } from '../../components/icons';

interface StatCardProps {
  label: string;
  value: number | string;
  meta: string;
  icon: MaterialIconName;
  tone?: 'action' | 'success' | 'warning' | 'danger';
}

export function StatCard({ label, value, meta, icon, tone }: StatCardProps) {
  return (
    <article className={tone ? `dashboard-stat dashboard-stat--${tone}` : 'dashboard-stat'}>
      <div className="dashboard-stat__header">
        <p className="dashboard-stat__label">{label}</p>
        <span className="dashboard-stat__icon" aria-hidden="true">
          <MaterialIcon name={icon} size={18} />
        </span>
      </div>
      <p className="dashboard-stat__value">{value}</p>
      <p className="dashboard-stat__meta">{meta}</p>
    </article>
  );
}
