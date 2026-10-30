import { listPendingGuides, type Guide } from '../guides';
import { readLocalGuides } from '../guides/localGuideRepository';
import { subscribeToGuideUpdates } from '../guides/guideEvents';
import { normalizeCpf } from '../../utils/cpf';
import { env } from '../../config/env';
import { authenticatedFetch } from '../../api/httpClient';
import { matchesCpfDigits, matchesTerm } from './search';

export interface PatientRecord {
  name: string;
  cpf: string;
  birthDate?: string;
}

export interface SchedulingSearchData {
  guides: Guide[];
  patients: PatientRecord[];
  /** false quando a fila da API não respondeu e só há dados deste dispositivo. */
  fromServer: boolean;
}

interface PatientSearchApiResponse {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
}

function buildPatientRegistry(guides: Guide[]): PatientRecord[] {
  const byCpf = new Map<string, PatientRecord>();

  for (const guide of guides) {
    const key = normalizeCpf(guide.pacienteCpf);
    if (!byCpf.has(key)) {
      byCpf.set(key, { name: guide.pacienteNome, cpf: guide.pacienteCpf });
    }
  }

  return [...byCpf.values()];
}

export async function loadSchedulingSearchData(): Promise<SchedulingSearchData> {
  const useLocalGuides = !import.meta.env.PROD && env.guideDataSource !== 'api';
  let guides = useLocalGuides ? readLocalGuides() : [];
  let fromServer = true;

  try {
    // A busca de apoio precisa consultar também guias já agendadas, não apenas a fila.
    const serverGuides = import.meta.env.PROD || env.guideDataSource === 'api'
      ? await authenticatedFetch<Guide[]>('/guias', { retries: 0 })
      : await listPendingGuides();
    // Guias locais primeiro: incluem registros ainda não sincronizados neste dispositivo.
    const byId = new Map(guides.map((guide) => [guide.id, guide]));
    for (const guide of serverGuides) {
      if (!byId.has(guide.id)) byId.set(guide.id, guide);
    }
    guides = [...byId.values()];
  } catch {
    fromServer = false;
    if (!useLocalGuides) guides = [];
  }

  return { guides, patients: buildPatientRegistry(guides), fromServer };
}

/**
 * Pesquisa o cadastro oficial por nome ou por qualquer trecho do CPF.
 * No modo conectado, a busca sempre consulta os cadastros oficiais da API.
 */
export async function searchRegisteredPatients(
  term: string,
  localRegistry: PatientRecord[] = [],
): Promise<PatientRecord[]> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return [];

  if (import.meta.env.PROD || env.guideDataSource === 'api') {
    const results = await authenticatedFetch<PatientSearchApiResponse[]>(
      `/pacientes?busca=${encodeURIComponent(trimmed)}`,
      { retries: 0 },
    );
    return results.map((patient) => ({
      name: patient.nome,
      cpf: patient.cpf,
      birthDate: patient.dataNascimento,
    }));
  }

  return localRegistry
    .filter((patient) => matchesTerm(trimmed, patient.name) || matchesCpfDigits(trimmed, patient.cpf))
    .slice(0, 20);
}

export { subscribeToGuideUpdates };
