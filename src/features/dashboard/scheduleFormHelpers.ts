import type { ConsultationSpecialty, CreateGuideInput, GuideType } from '../guides';
import { isPastIsoDate } from './date';
import type { Patient, ScheduleType } from './types';

export function getScheduleTitle(type: ScheduleType): string {
  const titles: Record<ScheduleType, string> = {
    consulta: 'Nova consulta',
    retorno: 'Novo retorno',
    exame: 'Novo exame',
    encaminhamento: 'Novo encaminhamento',
  };
  return titles[type];
}

export function needsScheduleDetail(type: ScheduleType): boolean {
  return type === 'exame' || type === 'encaminhamento';
}

export function isUuid(value: string | number | null | undefined): boolean {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validateSchedule(patient: Patient | null, date: string, type: ScheduleType, detail: string, specialty: ConsultationSpecialty | ''): string {
  if (!patient || !date) return 'Identifique o paciente e informe a data solicitada.';
  if (isPastIsoDate(date)) return 'A data solicitada não pode ser anterior à data de hoje.';
  if (needsScheduleDetail(type) && !detail.trim()) {
    return type === 'exame' ? 'Selecione o exame solicitado.' : 'Selecione a especialidade de destino.';
  }
  if (type === 'consulta' && !specialty) return 'Selecione a especialidade da consulta.';
  return '';
}

export function makeGuideInput(patient: Patient, type: ScheduleType, specialty: ConsultationSpecialty | '', detail: string, date: string, observation: string, priority: 'normal' | 'urgente'): CreateGuideInput {
  return {
    pacienteId: String(patient.id),
    pacienteNome: patient.name,
    pacienteCpf: patient.cpf.replace(/\D/g, ''),
    tipo: type.toUpperCase() as GuideType,
    especialidade: type === 'consulta' ? specialty || undefined : undefined,
    detalhe: needsScheduleDetail(type) ? detail.trim() : undefined,
    dataSolicitada: date,
    observacao: observation.trim() || undefined,
    prioridade: priority === 'urgente' ? 'URGENTE' : 'NORMAL',
  };
}
