// Quatro cartões com o total de consultas, exames, retornos e encaminhamentos.

import { MaterialIcon } from '../../../components/icons';
import { careTypeIcons } from '../data';
import type { SummaryType, TypeSummary } from '../careSummary';

const typeLabels: Record<SummaryType, string> = {
  consulta: 'Consultas',
  exame: 'Exames',
  retorno: 'Retornos',
  encaminhamento: 'Encaminhamentos',
};

interface CareTypeStatsProps {
  summary: TypeSummary[];
}

export function CareTypeStats({ summary }: CareTypeStatsProps) {
  return (
    <section className="care-stats" aria-label="Resumo por tipo de atendimento">
      {summary.map((entry) => (
        <article
          key={entry.type}
          className={`care-stat care-stat--${entry.type}${entry.total === 0 ? ' care-stat--empty' : ''}`}
        >
          <span className="care-stat__icon" aria-hidden="true">
            <MaterialIcon name={careTypeIcons[entry.type]} size={22} />
          </span>
          <h3 className="care-stat__label">{typeLabels[entry.type]}</h3>
          <p className="care-stat__value">{entry.total}</p>
          <p className="care-stat__meta">
            {entry.total === 0
              ? 'Nada registrado ainda'
              : `${entry.scheduled} com data marcada · ${entry.waiting} aguardando`}
          </p>
        </article>
      ))}
    </section>
  );
}
