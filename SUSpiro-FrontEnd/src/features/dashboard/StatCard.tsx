import { MaterialIcon, type MaterialIconName } from '../../components/icons';

interface StatCardProps {
  label: string;
  value: number | string;
  meta: string;
  icon: MaterialIconName;
  tone: 'action' | 'success' | 'warning' | 'danger';
  emphasis?: 'default' | 'next';
}

export function StatCard({ label, value, meta, icon, tone, emphasis = 'default' }: StatCardProps) {
  return (
    <article className={`dashboard-stat dashboard-stat--${tone} dashboard-stat--${emphasis}`}>
      <div className="dashboard-stat__header">
        <span className="dashboard-stat__icon" aria-hidden="true">
          <MaterialIcon name={icon} size={20} />
        </span>
        {emphasis === 'next' && <span className="dashboard-stat__badge">Agora</span>}
      </div>
      <p className="dashboard-stat__value">{value}</p>
      <p className="dashboard-stat__label">{label}</p>
      <p className="dashboard-stat__meta">{meta}</p>
    </article>
  );
}
