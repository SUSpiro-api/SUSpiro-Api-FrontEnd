import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listMyGuides, listPatientGuides } from '../../guides';
import { useDoctorDashboard } from './useDoctorDashboard';
import type { Guide } from '../../guides';
import type { Patient } from '../types';

vi.mock('../../guides', () => ({
  listMyGuides: vi.fn(),
  listPatientGuides: vi.fn(),
  subscribeToGuideUpdates: vi.fn(() => () => undefined),
}));

const patient: Patient = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Mariana Oliveira Santos',
  cpf: '11144477735',
};

const guide: Guide = {
  id: 17,
  pacienteId: patient.id,
  pacienteNome: patient.name,
  pacienteCpf: patient.cpf,
  tipo: 'RETORNO',
  detalhe: 'Retorno cardiológico',
  dataSolicitada: '2026-11-05',
  prioridade: 'NORMAL',
  status: 'AGUARDANDO_AGENDAMENTO',
  solicitanteId: 3,
  solicitanteNome: 'Dra. Ana',
  criadoEm: '2026-10-30T12:00:00',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listMyGuides).mockResolvedValue([]);
  vi.mocked(listPatientGuides).mockResolvedValue([guide]);
});

describe('useDoctorDashboard patient history', () => {
  it('loads the complete patient history after the doctor selects a patient', async () => {
    const { result } = renderHook(() => useDoctorDashboard());
    await waitFor(() => expect(listMyGuides).toHaveBeenCalled());

    act(() => result.current.setSelectedPatient(patient));

    await waitFor(() => expect(result.current.patientRecords).toHaveLength(1));
    expect(listPatientGuides).toHaveBeenCalledWith(patient.id);
    expect(result.current.patientRecords[0]).toMatchObject({
      id: guide.id,
      patientId: patient.id,
      type: 'retorno',
      title: 'Retorno cardiológico',
    });
    expect(result.current.patientHistoryLoadFailed).toBe(false);
  });

  it('falls back to the selected professional history when the patient endpoint is unavailable', async () => {
    vi.mocked(listMyGuides).mockResolvedValue([guide]);
    vi.mocked(listPatientGuides).mockRejectedValue(new Error('API indisponível'));

    const { result } = renderHook(() => useDoctorDashboard());
    await waitFor(() => expect(result.current.records).toHaveLength(1));
    act(() => result.current.setSelectedPatient(patient));

    await waitFor(() => expect(result.current.patientHistoryLoadFailed).toBe(true));
    expect(result.current.patientRecords).toHaveLength(1);
    expect(result.current.patientRecords[0].id).toBe(guide.id);
  });
});
