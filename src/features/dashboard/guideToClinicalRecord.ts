// Mapas centralizados tornam o tratamento de novos estados/tipos explícito em tempo de compilação.
import type { Guide } from '../guides';
import type { ClinicalRecord } from './types';

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

const priorityByGuide: Record<Guide['prioridade'], ClinicalRecord['priority']> = {
  NORMAL: 'normal',
  URGENTE: 'urgente',
};

const titleByGuide: Record<Guide['tipo'], (guide: Guide) => string> = {
  CONSULTA: (guide) => guide.especialidade ?? 'Consulta',
  RETORNO: (guide) => guide.detalhe ?? 'Retorno',
  EXAME: (guide) => guide.detalhe ?? 'Exame',
  ENCAMINHAMENTO: (guide) => guide.detalhe ?? 'Encaminhamento',
};

export function guideToClinicalRecord(guide: Guide): ClinicalRecord {
  return {
    id: guide.id,
    patientId: guide.pacienteId,
    patientName: guide.pacienteNome,
    patientCpf: guide.pacienteCpf,
    date: guide.dataSolicitada,
    scheduledDate: guide.dataAgendamento ?? undefined,
    time: guide.horaAgendamento ?? undefined,
    type: typeByGuide[guide.tipo],
    title: titleByGuide[guide.tipo](guide),
    observation: guide.observacao ?? undefined,
    status: statusByGuide[guide.status],
    priority: priorityByGuide[guide.prioridade],
    guide,
  };
}
