// Confere os dados informados no cadastro de funcionário.

import { isValidCpf } from '../../utils/cpf';

export const NOME_MAX_LENGTH = 150;

export function validateNome(value: string): string {
  const nome = value.trim();
  if (!nome) return 'Informe o nome completo.';
  if (nome.length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
  if (nome.length > NOME_MAX_LENGTH) {
    return `O nome deve ter no máximo ${NOME_MAX_LENGTH} caracteres.`;
  }
  return '';
}

export function validateCpfFuncionario(value: string): string {
  return isValidCpf(value) ? '' : 'Informe um CPF válido com 11 dígitos.';
}

const SENHA_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export function validateSenhaFuncionario(value: string): string {
  if (!value) return 'Informe uma senha.';
  if (value.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
  if (value.length > 72) return 'A senha deve ter no máximo 72 caracteres.';
  if (!SENHA_PATTERN.test(value)) return 'A senha deve conter pelo menos uma letra e um número.';
  return '';
}

export function validateConfirmarSenha(senha: string, confirmar: string): string {
  return senha === confirmar ? '' : 'As senhas não coincidem.';
}
