// Mostra o resumo dos registros do paciente.

import { StatCard } from './StatCard';
import { usePatientStats } from './hooks/usePatientStats';
import type { ClinicalRecord, Patient } from './types';

interface StatsGridProps {
  records: ClinicalRecord[];
  patient: Patient;
}

export function StatsGrid({ records, patient }: StatsGridProps) {
  const stats = usePatientStats(records, patient);

  return (
    <section aria-labelledby="patient-summary-title">
      <h2 id="patient-summary-title" className="sr-only">Resumo do paciente</h2>
      <div className="dashboard-stats">
        {stats.map((stat) => (
          <StatCard
            key={stat.type}
            label={stat.label}
            value={stat.value}
            meta={stat.meta}
            icon={stat.icon}
          />
        ))}
      </div>
    </section>
  );
}
