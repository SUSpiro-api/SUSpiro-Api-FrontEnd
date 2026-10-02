import { authenticatedFetch } from '../../core/api/httpClient';

export interface CadastroPacienteValues {
  nome: string;
  cpf: string;
  dataNascimento: string;
  numeroSus: string;
  telefone: string;
}

export interface PacienteCriado {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  numeroSus: string;
  telefone: string | null;
  criadoEm: string;
}

export async function cadastrarPaciente(
  values: CadastroPacienteValues,
): Promise<PacienteCriado> {
  return authenticatedFetch<PacienteCriado>('/pacientes', {
    method: 'POST',
    body: JSON.stringify({
      nome: values.nome.trim(),
      cpf: values.cpf.replace(/\D/g, ''),
      dataNascimento: values.dataNascimento,
      numeroSus: values.numeroSus.replace(/\D/g, ''),
      telefone: values.telefone.replace(/\D/g, ''),
    }),
  });
}
