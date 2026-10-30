import { StatCard } from './StatCard';
import { useOverviewStats } from './hooks/useOverviewStats';
import type { ClinicalRecord } from './types';

interface OverviewStatsProps {
  records: ClinicalRecord[];
}

export function OverviewStats({ records }: OverviewStatsProps) {
  const stats = useOverviewStats(records);

  return (
    <section aria-labelledby="overview-stats-title">
      <h2 id="overview-stats-title" className="sr-only">Registros em aberto</h2>
      <div className="dashboard-stats">
        {stats.map((stat) => (
          <StatCard
            key={stat.type}
            label={stat.label}
            value={stat.value}
            meta={stat.meta}
          />
        ))}
      </div>
    </section>
  );
}
