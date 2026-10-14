// Define os tipos de dados usados no dashboard.

export type ClinicalRecordStatus = 'agendado' | 'pendente' | 'realizado' | 'cancelado';
export type ClinicalRecordType = 'consulta' | 'retorno' | 'exame' | 'encaminhamento';

export interface Patient {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
}

export interface ClinicalRecord {
  id: number;
  patientId: number;
  date: string;
  time?: string;
  type: ClinicalRecordType;
  title: string;
  observation?: string;
  status: ClinicalRecordStatus;
  priority: 'normal' | 'urgente';
}

export type ScheduleType = ClinicalRecordType;
