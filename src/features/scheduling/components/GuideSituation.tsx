// Mostra a situação de uma guia: chip de status e linhas/carteiras de detalhe.

import { MaterialIcon } from '../../../components/icons';
import type { Guide } from '../../guides';
import { formatIsoDate, guideDetail, guidePriorityLabels, guideStatusLabels, guideTypeLabels } from '../../dashboard/guideLabels';

const STATUS_CHIP_CLASS: Record<Guide['status'], string> = {
  AGUARDANDO_AGENDAMENTO: 'situation-status--pendente',
  AGENDADO: 'situation-status--agendado',
  CANCELADO: 'situation-status--cancelado',
};

function typeIcon(guide: Guide): 'science' | 'description' | 'medical_services' | 'calendar' {
  if (guide.tipo === 'EXAME') return 'science';
  if (guide.tipo === 'ENCAMINHAMENTO') return 'description';
  if (guide.tipo === 'RETORNO') return 'medical_services';
  return 'calendar';
}

export function situationLabel(guide: Guide): string {
  if (guide.status === 'AGENDADO' && guide.dataAgendamento) {
    const hora = guide.horaAgendamento ? ` às ${guide.horaAgendamento.slice(0, 5)}` : '';
    return `Agendado · ${formatIsoDate(guide.dataAgendamento)}${hora}`;
  }
  return guideStatusLabels[guide.status];
}

export function SituationChip({ guide }: { guide: Guide }) {
  return (
    <span className={`situation-status ${STATUS_CHIP_CLASS[guide.status]}`}>{situationLabel(guide)}</span>
  );
}

/** Linha compacta: usada dentro do resultado de um paciente. */
export function GuideSituationRow({ guide }: { guide: Guide }) {
  return (
    <li className="situation-row">
      <span className="situation-row__icon" aria-hidden="true">
        <MaterialIcon name={typeIcon(guide)} size={18} />
      </span>
      <span className="situation-row__info">
        <strong>{guideTypeLabels[guide.tipo]} · {guideDetail(guide)}</strong>
        <span>
          Guia nº {guide.id} · solicitada em {formatIsoDate(guide.dataSolicitada.slice(0, 10))}
          {guide.prioridade === 'URGENTE' ? ' · urgente' : ''}
        </span>
      </span>
      <SituationChip guide={guide} />
    </li>
  );
}

/** Carteira completa: usada na busca de guias. */
export function GuideSituationCard({ guide }: { guide: Guide }) {
  const isUrgent = guide.prioridade === 'URGENTE';

  return (
    <article className={['guide-result', isUrgent && 'guide-result--urgent'].filter(Boolean).join(' ')}>
      <header className="guide-result__header">
        <span className="guide-result__icon" aria-hidden="true">
          <MaterialIcon name={typeIcon(guide)} size={20} />
        </span>
        <strong className="guide-result__title">Guia nº {guide.id}</strong>
        <SituationChip guide={guide} />
      </header>

      <dl className="guide-result__details">
        <div>
          <dt>Paciente</dt>
          <dd>{guide.pacienteNome}</dd>
        </div>
        <div>
          <dt>Solicitação</dt>
          <dd>{guideTypeLabels[guide.tipo]} · {guideDetail(guide)}</dd>
        </div>
        <div>
          <dt>Prioridade</dt>
          <dd>{guidePriorityLabels[guide.prioridade]}</dd>
        </div>
        <div>
          <dt>Data desejada</dt>
          <dd>{formatIsoDate(guide.dataSolicitada)}</dd>
        </div>
        <div>
          <dt>Solicitante</dt>
          <dd>{guide.solicitanteNome}</dd>
        </div>
        <div>
          <dt>Agendamento</dt>
          <dd>{guide.dataAgendamento ? formatIsoDate(guide.dataAgendamento) : '—'}</dd>
        </div>
      </dl>

      {guide.observacao && (
        <p className="guide-result__obs" title={guide.observacao}>{guide.observacao}</p>
      )}
    </article>
  );
}
