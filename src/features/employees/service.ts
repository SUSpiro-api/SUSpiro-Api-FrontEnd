import { authenticatedFetch } from '../../api/httpClient';

export type PerfilFuncionario = 'ADMIN' | 'USUARIO';

export interface CadastroFuncionarioValues {
  nome: string;
  cpf: string;
  senha: string;
  perfil: PerfilFuncionario;
}

export interface UsuarioCriado {
  id: number;
  nome: string;
  cpf: string;
  perfil: string;
  ativo: boolean;
}

export async function cadastrarFuncionario(
  values: CadastroFuncionarioValues,
): Promise<UsuarioCriado> {
  return authenticatedFetch<UsuarioCriado>('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      nome: values.nome.trim(),
      cpf: values.cpf.replace(/\D/g, ''),
      senha: values.senha,
      perfil: values.perfil,
    }),
  });
}
