// Envia os dados de cadastro de paciente e recebe a confirmação da API.

import { authenticatedFetch } from '../../api/httpClient';

export interface CadastroPacienteValues {
  nome: string;
  cpf: string;
  dataNascimento: string;
  convenio: string;
  telefone: string;
  email: string;
}

export interface PacienteCriado {
  id: string;
  nome: string;
  cpfMascarado: string;
  convenio?: string | null;
  email: string;
  criadoEm: string;
  contaCriada: boolean;
}

export async function cadastrarPaciente(values: CadastroPacienteValues): Promise<PacienteCriado> {
  return authenticatedFetch<PacienteCriado>('/pacientes', {
    method: 'POST',
    body: JSON.stringify({
      nome: values.nome.trim(),
      cpf: values.cpf.replace(/\D/g, ''),
      dataNascimento: values.dataNascimento,
      convenio: values.convenio.trim() || undefined,
      telefone: values.telefone.replace(/\D/g, ''),
      email: values.email.trim().toLowerCase(),
    }),
  });
}
