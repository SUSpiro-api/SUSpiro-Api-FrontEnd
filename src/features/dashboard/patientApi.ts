import { ApiError, authenticatedFetch } from '../../api/httpClient';
import { normalizeCpf } from '../../utils/cpf';
import type { Patient } from './types';

/** Contrato de PacienteController.buscarPorCpf -> PacienteIdentificacaoResponse. */
interface PatientIdentificationApiResponse {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento?: string | null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function findPatientByCpfApi(cpf: string): Promise<Patient | null> {
  const normalizedCpf = normalizeCpf(cpf);
  if (normalizedCpf.length !== 11) {
    throw new ApiError('Informe um CPF válido com 11 dígitos.', 400, 'CPF_INVALIDO');
  }

  const patient = await authenticatedFetch<PatientIdentificationApiResponse>(
    `/pacientes?cpf=${encodeURIComponent(normalizedCpf)}`,
    { retries: 0 },
  );

  if (patient == null) return null;

  const id = typeof patient.id === 'string' ? patient.id.trim() : '';
  const name = typeof patient.nome === 'string' ? patient.nome.trim() : '';
  const returnedCpf = typeof patient.cpf === 'string' ? normalizeCpf(patient.cpf) : '';

  if (!UUID_PATTERN.test(id) || !name || returnedCpf !== normalizedCpf) {
    throw new ApiError(
      'A API retornou dados de identificação do paciente em formato inesperado. Confira o contrato da API.',
      502,
      'INVALID_PATIENT_RESPONSE',
    );
  }

  const birthDate = typeof patient.dataNascimento === 'string' && ISO_DATE_PATTERN.test(patient.dataNascimento)
    ? patient.dataNascimento
    : undefined;

  return { id, name, cpf: returnedCpf, ...(birthDate ? { birthDate } : {}) };
}
