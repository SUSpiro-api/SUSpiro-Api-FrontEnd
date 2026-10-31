import { MaterialIcon, type MaterialIconName } from '../../components/icons';
import type { ScheduleType } from './types';

interface QuickActionsProps {
  onCreate: (type: ScheduleType) => void;
}

const actions: Array<{ label: string; description: string; type: ScheduleType; icon: MaterialIconName }> = [
  { label: 'Consulta', description: 'Registrar atendimento', type: 'consulta', icon: 'stethoscope' },
  { label: 'Retorno', description: 'Programar acompanhamento', type: 'retorno', icon: 'calendar' },
  { label: 'Exame', description: 'Registrar solicitação', type: 'exame', icon: 'science' },
  { label: 'Encaminhamento', description: 'Direcionar paciente', type: 'encaminhamento', icon: 'assignment' },
];

export function QuickActions({ onCreate }: QuickActionsProps) {
  return (
    <section className="dashboard-card" aria-labelledby="acoes-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="acoes-title" className="dashboard-card__title">Ações rápidas</h2>
          <p className="dashboard-card__subtitle">Selecione um tipo de registro; se necessário, o sistema pedirá para localizar o paciente.</p>
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
              <MaterialIcon name="chevron_right" size={20} className="quick-action__arrow" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
