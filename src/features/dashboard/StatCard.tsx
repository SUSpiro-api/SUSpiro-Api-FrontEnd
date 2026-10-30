interface StatCardProps {
  label: string;
  value: number | string;
  meta: string;
  tone?: 'action' | 'success' | 'warning' | 'danger';
}

export function StatCard({ label, value, meta, tone }: StatCardProps) {
  return (
    <article className={tone ? `dashboard-stat dashboard-stat--${tone}` : 'dashboard-stat'}>
      <div className="dashboard-stat__header">
        <h3 className="dashboard-stat__label">{label}</h3>
      </div>
      <p className="dashboard-stat__value">{value}</p>
      <p className="dashboard-stat__meta">{meta}</p>
    </article>
  );
}
