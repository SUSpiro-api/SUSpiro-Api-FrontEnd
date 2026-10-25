// O administrador define uma senha temporária; o backend exige a troca no primeiro acesso.

import { authenticatedFetch } from '../../api/httpClient';

export type PerfilFuncionario = 'GERENTE' | 'ATENDENTE' | 'MEDICO' | 'ENFERMEIRO';

export interface CadastroFuncionarioValues {
  nome: string;
  cpf: string;
  email: string;
  perfil: PerfilFuncionario;
  senhaTemporaria: string;
}

export interface UsuarioCriado {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  perfil: string;
  ativo: boolean;
}

export async function cadastrarFuncionario(values: CadastroFuncionarioValues): Promise<UsuarioCriado> {
  return authenticatedFetch<UsuarioCriado>('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      nome: values.nome.trim(),
      cpf: values.cpf.replace(/\D/g, ''),
      email: values.email.trim().toLowerCase(),
      perfil: values.perfil,
      senhaTemporaria: values.senhaTemporaria,
    }),
  });
}
