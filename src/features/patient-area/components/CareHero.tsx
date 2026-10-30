import { careDisplayTitle, type CareItem } from '../data';
import { dateParts } from '../careSummary';

interface CareHeroProps {
  /** Texto de saudação já com ponto final e espaço, ou vazio. */
  greeting: string;
  loading: boolean;
  next: CareItem | null;
  /** Quantas solicitações aguardam data e horário da recepção. */
  waiting: number;
  onSelect: (item: CareItem) => void;
}

export function CareHero({ greeting, loading, next, waiting, onSelect }: CareHeroProps) {
  return (
    <header className="care-hero">
      <div className="care-hero__copy">
        <h1 className="page__title care-hero__title">Minha saúde</h1>
        <p className="page__description care-hero__description">
          {greeting}Acompanhe suas consultas, exames, retornos e encaminhamentos em um só lugar.
        </p>
      </div>
      {loading ? <span className="care-next care-next--loading" aria-hidden="true" /> : <NextCare next={next} waiting={waiting} onSelect={onSelect} />}
    </header>
  );
}

function NextCare({ next, waiting, onSelect }: Pick<CareHeroProps, 'next' | 'waiting' | 'onSelect'>) {
  if (!next) {
    const text = waiting > 0
      ? `${waiting} ${waiting === 1 ? 'solicitação aguarda' : 'solicitações aguardam'} data e horário da recepção.`
      : 'Quando a clínica agendar, a data e o horário aparecem aqui.';
    return (
      <aside className="care-next" aria-label="Próximo atendimento">
        <div className="care-next__body">
          <p className="care-next__label">Próximo atendimento</p>
          <p className="care-next__title">Nenhum atendimento marcado</p>
          <p className="care-next__meta">{text}</p>
        </div>
      </aside>
    );
  }

  const parts = dateParts(next.date);
  const time = next.time ? `, às ${next.time.slice(0, 5)}` : '';
  const professional = next.professional ? ` · ${next.professional}` : '';
  const location = next.location ? ` · ${next.location}` : '';

  return (
    <aside className="care-next" aria-label="Próximo atendimento">
      <span className="care-next__tile" aria-hidden="true">
        <span className="care-next__day">{parts.day}</span>
        <span className="care-next__month">{parts.month}</span>
      </span>
      <div className="care-next__body">
        <p className="care-next__label">Próximo atendimento</p>
        <p className="care-next__title">{careDisplayTitle(next)}</p>
        <p className="care-next__meta">{parts.weekday}{time}{professional}{location}</p>
        <button type="button" className="care-next__action" onClick={() => onSelect(next)} aria-haspopup="dialog">
          Ver detalhes
        </button>
      </div>
    </aside>
  );
}
