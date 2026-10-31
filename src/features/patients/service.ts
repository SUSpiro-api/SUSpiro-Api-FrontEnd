import { authenticatedFetch } from '../../api/httpClient';

export interface CadastroPacienteValues {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  convenio: string;
  numeroCarteirinha: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface PacienteCriado {
  id: string;
  nome: string;
  cpfMascarado: string;
  convenio?: string | null;
  numeroCarteirinha?: string | null;
  sexo?: string | null;
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
      sexo: values.sexo,
      convenio: values.convenio.trim() || undefined,
      numeroCarteirinha: values.numeroCarteirinha.trim() || undefined,
      telefone: values.telefone.replace(/\D/g, ''),
      email: values.email.trim().toLowerCase(),
      cep: values.cep.replace(/\D/g, ''),
      logradouro: values.logradouro.trim(),
      numero: values.numero.trim(),
      complemento: values.complemento.trim() || undefined,
      bairro: values.bairro.trim(),
      cidade: values.cidade.trim(),
      estado: values.estado.trim().toUpperCase(),
    }),
  });
}


export interface PacientePerfil {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo?: string | null;
  convenio?: string | null;
  numeroCarteirinha?: string | null;
  telefone?: string | null;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type PacientePerfilUpdate = Omit<PacientePerfil, 'id' | 'cpf' | 'criadoEm' | 'atualizadoEm'>;

export async function obterMeuPerfilPaciente(): Promise<PacientePerfil> {
  return authenticatedFetch<PacientePerfil>('/pacientes/me', { retries: 0 });
}

export async function atualizarMeuPerfilPaciente(values: PacientePerfilUpdate): Promise<PacientePerfil> {
  return authenticatedFetch<PacientePerfil>('/pacientes/me', {
    method: 'PUT',
    body: JSON.stringify({
      ...values,
      nome: values.nome.trim(),
      sexo: values.sexo?.trim() || null,
      convenio: values.convenio?.trim() || null,
      numeroCarteirinha: values.numeroCarteirinha?.trim() || null,
      telefone: values.telefone?.replace(/\D/g, '') || null,
      email: values.email.trim().toLowerCase(),
      cep: values.cep.replace(/\D/g, ''),
      logradouro: values.logradouro.trim(),
      numero: values.numero.trim(),
      complemento: values.complemento?.trim() || null,
      bairro: values.bairro.trim(),
      cidade: values.cidade.trim(),
      estado: values.estado.trim().toUpperCase(),
    }),
    retries: 0,
  });
}
