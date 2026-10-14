// Transforma uma guia da API no formato usado pelo dashboard.

import type { Guide } from '../guides';
import type { ClinicalRecord } from './types';

export function guideToClinicalRecord(guide: Guide): ClinicalRecord {
  const typeByGuide: Record<Guide['tipo'], ClinicalRecord['type']> = {
    CONSULTA: 'consulta',
    RETORNO: 'retorno',
    EXAME: 'exame',
    ENCAMINHAMENTO: 'encaminhamento',
  };

  const statusByGuide: Record<Guide['status'], ClinicalRecord['status']> = {
    AGUARDANDO_AGENDAMENTO: 'pendente',
    AGENDADO: 'agendado',
    CANCELADO: 'cancelado',
  };

  const title = guide.tipo === 'CONSULTA'
    ? guide.especialidade ?? 'Consulta'
    : guide.detalhe ?? guide.tipo;

  return {
    id: guide.id,
    patientId: guide.pacienteId,
    date: guide.dataSolicitada,
    time: guide.horaAgendamento ?? undefined,
    type: typeByGuide[guide.tipo],
    title,
    observation: guide.observacao ?? undefined,
    status: statusByGuide[guide.status],
    priority: guide.prioridade === 'URGENTE' ? 'urgente' : 'normal',
  };
}
