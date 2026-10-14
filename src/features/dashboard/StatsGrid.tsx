// Mostra os totais dos registros do paciente.

import { StatCard } from './StatCard';
import type { ClinicalRecord, Patient } from './types';

interface StatsGridProps {
  records: ClinicalRecord[];
  patient: Patient;
}

const typeGender: Record<ClinicalRecord['type'], 'feminine' | 'masculine'> = {
  consulta: 'feminine',
  retorno: 'masculine',
  exame: 'masculine',
  encaminhamento: 'masculine',
};

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function StatsGrid({ records, patient }: StatsGridProps) {
  const patientRecords = records.filter((item) => item.patientId === patient.id);
  const byType = (type: ClinicalRecord['type']) => patientRecords.filter((item) => item.type === type);

  const cards = [
    { label: 'Consultas', type: 'consulta' as const, icon: 'calendar' as const },
    { label: 'Retornos', type: 'retorno' as const, icon: 'medical_services' as const },
    { label: 'Exames', type: 'exame' as const, icon: 'science' as const },
    { label: 'Encaminhamentos', type: 'encaminhamento' as const, icon: 'description' as const },
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
          const scheduledLabel = typeGender[card.type] === 'feminine' ? 'agendada' : 'agendado';
          const completedLabel = typeGender[card.type] === 'feminine' ? 'realizada' : 'realizado';

          return (
            <StatCard
              key={card.type}
              label={card.label}
              value={items.length}
              meta={[
                plural(pending, 'pendente', 'pendentes'),
                plural(scheduled, scheduledLabel, `${scheduledLabel}s`),
                plural(completed, completedLabel, `${completedLabel}s`),
              ].join(' · ')}
              icon={card.icon}
            />
          );
        })}
      </div>
    </section>
  );
}
