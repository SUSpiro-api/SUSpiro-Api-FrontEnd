// Fontes de dados das buscas da central de agendamento: fila da API, guias deste
// dispositivo e pacientes de demonstração. Não usa nenhum endpoint novo.

import { listPendingGuides, type Guide } from '../guides';
import { readLocalGuides } from '../guides/localGuideRepository';
import { subscribeToGuideUpdates } from '../guides/guideEvents';
import { patients as demoPatients } from '../dashboard/data';
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

function buildPatientRegistry(guides: Guide[], includeDemo: boolean): PatientRecord[] {
  const byCpf = new Map<string, PatientRecord>();

  if (includeDemo) {
    for (const patient of demoPatients) {
      byCpf.set(normalizeCpf(patient.cpf), {
        name: patient.name,
        cpf: patient.cpf,
        birthDate: patient.birthDate,
      });
    }
  }

  for (const guide of guides) {
    const key = normalizeCpf(guide.pacienteCpf);
    if (!byCpf.has(key)) {
      byCpf.set(key, { name: guide.pacienteNome, cpf: guide.pacienteCpf });
    }
  }

  return [...byCpf.values()];
}

export async function loadSchedulingSearchData(): Promise<SchedulingSearchData> {
  const allowLocalDemo = !import.meta.env.PROD && env.guideDataSource !== 'api';
  let guides = allowLocalDemo ? readLocalGuides() : [];
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
    if (!allowLocalDemo) guides = [];
  }

  return { guides, patients: buildPatientRegistry(guides, allowLocalDemo), fromServer };
}

/**
 * Pesquisa o cadastro oficial por nome ou por qualquer trecho do CPF.
 * Na aplicação conectada não usa listas locais como fallback, evitando exibir
 * pacientes de demonstração quando o servidor não responder.
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
