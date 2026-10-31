import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDashboardOverview } from './useDashboardOverview';
import type { ClinicalRecord, Patient } from '../types';

const records: ClinicalRecord[] = [
  {
    id: 1, patientId: 'patient-1', patientName: 'Mariana Oliveira Santos', date: '2026-12-01',
    type: 'retorno', title: 'Retorno cardiológico', status: 'pendente', priority: 'normal',
    guide: {
      id: 1, pacienteId: 'patient-1', pacienteNome: 'Mariana Oliveira Santos', pacienteCpf: '11144477735',
      tipo: 'RETORNO', detalhe: 'Retorno cardiológico', dataSolicitada: '2026-12-01', prioridade: 'NORMAL',
      status: 'AGUARDANDO_AGENDAMENTO', solicitanteId: 2, solicitanteNome: 'Dra. Ana', criadoEm: '2026-10-30T13:00:00',
    },
  },
  {
    id: 2, patientId: 'patient-2', patientName: 'João da Silva', date: '2026-09-01',
    type: 'exame', title: 'Hemograma', status: 'pendente', priority: 'normal',
  },
];

describe('useDashboardOverview', () => {
  it('uses creation date for recent activity and keeps patients even when CPF is missing', () => {
    const { result } = renderHook(() => useDashboardOverview(records, []));

    expect(result.current.recentActivity[0].record.id).toBe(1);
    expect(result.current.recentPatients).toEqual([
      { id: 'patient-1', name: 'Mariana Oliveira Santos', cpf: '11144477735', birthDate: undefined },
      { id: 'patient-2', name: 'João da Silva', cpf: '', birthDate: undefined },
    ]);
  });

  it('matches registered patient identifiers as strings', () => {
    const patients = [{ id: 'patient-1', name: 'Nome cadastrado', cpf: '11144477735' }] satisfies Patient[];
    const { result } = renderHook(() => useDashboardOverview(records, patients));
    expect(result.current.recentPatients[0]).toEqual(patients[0]);
    expect(result.current.recentActivity[0].patientName).toBe('Nome cadastrado');
  });
});
