import { StatCard } from './StatCard';
import type { ClinicalRecord, Patient } from './types';

interface StatsGridProps {
  records: ClinicalRecord[];
  patient: Patient;
}

export function StatsGrid({ records, patient }: StatsGridProps) {
  const patientRecords = records.filter((item) => item.patientId === patient.id);
  const byType = (type: ClinicalRecord['type']) => patientRecords.filter((item) => item.type === type);

  const cards = [
    { label: 'Consultas', type: 'consulta' as const, icon: 'calendar' as const, tone: 'action' as const },
    { label: 'Retornos', type: 'retorno' as const, icon: 'medical_services' as const, tone: 'success' as const },
    { label: 'Exames', type: 'exame' as const, icon: 'science' as const, tone: 'warning' as const },
    { label: 'Encaminhamentos', type: 'encaminhamento' as const, icon: 'description' as const, tone: 'danger' as const },
  ];

  return (
    <section aria-labelledby="patient-summary-title">
      <h2 id="patient-summary-title" className="sr-only">Resumo do paciente</h2>
      <div className="dashboard-stats">
        {cards.map((card) => {
          const items = byType(card.type);
          const pending = items.filter((item) => item.status === 'pendente').length;
          const scheduled = items.filter((item) => item.status === 'agendado').length;
          const completed = items.filter((item) => item.status === 'realizado').length;

          return (
            <StatCard
              key={card.type}
              label={card.label}
              value={items.length}
              meta={`${pending} pendente${pending === 1 ? '' : 's'} · ${scheduled} agendada${scheduled === 1 ? '' : 's'} · ${completed} realizada${completed === 1 ? '' : 's'}`}
              icon={card.icon}
              tone={card.tone}
            />
          );
        })}
      </div>
    </section>
  );
}
