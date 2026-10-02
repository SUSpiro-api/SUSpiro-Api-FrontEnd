import { normalizeCpf } from '../../utils/cpf';
import type { ClinicalRecord, Patient } from './types';

export const patients: Patient[] = [
  {
    id: 1,
    name: 'Paciente Teste SUSpiro',
    cpf: '529.982.247-25',
    birthDate: '1987-04-18',
  },
  {
    id: 2,
    name: 'João Oliveira',
    cpf: '390.533.447-05',
    birthDate: '1979-11-02',
  },
  {
    id: 3,
    name: 'Ana Costa',
    cpf: '935.411.347-80',
    birthDate: '1993-07-27',
  },
];

// Dados temporários da camada visual. O ponto de troca com a API fica isolado nesta feature.
export const clinicalRecords: ClinicalRecord[] = [
  {
    id: 1,
    patientId: 1,
    date: '2026-09-30',
    time: '09:00',
    type: 'consulta',
    title: 'Consulta clínica',
    observation: 'Avaliação de acompanhamento.',
    status: 'agendado',
    priority: 'normal',
  },
  {
    id: 2,
    patientId: 1,
    date: '2026-09-15',
    type: 'consulta',
    title: 'Consulta clínica',
    status: 'realizado',
    priority: 'normal',
  },
  {
    id: 3,
    patientId: 1,
    date: '2026-08-10',
    type: 'consulta',
    title: 'Consulta clínica',
    status: 'realizado',
    priority: 'normal',
  },
  {
    id: 4,
    patientId: 1,
    date: '2026-10-07',
    type: 'retorno',
    title: 'Retorno',
    observation: 'Acompanhar evolução do tratamento.',
    status: 'pendente',
    priority: 'normal',
  },
  {
    id: 5,
    patientId: 1,
    date: '2026-09-29',
    type: 'exame',
    title: 'Ecocardiograma',
    observation: 'Aguardando agendamento.',
    status: 'pendente',
    priority: 'normal',
  },
  {
    id: 6,
    patientId: 1,
    date: '2026-09-10',
    type: 'exame',
    title: 'Hemograma',
    status: 'realizado',
    priority: 'normal',
  },
  {
    id: 7,
    patientId: 1,
    date: '2026-09-30',
    type: 'encaminhamento',
    title: 'Ortopedia',
    observation: 'Avaliação especializada.',
    status: 'pendente',
    priority: 'urgente',
  },
  {
    id: 8,
    patientId: 1,
    date: '2026-08-22',
    type: 'encaminhamento',
    title: 'Cardiologia',
    status: 'realizado',
    priority: 'normal',
  },
  {
    id: 9,
    patientId: 2,
    date: '2026-09-30',
    time: '10:30',
    type: 'consulta',
    title: 'Consulta de acompanhamento',
    status: 'agendado',
    priority: 'normal',
  },
  {
    id: 10,
    patientId: 3,
    date: '2026-09-30',
    time: '11:00',
    type: 'consulta',
    title: 'Primeira consulta',
    status: 'agendado',
    priority: 'normal',
  },
  {
    id: 11,
    patientId: 2,
    date: '2026-09-28',
    type: 'exame',
    title: 'Ultrassonografia',
    status: 'pendente',
    priority: 'normal',
  },
];

export function findPatientByCpf(cpf: string): Patient | null {
  const normalized = normalizeCpf(cpf);
  return patients.find((patient) => normalizeCpf(patient.cpf) === normalized) ?? null;
}
