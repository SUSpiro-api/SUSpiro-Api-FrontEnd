import { authenticatedFetch } from '../../api/httpClient';
import { normalizeCpf } from '../../utils/cpf';
import type { Patient } from './types';

interface PatientApiResponse { id: string; nome: string; cpf: string; dataNascimento: string }

export async function findPatientByCpfApi(cpf: string): Promise<Patient | null> {
  const normalized = normalizeCpf(cpf);
  const patient = await authenticatedFetch<PatientApiResponse>(`/pacientes?cpf=${encodeURIComponent(normalized)}`, { retries: 0 });
  if (!patient?.id || !patient.nome || !patient.cpf || !patient.dataNascimento) return null;
  return { id: patient.id, name: patient.nome, cpf: patient.cpf, birthDate: patient.dataNascimento };
}
