import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, authenticatedFetch } from '../../api/httpClient';
import { findPatientByCpfApi } from './patientApi';

vi.mock('../../api/httpClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/httpClient')>();
  return { ...actual, authenticatedFetch: vi.fn() };
});

const patientApiResponse = {
  id: '00000000-0000-4000-8000-000000000001',
  nome: 'Mariana Oliveira Santos',
  cpf: '11144477735',
  dataNascimento: '1990-05-20',
};

beforeEach(() => vi.clearAllMocks());

describe('findPatientByCpfApi', () => {
  it('calls the backend CPF endpoint and maps PacienteIdentificacaoResponse', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue(patientApiResponse);

    await expect(findPatientByCpfApi('111.444.777-35')).resolves.toEqual({
      id: patientApiResponse.id,
      name: patientApiResponse.nome,
      cpf: patientApiResponse.cpf,
      birthDate: patientApiResponse.dataNascimento,
    });
    expect(authenticatedFetch).toHaveBeenCalledWith('/pacientes?cpf=11144477735', { retries: 0 });
  });

  it('accepts a legacy record without birth date while preserving the patient identity', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue({ ...patientApiResponse, dataNascimento: null });
    await expect(findPatientByCpfApi('11144477735')).resolves.toEqual({
      id: patientApiResponse.id,
      name: patientApiResponse.nome,
      cpf: patientApiResponse.cpf,
    });
  });

  it('rejects a response whose CPF or UUID does not match the lookup contract', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue({ ...patientApiResponse, cpf: '52998224725' });
    await expect(findPatientByCpfApi('11144477735')).rejects.toBeInstanceOf(ApiError);
  });
});
