import { MaterialIcon, type MaterialIconName } from '../../components/icons';
import type { ScheduleType } from './types';

interface QuickActionsProps {
  onCreate: (type: ScheduleType) => void;
}

const actions: Array<{ label: string; description: string; type: ScheduleType; icon: MaterialIconName }> = [
  { label: 'Consulta', description: 'Registrar atendimento', type: 'consulta', icon: 'calendar' },
  { label: 'Retorno', description: 'Programar acompanhamento', type: 'retorno', icon: 'medical_services' },
  { label: 'Exame', description: 'Registrar solicitação', type: 'exame', icon: 'science' },
  { label: 'Encaminhamento', description: 'Direcionar paciente', type: 'encaminhamento', icon: 'description' },
];

export function QuickActions({ onCreate }: QuickActionsProps) {
  return (
    <section className="dashboard-card" aria-labelledby="acoes-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="acoes-title" className="dashboard-card__title">Ações rápidas</h2>
          <p className="dashboard-card__subtitle">Todas usam o paciente em atendimento.</p>
        </div>
      </header>
      <ul className="quick-actions">
        {actions.map((action) => (
          <li key={action.type}>
            <button type="button" className="quick-action" onClick={() => onCreate(action.type)}>
              <span className="quick-action__icon" aria-hidden="true">
                <MaterialIcon name={action.icon} size={22} />
              </span>
              <span className="quick-action__text">
                <strong>{action.label}</strong>
                <small>{action.description}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
