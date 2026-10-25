import { describe, expect, it } from 'vitest';
import type { Guide } from '../guides';
import { guideToClinicalRecord } from './guideToClinicalRecord';

const baseGuide: Guide = {
  id: 42,
  pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
  pacienteNome: 'Maria da Silva',
  pacienteCpf: '12345678901',
  tipo: 'CONSULTA',
  especialidade: 'Cardiologia',
  dataSolicitada: '2026-11-05',
  prioridade: 'URGENTE',
  status: 'AGUARDANDO_AGENDAMENTO',
  solicitanteId: 2,
  solicitanteNome: 'Dr. Exemplo',
  criadoEm: '2026-10-13T10:00:00',
};

describe('guideToClinicalRecord', () => {
  it('converte uma guia de consulta para o formato usado no histórico', () => {
    expect(guideToClinicalRecord(baseGuide)).toEqual({
      id: 42,
      patientId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
      patientName: 'Maria da Silva',
      patientCpf: '12345678901',
      date: '2026-11-05',
      time: undefined,
      type: 'consulta',
      title: 'Cardiologia',
      observation: undefined,
      status: 'pendente',
      priority: 'urgente',
    });
  });

  it('mantém o detalhe de exames e o status de agendamento', () => {
    const guide: Guide = {
      ...baseGuide,
      tipo: 'EXAME',
      especialidade: undefined,
      detalhe: 'Hemograma completo',
      status: 'AGENDADO',
      dataAgendamento: '2026-11-12',
      horaAgendamento: '09:30:00',
      observacao: 'Jejum de 8 horas',
      prioridade: 'NORMAL',
    };

    expect(guideToClinicalRecord(guide)).toMatchObject({
      title: 'Hemograma completo',
      type: 'exame',
      date: '2026-11-05',
      scheduledDate: '2026-11-12',
      time: '09:30:00',
      status: 'agendado',
      priority: 'normal',
      observation: 'Jejum de 8 horas',
    });
  });
});
