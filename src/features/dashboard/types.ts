// Define os tipos de dados usados no dashboard.

export type ClinicalRecordStatus = 'agendado' | 'pendente' | 'realizado' | 'cancelado';
export type ClinicalRecordType = 'consulta' | 'retorno' | 'exame' | 'encaminhamento';

export interface Patient {
  id: string | number;
  name: string;
  cpf: string;
  /** Pode não estar presente no resumo derivado de uma guia. */
  birthDate?: string;
}

export interface ClinicalRecord {
  id: number;
  patientId: string | number;
  /** Identificação vinda da própria guia, útil quando a lista de pacientes não foi carregada. */
  patientName?: string;
  patientCpf?: string;
  date: string;
  /** Dia em que o atendimento foi agendado (a recepção define); `date` é o dia solicitado. */
  scheduledDate?: string;
  time?: string;
  type: ClinicalRecordType;
  title: string;
  observation?: string;
  status: ClinicalRecordStatus;
  priority: 'normal' | 'urgente';
}

export type ScheduleType = ClinicalRecordType;
